import { MAX_WORKSPACE_SERIALIZED_BYTES } from "./limits.mjs";

export const WORKSPACE_SCHEMA_VERSION = 3;
export const APPLICATION_STATUSES = Object.freeze([
  "interested",
  "applied",
  "interview",
  "rejected",
  "offered",
  "withdrawn",
]);
export const DRAFT_PURPOSES = Object.freeze(["role-application", "speculative-introduction", "networking"]);
export const DRAFT_REVIEW_STATUSES = Object.freeze(["draft", "reviewed", "ready-for-user"]);
export const APPLICATION_ACTIVITY_TYPES = Object.freeze([
  "note",
  "response",
  "follow-up",
  "interview",
  "outcome",
  "status-change",
  "submitted",
]);

const PROFILE_KEYS = ["id", "displayName", "headline", "professionalSummary", "targetRoles", "skills", "updatedAt"];
const RESUME_KEYS = ["id", "label", "kind", "processedAt"];
const LEGACY_DRAFT_KEYS = ["id", "title", "body", "updatedAt"];
const DRAFT_KEYS = [
  "id",
  "seriesId",
  "versionNumber",
  "previousVersionId",
  "title",
  "body",
  "updatedAt",
  "studioId",
  "studioName",
  "roleTitle",
  "opportunityId",
  "sourceUrl",
  "purpose",
  "profileUpdatedAt",
  "resumeLabel",
  "guidanceVersion",
  "reviewStatus",
];
const LEGACY_APPLICATION_KEYS = [
  "id",
  "studioName",
  "roleTitle",
  "status",
  "applicationUrl",
  "notes",
  "createdAt",
  "updatedAt",
];
const APPLICATION_KEYS = [
  ...LEGACY_APPLICATION_KEYS,
  "studioId",
  "opportunityId",
  "outreachDraftId",
  "nextFollowUpAt",
  "history",
];
const WORKSPACE_V1_KEYS = ["schemaVersion", "updatedAt", "profile", "resumes", "drafts", "applications"];
const WORKSPACE_V2_KEYS = ["schemaVersion", "updatedAt", "profile", "resumes", "drafts", "applications"];
const WORKSPACE_KEYS = [...WORKSPACE_V2_KEYS, "routeMarkers"];
const ROUTE_MARKER_KEYS = [
  "id",
  "routeId",
  "studioId",
  "studioName",
  "routeUrl",
  "status",
  "createdAt",
  "updatedAt",
];

/** @typedef {"interested" | "applied" | "interview" | "rejected" | "offered" | "withdrawn"} ApplicationStatus */
/** @typedef {"role-application" | "speculative-introduction" | "networking"} DraftPurpose */
/** @typedef {"draft" | "reviewed" | "ready-for-user"} DraftReviewStatus */
/** @typedef {"note" | "response" | "follow-up" | "interview" | "outcome" | "status-change" | "submitted"} ApplicationActivityType */
/** @typedef {{id: string, displayName: string, headline: string, professionalSummary: string, targetRoles: string[], skills: string[], updatedAt: string}} ProfileData */
/** @typedef {{id: string, label: string, kind: "pdf" | "docx" | "txt" | "unknown", processedAt: string}} ResumeMetadata */
/** @typedef {{id: string, title: string, body: string, updatedAt: string}} LegacyDraftData */
/** @typedef {{id: string, seriesId: string, versionNumber: number, previousVersionId: string | null, title: string, body: string, updatedAt: string, studioId: string, studioName: string, roleTitle: string, opportunityId: string, sourceUrl: string, purpose: DraftPurpose, profileUpdatedAt: string | null, resumeLabel: string, guidanceVersion: string, reviewStatus: DraftReviewStatus}} OutreachDraft */
/** @typedef {{id: string, studioName: string, roleTitle: string, status: ApplicationStatus, applicationUrl: string, notes: string, createdAt: string, updatedAt: string}} LegacyApplicationData */
/** @typedef {{id: string, type: ApplicationActivityType, occurredAt: string, note: string}} ApplicationActivity */
/** @typedef {{id: string, studioName: string, roleTitle: string, status: ApplicationStatus, applicationUrl: string, notes: string, createdAt: string, updatedAt: string, studioId: string, opportunityId: string, outreachDraftId: string, nextFollowUpAt: string | null, history: ApplicationActivity[]}} ApplicationData */
/** @typedef {"planned" | "applied"} RouteMarkerStatus */
/** @typedef {{id: string, routeId: string, studioId: string, studioName: string, routeUrl: string, status: RouteMarkerStatus, createdAt: string, updatedAt: string}} RouteMarkerData */
/** @typedef {{schemaVersion: 3, updatedAt: string, profile: ProfileData, resumes: ResumeMetadata[], drafts: OutreachDraft[], applications: ApplicationData[], routeMarkers: RouteMarkerData[]}} WorkspaceData */

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/** @param {unknown} value @param {string[]} keys @param {string} label @returns {asserts value is Record<string, unknown>} */
function assertExactKeys(value, keys, label) {
  if (!isPlainRecord(value)) throw new Error(label + " must be an object.");
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(label + " contains an unsupported field.");
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) throw new Error(label + " is missing a required field.");
  }
}

