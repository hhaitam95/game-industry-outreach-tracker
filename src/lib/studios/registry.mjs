import rawStudioRegistry from "../../../config/studio-registry.json" with { type: "json" };

const ROOT_KEYS = ["schema_version", "registry_reviewed_on", "description", "sources"];
const REQUIRED_SOURCE_KEYS = ["id", "studio_id", "studio_name", "url", "source_type", "adapter", "enabled"];
const OPTIONAL_SOURCE_KEYS = ["job_url_regex", "allowed_job_hosts", "review_reason"];
const SOURCE_TYPES = new Set(["official-careers"]);
const ADAPTERS = new Set(["official-job-links", "manual-review"]);

/** @typedef {{id:string,studio_id:string,studio_name:string,url:string,source_type:"official-careers",adapter:"official-job-links"|"manual-review",enabled:boolean,job_url_regex?:string,allowed_job_hosts?:string[],review_reason?:string}} CareerRegistrySource */
/** @typedef {{schema_version:1,registry_reviewed_on:string,description:string,sources:CareerRegistrySource[]}} StudioRegistry */
/** @typedef {{sources:Array<{id:string,url:string,sourceType:string}>,applicationRoutes:Array<{studioId:string,status:string,url:string,sourceIds:string[]}>}} RouteCatalog */

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** @param {unknown} value @param {string} label */
function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(label + " must be non-empty text.");
  }
  return value.trim();
}

/** @param {unknown} value @param {string} label */
function requireSlug(value, label) {
  const result = requireText(value, label);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) {
    throw new Error(label + " must be a stable lowercase slug.");
  }
  return result;
}

/** @param {unknown} value @param {string} label */
function requireDate(value, label) {
  const result = requireText(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error(label + " must use YYYY-MM-DD.");
  const parsed = new Date(result + "T00:00:00.000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) {
    throw new Error(label + " must be a real calendar date.");
  }
  return result;
}

/** @param {unknown} value @param {string} label */
function requireHttpsUrl(value, label) {
  const raw = requireText(value, label);
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(label + " must be a valid HTTPS URL.");
  }
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(label + " must be an HTTPS URL without embedded credentials.");
  }
  return url.toString();
}

/** @template T @param {T} value @returns {T} */
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

