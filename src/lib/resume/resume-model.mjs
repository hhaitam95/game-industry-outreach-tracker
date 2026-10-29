import { RESUME_SECTION_GROUPS } from "./analysis.mjs";

export const RESUME_MODEL_VERSION = 1;
export const MAX_RESUME_BLOCKS = 40;
export const MAX_RESUME_TEXT_CHARS = 150_000;

const VALID_SECTIONS = new Set([...RESUME_SECTION_GROUPS.map((section) => section.label), "Other"]);
const VALID_ORIGINS = new Set(["imported", "typed", "ai-paste"]);
const SECTION_ALIASES = new Map(
  RESUME_SECTION_GROUPS.flatMap((section) => section.aliases.map((alias) => [normalizeHeading(alias), section.label])),
);

const STOP_WORDS = new Set(
  "about after also and are as at be because been being but by can candidate company experience for from have having how in include including into is it job join like looking more our position preferred provide required requirements responsibilities role such team teams that the their them there these they this those to what when where which who will with work working years you your".split(
    " ",
  ),
);

/**
 * @typedef {"Summary" | "Experience" | "Skills" | "Education" | "Projects" | "Certifications" | "Portfolio" | "Languages" | "Awards" | "Other"} ResumeSection
 * @typedef {"imported" | "typed" | "ai-paste"} ResumeBlockOrigin
 * @typedef {{id: string, section: ResumeSection, content: string, origin: ResumeBlockOrigin, originalContent: string, modified: boolean}} ResumeBlock
 * @typedef {{id: string, section: ResumeSection, content: string}} ResumeBaselineBlock
 * @typedef {{version: 1, nextId: number, baseline: ResumeBaselineBlock[], blocks: ResumeBlock[]}} ResumeDocument
 */

/** @param {unknown} value */
function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

/** @param {Record<string, unknown>} value @param {string[]} expected @param {string} label */
function assertExactKeys(value, expected, label) {
  const keys = Object.keys(value).sort();
  const allowed = [...expected].sort();
  if (keys.length !== allowed.length || keys.some((key, index) => key !== allowed[index])) {
    throw new Error(label + " contains an unsupported shape.");
  }
}

/** @param {string} value */
function normalizeHeading(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** @param {string} value */
function detectHeading(value) {
  const line = value.replace(/^\s*(?:\d{1,2}[.)\-:]\s*)?/u, "").trim();
  const colonIndex = line.indexOf(":");
  if (colonIndex > 0) {
    const section = SECTION_ALIASES.get(normalizeHeading(line.slice(0, colonIndex)));
    if (section) return { section, remainder: line.slice(colonIndex + 1).trim() };
  }
  const section = SECTION_ALIASES.get(normalizeHeading(line));
  return section ? { section, remainder: "" } : null;
}

/**
 * Validate the versioned document object and return a defensive copy.
 * @param {unknown} input
 * @returns {ResumeDocument}
 */
