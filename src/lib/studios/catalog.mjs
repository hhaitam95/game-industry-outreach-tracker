import rawStudioRegistry from "../../../config/studio-registry.json" with { type: "json" };

export const CATALOG_SCHEMA_VERSION = 1;
export const STUDIO_CREDIT_ROLES = Object.freeze([
  "developer",
  "co-developer",
  "publisher",
  "porting",
  "support",
  "other",
]);
export const APPLICATION_ROUTE_STATUSES = Object.freeze(["verified", "unverified", "stale", "conflicting", "unknown"]);
export const APPLICATION_ROUTE_TYPES = Object.freeze([
  "careers",
  "role-specific",
  "talent-community",
  "speculative",
  "other",
]);
export const OPPORTUNITY_TYPES = Object.freeze(["advertised-role", "talent-community", "speculative-route", "other"]);
export const OPPORTUNITY_STATUSES = Object.freeze([
  "announced",
  "closed",
  "stale",
  "unavailable",
  "needs-review",
  "unknown",
]);
export const CHANGE_EVENT_TYPES = Object.freeze([
  "created",
  "updated",
  "explicitly-closed",
  "stale",
  "unavailable",
  "needs-review",
]);

const CATALOGUED_ON = "2026-10-25";

/** @param {string} studioId @param {string} sourceId */
function careerSourceEvidence(studioId, sourceId) {
  const source = getCareerRegistrySource(studioId);
  return {
    id: sourceId,
    label: source.studio_name + " careers",
    url: source.url,
    publisher: source.studio_name,
    sourceType: source.source_type,
    accessedOn: CATALOGUED_ON,
  };
}

/** @param {string} studioId @param {string} routeId @param {string} sourceId */
function careerApplicationRoute(studioId, routeId, sourceId) {
  const source = getCareerRegistrySource(studioId);
  return {
    id: routeId,
    studioId,
    label: "Official careers and vacancies",
    routeType: "careers",
    status: "verified",
    url: source.url,
    sourceIds: [sourceId],
    verifiedOn: CATALOGUED_ON,
  };
}

const SOURCE_TYPES = ["official-site", "official-careers", "official-company", "official-publisher"];
const SITE_TYPES = ["headquarters", "studio", "office"];
const OWNERSHIP_TYPES = ["wholly-owned-subsidiary-of", "majority-owned-by", "member-of", "operated-by", "other"];
const CHANGE_ENTITY_TYPES = [
  "studio",
  "site",
  "ownership-relationship",
  "game",
  "credit",
  "opportunity",
  "application-route",
];
const CATALOG_KEYS = [
  "schemaVersion",
  "cataloguedOn",
  "sources",
  "studios",
  "sites",
  "ownershipRelationships",
  "games",
  "credits",
  "opportunities",
  "applicationRoutes",
  "changeEvents",
];

/** @typedef {{id:string,label:string,url:string,publisher:string,sourceType:string,accessedOn:string}} SourceEvidence */
/** @typedef {{id:string,name:string,businessType:string,summary:string,officialWebsiteUrl:string,sourceIds:string[]}} StudioRecord */
/** @typedef {{id:string,studioId:string,siteType:string,city:string,region:string,country:string,sourceIds:string[]}} StudioSite */
/** @typedef {{id:string,studioId:string,ownerName:string,relationshipType:string,sourceIds:string[]}} OwnershipRelationship */
/** @typedef {{id:string,title:string,sourceIds:string[]}} GameRecord */
/** @typedef {{id:string,studioId:string,gameId:string,role:string,sourceIds:string[],verifiedOn:string}} StudioCredit */
/** @typedef {{id:string,studioId:string,title:string,opportunityType:string,status:string,location:string,sourceIds:string[],observedAt:string}} OpportunityRecord */
/** @typedef {{id:string,studioId:string,label:string,routeType:string,status:string,url:string,sourceIds:string[],verifiedOn:string}} ApplicationRoute */
/** @typedef {{id:string,entityType:string,entityId:string,changeType:string,observedAt:string,sourceId:string,summary:string}} ChangeEvent */
/** @typedef {{schemaVersion:number,cataloguedOn:string,sources:SourceEvidence[],studios:StudioRecord[],sites:StudioSite[],ownershipRelationships:OwnershipRelationship[],games:GameRecord[],credits:StudioCredit[],opportunities:OpportunityRecord[],applicationRoutes:ApplicationRoute[],changeEvents:ChangeEvent[]}} StudioCatalogData */
/** @typedef {{id:string,name:string,businessType:string,summary:string,officialWebsiteUrl:string,sourceIds:string[],sites:StudioSite[],ownershipRelationships:OwnershipRelationship[],credits:Array<StudioCredit & {gameTitle:string}>,routes:ApplicationRoute[]}} StudioProfile */

