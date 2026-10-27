import publicSnapshotSchema from "../../../schemas/public-opportunity-snapshot.schema.json" with { type: "json" };

/** @typedef {"announced" | "last-seen" | "stale" | "needs-review" | "unavailable"} PublicOpportunityStatus */
/** @typedef {{
 * id: string,
 * studioId: string,
 * studioName: string,
 * title: string,
 * url: string,
 * locations: string[],
 * employmentType: string[],
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

const ROOT_SCHEMA = /** @type {Record<string, any>} */ (publicSnapshotSchema);
const OPPORTUNITY_SCHEMA = ROOT_SCHEMA.$defs.publicOpportunity;

export const PUBLIC_OPPORTUNITY_FIELDS = Object.freeze(Object.keys(OPPORTUNITY_SCHEMA.properties));
export const PUBLIC_OPPORTUNITY_STATUSES = Object.freeze([...OPPORTUNITY_SCHEMA.properties.status.enum]);

/** @param {string} reference @returns {Record<string, any>} */
function resolveSchemaReference(reference) {
  if (!reference.startsWith("#/")) {
    throw new Error("Unsupported public snapshot schema reference.");
  }

  /** @type {Record<string, any>} */
  let resolved = ROOT_SCHEMA;
  for (const part of reference.slice(2).split("/")) {
    const key = part.replaceAll("~1", "/").replaceAll("~0", "~");
    resolved = resolved[key];
  }
  return resolved;
}

/** @param {unknown} value @param {string} expected */
function matchesType(value, expected) {
  /** @type {Record<string, boolean>} */
  const matches = {
    object: value !== null && typeof value === "object" && !Array.isArray(value),
    array: Array.isArray(value),
    string: typeof value === "string",
    integer: Number.isInteger(value),
    number: typeof value === "number" && Number.isFinite(value),
    boolean: typeof value === "boolean",
    null: value === null,
  };
  return matches[expected] === true;
}

/** @param {string} value @param {string} format @param {string} label */
function validateFormat(value, format, label) {
  if (format === "date-time") {
    const rfc3339 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
    if (!rfc3339.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new Error(label + " must be an RFC 3339 date-time with a timezone.");
    }

    const datePart = value.slice(0, 10);
    const parsedDate = new Date(datePart + "T00:00:00.000Z");
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== datePart) {
      throw new Error(label + " must contain a valid calendar date.");
    }
  } else if (format === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error(label + " must be an ISO date.");
    }
    const parsed = new Date(value + "T00:00:00.000Z");
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
      throw new Error(label + " must be a valid ISO date.");
    }
  } else if (format === "uri") {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new Error(label + " must be a valid HTTPS URL.");
    }
    if (parsed.protocol !== "https:" || !parsed.hostname || parsed.username || parsed.password) {
      throw new Error(label + " must be an HTTPS URL without embedded credentials.");
    }
  }
}

/** Minimal interpreter for the JSON Schema keywords used by this public snapshot contract. */
/**
 * @param {unknown} value
 * @param {Record<string, any>} schema
 * @param {string} label
 */
function validateAgainstSchema(value, schema, label) {
  if (schema.$ref) {
    validateAgainstSchema(value, resolveSchemaReference(schema.$ref), label);
    return;
  }

  if (schema.type) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!expectedTypes.some((type) => matchesType(value, type))) {
      throw new Error(label + " has an invalid type.");
    }
  }
  if ("const" in schema && value !== schema.const) {
    throw new Error(label + " has an unsupported constant value.");
  }
  if (schema.enum && !schema.enum.includes(value)) {
    throw new Error(label + " has an unsupported value.");
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      throw new Error(label + " must not be empty.");
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      throw new Error(label + " does not match its required pattern.");
    }
    if (schema.format) {
      validateFormat(value, schema.format, label);
    }
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => validateAgainstSchema(item, schema.items, label + "[" + index + "]"));
    if (schema["x-uniqueBy"]) {
      const key = schema["x-uniqueBy"];
      const seen = new Set();
      for (const item of value) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const identity = item[key];
          if (seen.has(identity)) {
            throw new Error("Duplicate public opportunity ID: " + String(identity));
          }
          seen.add(identity);
        }
      }
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value) && schema.properties) {
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(value, key)) {
        throw new Error(label + " has missing or unsupported fields.");
      }
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties));
      if (Object.keys(value).some((key) => !allowed.has(key))) {
        throw new Error(label + " has missing or unsupported fields.");
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties, key)) {
        validateAgainstSchema(child, schema.properties[key], label + "." + key);
      }
    }
  }
}

/** @param {unknown} input @returns {PublicOpportunitySnapshot} */
export function validateOpportunitySnapshot(input) {
  validateAgainstSchema(input, ROOT_SCHEMA, "Opportunity snapshot");
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
