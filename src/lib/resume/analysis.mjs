export const MAX_RESUME_ANALYSIS_TEXT_CHARS = 150_000;
export const MAX_ROLE_DESCRIPTION_CHARS = 20_000;
export const MAX_ROLE_TERMS = 30;

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>()]+/giu;
const PHONE_LIKE_PATTERN = /\+?\d[\d\s().-]{6,}\d/gu;
const WORD_PATTERN = /[\p{L}\p{N}]+(?:[+#][\p{L}\p{N}]+)*/gu;

const STOP_WORDS = new Set(
  "about after also and are as at be because been being but by can candidate company experience for from have having how in include including into is it job join like looking more our position preferred provide required requirements responsibilities role such team teams that the their them there these they this those to what when where which who will with work working years you your".split(
    " ",
  ),
);

export const RESUME_SECTION_GROUPS = Object.freeze([
  { label: "Summary", aliases: ["summary", "professional summary", "profile", "objective", "career objective"] },
  {
    label: "Experience",
    aliases: ["experience", "professional experience", "work experience", "employment history", "work history"],
  },
  { label: "Skills", aliases: ["skills", "technical skills", "core competencies", "key skills", "competencies"] },
  { label: "Education", aliases: ["education", "education training", "education and training"] },
  { label: "Projects", aliases: ["projects", "selected projects", "personal projects", "selected work"] },
  {
    label: "Certifications",
    aliases: ["certifications", "certificates", "licenses certifications", "licenses and certifications"],
  },
  { label: "Portfolio", aliases: ["portfolio", "selected portfolio", "game credits"] },
  { label: "Languages", aliases: ["languages", "language skills"] },
  { label: "Awards", aliases: ["awards", "achievements", "honors"] },
]);

/** Normalize text for transparent, case-insensitive literal matching. */
/** @param {string} value */
function normalizeForMatching(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en-US")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** @param {string} haystack @param {string} needle */
function containsExactPhrase(haystack, needle) {
  const normalizedNeedle = normalizeForMatching(needle);
  if (!normalizedNeedle) return false;
  const normalizedHaystack = " " + normalizeForMatching(haystack) + " ";
  return normalizedHaystack.includes(" " + normalizedNeedle + " ");
}

/** @param {string} value @param {RegExp} pattern */
function countMatches(value, pattern) {
  return Array.from(value.matchAll(pattern)).length;
}

/** @param {unknown} profile @param {"skills" | "targetRoles"} field */
function profileLabels(profile, field) {
  if (!profile || typeof profile !== "object" || Array.isArray(profile)) return [];
  const value = /** @type {Record<string, unknown>} */ (profile)[field];
  if (!Array.isArray(value)) return [];
  const maxLength = field === "skills" ? 100 : 120;
  const maxItems = field === "skills" ? 80 : 30;
  const result = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== "string" || item.trim().length === 0 || item.length > maxLength) continue;
    const label = item.trim();
    const normalized = normalizeForMatching(label);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(label);
    if (result.length >= maxItems) break;
  }
  return result;
}

/** @param {string} text */
function detectSections(text) {
  const headings = new Set();
  for (const line of text.split(/\r\n?|\n/u)) {
    if (line.length > 120) continue;
    const heading = normalizeForMatching(line.replace(/^\s*(?:\d{1,2}[.)\-:]\s*)?/u, ""));
    if (heading) headings.add(heading);
  }
  return RESUME_SECTION_GROUPS.filter((section) => section.aliases.some((alias) => headings.has(alias))).map(
    (section) => section.label,
  );
}

/** @param {string} text */
function selectRoleTerms(text) {
  /** @type {Map<string, {label: string, count: number, firstIndex: number}>} */
  const counts = new Map();
  let index = 0;
  for (const token of normalizeForMatching(text).split(" ")) {
    if (!token || STOP_WORDS.has(token) || (token.length < 3 && token !== "c++" && token !== "c#")) {
      index += 1;
      continue;
    }
    const current = counts.get(token);
    if (current) current.count += 1;
    else counts.set(token, { label: token, count: 1, firstIndex: index });
    index += 1;
  }
  return [...counts.values()]
    .sort((left, right) => right.count - left.count || left.firstIndex - right.firstIndex)
    .slice(0, MAX_ROLE_TERMS)
    .map((term) => term.label);
}

/**
 * Deterministic resume checks. Results include counts and detected terms, not raw resume excerpts.
 * A term match means only that text was found, not that a skill is proven.
 * @param {{resumeText?: unknown, profile?: unknown, roleTitle?: unknown, roleDescription?: unknown}} [input]
 */
export function analyzeResume(input = {}) {
  const resumeText = input.resumeText;
  const profile = input.profile ?? null;
  const roleTitle = input.roleTitle ?? "";
  const roleDescription = input.roleDescription ?? "";

  if (typeof resumeText !== "string") throw new Error("Resume text is unavailable for analysis.");
  if (resumeText.length > MAX_RESUME_ANALYSIS_TEXT_CHARS) {
    throw new Error("Resume text exceeds the supported analysis limit.");
  }
  if (typeof roleTitle !== "string" || roleTitle.length > 300) {
    throw new Error("Role title exceeds the supported length.");
  }
  if (typeof roleDescription !== "string" || roleDescription.length > MAX_ROLE_DESCRIPTION_CHARS) {
    throw new Error("Role description exceeds the supported length.");
  }

  const wordCount = (resumeText.match(WORD_PATTERN) ?? []).length;
  const sections = detectSections(resumeText);
  const normalizedRoleTitle = roleTitle.trim();
  const normalizedRoleText = [normalizedRoleTitle, roleDescription.trim()].filter(Boolean).join("\n");
  const hasProfile = Boolean(profile && typeof profile === "object" && !Array.isArray(profile));
  const skills = profileLabels(profile, "skills");
  const targetRoles = profileLabels(profile, "targetRoles");

  return {
    stats: {
      characterCount: resumeText.length,
      wordCount,
      lineCount: resumeText.trim() ? resumeText.split(/\r\n?|\n/u).length : 0,
      sectionCount: sections.length,
      urlCount: countMatches(resumeText, URL_PATTERN),
      emailPatternCount: countMatches(resumeText, EMAIL_PATTERN),
      phoneLikePatternCount: countMatches(resumeText, PHONE_LIKE_PATTERN),
      hasReadableText: Boolean(resumeText.trim()),
    },
    sections,
    profile: {
      available: hasProfile,
      skillMentions: skills.map((label) => ({ label, found: containsExactPhrase(resumeText, label) })),
      targetRoleMatches: normalizedRoleTitle
        ? targetRoles.map((label) => ({ label, found: containsExactPhrase(normalizedRoleTitle, label) }))
        : [],
    },
    role: {
      title: normalizedRoleTitle,
      descriptionProvided: Boolean(roleDescription.trim()),
      terms: selectRoleTerms(normalizedRoleText).map((label) => ({
        label,
        found: containsExactPhrase(resumeText, label),
      })),
    },
  };
}