/** @param {unknown} value @param {string[]} keys @param {string} label @returns {asserts value is Record<string, unknown>} */
function assertExactKeys(value, keys, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(label + " must be an object.");
  }
  const allowed = new Set(keys);
  const actual = Object.keys(value);
  if (actual.some((key) => !allowed.has(key)) || keys.some((key) => !Object.hasOwn(value, key))) {
    throw new Error(label + " has missing or unsupported fields.");
  }
}

/** @param {unknown} value @param {string} label @param {number} [maxLength] @param {boolean} [allowEmpty] */
function text(value, label, maxLength = 500, allowEmpty = false) {
  if (typeof value !== "string" || value.length > maxLength || (!allowEmpty && value.trim().length === 0)) {
    throw new Error(label + " must be text" + (allowEmpty ? "" : " and cannot be empty") + ".");
  }
  return value.trim();
}

/** @param {unknown} value @param {string} label */
function identifier(value, label) {
  const result = text(value, label, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result)) throw new Error(label + " must be a stable lowercase slug.");
  return result;
}

/** @param {unknown} value @param {string} label */
function calendarDate(value, label) {
  const result = text(value, label, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) throw new Error(label + " must use YYYY-MM-DD.");
  const parsed = new Date(result + "T00:00:00.000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== result) {
    throw new Error(label + " must be a real calendar date.");
  }
  return result;
}

/** @param {unknown} value @param {string} label */
function httpsUrl(value, label) {
  const raw = text(value, label, 2_000);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(label + " must be a valid HTTPS URL.");
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password) {
    throw new Error(label + " must be an HTTPS URL without embedded credentials.");
  }
  parsed.hash = "";
  return parsed.toString();
}

/** @param {unknown} value @param {string} label @param {number} maxItems @param {boolean} [allowEmpty] */
function stringList(value, label, maxItems, allowEmpty = false) {
  if (!Array.isArray(value) || value.length > maxItems || (!allowEmpty && value.length === 0)) {
    throw new Error(
      label + " must be a list with " + (allowEmpty ? "at most " : "between one and ") + maxItems + " items.",
    );
  }
  return value.map((item) => text(item, label + " item", 100));
}

/** @param {unknown} value @param {ReadonlyArray<string>} choices @param {string} label */
function oneOf(value, choices, label) {
  const result = text(value, label, 100);
  if (!choices.includes(result)) throw new Error(label + " has an unsupported value.");
  return result;
}

/** @param {unknown} value @param {string} label @param {string[]} allowedKeys @param {Set<string>} seenIds */
function registerId(value, label, allowedKeys, seenIds) {
  assertExactKeys(value, allowedKeys, label);
  const id = identifier(value.id, label + " ID");
  if (seenIds.has(id)) throw new Error("Duplicate catalog ID.");
  seenIds.add(id);
  return id;
}

/** @param {unknown} input @param {string} label @param {number} maxItems @returns {Array<Record<string, unknown>>} */
function objectList(input, label, maxItems) {
  if (!Array.isArray(input) || input.length > maxItems) {
    throw new Error(label + " must be a list of at most " + maxItems + " records.");
  }
  for (const item of input) {
    if (item === null || typeof item !== "object" || Array.isArray(item)) {
      throw new Error(label + " entries must be objects.");
    }
  }
  return input;
}

/** @param {string[]} ids @param {Set<string>} validSourceIds @param {string} label */
function assertSourceReferences(ids, validSourceIds, label) {
  if (!ids.every((id) => validSourceIds.has(id))) throw new Error(label + " references missing source evidence.");
}