export function validateResumeDocument(input) {
  if (!isRecord(input)) throw new Error("Resume document is invalid.");
  assertExactKeys(input, ["version", "nextId", "baseline", "blocks"], "Resume document");
  if (input.version !== RESUME_MODEL_VERSION) throw new Error("Resume document version is unsupported.");
  if (!Number.isSafeInteger(input.nextId) || input.nextId < 1) throw new Error("Resume document counter is invalid.");
  if (!Array.isArray(input.baseline) || !Array.isArray(input.blocks)) {
    throw new Error("Resume document block lists are invalid.");
  }
  if (input.baseline.length > MAX_RESUME_BLOCKS || input.blocks.length > MAX_RESUME_BLOCKS) {
    throw new Error("Resume document contains too many blocks.");
  }

  const validateSection = (section) => {
    if (typeof section !== "string" || !VALID_SECTIONS.has(section)) {
      throw new Error("Resume section is unsupported.");
    }
    return /** @type {ResumeSection} */ (section);
  };
  const validateId = (id) => {
    if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/u.test(id)) {
      throw new Error("Resume block ID is invalid.");
    }
    return id;
  };
  const validateContent = (content) => {
    if (typeof content !== "string" || content.length > MAX_RESUME_TEXT_CHARS) {
      throw new Error("Resume block content exceeds the supported limit.");
    }
    return content;
  };

  const baselineIds = new Set();
  let baselineLength = 0;
  const baseline = input.baseline.map((item) => {
    if (!isRecord(item)) throw new Error("Resume baseline block is invalid.");
    assertExactKeys(item, ["id", "section", "content"], "Resume baseline block");
    const id = validateId(item.id);
    if (baselineIds.has(id)) throw new Error("Resume baseline contains duplicate IDs.");
    baselineIds.add(id);
    const content = validateContent(item.content);
    baselineLength += content.length;
    return { id, section: validateSection(item.section), content };
  });
  if (baselineLength > MAX_RESUME_TEXT_CHARS) throw new Error("Resume baseline exceeds the supported limit.");

  const blockIds = new Set();
  let totalLength = 0;
  const blocks = input.blocks.map((item) => {
    if (!isRecord(item)) throw new Error("Resume block is invalid.");
    assertExactKeys(item, ["id", "section", "content", "origin", "originalContent", "modified"], "Resume block");
    const id = validateId(item.id);
    if (blockIds.has(id)) throw new Error("Resume document contains duplicate IDs.");
    blockIds.add(id);
    const origin = item.origin;
    if (typeof origin !== "string" || !VALID_ORIGINS.has(origin)) {
      throw new Error("Resume block origin is unsupported.");
    }
    if (typeof item.modified !== "boolean") throw new Error("Resume block modification state is invalid.");
    const content = validateContent(item.content);
    const originalContent = validateContent(item.originalContent);
    totalLength += content.length;
    return {
      id,
      section: validateSection(item.section),
      content,
      origin: /** @type {ResumeBlockOrigin} */ (origin),
      originalContent,
      modified: item.modified,
    };
  });
  if (totalLength > MAX_RESUME_TEXT_CHARS) throw new Error("Resume document exceeds the supported text limit.");

  return {
    version: RESUME_MODEL_VERSION,
    nextId: input.nextId,
    baseline,
    blocks,
  };
}

/**
 * Convert extracted text into editable blocks using recognized section headings only.
 * Unrecognized content remains in an explicit Other block; role boundaries are not inferred.
 * @param {unknown} input
 * @returns {ResumeDocument}
 */
export function structureResumeText(input) {
  if (typeof input !== "string") throw new Error("Resume text is required.");
  if (input.length > MAX_RESUME_TEXT_CHARS) throw new Error("Resume text exceeds the supported limit.");

  /** @type {{section: ResumeSection, content: string}[]} */
  const parsed = [];
  /** @type {{section: ResumeSection, lines: string[]} | null} */
  let current = null;
  /** @type {string[]} */
  let leading = [];
  const pushBlock = (section, lines) => {
    const content = lines.join("\n").trim();
    if (content || section !== "Other") parsed.push({ section, content });
  };

  for (const line of input.replace(/\r\n?/gu, "\n").split("\n")) {
    const heading = detectHeading(line);
    if (heading) {
      if (current) pushBlock(current.section, current.lines);
      else if (leading.some((item) => item.trim())) {
        pushBlock("Other", leading);
        leading = [];
      }
      current = { section: heading.section, lines: heading.remainder ? [heading.remainder] : [] };
      continue;
    }
    if (current) current.lines.push(line);
    else leading.push(line);
  }
  if (current) pushBlock(current.section, current.lines);
  else if (leading.some((item) => item.trim())) pushBlock("Other", leading);

  if (parsed.length === 0) parsed.push({ section: "Other", content: input.trim() });
  if (parsed.length > MAX_RESUME_BLOCKS) throw new Error("Resume text contains too many sections.");

  const blocks = parsed.map((item, index) => ({
    id: "block-" + (index + 1),
    section: item.section,
    content: item.content,
    origin: "imported",
    originalContent: item.content,
    modified: false,
  }));
  return validateResumeDocument({
    version: RESUME_MODEL_VERSION,
    nextId: blocks.length + 1,
    baseline: blocks.map((block) => ({ id: block.id, section: block.section, content: block.content })),
    blocks,
  });
}

