export const MAX_RESUME_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_RESUME_PDF_PAGES = 100;
export const MAX_RESUME_TEXT_CHARS = 150_000;

const FILE_TYPES = Object.freeze({
  docx: {
    extensions: [".docx"],
    mediaTypes: [
      "",
      "application/octet-stream",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  pdf: {
    extensions: [".pdf"],
    mediaTypes: ["", "application/octet-stream", "application/pdf"],
  },
  txt: {
    extensions: [".txt"],
    mediaTypes: ["", "application/octet-stream", "text/plain"],
  },
});

const ERROR_MESSAGES = Object.freeze({
  "invalid-file": "Select a valid local file and try again.",
  "unsupported-file-type": "Choose a DOCX, text-based PDF, or UTF-8 text file.",
  "file-type-mismatch": "The file extension and reported file type do not match.",
  "empty-file": "The selected file is empty.",
  "file-too-large": "The selected file exceeds the 10 MiB limit.",
  "file-read-failed": "The browser could not read this file. Choose it again or try another copy.",
  "invalid-utf8": "This text file is not valid UTF-8. Save a UTF-8 copy and retry.",
  "parser-failed": "The document could not be read. It may be damaged, encrypted, or use unsupported features.",
  "too-many-pages": "This PDF has more than 100 pages. Use a shorter text-based version.",
  "output-too-large": "The extracted text exceeds the 150,000-character limit. Use a shorter document.",
});

const WARNING_MESSAGES = Object.freeze({
  "docx-structure-warning": "Some DOCX structure could not be read. Review the extracted text carefully.",
  "pdf-parser-warning": "The PDF parser reported a non-fatal issue. Review the extracted text carefully.",
  "no-selectable-text": "No selectable text was found. This may be a scanned or image-only PDF; OCR is not enabled.",
  "empty-document": "No readable text was found in this document.",
});

/** @typedef {keyof typeof ERROR_MESSAGES} ResumeExtractionErrorCode */
/** @typedef {
 *   "docx-structure-warning" | "pdf-parser-warning" | "no-selectable-text" | "empty-document"
 * } ResumeWarningCode */

/** @param {ResumeExtractionErrorCode} code */
export class ResumeExtractionError extends Error {
  constructor(code) {
    super(ERROR_MESSAGES[code] ?? ERROR_MESSAGES["parser-failed"]);
    this.name = "ResumeExtractionError";
    this.code = code;
  }
}

/** @param {unknown} error */
export function getResumeExtractionErrorMessage(error) {
  if (error instanceof ResumeExtractionError && Object.hasOwn(ERROR_MESSAGES, error.code)) {
    return ERROR_MESSAGES[error.code];
  }
  return ERROR_MESSAGES["parser-failed"];
}

/** @param {string} code */
export function getResumeWarningMessage(code) {
  return WARNING_MESSAGES[code] ?? "Some text may not have been extracted. Review the result before relying on it.";
}

/** @param {unknown} file @returns {"docx" | "pdf" | "txt"} */
export function classifyResumeFile(file) {
  if (
    file === null ||
    typeof file !== "object" ||
    typeof file.name !== "string" ||
    typeof file.size !== "number" ||
    !Number.isFinite(file.size) ||
    typeof file.arrayBuffer !== "function"
  ) {
    throw new ResumeExtractionError("invalid-file");
  }
  if (file.size <= 0) throw new ResumeExtractionError("empty-file");
  if (file.size > MAX_RESUME_FILE_BYTES) throw new ResumeExtractionError("file-too-large");

  const name = file.name.toLowerCase();
  const entry = Object.entries(FILE_TYPES).find(([, definition]) =>
    definition.extensions.some((extension) => name.endsWith(extension)),
  );
  if (!entry) throw new ResumeExtractionError("unsupported-file-type");

  const [kind, definition] = entry;
  const mediaType = typeof file.type === "string" ? file.type.split(";", 1)[0].trim().toLowerCase() : "";
  if (!definition.mediaTypes.includes(mediaType)) throw new ResumeExtractionError("file-type-mismatch");
  return /** @type {"docx" | "pdf" | "txt"} */ (kind);
}

/** @param {string} value @returns {string} */
export function normalizeExtractedText(value) {
  if (typeof value !== "string") throw new ResumeExtractionError("parser-failed");
  const text = value
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .split("\n")
    .map((line) => line.replace(/[\t ]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (text.length > MAX_RESUME_TEXT_CHARS) throw new ResumeExtractionError("output-too-large");
  return text;
}

/** @param {unknown} value */
function safePageCount(value) {
  return Number.isInteger(value) && value >= 1 && value <= MAX_RESUME_PDF_PAGES ? value : null;
}

/** @param {string} name */
function safeDisplayFileName(name) {
  const leaf = name.split(/[\\/]/).pop() ?? "";
  const safe = leaf.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 120).trim();
  return safe || "Selected document";
}

/**
 * Read a user-selected local document in memory. Parser implementations are injectable for deterministic tests;
 * production parsers are dynamically loaded from locally bundled packages only.
 * @param {File | {name: string, type: string, size: number, arrayBuffer: () => Promise<ArrayBuffer>}} file
 * @param {{
 *   extractDocxText?: (bytes: ArrayBuffer) => Promise<{text: string, warnings?: string[]}>,
 *   extractPdfText?: (bytes: ArrayBuffer) => Promise<{text: string, pageCount: number, warnings?: string[]}>
 * }} [parsers]
 */
export async function extractResumeDocument(file, parsers = {}) {
  const kind = classifyResumeFile(file);
  /** @type {ArrayBuffer} */
  let bytes;
  try {
    bytes = await file.arrayBuffer();
  } catch {
    throw new ResumeExtractionError("file-read-failed");
  }

  /** @type {{text: string, pageCount?: number, warnings?: string[]}} */
  let parsed;
  if (kind === "txt") {
    try {
      parsed = { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), warnings: [] };
    } catch {
      throw new ResumeExtractionError("invalid-utf8");
    }
  } else {
    try {
      const needsDocxParser = kind === "docx" && typeof parsers.extractDocxText !== "function";
      const needsPdfParser = kind === "pdf" && typeof parsers.extractPdfText !== "function";
      /** @type {Partial<typeof import("./browser-document-parsers.mjs")>} */
      const defaults = needsDocxParser || needsPdfParser ? await import("./browser-document-parsers.mjs") : {};
      if (kind === "docx") {
        const parser = parsers.extractDocxText ?? defaults.extractDocxText;
        if (typeof parser !== "function") throw new ResumeExtractionError("parser-failed");
        parsed = await parser(bytes);
      } else {
        const parser = parsers.extractPdfText ?? defaults.extractPdfText;
        if (typeof parser !== "function") throw new ResumeExtractionError("parser-failed");
        parsed = await parser(bytes);
      }
    } catch (error) {
      if (error instanceof ResumeExtractionError) throw error;
      throw new ResumeExtractionError("parser-failed");
    }
  }

  if (kind === "pdf" && (parsed.pageCount ?? 0) > MAX_RESUME_PDF_PAGES) {
    throw new ResumeExtractionError("too-many-pages");
  }
  const pageCount = kind === "pdf" ? safePageCount(parsed.pageCount) : null;
  const text = normalizeExtractedText(parsed.text);
  const warnings = Array.isArray(parsed.warnings)
    ? [...new Set(parsed.warnings.filter((code) => Object.hasOwn(WARNING_MESSAGES, code)))]
    : [];
  if (!text) warnings.push(kind === "pdf" ? "no-selectable-text" : "empty-document");
  const uniqueWarnings = [...new Set(warnings)];

  return {
    kind,
    fileName: safeDisplayFileName(file.name),
    sizeBytes: file.size,
    pageCount,
    text,
    characterCount: text.length,
    warnings: uniqueWarnings,
    status: text && uniqueWarnings.length === 0 ? "ready" : "warning",
  };
}