const REGISTRY_ROOT_KEYS = ["schema_version", "registry_reviewed_on", "description", "sources"];
const REGISTRY_SOURCE_KEYS = ["id", "studio_id", "studio_name", "url", "source_type", "adapter", "enabled"];
const REGISTRY_ADAPTERS = ["official-job-links", "manual-review"];

/** @typedef {Record<string, unknown> & {id:string,studio_id:string,studio_name:string,url:string,source_type:string,adapter:string,enabled:boolean,job_url_regex?:string,allowed_job_hosts?:string[],review_reason?:string}} CareerRegistrySource */
/** @typedef {{schema_version:number,registry_reviewed_on:string,description:string,sources:CareerRegistrySource[]}} StudioRegistry */
/** @typedef {{sources:Array<{id:string,url:string,sourceType:string}>,applicationRoutes:Array<{studioId:string,status:string,url:string,sourceIds:string[]}>}} RouteCatalog */

/** @param {unknown} input @returns {StudioRegistry} */
export function validateStudioRegistry(input) {
  assertExactKeys(input, REGISTRY_ROOT_KEYS, "Studio registry");
  if (input.schema_version !== 1) throw new Error("Unsupported studio registry schema version.");
  const registryReviewedOn = calendarDate(input.registry_reviewed_on, "Registry review date");
  const description = text(input.description, "Registry description", 500);
  const entries = objectList(input.sources, "Studio registry sources", 200);
  if (entries.length === 0) throw new Error("Studio registry sources must not be empty.");

  const ids = new Set();
  const studioIds = new Set();
  const urls = new Set();
  const sources = entries.map((entry) => {
    const adapter = oneOf(entry.adapter, REGISTRY_ADAPTERS, "Registry adapter");
    const adapterKeys = adapter === "official-job-links" ? ["job_url_regex", "allowed_job_hosts"] : ["review_reason"];
    assertExactKeys(entry, [...REGISTRY_SOURCE_KEYS, ...adapterKeys], "Studio registry source");

    const id = identifier(entry.id, "Registry source ID");
    const studio_id = identifier(entry.studio_id, "Registry studio ID");
    if (ids.has(id)) throw new Error("Duplicate registry source ID.");
    if (studioIds.has(studio_id)) throw new Error("Duplicate registry studio ID.");
    ids.add(id);
    studioIds.add(studio_id);

    const studio_name = text(entry.studio_name, "Registry studio name", 180);
    const url = httpsUrl(entry.url, "Registry source URL");
    if (urls.has(url)) throw new Error("Duplicate registry source URL.");
    urls.add(url);
    const source_type = oneOf(entry.source_type, ["official-careers"], "Registry source type");
    if (typeof entry.enabled !== "boolean") throw new Error("Registry enabled flag must be boolean.");

    const source = /** @type {CareerRegistrySource} */ ({
      id,
      studio_id,
      studio_name,
      url,
      source_type,
      adapter,
      enabled: entry.enabled,
    });

    if (adapter === "official-job-links") {
      const job_url_regex = text(entry.job_url_regex, "Registry job URL pattern", 500);
      try {
        new RegExp(job_url_regex);
      } catch {
        throw new Error("Registry job URL pattern must be a valid regular expression.");
      }
      const allowed_job_hosts = stringList(entry.allowed_job_hosts, "Allowed job hosts", 20);
      if (allowed_job_hosts.some((host) => !/^[a-z0-9.-]+$/i.test(host))) {
        throw new Error("Allowed job hosts must be hostnames.");
      }
      if (!allowed_job_hosts.includes(new URL(url).hostname)) {
        throw new Error("Allowed job hosts must include the career source hostname.");
      }
      source.job_url_regex = job_url_regex;
      source.allowed_job_hosts = allowed_job_hosts;
    } else {
      source.review_reason = text(entry.review_reason, "Manual-review reason", 1_000);
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
function getCareerRegistrySource(studioId) {
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
  if (!Array.isArray(catalog.sources) || !Array.isArray(catalog.applicationRoutes)) {
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
      throw new Error(`Enabled registry source "${source.id}" has no matching verified catalogue route.`);
    }
  }
  return true;
}

/** @param {unknown} input @returns {StudioCatalogData} */
export function validateStudioCatalog(input) {
  assertExactKeys(input, CATALOG_KEYS, "Studio catalog");
  if (input.schemaVersion !== CATALOG_SCHEMA_VERSION) throw new Error("Unsupported studio catalog schema version.");
  const cataloguedOn = calendarDate(input.cataloguedOn, "Catalog date");
  const seenIds = new Set();

  const validSources = objectList(input.sources, "Sources", 200).map((value) => {
    const id = registerId(value, "Source", ["id", "label", "url", "publisher", "sourceType", "accessedOn"], seenIds);
    return {
      id,
      label: text(value.label, "Source label", 180),
      url: httpsUrl(value.url, "Source URL"),
      publisher: text(value.publisher, "Source publisher", 180),
      sourceType: oneOf(value.sourceType, SOURCE_TYPES, "Source type"),
      accessedOn: calendarDate(value.accessedOn, "Source access date"),
    };
  });
  if (new Set(validSources.map((source) => source.url)).size !== validSources.length) {
    throw new Error("Duplicate source URL.");
  }
  const sourceById = new Map(validSources.map((source) => [source.id, source]));
  const validSourceIds = new Set(sourceById.keys());

  /** @param {unknown} value @param {string} label */
  const validateSources = (value, label) => {
    const ids = stringList(value, label + " source IDs", 20);
    assertSourceReferences(ids, validSourceIds, label);
    return ids;
  };

  const studioValues = objectList(input.studios, "Studios", 5);
  if (studioValues.length < 3) throw new Error("The starter studio catalog must contain between 3 and 5 studios.");
  /** @type {StudioRecord[]} */
  const studios = studioValues.map((value) => {
    const id = registerId(
      value,
      "Studio",
      ["id", "name", "businessType", "summary", "officialWebsiteUrl", "sourceIds"],
      seenIds,
    );
    const officialWebsiteUrl = httpsUrl(value.officialWebsiteUrl, "Studio website");
    const sourceIds = validateSources(value.sourceIds, "Studio");
    if (!sourceIds.some((sourceId) => sourceById.get(sourceId)?.url === officialWebsiteUrl)) {
      throw new Error("Studio website must have direct source evidence.");
    }
    return {
      id,
      name: text(value.name, "Studio name", 180),
      businessType: oneOf(value.businessType, ["game-developer", "game-developer-publisher"], "Studio business type"),
      summary: text(value.summary, "Studio summary", 800),
      officialWebsiteUrl,
      sourceIds,
    };
  });
  const studioIds = new Set(studios.map((studio) => studio.id));
  const normalizedNames = studios.map((studio) =>
    studio.name.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim(),
  );
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    throw new Error("Duplicate studio names are not allowed.");
  }

  /** @param {unknown} value @param {string} label */
  const validateStudioReference = (value, label) => {
    const studioId = identifier(value, label + " studio ID");
    if (!studioIds.has(studioId)) throw new Error(label + " references an unknown studio.");
    return studioId;
  };

  const sites = objectList(input.sites, "Studio sites", 100).map((value) => {
    const id = registerId(
      value,
      "Studio site",
      ["id", "studioId", "siteType", "city", "region", "country", "sourceIds"],
      seenIds,
    );
    return {
      id,
      studioId: validateStudioReference(value.studioId, "Studio site"),
      siteType: oneOf(value.siteType, SITE_TYPES, "Site type"),
      city: text(value.city, "Site city", 100),
      region: text(value.region, "Site region", 100, true),
      country: text(value.country, "Site country", 100),
      sourceIds: validateSources(value.sourceIds, "Studio site"),
    };
  });

  const ownershipRelationships = objectList(input.ownershipRelationships, "Ownership relationships", 100).map(
    (value) => {
      const id = registerId(
        value,
        "Ownership relationship",
        ["id", "studioId", "ownerName", "relationshipType", "sourceIds"],
        seenIds,
      );
      return {
        id,
        studioId: validateStudioReference(value.studioId, "Ownership relationship"),
        ownerName: text(value.ownerName, "Owner name", 180),
        relationshipType: oneOf(value.relationshipType, OWNERSHIP_TYPES, "Ownership relationship type"),
        sourceIds: validateSources(value.sourceIds, "Ownership relationship"),
      };
    },
  );

  const games = objectList(input.games, "Games", 500).map((value) => {
    const id = registerId(value, "Game", ["id", "title", "sourceIds"], seenIds);
    return { id, title: text(value.title, "Game title", 180), sourceIds: validateSources(value.sourceIds, "Game") };
  });
  const gameIds = new Set(games.map((game) => game.id));

  const credits = objectList(input.credits, "Credits", 1_000).map((value) => {
    const id = registerId(
      value,
      "Studio credit",
      ["id", "studioId", "gameId", "role", "sourceIds", "verifiedOn"],
      seenIds,
    );
    const studioId = validateStudioReference(value.studioId, "Studio credit");
    const gameId = identifier(value.gameId, "Credit game ID");
    if (!gameIds.has(gameId)) throw new Error("Studio credit references an unknown game.");
    const sourceIds = validateSources(value.sourceIds, "Studio credit");
    const verifiedOn = calendarDate(value.verifiedOn, "Credit verification date");
    return {
      id,
      studioId,
      gameId,
      role: oneOf(value.role, STUDIO_CREDIT_ROLES, "Studio credit role"),
      sourceIds,
      verifiedOn,
    };
  });

  const opportunities = objectList(input.opportunities, "Opportunities", 5_000).map((value) => {
    const id = registerId(
      value,
      "Opportunity",
      ["id", "studioId", "title", "opportunityType", "status", "location", "sourceIds", "observedAt"],
      seenIds,
    );
    return {
      id,
      studioId: validateStudioReference(value.studioId, "Opportunity"),
      title: text(value.title, "Opportunity title", 180),
      opportunityType: oneOf(value.opportunityType, OPPORTUNITY_TYPES, "Opportunity type"),
      status: oneOf(value.status, OPPORTUNITY_STATUSES, "Opportunity status"),
      location: text(value.location, "Opportunity location", 180, true),
      sourceIds: validateSources(value.sourceIds, "Opportunity"),
      observedAt: calendarDate(value.observedAt, "Opportunity observation date"),
    };
  });

  const applicationRoutes = objectList(input.applicationRoutes, "Application routes", 500).map((value) => {
    const id = registerId(
      value,
      "Application route",
      ["id", "studioId", "label", "routeType", "status", "url", "sourceIds", "verifiedOn"],
      seenIds,
    );
    const url = httpsUrl(value.url, "Application route URL");
    const sourceIds = validateSources(value.sourceIds, "Application route");
    const status = oneOf(value.status, APPLICATION_ROUTE_STATUSES, "Application route status");
    if (status === "verified" && !sourceIds.some((sourceId) => sourceById.get(sourceId)?.url === url)) {
      throw new Error("A verified application route must link to direct matching source evidence.");
    }
    return {
      id,
      studioId: validateStudioReference(value.studioId, "Application route"),
      label: text(value.label, "Application route label", 180),
      routeType: oneOf(value.routeType, APPLICATION_ROUTE_TYPES, "Application route type"),
      status,
      url,
      sourceIds,
      verifiedOn: calendarDate(value.verifiedOn, "Route verification date"),
    };
  });

  const allEntityIds = new Set([
    ...studioIds,
    ...sites.map((item) => item.id),
    ...ownershipRelationships.map((item) => item.id),
    ...games.map((item) => item.id),
    ...credits.map((item) => item.id),
    ...opportunities.map((item) => item.id),
    ...applicationRoutes.map((item) => item.id),
  ]);
  const changeEvents = objectList(input.changeEvents, "Change events", 10_000).map((value) => {
    const id = registerId(
      value,
      "Change event",
      ["id", "entityType", "entityId", "changeType", "observedAt", "sourceId", "summary"],
      seenIds,
    );
    const entityType = oneOf(value.entityType, CHANGE_ENTITY_TYPES, "Change event entity type");
    const entityId = identifier(value.entityId, "Change event entity ID");
    if (!allEntityIds.has(entityId)) throw new Error("Change event references an unknown catalog entity.");
    const sourceId = identifier(value.sourceId, "Change event source ID");
    if (!validSourceIds.has(sourceId)) throw new Error("Change event references missing source evidence.");
    return {
      id,
      entityType,
      entityId,
      changeType: oneOf(value.changeType, CHANGE_EVENT_TYPES, "Change event type"),
      observedAt: calendarDate(value.observedAt, "Change event date"),
      sourceId,
      summary: text(value.summary, "Change event summary", 500),
    };
  });

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    cataloguedOn,
    sources: validSources,
    studios,
    sites,
    ownershipRelationships,
    games,
    credits,
    opportunities,
    applicationRoutes,
    changeEvents,
  };
}

/** @type {StudioCatalogData} */
const initialCatalog = {
  schemaVersion: CATALOG_SCHEMA_VERSION,
  cataloguedOn: CATALOGUED_ON,
  sources: [
    {
      id: "source-cdpr-site",
      label: "CD PROJEKT RED official website",
      url: "https://www.cdprojektred.com/en/",
      publisher: "CD PROJEKT RED",
      sourceType: "official-site",
      accessedOn: CATALOGUED_ON,
    },
    careerSourceEvidence("cd-projekt-red", "source-cdpr-careers"),
    {
      id: "source-cdpr-group",
      label: "CD PROJEKT RED Capital Group",
      url: "https://www.cdprojekt.com/en/capital-group/",
      publisher: "CD PROJEKT RED S.A.",
      sourceType: "official-company",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-cdpr-games",
      label: "CD PROJEKT RED official games",
      url: "https://www.cdprojektred.com/en/our-games",
      publisher: "CD PROJEKT RED",
      sourceType: "official-site",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-cdpr-contact",
      label: "CD PROJEKT RED contact and Warsaw address",
      url: "https://www.cdprojekt.com/en/Contact/",
      publisher: "CD PROJEKT RED S.A.",
      sourceType: "official-company",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-nd-site",
      label: "Naughty Dog official website",
      url: "https://www.naughtydog.com/",
      publisher: "Naughty Dog",
      sourceType: "official-site",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-nd-about",
      label: "Naughty Dog company information",
      url: "https://www.naughtydog.com/company",
      publisher: "Naughty Dog",
      sourceType: "official-company",
      accessedOn: CATALOGUED_ON,
    },
    careerSourceEvidence("naughty-dog", "source-nd-careers"),
    {
      id: "source-sms-site",
      label: "Santa Monica Studio official website",
      url: "https://sms.playstation.com/",
      publisher: "Santa Monica Studio / PlayStation",
      sourceType: "official-site",
      accessedOn: CATALOGUED_ON,
    },
    careerSourceEvidence("santa-monica-studio", "source-sms-careers"),
    {
      id: "source-sms-about",
      label: "Santa Monica Studio official studio history",
      url: "https://sms.playstation.com/who-we-are",
      publisher: "Santa Monica Studio / PlayStation",
      sourceType: "official-company",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-playstation-studios",
      label: "PlayStation Studios official studio directory",
      url: "https://www.playstation.com/en-gb/corporate/playstation-studios/",
      publisher: "PlayStation",
      sourceType: "official-publisher",
      accessedOn: CATALOGUED_ON,
    },
    {
      id: "source-riot-site",
      label: "Riot Games official website",
      url: "https://www.riotgames.com/en",
      publisher: "Riot Games",
      sourceType: "official-site",
      accessedOn: CATALOGUED_ON,
    },
    careerSourceEvidence("riot-games", "source-riot-careers"),
    {
      id: "source-riot-about",
      label: "Riot Games official company and games overview",
      url: "https://www.riotgames.com/en/who-we-are",
      publisher: "Riot Games",
      sourceType: "official-company",
      accessedOn: CATALOGUED_ON,
    },
  ],
  studios: [
    {
      id: "cd-projekt-red",
      name: "CD PROJEKT RED",
      businessType: "game-developer-publisher",
      summary:
        "A video-game development studio known for The Witcher and Cyberpunk; its official careers site lists teams across multiple projects and locations.",
      officialWebsiteUrl: "https://www.cdprojektred.com/en/",
      sourceIds: ["source-cdpr-site", "source-cdpr-careers", "source-cdpr-group", "source-cdpr-games"],
    },
    {
      id: "naughty-dog",
      name: "Naughty Dog",
      businessType: "game-developer",
      summary:
        "A PlayStation first-party game developer known for The Last of Us and Uncharted; its company page also identifies Intergalactic: The Heretic Prophet as in development.",
      officialWebsiteUrl: "https://www.naughtydog.com/",
      sourceIds: ["source-nd-site", "source-nd-about", "source-nd-careers"],
    },
    {
      id: "santa-monica-studio",
      name: "Santa Monica Studio",
      businessType: "game-developer",
      summary: "A PlayStation Studios developer known for the God of War series.",
      officialWebsiteUrl: "https://sms.playstation.com/",
      sourceIds: ["source-sms-site", "source-sms-careers", "source-sms-about", "source-playstation-studios"],
    },
    {
      id: "riot-games",
      name: "Riot Games",
      businessType: "game-developer-publisher",
      summary:
        "A game developer and publisher whose official career listings organize work around products including League of Legends, VALORANT, and Teamfight Tactics.",
      officialWebsiteUrl: "https://www.riotgames.com/en",
      sourceIds: ["source-riot-site", "source-riot-careers", "source-riot-about"],
    },
  ],
  sites: [
    {
      id: "site-cdpr-warsaw",
      studioId: "cd-projekt-red",
      siteType: "headquarters",
      city: "Warsaw",
      region: "Masovian Voivodeship",
      country: "Poland",
      sourceIds: ["source-cdpr-contact", "source-cdpr-group"],
    },
    {
      id: "site-naughty-dog-santa-monica",
      studioId: "naughty-dog",
      siteType: "studio",
      city: "Santa Monica",
      region: "California",
      country: "United States",
      sourceIds: ["source-nd-careers", "source-nd-about"],
    },
    {
      id: "site-santa-monica-studio",
      studioId: "santa-monica-studio",
      siteType: "studio",
      city: "Santa Monica",
      region: "California",
      country: "United States",
      sourceIds: ["source-sms-careers"],
    },
    {
      id: "site-riot-los-angeles",
      studioId: "riot-games",
      siteType: "office",
      city: "Los Angeles",
      region: "California",
      country: "United States",
      sourceIds: ["source-riot-careers"],
    },
  ],
  ownershipRelationships: [
    {
      id: "ownership-cdpr",
      studioId: "cd-projekt-red",
      ownerName: "CD PROJEKT S.A.",
      relationshipType: "operated-by",
      sourceIds: ["source-cdpr-group"],
    },
    {
      id: "ownership-naughty-dog",
      studioId: "naughty-dog",
      ownerName: "Sony Interactive Entertainment",
      relationshipType: "wholly-owned-subsidiary-of",
      sourceIds: ["source-nd-about"],
    },
    {
      id: "ownership-santa-monica",
      studioId: "santa-monica-studio",
      ownerName: "PlayStation Studios",
      relationshipType: "member-of",
      sourceIds: ["source-playstation-studios"],
    },
  ],
  games: [
    { id: "game-the-witcher-series", title: "The Witcher series", sourceIds: ["source-cdpr-games"] },
    { id: "game-cyberpunk-2077", title: "Cyberpunk 2077", sourceIds: ["source-cdpr-games"] },
    { id: "game-the-last-of-us-series", title: "The Last of Us series", sourceIds: ["source-nd-about"] },
    { id: "game-uncharted-series", title: "Uncharted series", sourceIds: ["source-nd-about"] },
    { id: "game-intergalactic", title: "Intergalactic: The Heretic Prophet", sourceIds: ["source-nd-about"] },
    { id: "game-god-of-war-series", title: "God of War series", sourceIds: ["source-sms-about"] },
    { id: "game-league-of-legends", title: "League of Legends", sourceIds: ["source-riot-about"] },
    { id: "game-valorant", title: "VALORANT", sourceIds: ["source-riot-about"] },
    { id: "game-teamfight-tactics", title: "Teamfight Tactics", sourceIds: ["source-riot-about"] },
  ],
  credits: [
    {
      id: "credit-cdpr-witcher",
      studioId: "cd-projekt-red",
      gameId: "game-the-witcher-series",
      role: "developer",
      sourceIds: ["source-cdpr-games"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-cdpr-cyberpunk",
      studioId: "cd-projekt-red",
      gameId: "game-cyberpunk-2077",
      role: "developer",
      sourceIds: ["source-cdpr-games"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-nd-last-of-us",
      studioId: "naughty-dog",
      gameId: "game-the-last-of-us-series",
      role: "developer",
      sourceIds: ["source-nd-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-nd-uncharted",
      studioId: "naughty-dog",
      gameId: "game-uncharted-series",
      role: "developer",
      sourceIds: ["source-nd-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-nd-intergalactic",
      studioId: "naughty-dog",
      gameId: "game-intergalactic",
      role: "developer",
      sourceIds: ["source-nd-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-sms-god-of-war",
      studioId: "santa-monica-studio",
      gameId: "game-god-of-war-series",
      role: "developer",
      sourceIds: ["source-sms-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-riot-lol",
      studioId: "riot-games",
      gameId: "game-league-of-legends",
      role: "developer",
      sourceIds: ["source-riot-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-riot-valorant",
      studioId: "riot-games",
      gameId: "game-valorant",
      role: "developer",
      sourceIds: ["source-riot-about"],
      verifiedOn: CATALOGUED_ON,
    },
    {
      id: "credit-riot-tft",
      studioId: "riot-games",
      gameId: "game-teamfight-tactics",
      role: "developer",
      sourceIds: ["source-riot-about"],
      verifiedOn: CATALOGUED_ON,
    },
  ],
  opportunities: [],
  applicationRoutes: [
    careerApplicationRoute("cd-projekt-red", "route-cdpr-careers", "source-cdpr-careers"),
    careerApplicationRoute("naughty-dog", "route-naughty-dog-careers", "source-nd-careers"),
    careerApplicationRoute("santa-monica-studio", "route-santa-monica-careers", "source-sms-careers"),
    careerApplicationRoute("riot-games", "route-riot-careers", "source-riot-careers"),
  ],
  changeEvents: [],
};

/** @template T @param {T} value @returns {T} */
function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

const validatedCatalog = validateStudioCatalog(initialCatalog);
assertEnabledRegistrySourcesHaveVerifiedRoutes(validatedCatalog);
export const STUDIO_CATALOG_DATA = deepFreeze(validatedCatalog);

/** @type {StudioProfile[]} */
export const STUDIO_PROFILES = STUDIO_CATALOG_DATA.studios.map((studio) => ({
  ...studio,
  sites: STUDIO_CATALOG_DATA.sites.filter((site) => site.studioId === studio.id),
  ownershipRelationships: STUDIO_CATALOG_DATA.ownershipRelationships.filter(
    (relationship) => relationship.studioId === studio.id,
  ),
  credits: STUDIO_CATALOG_DATA.credits
    .filter((credit) => credit.studioId === studio.id)
    .map((credit) => ({
      ...credit,
      gameTitle: STUDIO_CATALOG_DATA.games.find((game) => game.id === credit.gameId)?.title ?? "Unknown title",
    })),
  routes: STUDIO_CATALOG_DATA.applicationRoutes.filter((route) => route.studioId === studio.id),
}));

/** @param {string} value */
function normalizeSearch(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** @param {string} query */
export function searchStudioProfiles(query) {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return STUDIO_PROFILES;
  return STUDIO_PROFILES.filter((studio) => {
    const relatedText = [
      studio.name,
      studio.summary,
      ...studio.sites.map((site) => [site.city, site.region, site.country].join(" ")),
      ...studio.ownershipRelationships.map((relationship) => relationship.ownerName),
      ...studio.credits.map((credit) => credit.gameTitle),
    ].join(" ");
    return normalizeSearch(relatedText).includes(normalizedQuery);
  });
}