/**
 * Update only content or section; provenance and imported baseline are not caller-editable.
 * @param {unknown} input
 * @param {string} id
 * @param {{section?: unknown, content?: unknown}} patch
 * @returns {ResumeDocument}
 */
export function updateResumeBlock(input, id, patch) {
  const document = validateResumeDocument(input);
  if (!isRecord(patch)) throw new Error("Resume edit is invalid.");
  const keys = Object.keys(patch);
  if (!keys.length || keys.some((key) => key !== "section" && key !== "content")) {
    throw new Error("Resume edit contains an unsupported field.");
  }
  const exists = document.blocks.some((block) => block.id === id);
  if (!exists) throw new Error("Resume block was not found.");
  const nextBlocks = document.blocks.map((block) => {
    if (block.id !== id) return block;
    const section =
      patch.section === undefined
        ? block.section
        : typeof patch.section === "string" && VALID_SECTIONS.has(patch.section)
          ? /** @type {ResumeSection} */ (patch.section)
          : (() => {
              throw new Error("Resume section is unsupported.");
            })();
    const content =
      patch.content === undefined
        ? block.content
        : typeof patch.content === "string" && patch.content.length <= MAX_RESUME_TEXT_CHARS
          ? patch.content
          : (() => {
              throw new Error("Resume block content exceeds the supported limit.");
            })();
    const baseline = document.baseline.find((item) => item.id === id);
    return {
      ...block,
      section,
      content,
      modified: baseline ? section !== baseline.section || content !== baseline.content : true,
    };
  });
  return validateResumeDocument({ ...document, blocks: nextBlocks });
}

/**
 * Add an empty or populated block. New IDs are generated locally and never use resume content.
 * @param {unknown} input
 * @param {unknown} section
 * @param {unknown} origin
 * @param {unknown} [content]
 * @returns {ResumeDocument}
 */
export function addResumeBlock(input, section = "Other", origin = "typed", content = "") {
  const document = validateResumeDocument(input);
  if (!VALID_SECTIONS.has(section) || typeof section !== "string") throw new Error("Resume section is unsupported.");
  if (!VALID_ORIGINS.has(origin) || typeof origin !== "string") throw new Error("Resume block origin is unsupported.");
  if (typeof content !== "string" || content.length > MAX_RESUME_TEXT_CHARS) {
    throw new Error("Resume block content exceeds the supported limit.");
  }
  if (document.blocks.length >= MAX_RESUME_BLOCKS) throw new Error("Resume document contains too many blocks.");
  if (document.blocks.reduce((sum, block) => sum + block.content.length, 0) + content.length > MAX_RESUME_TEXT_CHARS) {
    throw new Error("Resume document exceeds the supported text limit.");
  }
  let id = "block-" + document.nextId;
  while (document.blocks.some((block) => block.id === id) || document.baseline.some((block) => block.id === id)) {
    id = "block-" + (document.nextId + 1);
  }
  const nextId = Number(id.slice("block-".length)) + 1;
  const block = {
    id,
    section: /** @type {ResumeSection} */ (section),
    content,
    origin: /** @type {ResumeBlockOrigin} */ (origin),
    originalContent: "",
    modified: false,
  };
  return validateResumeDocument({ ...document, nextId, blocks: [...document.blocks, block] });
}

/** @param {unknown} input @param {string} id */
export function removeResumeBlock(input, id) {
  const document = validateResumeDocument(input);
  if (!document.blocks.some((block) => block.id === id)) throw new Error("Resume block was not found.");
  return validateResumeDocument({ ...document, blocks: document.blocks.filter((block) => block.id !== id) });
}