/** @param {unknown} value @param {string} label @param {number} maxLength @param {{allowEmpty?: boolean}} [options] */
function boundedString(value, label, maxLength, { allowEmpty = true } = {}) {
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error(label + " must be text of at most " + maxLength + " characters.");
  }
  if (!allowEmpty && value.trim().length === 0) throw new Error(label + " is required.");
  return value;
}

/** @param {unknown} value @param {string} label */
function identifier(value, label) {
  return boundedString(value, label, 100, { allowEmpty: false });
}

/** @param {unknown} value @param {string} label */
function slugIdentifier(value, label) {
  const result = identifier(value, label);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) {
    throw new Error(label + " must be a lowercase hyphenated identifier.");
  }
  return result;
}

/** @param {unknown} value */
function safeHttpsRouteUrl(value) {
  const urlText = boundedString(value, "Speculative route URL", 2_000, { allowEmpty: false });
  let url;
  try {
    url = new URL(urlText);
  } catch {
    throw new Error("Speculative route URL must be a valid HTTPS URL.");
  }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
    throw new Error("Speculative route URL must be HTTPS without embedded credentials.");
  }
  const normalizedUrl = url.toString();
  if (normalizedUrl.length > 2_000) {
    throw new Error("Speculative route URL must be at most 2,000 characters after normalization.");
  }
  return normalizedUrl;
}

/** @param {unknown} value @param {string} label */
function timestamp(value, label) {
  if (typeof value !== "string" || value.length > 50 || !Number.isFinite(Date.parse(value))) {
    throw new Error(label + " must be a valid timestamp.");
  }
  return value;
}

/** @param {unknown} value @param {string} label */
function optionalTimestamp(value, label) {
  return value === null ? null : timestamp(value, label);
}

/** @param {unknown} value @param {string} label */
function optionalIdentifier(value, label) {
  return value === null ? null : identifier(value, label);
}

/** @param {unknown} value @param {string} label */
function optionalDate(value, label) {
  if (value === null) return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(label + " must be an ISO calendar date or null.");
  }
  const parsed = new Date(value + "T00:00:00.000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error(label + " must be a valid ISO calendar date or null.");
  }
  return value;
}

