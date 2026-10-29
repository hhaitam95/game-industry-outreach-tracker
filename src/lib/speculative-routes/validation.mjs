import curatedDirectory from "../../data/speculative-route-directory.json" with { type: "json" };
import sampleDirectory from "../../data/sample-speculative-route-directory.json" with { type: "json" };
import speculativeRouteSchema from "../../../schemas/speculative-route-directory.schema.json" with { type: "json" };

/** @typedef {"dedicated-page" | "ats-posting" | "email-invite" | "talent-community"} SpeculativeRouteType */
/** @typedef {"candidate" | "verified" | "needs-review" | "stale"} SpeculativeRouteStatus */
/** @typedef {{id:string,name:string,officialWebsiteUrl:string,homeCountryCode:string|null}} SpeculativeStudio */
/** @typedef {{id:string,studioId:string,routeUrl:string,evidenceUrl:string,routeType:SpeculativeRouteType,status:SpeculativeRouteStatus,countryScope:"worldwide"|"country-limited"|"unknown",countryCodes:string[],language:string|null,disciplineTags:string[],workModel:"remote"|"hybrid"|"onsite"|"not-stated",matchedPhraseCategory:string,evidenceSummary:string,contentHash:string,firstSeenAt:string,lastCheckedAt:string,lastVerifiedAt:string|null}} SpeculativeRoute */
/** @typedef {{schemaVersion:1,generatedAt:string,studios:SpeculativeStudio[],routes:SpeculativeRoute[]}} SpeculativeRouteDirectory */
/** @typedef {{directory:SpeculativeRouteDirectory|null,error:string|null,origin:"curated"|"sample"}} SpeculativeRouteLoadResult */

const ROOT_SCHEMA = /** @type {Record<string, any>} */ (speculativeRouteSchema);
const ROUTE_SCHEMA = ROOT_SCHEMA.$defs.speculativeRoute;

export const SPECULATIVE_ROUTE_DIRECTORY_SCHEMA_VERSION = 1;
export const SPECULATIVE_ROUTE_TYPES = Object.freeze([...ROUTE_SCHEMA.properties.routeType.enum]);
export const SPECULATIVE_ROUTE_STATUSES = Object.freeze([...ROUTE_SCHEMA.properties.status.enum]);
export const SPECULATIVE_ROUTE_PHRASE_CATEGORIES = Object.freeze([
  ...ROUTE_SCHEMA.properties.matchedPhraseCategory.enum,
]);

