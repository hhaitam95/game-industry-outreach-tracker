export type ContinentLabel =
  | "Africa"
  | "Asia"
  | "Europe"
  | "North America"
  | "South America"
  | "Oceania"
  | "Remote / distributed"
  | "Not stated";

const CONTINENT_BY_COUNTRY_CODE: Record<string, ContinentLabel> = {
  // Africa
  MA: "Africa",
  NG: "Africa",

  // Asia
  AE: "Asia",
  CN: "Asia",
  ID: "Asia",
  IN: "Asia",
  IQ: "Asia",
  JP: "Asia",
  KR: "Asia",
  MY: "Asia",
  PK: "Asia",
  PH: "Asia",
  SA: "Asia",
  SG: "Asia",
  TH: "Asia",
  TR: "Asia",
  VN: "Asia",

  // Europe
  AT: "Europe",
  BE: "Europe",
  BG: "Europe",
  CY: "Europe",
  CZ: "Europe",
  DE: "Europe",
  DK: "Europe",
  ES: "Europe",
  FI: "Europe",
  FR: "Europe",
  GB: "Europe",
  HU: "Europe",
  IS: "Europe",
  IT: "Europe",
  MD: "Europe",
  MT: "Europe",
  NL: "Europe",
  NO: "Europe",
  PL: "Europe",
  PT: "Europe",
  RS: "Europe",
  SE: "Europe",
  CH: "Europe",
  UA: "Europe",

  // North America
  CA: "North America",
  CR: "North America",
  US: "North America",

  // South America
  BR: "South America",

  // Oceania
  AU: "Oceania",
  NZ: "Oceania",
};

const COUNTRY_CODE_BY_NAME: Record<string, string> = {
  Australia: "AU",
  Austria: "AT",
  Belgium: "BE",
  Brazil: "BR",
  Bulgaria: "BG",
  Canada: "CA",
  China: "CN",
  "Costa Rica": "CR",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  England: "GB",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Hungary: "HU",
  Iceland: "IS",
  India: "IN",
  Indonesia: "ID",
  Iraq: "IQ",
  Italy: "IT",
  Japan: "JP",
  Malaysia: "MY",
  Malta: "MT",
  Moldova: "MD",
  Morocco: "MA",
  Netherlands: "NL",
  Nigeria: "NG",
  Norway: "NO",
  Pakistan: "PK",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Serbia: "RS",
  Singapore: "SG",
  "South Korea": "KR",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  Thailand: "TH",
  "Türkiye": "TR",
  Ukraine: "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  Vietnam: "VN",
};

const CONTINENT_ORDER: ContinentLabel[] = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Remote / distributed",
  "Not stated",
];

export function continentsForLocation(country: string, countryCode?: string | null): ContinentLabel[] {
  const label = country.trim();
  if (/^remote$/i.test(label)) return ["Remote / distributed"];

  const explicitCode = countryCode?.trim().toUpperCase();
  const codes = explicitCode && /^[A-Z]{2}$/.test(explicitCode) && CONTINENT_BY_COUNTRY_CODE[explicitCode]
    ? [explicitCode]
    : label.split(/\s*\/\s*/).map((part) => COUNTRY_CODE_BY_NAME[part.trim()]).filter(Boolean);

  const continents = Array.from(
    new Set(codes.map((code) => CONTINENT_BY_COUNTRY_CODE[code]).filter(Boolean)),
  ) as ContinentLabel[];

  if (continents.length === 0) return ["Not stated"];
  return continents.sort(
    (a, b) => CONTINENT_ORDER.indexOf(a) - CONTINENT_ORDER.indexOf(b),
  );
}

function flagFromCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return null;
  const first = normalized.codePointAt(0);
  const second = normalized.codePointAt(1);
  if (first === undefined || second === undefined) return null;
  return String.fromCodePoint(first + 127397, second + 127397);
}

const COUNTRY_CODE_FALLBACK: Record<string, string> = {
  Australia: "AU", Austria: "AT", Canada: "CA", China: "CN", Denmark: "DK",
  England: "GB", Finland: "FI", France: "FR", Hungary: "HU", Iceland: "IS",
  India: "IN", Netherlands: "NL", Norway: "NO", Pakistan: "PK", Poland: "PL",
  Serbia: "RS", Sweden: "SE", Switzerland: "CH", "Türkiye": "TR",
  "United States": "US", "United Kingdom": "GB", "Czech Republic": "CZ",
  Czechia: "CZ", "South Korea": "KR", "Saudi Arabia": "SA", "United Arab Emirates": "AE",
  "New Zealand": "NZ", Germany: "DE", Belgium: "BE", Brazil: "BR", Bulgaria: "BG",
  "Costa Rica": "CR", Cyprus: "CY", Indonesia: "ID", Iraq: "IQ", Italy: "IT",
  Japan: "JP", Malaysia: "MY", Malta: "MT", Moldova: "MD", Morocco: "MA",
  Nigeria: "NG", Philippines: "PH", Portugal: "PT", Singapore: "SG", Spain: "ES",
  Thailand: "TH", Ukraine: "UA", Vietnam: "VN",
};

export function countryFlagFor(country: string, countryCode?: string | null): string | null {
  const label = country.trim();
  if (!label || /^(not stated|not publicly stated|not disclosed|unknown)$/i.test(label)) return null;
  if (label === "Remote") return "🌐";
  if (label === "France / Canada") return "🇫🇷 🇨🇦";
  if (label === "Ukraine / Cyprus") return "🇺🇦 🇨🇾";
  const code = countryCode?.trim().toUpperCase() || COUNTRY_CODE_FALLBACK[label];
  return code ? flagFromCode(code) : null;
}
