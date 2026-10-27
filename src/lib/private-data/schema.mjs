import { MAX_WORKSPACE_SERIALIZED_BYTES } from "./limits.mjs";

export const WORKSPACE_SCHEMA_VERSION = 1;
export const APPLICATION_STATUSES = Object.freeze([
  "interested",
  "applied",
  "interview",
  "rejected",
  "offered",
  "withdrawn",
]);

const PROFILE_KEYS = ["id", "displayName", "headline", "professionalSummary", "targetRoles", "skills", "updatedAt"];
const RESUME_KEYS = ["id", "label", "kind", "processedAt"];
const DRAFT_KEYS = ["id", "title", "body", "updatedAt"];
const APPLICATION_KEYS = [
  "id",
  "studioName",
  "roleTitle",
  "status",
  "applicationUrl",
  "notes",
  "createdAt",
  "updatedAt",
];
const WORKSPACE_KEYS = ["schemaVersion", "updatedAt", "profile", "resumes", "drafts", "applications"];

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** @param {unknown} value @param {string[]} keys @param {string} label @returns {asserts value is Record<string, unknown>} */
function assertExactKeys(value, keys, label) {
  if (!isPlainRecord(value)) throw new Error(`${label} must be an object.`);
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`${label} contains an unsupported field.`);
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new Error(`${label} is missing a required field.`);
  }
}

/** @param {unknown} value @param {string} label @param {number} maxLength @param {{allowEmpty?: boolean}} [options] */
function boundedString(value, label, maxLength, { allowEmpty = true } = {}) {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(`${label} must be text of at most ${maxLength} characters.`);
  }
  if (!allowEmpty && value.trim().length === 0) throw new Error(`${label} is required.`);
  return value;
}

/** @param {unknown} value @param {string} label */
function identifier(value, label) {
  return boundedString(value, label, 100, { allowEmpty: false });
}

/** @param {unknown} value @param {string} label */
function timestamp(value, label) {
  if (typeof value !== "string" || value.length > 50 || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${label} must be a valid timestamp.`);
  }
  return value;
}

/** @param {unknown} value @param {string} label @param {{maxItems: number, maxItemLength: number}} limits */
function stringList(value, label, { maxItems, maxItemLength }) {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(`${label} must be a list with at most ${maxItems} items.`);
  }
  return value.map((item) => boundedString(item, label, maxItemLength, { allowEmpty: false }));
}

/** @param {unknown} value */
function safeApplicationUrl(value) {
  const urlText = boundedString(value, "Application URL", 2_000);
  if (!urlText) return "";
  let url;
  try {
    url = new URL(urlText);
  } catch {
    throw new Error("Application URL must be a valid HTTPS or HTTP URL.");
  }
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Application URL must be a public HTTPS or HTTP URL without embedded credentials.");
  }
  const normalizedUrl = url.toString();
  if (normalizedUrl.length > 2_000) {
    throw new Error("Application URL must be at most 2,000 characters after normalization.");
  }
  return normalizedUrl;
}

/** @param {unknown} value */
function validateProfile(value) {
  assertExactKeys(value, PROFILE_KEYS, "Profile");
  return {
    id: identifier(value.id, "Profile ID"),
    displayName: boundedString(value.displayName, "Display name", 120),
    headline: boundedString(value.headline, "Headline", 180),
    professionalSummary: boundedString(value.professionalSummary, "Professional summary", 2_000),
    targetRoles: stringList(value.targetRoles, "Target roles", { maxItems: 30, maxItemLength: 120 }),
    skills: stringList(value.skills, "Skills", { maxItems: 80, maxItemLength: 100 }),
    updatedAt: timestamp(value.updatedAt, "Profile updatedAt"),
  };
}

/** @param {unknown} value */
function validateResumeMetadata(value) {
  assertExactKeys(value, RESUME_KEYS, "Resume metadata");
  if (typeof value.kind !== "string" || !["pdf", "docx", "txt", "unknown"].includes(value.kind)) {
    throw new Error("Resume metadata has an unsupported file type.");
  }
  return {
    id: identifier(value.id, "Resume metadata ID"),
    // This is a user-provided display label, not the original path or file contents.
    label: boundedString(value.label, "Resume label", 120, { allowEmpty: false }),
    kind: value.kind,
    processedAt: timestamp(value.processedAt, "Resume processedAt"),
  };
}

/** @param {unknown} value */
function validateDraft(value) {
  assertExactKeys(value, DRAFT_KEYS, "Outreach draft");
  return {
    id: identifier(value.id, "Draft ID"),
    title: boundedString(value.title, "Draft title", 180, { allowEmpty: false }),
    body: boundedString(value.body, "Draft body", 20_000),
    updatedAt: timestamp(value.updatedAt, "Draft updatedAt"),
  };
}

/** @param {unknown} value */
function validateApplication(value) {
  assertExactKeys(value, APPLICATION_KEYS, "Application");
  if (typeof value.status !== "string" || !APPLICATION_STATUSES.includes(value.status)) {
    throw new Error("Application has an unsupported status.");
  }
  return {
    id: identifier(value.id, "Application ID"),
    studioName: boundedString(value.studioName, "Studio name", 180, { allowEmpty: false }),
    roleTitle: boundedString(value.roleTitle, "Role title", 180, { allowEmpty: false }),
    status: value.status,
    applicationUrl: safeApplicationUrl(value.applicationUrl),
    notes: boundedString(value.notes, "Application notes", 4_000),
    createdAt: timestamp(value.createdAt, "Application createdAt"),
    updatedAt: timestamp(value.updatedAt, "Application updatedAt"),
  };
}

/** Create a blank local workspace. It contains no real profile or application data. */
/** @param {string} [now] */
export function createEmptyWorkspace(now = new Date().toISOString()) {
  const safeNow = timestamp(now, "Workspace timestamp");
  return {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    updatedAt: safeNow,
    profile: {
      id: "profile-primary",
      displayName: "",
      headline: "",
      professionalSummary: "",
      targetRoles: [],
      skills: [],
      updatedAt: safeNow,
    },
    resumes: [],
    drafts: [],
    applications: [],
  };
}

/**
 * Validate and copy a workspace payload. The exact-key checks reject unknown fields, including accidental raw CV text.
 * @param {unknown} input
 */
export function validateWorkspaceData(input) {
  assertExactKeys(input, WORKSPACE_KEYS, "Private workspace");
  if (input.schemaVersion !== WORKSPACE_SCHEMA_VERSION) {
    throw new Error("This private workspace uses an unsupported data version.");
  }
  if (!Array.isArray(input.resumes) || input.resumes.length > 100) {
    throw new Error("Resume metadata must be a list with at most 100 items.");
  }
  if (!Array.isArray(input.drafts) || input.drafts.length > 500) {
    throw new Error("Outreach drafts must be a list with at most 500 items.");
  }
  if (!Array.isArray(input.applications) || input.applications.length > 1_000) {
    throw new Error("Applications must be a list with at most 1,000 items.");
  }
  const workspace = {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    updatedAt: timestamp(input.updatedAt, "Workspace updatedAt"),
    profile: validateProfile(input.profile),
    resumes: input.resumes.map(validateResumeMetadata),
    drafts: input.drafts.map(validateDraft),
    applications: input.applications.map(validateApplication),
  };
  const serializedBytes = new TextEncoder().encode(JSON.stringify(workspace)).byteLength;
  if (serializedBytes > MAX_WORKSPACE_SERIALIZED_BYTES) {
    throw new Error("Private workspace exceeds the serialized-size budget.");
  }
  return workspace;
}