/** @param {unknown} input @param {string} id @param {number} direction */
export function moveResumeBlock(input, id, direction) {
  const document = validateResumeDocument(input);
  if (direction !== -1 && direction !== 1) throw new Error("Resume block movement is invalid.");
  const index = document.blocks.findIndex((block) => block.id === id);
  if (index < 0) throw new Error("Resume block was not found.");
  const target = index + direction;
  if (target < 0 || target >= document.blocks.length) return document;
  const blocks = [...document.blocks];
  [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
  return validateResumeDocument({ ...document, blocks });
}

/** @param {unknown} input */
export function getResumeDiff(input) {
  const document = validateResumeDocument(input);
  const currentIndex = new Map(document.blocks.map((block, index) => [block.id, index]));
  const baselineIndex = new Map(document.baseline.map((block, index) => [block.id, index]));
  const currentById = new Map(document.blocks.map((block) => [block.id, block]));
  const diff = document.baseline.map((before) => {
    const after = currentById.get(before.id);
    const index = currentIndex.get(before.id);
    if (!after || index === undefined) {
      return {
        id: before.id,
        section: before.section,
        status: "removed",
        beforeSection: before.section,
        afterSection: null,
        beforeContent: before.content,
        afterContent: null,
      };
    }
    let status = "unchanged";
    if (before.section !== after.section || before.content !== after.content) status = "modified";
    else if (index !== baselineIndex.get(before.id)) status = "reordered";
    return {
      id: before.id,
      section: after.section,
      status,
      beforeSection: before.section,
      afterSection: after.section,
      beforeContent: before.content,
      afterContent: after.content,
    };
  });
  for (const after of document.blocks) {
    if (baselineIndex.has(after.id)) continue;
    diff.push({
      id: after.id,
      section: after.section,
      status: "added",
      beforeSection: null,
      afterSection: after.section,
      beforeContent: null,
      afterContent: after.content,
    });
  }
  return diff;
}

/** @param {string} value */
function meaningfulTokens(value) {
  const normalized = value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US");
  const tokens = new Map();
  for (const match of normalized.matchAll(/[\p{L}\p{N}]+(?:[+#][\p{L}\p{N}]+)*/gu)) {
    const token = match[0];
    if (STOP_WORDS.has(token) || (token.length < 3 && token !== "c++" && token !== "c#") || tokens.has(token)) continue;
    tokens.set(token, token);
  }
  return tokens;
}

/**
 * Return token-only prompts for human review; no content beyond the flagged term labels is returned.
 * @param {unknown} input
 * @param {string} sourceText
 * @param {string} profileText
 */
export function getUnsupportedTermWarnings(input, sourceText, profileText = "") {
  const document = validateResumeDocument(input);
  if (typeof sourceText !== "string" || typeof profileText !== "string") {
    throw new Error("Resume comparison text is invalid.");
  }
  const supported = meaningfulTokens(sourceText + "\n" + profileText);
  return document.blocks.flatMap((block) => {
    const seen = new Set();
    const terms = [];
    for (const [normalized, label] of meaningfulTokens(block.content)) {
      if (supported.has(normalized) || seen.has(normalized)) continue;
      seen.add(normalized);
      terms.push(label);
      if (terms.length >= 12) break;
    }
    return terms.length ? [{ blockId: block.id, terms }] : [];
  });
}

/**
 * Redact common contact patterns from manually selected text before a user copies it elsewhere.
 * @param {unknown} input
 * @param {{redactEmail?: boolean, redactPhone?: boolean, redactUrl?: boolean}} [options]
 */
export function redactResumeText(input, options = {}) {
  if (typeof input !== "string") throw new Error("Handoff text is invalid.");
  let output = input;
  if (options.redactEmail !== false) {
    output = output.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu, "[email redacted]");
  }
  if (options.redactUrl !== false) {
    output = output.replace(/\b(?:https?:\/\/|www\.)[^\s<>()]+/giu, "[URL redacted]");
  }
  if (options.redactPhone !== false) {
    output = output.replace(/\+?\d[\d\s().-]{6,}\d/gu, "[phone redacted]");
  }
  return output;
}