/** @param {string} reference @returns {Record<string, any>} */
function resolveSchemaReference(reference) {
  if (!reference.startsWith("#/")) {
    throw new Error("Unsupported speculative-route schema reference.");
  }
  /** @type {Record<string, any>} */
  let resolved = ROOT_SCHEMA;
  for (const part of reference.slice(2).split("/")) {
    const key = part.replaceAll("~1", "/").replaceAll("~0", "~");
    resolved = resolved[key];
  }
  if (resolved === null || typeof resolved !== "object" || Array.isArray(resolved)) {
    throw new Error("Speculative-route schema reference did not resolve to an object.");
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
    if (!rfc3339.test(value)) {
      throw new Error(label + " must be an RFC 3339 date-time with a timezone.");
    }
    const datePart = value.slice(0, 10);
    const parsedDate = new Date(datePart + "T00:00:00.000Z");
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== datePart) {
      throw new Error(label + " must contain a valid calendar date.");
    }
    if (!Number.isFinite(Date.parse(value))) {
      throw new Error(label + " must be a valid RFC 3339 date-time.");
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

/** @param {unknown} value @param {Record<string, any>} schema @param {string} label */
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
    if (schema.minLength !== undefined && value.trim().length < schema.minLength) {
      throw new Error(label + " must not be empty.");
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      throw new Error(label + " is too long.");
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
      throw new Error(label + " does not match its required pattern.");
    }
    if (schema.format) validateFormat(value, schema.format, label);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      throw new Error(label + " has too few items.");
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      throw new Error(label + " has too many items.");
    }
    if (schema.items) {
      value.forEach((item, index) => validateAgainstSchema(item, schema.items, label + "[" + index + "]"));
    }
    if (schema.uniqueItems === true && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      throw new Error(label + " must not contain duplicate items.");
    }
    if (schema["x-uniqueBy"]) {
      const key = schema["x-uniqueBy"];
      const seen = new Set();
      for (const item of value) {
        if (item !== null && typeof item === "object" && !Array.isArray(item)) {
          const identity = item[key];
          if (seen.has(identity)) {
            throw new Error("Duplicate ID in speculative-route directory.");
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

/** @param {string} value */
function parseTimestamp(value) {
  const result = Date.parse(value);
  if (!Number.isFinite(result)) throw new Error("Speculative-route timestamp is invalid.");
  return result;
}

/** @param {unknown} input @returns {SpeculativeRouteDirectory} */
export function validateSpeculativeRouteDirectory(input) {
  validateAgainstSchema(input, ROOT_SCHEMA, "Speculative-route directory");
  const directory = /** @type {SpeculativeRouteDirectory} */ (input);
  const studioIds = new Set(directory.studios.map((studio) => studio.id));

  for (const studio of directory.studios) {
    if (!studio.name.trim()) throw new Error("Studio name must not be empty.");
  }

  for (const route of directory.routes) {
    if (!route.evidenceSummary.trim()) throw new Error("Route evidence summary must not be empty.");
    if (!studioIds.has(route.studioId)) {
      throw new Error("Speculative route references an unknown studio.");
    }
    if (route.countryScope === "country-limited" && route.countryCodes.length === 0) {
      throw new Error("Country-limited routes must list at least one country code.");
    }
    if (route.countryScope !== "country-limited" && route.countryCodes.length > 0) {
      throw new Error("Only country-limited routes may list country codes.");
    }

    const isTalentCommunity = route.routeType === "talent-community";
    const isTalentPoolPhrase = route.matchedPhraseCategory === "talent-pool-invitation";
    if (isTalentCommunity !== isTalentPoolPhrase) {
      throw new Error("Talent-community routes must be labelled separately from direct speculative routes.");
    }

    const firstSeenAt = parseTimestamp(route.firstSeenAt);
    const lastCheckedAt = parseTimestamp(route.lastCheckedAt);
    if (lastCheckedAt < firstSeenAt) {
      throw new Error("Route lastCheckedAt cannot be earlier than firstSeenAt.");
    }
    if (route.status === "verified" && route.lastVerifiedAt === null) {
      throw new Error("Verified routes require lastVerifiedAt.");
    }
    if (route.status === "candidate" && route.lastVerifiedAt !== null) {
      throw new Error("Candidate routes cannot claim a previous verification date.");
    }
    if (route.status === "stale" && route.lastVerifiedAt === null) {
      throw new Error("Stale routes require a previous verification date.");
    }
    if (route.lastVerifiedAt !== null) {
      const lastVerifiedAt = parseTimestamp(route.lastVerifiedAt);
      if (lastVerifiedAt < firstSeenAt || lastVerifiedAt > lastCheckedAt) {
        throw new Error("Route lastVerifiedAt must be between firstSeenAt and lastCheckedAt.");
      }
    }
  }

  return directory;
}

/**
 * Invalid curated data fails closed. An empty valid curated directory uses the
 * clearly named synthetic sample; valid curated routes take precedence.
 * @param {unknown} [curated]
 * @param {unknown} [sample]
 * @returns {SpeculativeRouteLoadResult}
 */
export function loadSpeculativeRouteDirectory(curated = curatedDirectory, sample = sampleDirectory) {
  let validatedCurated;
  try {
    validatedCurated = validateSpeculativeRouteDirectory(curated);
  } catch (error) {
    return {
      directory: null,
      error: error instanceof Error ? error.message : "Curated speculative-route data validation failed.",
      origin: "curated",
    };
  }
  if (validatedCurated.routes.length > 0) {
    return { directory: validatedCurated, error: null, origin: "curated" };
  }
  try {
    return { directory: validateSpeculativeRouteDirectory(sample), error: null, origin: "sample" };
  } catch (error) {
    return {
      directory: null,
      error: error instanceof Error ? error.message : "Synthetic speculative-route sample validation failed.",
      origin: "sample",
    };
  }
}

const loadedDirectory = loadSpeculativeRouteDirectory();
export const SPECULATIVE_ROUTE_DIRECTORY = loadedDirectory.directory;
export const SPECULATIVE_ROUTE_DIRECTORY_ERROR = loadedDirectory.error;
export const SPECULATIVE_ROUTE_DIRECTORY_ORIGIN = loadedDirectory.origin;
