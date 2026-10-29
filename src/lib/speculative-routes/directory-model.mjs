/** @typedef {{id:string,studioId:string,routeUrl:string,evidenceUrl:string,routeType:string,status:string,countryScope:string,countryCodes:string[],language:string|null,disciplineTags:string[],workModel:string,matchedPhraseCategory:string,evidenceSummary:string,contentHash:string,firstSeenAt:string,lastCheckedAt:string,lastVerifiedAt:string|null}} SpeculativeRouteRecord */
/** @typedef {{id:string,name:string,officialWebsiteUrl:string,homeCountryCode:string|null}} DirectoryStudio */
/** @typedef {{schemaVersion:1,generatedAt:string,studios:DirectoryStudio[],routes:SpeculativeRouteRecord[]}} RouteDirectory */
/** @typedef {SpeculativeRouteRecord & {studioName:string}} RouteDirectoryEntry */
/** @typedef {{query?:string,status?:string,routeType?:string,countryScope?:string,discipline?:string,sort?:string,page?:number,pageSize?:number}} RouteDirectoryOptions */

export const ROUTE_DIRECTORY_PAGE_SIZE = 10;

/** @param {string} left @param {string} right */
function compareText(left, right) {
  return left.localeCompare(right, "en", { sensitivity: "base", numeric: true });
}

/** @param {RouteDirectoryEntry} left @param {RouteDirectoryEntry} right @param {string} sort */
function compareRoutes(left, right, sort) {
  if (sort === "studio-asc") {
    return compareText(left.studioName, right.studioName) || compareText(left.id, right.id);
  }
  if (sort === "checked-asc") {
    return Date.parse(left.lastCheckedAt) - Date.parse(right.lastCheckedAt) || compareText(left.id, right.id);
  }
  if (sort === "status-asc") {
    return compareText(left.status, right.status) || compareText(left.studioName, right.studioName) || compareText(left.id, right.id);
  }
  return Date.parse(right.lastCheckedAt) - Date.parse(left.lastCheckedAt) || compareText(left.id, right.id);
}

/**
 * Return a deterministic page of route records enriched with the referenced studio name.
 * Search and filtering are deliberately offline and never interpret generic career links as routes.
 * @param {RouteDirectory} directory
 * @param {RouteDirectoryOptions} [options]
 * @returns {{items: RouteDirectoryEntry[], totalCount:number, page:number, pageCount:number}}
 */
export function selectSpeculativeRoutes(directory, options = {}) {
  const {
    query = "",
    status = "all",
    routeType = "all",
    countryScope = "all",
    discipline = "all",
    sort = "checked-desc",
    page = 1,
    pageSize = ROUTE_DIRECTORY_PAGE_SIZE,
  } = options;
  const studioById = new Map(directory.studios.map((studio) => [studio.id, studio.name]));
  const studioUrlById = new Map(directory.studios.map((studio) => [studio.id, studio.officialWebsiteUrl]));
  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const normalizedPageSize = Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= 100
    ? pageSize
    : ROUTE_DIRECTORY_PAGE_SIZE;

  const matching = directory.routes
    .map((route) => ({
      ...route,
      studioName: studioById.get(route.studioId) ?? route.studioId,
    }))
    .filter((route) => {
      if (status !== "all" && route.status !== status) return false;
      if (routeType !== "all" && route.routeType !== routeType) return false;
      if (countryScope !== "all" && route.countryScope !== countryScope) return false;
      if (discipline !== "all" && !route.disciplineTags.includes(discipline)) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        route.studioName,
        studioUrlById.get(route.studioId) ?? "",
        route.id,
        route.studioId,
        route.routeUrl,
        route.evidenceUrl,
        route.routeType,
        route.status,
        route.countryScope,
        ...route.countryCodes,
        route.language ?? "",
        ...route.disciplineTags,
        route.workModel,
        route.matchedPhraseCategory,
        route.evidenceSummary,
      ].join(" ").toLocaleLowerCase("en");
      return haystack.includes(normalizedQuery);
    })
    .sort((left, right) => compareRoutes(left, right, sort));

  const totalCount = matching.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / normalizedPageSize));
  const normalizedPage = Number.isInteger(page) ? Math.min(Math.max(1, page), pageCount) : 1;
  const start = (normalizedPage - 1) * normalizedPageSize;

  return {
    items: matching.slice(start, start + normalizedPageSize),
    totalCount,
    page: normalizedPage,
    pageCount,
  };
}
