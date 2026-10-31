const COUNTRY_CODE_FALLBACK: Record<string, string> = {
  Australia: "AU", Austria: "AT", Canada: "CA", China: "CN", Denmark: "DK",
  England: "GB", Finland: "FI", France: "FR", Hungary: "HU", Iceland: "IS",
  India: "IN", Netherlands: "NL", Norway: "NO", Pakistan: "PK", Poland: "PL",
  Serbia: "RS", Sweden: "SE", Switzerland: "CH", "Türkiye": "TR",
  "United States": "US", "United Kingdom": "GB", "Czech Republic": "CZ",
  "South Korea": "KR", "Saudi Arabia": "SA", "United Arab Emirates": "AE",
  "New Zealand": "NZ",
};

function flagFromCode(code: string): string | null {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) return null;
  const first = normalized.codePointAt(0);
  const second = normalized.codePointAt(1);
  if (first === undefined || second === undefined) return null;
  return String.fromCodePoint(first + 127397, second + 127397);
}

export function countryFlagFor(country: string, countryCode?: string | null): string | null {
  const label = country.trim();
  if (!label || /^(not stated|not publicly stated|not disclosed|unknown)$/i.test(label)) return null;
  if (label === "Remote") return "🌐";
  if (label === "France / Canada") return "🇫🇷 🇨🇦";
  if (label === "Ukraine / Cyprus") return "🇺🇦 🇨🇾";
  const code = countryCode?.trim().toUpperCase() || COUNTRY_CODE_FALLBACK[label];
  return code ? flagFromCode(code) : null;
}
