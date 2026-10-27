/** @typedef {"announced" | "last-seen" | "stale" | "needs-review" | "unavailable"} PublicOpportunityStatus */

/** @typedef {{
 * id: string,
 * studioId: string,
 * studioName: string,
 * title: string,
 * url: string,
 * locations: unknown[],
 * employmentType: unknown[],
 * datePosted: string | null,
 * validThrough: string | null,
 * status: PublicOpportunityStatus,
 * sourceUrl: string,
 * firstSeenAt: string,
 * lastSeenAt: string,
 * lastChangedAt: string,
 * observedAt: string,
 * contentHash: string
 * }} PublicOpportunity */

/** @typedef {{
 * schemaVersion: 1,
 * generatedAt: string,
 * opportunities: PublicOpportunity[]
 * }} PublicOpportunitySnapshot */

export const PUBLIC_OPPORTUNITY_FIELDS = Object.freeze([
  "id",
  "studioId",
  "studioName",
  "title",
  "url",
  "locations",
  "employmentType",
  "datePosted",
  "validThrough",
  "status",
  "sourceUrl",
  "firstSeenAt",
  "lastSeenAt",
  "lastChangedAt",
  "observedAt",
  "contentHash",
]);
export const PUBLIC_OPPORTUNITY_STATUSES = Object.freeze([
  "announced",
  "last-seen",
  "stale",
  "needs-review",
  "unavailable",
]);
const SNAPSHOT_FIELDS = Object.freeze(["schemaVersion", "generatedAt", "opportunities"]);
const STATUS_SET = new Set(PUBLIC_OPPORTUNITY_STATUSES);
const FIELD_SET = new Set(PUBLIC_OPPORTUNITY_FIELDS);

/** @param {unknown} value @param {string} label */
function assertTimestamp(value, label) {
  if (typeof value !== "string" || !value.trim() || !Number.isFinite(Date.parse(value))) {
    throw new Error(label + " must be a parseable date or timestamp.");
  }
}

/** @param {unknown} value @param {string} label */
function assertHttpsUrl(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(label + " must be an HTTPS URL.");
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(label + " must be a valid HTTPS URL.");
  }
  if (parsed.protocol !== "https:" || parsed.hostname.length === 0 || parsed.username || parsed.password) {
    throw new Error(label + " must be an HTTPS URL without embedded credentials.");
  }
}

/** @param {unknown} value @param {readonly string[]} keys @param {string} label @returns {asserts value is Record<string, unknown>} */
function assertExactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
  const actual = Object.keys(value);
  if (actual.length !== keys.length || actual.some((key) => !keys.includes(key))) {
    throw new Error(label + " has missing or unsupported fields.");
  }
}

/** @param {unknown} input @returns {PublicOpportunitySnapshot} */
export function validateOpportunitySnapshot(input) {
  assertExactKeys(input, SNAPSHOT_FIELDS, "Opportunity snapshot");
  if (input.schemaVersion !== 1) throw new Error("Unsupported opportunity snapshot schema version.");
  assertTimestamp(input.generatedAt, "Snapshot generatedAt");
  if (!Array.isArray(input.opportunities)) throw new Error("Snapshot opportunities must be a list.");

  const seenIds = new Set();
  input.opportunities.forEach((entry, index) => {
    const label = "Opportunity at index " + index;
    assertExactKeys(entry, PUBLIC_OPPORTUNITY_FIELDS, label);
    for (const key of Object.keys(entry)) {
      if (!FIELD_SET.has(key)) throw new Error(label + " contains an unsupported field.");
    }
    if (typeof entry.id !== "string" || !entry.id.trim()) throw new Error(label + " ID must be non-empty text.");
    if (seenIds.has(entry.id)) throw new Error("Duplicate public opportunity ID: " + entry.id);
    seenIds.add(entry.id);
    if (typeof entry.studioId !== "string" || !entry.studioId.trim())
      throw new Error(label + " studioId must be non-empty text.");
    if (typeof entry.studioName !== "string" || !entry.studioName.trim())
      throw new Error(label + " studioName must be non-empty text.");
    if (typeof entry.title !== "string" || !entry.title.trim())
      throw new Error(label + " title must be non-empty text.");
    if (typeof entry.status !== "string" || !STATUS_SET.has(entry.status)) {
      throw new Error(label + " has an unsupported public opportunity status.");
    }
    assertHttpsUrl(entry.url, label + " url");
    assertHttpsUrl(entry.sourceUrl, label + " sourceUrl");
    if (!Array.isArray(entry.locations)) throw new Error(label + " locations must be a list.");
    if (!Array.isArray(entry.employmentType)) throw new Error(label + " employmentType must be a list.");
    assertTimestamp(entry.lastSeenAt, label + " lastSeenAt");
  });

  return /** @type {PublicOpportunitySnapshot} */ (input);
}

/**
 * @param {unknown} input
 * @param {"live" | "sample"} [origin]
 * @returns {{snapshot: PublicOpportunitySnapshot | null, error: string | null, origin: "live" | "sample"}}
 */
export function loadOpportunitySnapshot(input, origin = "sample") {
  try {
    return { snapshot: validateOpportunitySnapshot(input), error: null, origin };
  } catch (error) {
    return {
      snapshot: null,
      error: error instanceof Error ? error.message : "Opportunity snapshot validation failed.",
      origin,
    };
  }
}
