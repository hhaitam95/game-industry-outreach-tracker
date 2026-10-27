/** @typedef {{city: string, country: string, label: string}} ParsedLocation */
/** @typedef {
 *   "Intern/Junior" |
 *   "Mid (II)" |
 *   "Senior" |
 *   "Staff" |
 *   "Principal" |
 *   "Lead" |
 *   "Manager" |
 *   "Director/Head" |
 *   "Not stated"
 * } ParsedSeniority */
/** @typedef {{
 *   location: ParsedLocation | null,
 *   seniority: ParsedSeniority,
 *   contract: boolean,
 *   relocationMentioned: boolean,
 *   provenance: "parsed from listing text"
 * }} ParsedTitle */

/** @type {Array<{label: ParsedSeniority, pattern: RegExp}>} */
const SENIORITY_RULES = [
  { label: "Intern/Junior", pattern: /\b(?:intern|junior)\b/i },
  { label: "Mid (II)", pattern: /\bII\b/i },
  { label: "Senior", pattern: /\b(?:senior|sr\.?)\b/i },
  { label: "Staff", pattern: /\bstaff\b/i },
  { label: "Principal", pattern: /\bprincipal\b/i },
  { label: "Lead", pattern: /\blead\b/i },
  { label: "Manager", pattern: /\bmanager\b/i },
  { label: "Director/Head", pattern: /\b(?:director|head)\b/i },
];

const COUNTRY_ALIASES = new Map([
  ["us", "USA"],
  ["u.s.", "USA"],
  ["usa", "USA"],
  ["united states", "USA"],
  ["united states of america", "USA"],
  ["korea", "South Korea"],
  ["south korea", "South Korea"],
  ["republic of korea", "South Korea"],
  ["korea, south", "South Korea"],
]);
const CITY_STATES = new Set(["singapore"]);

/** @param {string} country */
function normalizeCountry(country) {
  const trimmed = country.trim().replace(/[.]+$/, "");
  return COUNTRY_ALIASES.get(trimmed.toLowerCase()) ?? trimmed;
}

/** @param {string} value */
function isCountryAlias(value) {
  const key = value.trim().toLowerCase().replace(/[.]+$/, "");
  return (
    COUNTRY_ALIASES.has(key) ||
    [
      "ireland",
      "canada",
      "united kingdom",
      "uk",
      "england",
      "poland",
      "france",
      "germany",
      "japan",
      "australia",
      "india",
      "china",
      "brazil",
      "spain",
      "netherlands",
      "vietnam",
      "mexico",
      "new zealand",
      "sweden",
      "finland",
      "denmark",
      "italy",
      "portugal",
    ].includes(key)
  );
}

/** @param {string} suffix @returns {ParsedLocation | null} */
function parseLocationSuffix(suffix) {
  const parts = suffix.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 1 && CITY_STATES.has(parts[0].toLowerCase())) {
    const city = parts[0];
    const country = normalizeCountry(city);
    return { city, country, label: city + ", " + country };
  }
  if (parts.length < 2) return null;

  const city = parts[parts.length - 2];
  const country = parts[parts.length - 1];
  if (!city || !country) return null;
  const normalizedCountry = normalizeCountry(country);
  return { city, country: normalizedCountry, label: city + ", " + normalizedCountry };
}

/** @param {string} title @returns {ParsedLocation | null} */
function parseTrailingLocation(title) {
  const separators = [...title.matchAll(/\s+[-–—|]\s+/g)];
  if (separators.length > 0) {
    const separator = separators[separators.length - 1];
    const suffix = title.slice(separator.index + separator[0].length).trim();
    const location = parseLocationSuffix(suffix);
    if (location) return location;
  }

  const parts = title.split(",").map((part) => part.trim());
  if (parts.length >= 3 && isCountryAlias(parts[parts.length - 1])) {
    return parseLocationSuffix(parts.slice(-2).join(","));
  }
  return null;
}

/**
 * Parse only obvious title-text clues. This does not infer source-provided
 * employment data, work authorization, or eligibility.
 * @param {string} rawTitle
 * @returns {ParsedTitle}
 */
export function parseTitle(rawTitle) {
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const seniority = SENIORITY_RULES.find((rule) => rule.pattern.test(title))?.label ?? "Not stated";
  return {
    location: parseTrailingLocation(title),
    seniority,
    contract: /\(\s*contract\s*\)/i.test(title),
    relocationMentioned: /\brelocation\b/i.test(title),
    provenance: "parsed from listing text",
  };
}

export const SENIORITY_ORDER = Object.freeze([
  "Intern/Junior",
  "Mid (II)",
  "Senior",
  "Staff",
  "Principal",
  "Lead",
  "Manager",
  "Director/Head",
  "Not stated",
]);