/** @param {unknown} value @param {string} label @param {{maxItems: number, maxItemLength: number}} limits */
function stringList(value, label, { maxItems, maxItemLength }) {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new Error(label + " must be a list with at most " + maxItems + " items.");
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

/** @param {unknown} value @returns {ProfileData} */
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

/** @param {unknown} value @returns {ResumeMetadata} */
function validateResumeMetadata(value) {
  assertExactKeys(value, RESUME_KEYS, "Resume metadata");
  if (typeof value.kind !== "string" || !["pdf", "docx", "txt", "unknown"].includes(value.kind)) {
    throw new Error("Resume metadata has an unsupported file type.");
  }
  return {
    id: identifier(value.id, "Resume metadata ID"),
    // This is a user-provided display label, not the original path or file contents.
    label: boundedString(value.label, "Resume label", 120, { allowEmpty: false }),
    kind: /** @type {"pdf" | "docx" | "txt" | "unknown"} */ (value.kind),
    processedAt: timestamp(value.processedAt, "Resume processedAt"),
  };
}

/** @param {unknown} value @returns {LegacyDraftData} */
function validateLegacyDraft(value) {
  assertExactKeys(value, LEGACY_DRAFT_KEYS, "Outreach draft");
  return {
    id: identifier(value.id, "Draft ID"),
    title: boundedString(value.title, "Draft title", 180, { allowEmpty: false }),
    body: boundedString(value.body, "Draft body", 20_000),
    updatedAt: timestamp(value.updatedAt, "Draft updatedAt"),
  };
}

/** @param {unknown} value @returns {OutreachDraft} */
function validateDraft(value) {
  assertExactKeys(value, DRAFT_KEYS, "Outreach draft");
  if (
    typeof value.versionNumber !== "number" ||
    !Number.isSafeInteger(value.versionNumber) ||
    value.versionNumber < 1
  ) {
    throw new Error("Draft version number must be a positive integer.");
  }
  if (typeof value.purpose !== "string" || !DRAFT_PURPOSES.includes(value.purpose)) {
    throw new Error("Draft purpose is unsupported.");
  }
  if (typeof value.reviewStatus !== "string" || !DRAFT_REVIEW_STATUSES.includes(value.reviewStatus)) {
    throw new Error("Draft review status is unsupported.");
  }
  return {
    id: identifier(value.id, "Draft ID"),
    seriesId: identifier(value.seriesId, "Draft series ID"),
    versionNumber: /** @type {number} */ (value.versionNumber),
    previousVersionId: optionalIdentifier(value.previousVersionId, "Previous draft ID"),
    title: boundedString(value.title, "Draft title", 180, { allowEmpty: false }),
    body: boundedString(value.body, "Draft body", 20_000),
    updatedAt: timestamp(value.updatedAt, "Draft updatedAt"),
    studioId: boundedString(value.studioId, "Draft studio ID", 100),
    studioName: boundedString(value.studioName, "Draft studio name", 180),
    roleTitle: boundedString(value.roleTitle, "Draft role title", 180),
    opportunityId: boundedString(value.opportunityId, "Draft opportunity ID", 100),
    sourceUrl: safeApplicationUrl(value.sourceUrl),
    purpose: /** @type {DraftPurpose} */ (value.purpose),
    profileUpdatedAt: optionalTimestamp(value.profileUpdatedAt, "Draft profile timestamp"),
    resumeLabel: boundedString(value.resumeLabel, "Resume label", 120),
    guidanceVersion: boundedString(value.guidanceVersion, "Guidance version", 120, { allowEmpty: false }),
    reviewStatus: /** @type {DraftReviewStatus} */ (value.reviewStatus),
  };
}

/** @param {unknown} value @returns {LegacyApplicationData} */
function validateLegacyApplication(value) {
  assertExactKeys(value, LEGACY_APPLICATION_KEYS, "Application");
  if (typeof value.status !== "string" || !APPLICATION_STATUSES.includes(value.status)) {
    throw new Error("Application has an unsupported status.");
  }
  return {
    id: identifier(value.id, "Application ID"),
    studioName: boundedString(value.studioName, "Studio name", 180, { allowEmpty: false }),
    roleTitle: boundedString(value.roleTitle, "Role title", 180, { allowEmpty: false }),
    status: /** @type {ApplicationStatus} */ (value.status),
    applicationUrl: safeApplicationUrl(value.applicationUrl),
    notes: boundedString(value.notes, "Application notes", 4_000),
    createdAt: timestamp(value.createdAt, "Application createdAt"),
    updatedAt: timestamp(value.updatedAt, "Application updatedAt"),
  };
}

/** @param {unknown} value @returns {ApplicationActivity} */
function validateActivity(value) {
  assertExactKeys(value, ["id", "type", "occurredAt", "note"], "Application activity");
  if (typeof value.type !== "string" || !APPLICATION_ACTIVITY_TYPES.includes(value.type)) {
    throw new Error("Application activity type is unsupported.");
  }
  return {
    id: identifier(value.id, "Activity ID"),
    type: /** @type {ApplicationActivityType} */ (value.type),
    occurredAt: timestamp(value.occurredAt, "Activity timestamp"),
    note: boundedString(value.note, "Activity note", 2_000, { allowEmpty: false }),
  };
}

/** @param {unknown} value @returns {RouteMarkerData} */
function validateRouteMarker(value) {
  assertExactKeys(value, ROUTE_MARKER_KEYS, "Private route marker");
  if (value.status !== "planned" && value.status !== "applied") {
    throw new Error("Private route marker status must be planned or applied.");
  }
  return {
    id: identifier(value.id, "Route marker ID"),
    routeId: slugIdentifier(value.routeId, "Route ID"),
    studioId: slugIdentifier(value.studioId, "Studio ID"),
    studioName: boundedString(value.studioName, "Route marker studio name", 180, { allowEmpty: false }),
    routeUrl: safeHttpsRouteUrl(value.routeUrl),
    status: /** @type {RouteMarkerStatus} */ (value.status),
    createdAt: timestamp(value.createdAt, "Route marker createdAt"),
    updatedAt: timestamp(value.updatedAt, "Route marker updatedAt"),
  };
}

/** @param {unknown} value @returns {ApplicationData} */
function validateApplication(value) {
  assertExactKeys(value, APPLICATION_KEYS, "Application");
  if (typeof value.status !== "string" || !APPLICATION_STATUSES.includes(value.status)) {
    throw new Error("Application has an unsupported status.");
  }
  if (!Array.isArray(value.history) || value.history.length > 200) {
    throw new Error("Application history must contain at most 200 events.");
  }
  return {
    id: identifier(value.id, "Application ID"),
    studioName: boundedString(value.studioName, "Studio name", 180, { allowEmpty: false }),
    roleTitle: boundedString(value.roleTitle, "Role title", 180, { allowEmpty: false }),
    status: /** @type {ApplicationStatus} */ (value.status),
    applicationUrl: safeApplicationUrl(value.applicationUrl),
    notes: boundedString(value.notes, "Application notes", 4_000),
    createdAt: timestamp(value.createdAt, "Application createdAt"),
    updatedAt: timestamp(value.updatedAt, "Application updatedAt"),
    studioId: boundedString(value.studioId, "Application studio ID", 100),
    opportunityId: boundedString(value.opportunityId, "Application opportunity ID", 100),
    outreachDraftId: boundedString(value.outreachDraftId, "Application draft ID", 100),
    nextFollowUpAt: optionalDate(value.nextFollowUpAt, "Next follow-up date"),
    history: value.history.map(validateActivity),
  };
}

/** @param {unknown} input @returns {WorkspaceData} */
function migrateV1Workspace(input) {
  assertExactKeys(input, WORKSPACE_V1_KEYS, "Private workspace");
  if (input.schemaVersion !== 1) throw new Error("This private workspace uses an unsupported data version.");
  if (!Array.isArray(input.resumes) || input.resumes.length > 100) {
    throw new Error("Resume metadata must be a list with at most 100 items.");
  }
  if (!Array.isArray(input.drafts) || input.drafts.length > 500) {
    throw new Error("Outreach drafts must be a list with at most 500 items.");
  }
  if (!Array.isArray(input.applications) || input.applications.length > 1_000) {
    throw new Error("Applications must be a list with at most 1,000 items.");
  }
  const drafts = input.drafts.map(validateLegacyDraft).map((draft) => ({
    ...draft,
    seriesId: draft.id,
    versionNumber: 1,
    previousVersionId: null,
    studioId: "",
    studioName: "",
    roleTitle: "",
    opportunityId: "",
    sourceUrl: "",
    purpose: /** @type {DraftPurpose} */ ("speculative-introduction"),
    profileUpdatedAt: null,
    resumeLabel: "",
    guidanceVersion: "legacy-v1",
    reviewStatus: /** @type {DraftReviewStatus} */ ("draft"),
  }));
  const applications = input.applications.map(validateLegacyApplication).map((application) => ({
    ...application,
    studioId: "",
    opportunityId: "",
    outreachDraftId: "",
    nextFollowUpAt: null,
    history: [],
  }));
  return {
    schemaVersion: /** @type {2} */ (2),
    updatedAt: timestamp(input.updatedAt, "Workspace updatedAt"),
    profile: validateProfile(input.profile),
    resumes: input.resumes.map(validateResumeMetadata),
    drafts,
    applications,
  };
}

/** @param {unknown} input @returns {Record<string, unknown>} */
function migrateV2Workspace(input) {
  assertExactKeys(input, WORKSPACE_V2_KEYS, "Private workspace");
  if (input.schemaVersion !== 2) throw new Error("This private workspace uses an unsupported data version.");
  return { ...input, schemaVersion: 3, routeMarkers: [] };
}

/** Create a blank local workspace. It contains no real profile or application data. */
/** @param {string} [now] @returns {WorkspaceData} */
export function createEmptyWorkspace(now = new Date().toISOString()) {
  const safeNow = timestamp(now, "Workspace timestamp");
  return {
    schemaVersion: /** @type {3} */ (WORKSPACE_SCHEMA_VERSION),
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
    routeMarkers: [],
  };
}

/**
 * Validate and copy a workspace payload. Version 1/v2 vault data is validated and migrated
 * in memory to version 3; the next explicit save writes the migrated shape encrypted.
 * @param {unknown} input
 * @returns {WorkspaceData}
 */
export function validateWorkspaceData(input) {
  if (!isPlainRecord(input)) throw new Error("Private workspace must be an object.");
  if (input.schemaVersion === 1) {
    const migrated = migrateV1Workspace(input);
    return validateWorkspaceData(migrated);
  }
  if (input.schemaVersion === 2) {
    const migrated = migrateV2Workspace(input);
    return validateWorkspaceData(migrated);
  }
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
  if (!Array.isArray(input.routeMarkers) || input.routeMarkers.length > 1_000) {
    throw new Error("Private route markers must be a list with at most 1,000 items.");
  }

  const workspace = {
    schemaVersion: /** @type {3} */ (WORKSPACE_SCHEMA_VERSION),
    updatedAt: timestamp(input.updatedAt, "Workspace updatedAt"),
    profile: validateProfile(input.profile),
    resumes: input.resumes.map(validateResumeMetadata),
    drafts: input.drafts.map(validateDraft),
    applications: input.applications.map(validateApplication),
    routeMarkers: input.routeMarkers.map(validateRouteMarker),
  };
  const allIds = new Set([workspace.profile.id]);
  for (const record of [...workspace.resumes, ...workspace.drafts, ...workspace.applications, ...workspace.routeMarkers]) {
    if (allIds.has(record.id)) throw new Error("Private workspace record IDs must be unique.");
    allIds.add(record.id);
  }
  const routeIds = new Set();
  for (const marker of workspace.routeMarkers) {
    if (routeIds.has(marker.routeId)) throw new Error("A route can have only one private marker.");
    routeIds.add(marker.routeId);
  }
  const draftById = new Map(workspace.drafts.map((draft) => [draft.id, draft]));
  for (const draft of workspace.drafts) {
    if (draft.previousVersionId) {
      const parent = draftById.get(draft.previousVersionId);
      if (!parent || parent.seriesId !== draft.seriesId || parent.versionNumber >= draft.versionNumber) {
        throw new Error("Draft version history references an invalid previous version.");
      }
    }
  }
  for (const application of workspace.applications) {
    if (application.outreachDraftId && !draftById.has(application.outreachDraftId)) {
      throw new Error("Application references an unknown outreach draft.");
    }
  }
  const serializedBytes = new TextEncoder().encode(JSON.stringify(workspace)).byteLength;
  if (serializedBytes > MAX_WORKSPACE_SERIALIZED_BYTES) {
    throw new Error("Private workspace exceeds the serialized-size budget.");
  }
  return workspace;
}