/** @param {unknown} input @returns {StudioRegistry} */
export function validateStudioRegistry(input) {
  if (!isRecord(input)) throw new Error("Studio registry must be an object.");
  if (
    Object.keys(input).some((key) => !ROOT_KEYS.includes(key)) ||
    ROOT_KEYS.some((key) => !Object.hasOwn(input, key))
  ) {
    throw new Error("Studio registry has missing or unsupported fields.");
  }
  if (input.schema_version !== 1) throw new Error("Unsupported studio registry schema version.");
  const registryReviewedOn = requireDate(input.registry_reviewed_on, "Registry review date");
  const description = requireText(input.description, "Registry description");
  if (!Array.isArray(input.sources) || input.sources.length === 0 || input.sources.length > 200) {
    throw new Error("Studio registry sources must contain between one and 200 entries.");
  }

  const ids = new Set();
  const studioIds = new Set();
  const entries = /** @type {unknown[]} */ (input.sources);
  const sources = entries.map((entry) => {
    if (!isRecord(entry)) throw new Error("Studio registry source entries must be objects.");
    const allowedKeys = [...REQUIRED_SOURCE_KEYS, ...OPTIONAL_SOURCE_KEYS];
    if (
      Object.keys(entry).some((key) => !allowedKeys.includes(key)) ||
      REQUIRED_SOURCE_KEYS.some((key) => !Object.hasOwn(entry, key))
    ) {
      throw new Error("Studio registry source has missing or unsupported fields.");
    }

    const id = requireSlug(entry.id, "Registry source ID");
    const studioId = requireSlug(entry.studio_id, "Registry studio ID");
    if (ids.has(id)) throw new Error("Duplicate registry source ID.");
    if (studioIds.has(studioId)) throw new Error("A studio must have exactly one career source in this registry.");
    ids.add(id);
    studioIds.add(studioId);

    const studioName = requireText(entry.studio_name, "Registry studio name");
    const url = requireHttpsUrl(entry.url, "Registry source URL");
    if (typeof entry.source_type !== "string" || !SOURCE_TYPES.has(entry.source_type)) {
      throw new Error("Registry source has an unsupported source type.");
    }
    if (typeof entry.adapter !== "string" || !ADAPTERS.has(entry.adapter)) {
      throw new Error("Registry source has an unsupported adapter.");
    }
    if (typeof entry.enabled !== "boolean") throw new Error("Registry enabled flag must be boolean.");

    const source = /** @type {CareerRegistrySource} */ ({
      id,
      studio_id: studioId,
      studio_name: studioName,
      url,
      source_type: /** @type {"official-careers"} */ (entry.source_type),
      adapter: /** @type {"official-job-links" | "manual-review"} */ (entry.adapter),
      enabled: entry.enabled,
    });

    if (source.adapter === "official-job-links") {
      const jobUrlRegex = requireText(entry.job_url_regex, "Registry job URL pattern");
      try {
        new RegExp(jobUrlRegex);
      } catch {
        throw new Error("Registry job URL pattern must be a valid regular expression.");
      }
      if (!Array.isArray(entry.allowed_job_hosts) || entry.allowed_job_hosts.length === 0) {
        throw new Error("Link adapter requires at least one allowed job host.");
      }
      const hostEntries = /** @type {unknown[]} */ (entry.allowed_job_hosts);
      const hosts = hostEntries.map((host) => requireText(host, "Allowed job host"));
      if (hosts.some((host) => !/^[a-z0-9.-]+$/i.test(host))) {
        throw new Error("Allowed job hosts must be hostnames.");
      }
      if (!hosts.includes(new URL(url).hostname)) {
        throw new Error("Allowed job hosts must include the career source hostname.");
      }
      source.job_url_regex = jobUrlRegex;
      source.allowed_job_hosts = hosts;
    } else {
      source.review_reason = requireText(entry.review_reason, "Manual-review reason");
    }

    return source;
  });

  return deepFreeze({
    schema_version: 1,
    registry_reviewed_on: registryReviewedOn,
    description,
    sources,
  });
}

export const STUDIO_REGISTRY = validateStudioRegistry(rawStudioRegistry);

/** @param {string} studioId @returns {CareerRegistrySource} */
export function getCareerRegistrySource(studioId) {
  const matches = STUDIO_REGISTRY.sources.filter((source) => source.studio_id === studioId);
  if (matches.length !== 1) {
    throw new Error("Expected exactly one validated career registry source for studio " + studioId + ".");
  }
  return matches[0];
}

/**
 * Every enabled career source must be represented by a verified catalogue route
 * backed by matching official-careers source evidence.
 * @param {RouteCatalog} catalog
 * @param {unknown} [registryInput]
 */
export function assertEnabledRegistrySourcesHaveVerifiedRoutes(catalog, registryInput = STUDIO_REGISTRY) {
  const registry = registryInput === STUDIO_REGISTRY ? STUDIO_REGISTRY : validateStudioRegistry(registryInput);
  if (!isRecord(catalog) || !Array.isArray(catalog.sources) || !Array.isArray(catalog.applicationRoutes)) {
    throw new Error("Studio catalogue must provide sources and application routes.");
  }

  for (const source of registry.sources.filter((entry) => entry.enabled)) {
    const hasMatchingRoute = catalog.applicationRoutes.some((route) => {
      if (route.studioId !== source.studio_id || route.status !== "verified" || route.url !== source.url) return false;
      return route.sourceIds.some((sourceId) =>
        catalog.sources.some(
          (evidence) =>
            evidence.id === sourceId &&
            evidence.url === source.url &&
            evidence.sourceType === "official-careers",
        ),
      );
    });
    if (!hasMatchingRoute) {
      throw new Error('Enabled registry source "' + source.id + '" has no matching verified catalogue route.');
    }
  }
  return true;
}
