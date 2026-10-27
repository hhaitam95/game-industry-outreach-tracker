import { classifyRoleFamily, TARGET_ROLE_FAMILIES } from "./classify.mjs";
import { getRoleFreshness } from "./freshness.mjs";
import { parseTitle, SENIORITY_ORDER } from "./parse.mjs";

/** @typedef {Record<string, any> & {
 * parsed: import("./parse.mjs").ParsedTitle,
 * classification: import("./classify.mjs").RoleClassification,
 * freshness: ReturnType<typeof getRoleFreshness>
 * }} PreparedOpportunity */

/** @typedef {{
 * studioId?: string,
 * family?: string,
 * seniority?: string,
 * country?: string,
 * contract?: boolean | null,
 * freshness?: "latest" | "older" | "",
 * query?: string,
 * targetFamiliesOnly?: boolean,
 * generatedAt?: string
 * }} OpportunityFilterOptions */

const FAMILY_ORDER = Object.freeze([...TARGET_ROLE_FAMILIES, "technical-production", "other", "unclassified"]);
const SENIORITY_RANK = new Map(SENIORITY_ORDER.map((seniority, index) => [seniority, index]));

/** @param {unknown[]} values */
function countValues(values) {
  /** @type {Record<string, number>} */
  const counts = {};
  for (const value of values) {
    const key = String(value);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/**
 * @param {PreparedOpportunity[]} roles
 * @param {OpportunityFilterOptions} options
 * @param {"none" | "studio" | "family" | "seniority" | "country" | "contract" | "freshness"} omittedFacet
 */
function matchesRoles(roles, options, omittedFacet) {
  return roles.filter((role) => {
    if (omittedFacet !== "studio" && options.studioId && role.studioId !== options.studioId) return false;
    if (omittedFacet !== "family" && options.family && role.classification.family !== options.family) return false;
    if (omittedFacet !== "seniority" && options.seniority && role.parsed.seniority !== options.seniority) return false;
    if (
      omittedFacet !== "country" &&
      options.country &&
      (role.parsed.location?.country ?? "Not listed in source") !== options.country
    ) {
      return false;
    }
    if (
      omittedFacet !== "contract" &&
      typeof options.contract === "boolean" &&
      role.parsed.contract !== options.contract
    ) {
      return false;
    }
    if (omittedFacet !== "freshness" && options.freshness && role.freshness.key !== options.freshness) return false;
    if (options.targetFamiliesOnly && !TARGET_ROLE_FAMILIES.some((family) => family === role.classification.family)) {
      return false;
    }
    if (options.query && !role.title.toLocaleLowerCase().includes(options.query.trim().toLocaleLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Filter and rank the bundled snapshot. Facet counts are recomputed while
 * ignoring that facet's own selection, but respecting all other filters.
 * @param {Array<Record<string, any>>} opportunities
 * @param {OpportunityFilterOptions} [options]
 * @returns {{roles: PreparedOpportunity[], totalCount: number, counts: Record<string, any>}}
 */
export function filterOpportunities(opportunities, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const prepared = opportunities.map((role) => ({
    ...role,
    parsed: parseTitle(role.title),
    classification: classifyRoleFamily(role.title),
    freshness: getRoleFreshness(role, generatedAt),
  }));
  const roles = matchesRoles(prepared, options, "none").sort((left, right) => {
    const familyDiff =
      FAMILY_ORDER.indexOf(left.classification.family) - FAMILY_ORDER.indexOf(right.classification.family);
    if (familyDiff !== 0) return familyDiff;
    const seniorityDiff =
      (SENIORITY_RANK.get(left.parsed.seniority) ?? Number.MAX_SAFE_INTEGER) -
      (SENIORITY_RANK.get(right.parsed.seniority) ?? Number.MAX_SAFE_INTEGER);
    if (seniorityDiff !== 0) return seniorityDiff;
    const freshnessDiff = Date.parse(right.lastSeenAt) - Date.parse(left.lastSeenAt);
    if (freshnessDiff !== 0) return freshnessDiff;
    return left.title.localeCompare(right.title);
  });

  /** @param {"studio" | "family" | "seniority" | "country" | "contract" | "freshness"} facet */
  const countFacet = (facet) => matchesRoles(prepared, options, facet);
  const studioRows = countFacet("studio");
  const familyRows = countFacet("family");
  const seniorityRows = countFacet("seniority");
  const countryRows = countFacet("country");
  const freshnessRows = countFacet("freshness");
  const contractRows = countFacet("contract");

  const counts = {
    studios: countValues(studioRows.map((role) => role.studioName)),
    roleFamilies: countValues(familyRows.map((role) => role.classification.family)),
    seniorities: countValues(seniorityRows.map((role) => role.parsed.seniority)),
    countries: countValues(countryRows.map((role) => role.parsed.location?.country ?? "Not listed in source")),
    freshness: {
      latest: freshnessRows.filter((role) => role.freshness.key === "latest").length,
      older: freshnessRows.filter((role) => role.freshness.key === "older").length,
    },
    contract: {
      contract: contractRows.filter((role) => role.parsed.contract).length,
      nonContract: contractRows.filter((role) => !role.parsed.contract).length,
    },
  };

  return { roles, totalCount: roles.length, counts };
}
