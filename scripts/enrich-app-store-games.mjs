#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const profilesPath = path.join(root, "src/data/studio-profiles.json");
const SEARCH_URL = "https://itunes.apple.com/search";
const REQUEST_INTERVAL_MS = 3500;

export function normalizeGameTitle(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeDeveloperName(value) {
  return normalizeGameTitle(value)
    .replace(/\b(limited|ltd|incorporated|inc|llc|gmbh|plc|ab|bv|sa|sarl|srl|sro|oy|as|corp|corporation)\b/g, " ")
    .replace(/\b(studios|studio)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isValidAppStoreArtworkUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".mzstatic.com") &&
      !url.username &&
      !url.password &&
      /\.(?:jpe?g|png|webp)$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function isValidAppStorePageUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "apps.apple.com" || url.hostname.endsWith(".apps.apple.com")) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function selectExactAppStoreMatch(title, studioName, searchResponse) {
  const expectedTitle = normalizeGameTitle(title);
  const exactTitleMatches = (Array.isArray(searchResponse?.results) ? searchResponse.results : [])
    .filter(result =>
      normalizeGameTitle(result?.trackName) === expectedTitle &&
      result?.kind === "software",
    );

  if (exactTitleMatches.length === 0) return { status: "not_found" };

  const expectedDeveloper = normalizeDeveloperName(studioName);
  const developerMatches = exactTitleMatches.filter(result =>
    [result?.sellerName, result?.artistName]
      .filter(value => typeof value === "string" && value.trim())
      .some(value => normalizeDeveloperName(value) === expectedDeveloper),
  );

  if (developerMatches.length === 0) return { status: "developer_mismatch" };
  if (developerMatches.length > 1) {
    return { status: "ambiguous", candidateCount: developerMatches.length };
  }

  const match = developerMatches[0];
  const artworkUrl =
    [match.artworkUrl512, match.artworkUrl100, match.artworkUrl60]
      .find(isValidAppStoreArtworkUrl);
  const appStoreUrl = isValidAppStorePageUrl(match.trackViewUrl) ? match.trackViewUrl : undefined;

  if (!artworkUrl && !appStoreUrl) return { status: "missing_assets" };

  return {
    status: "matched",
    ...(artworkUrl ? { appStoreArtworkUrl: artworkUrl } : {}),
    ...(appStoreUrl ? { appStoreUrl } : {}),
  };
}

function parseArgs(argv) {
  const args = { write: false, limit: Infinity };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--write") {
      args.write = true;
    } else if (argv[index] === "--limit") {
      const parsed = Number(argv[index + 1]);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("--limit requires a positive integer.");
      }
      args.limit = parsed;
      index += 1;
    } else if (argv[index] === "--help" || argv[index] === "-h") {
      args.help = true;
    } else {
      throw new Error("Unknown argument: " + argv[index]);
    }
  }
  return args;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readJsonResponse(response, label) {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(label + " failed with HTTP " + response.status + (body ? ": " + body.slice(0, 250) : "."));
  }
  try {
    return JSON.parse(body);
  } catch (error) {
    throw new Error(label + " returned invalid JSON.", { cause: error });
  }
}

async function searchAppStore(title) {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({
    term: title,
    entity: "software",
    limit: "50",
    country: "us",
  }).toString();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      await delay(5000 * (attempt + 1));
      continue;
    }
    return readJsonResponse(response, "Apple App Store search for " + JSON.stringify(title));
  }
  throw new Error("Apple App Store search failed after retries.");
}

function isPubliclyReleasedGame(game) {
  const title = normalizeGameTitle(game.title);
  const stage = String(game.stage || "").toLowerCase();
  if (!title || /\b(untitled|undisclosed|series|franchise)\b/.test(title)) return false;
  if (/\b(in development|prototype|pre production|alpha|undisclosed|early development|not announced)\b/.test(stage)) {
    return false;
  }
  return true;
}

export function collectMissingArtworkGames(profiles) {
  const groups = new Map();
  for (const [studio, profile] of Object.entries(profiles)) {
    for (const game of profile.popularGames || []) {
      if (!isPubliclyReleasedGame(game)) continue;
      if (
        game.igdbCoverId ||
        game.officialArtworkUrl ||
        game.appStoreArtworkUrl ||
        game.appStoreUrl
      ) {
        continue;
      }

      const key = normalizeGameTitle(game.title);
      const group = groups.get(key) || { title: game.title, entries: [] };
      group.entries.push({ studio, game });
      groups.set(key, group);
    }
  }
  return [...groups.values()];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      "Safely enrich missing game artwork and direct links from the Apple App Store.\n\n" +
      "Dry run: node scripts/enrich-app-store-games.mjs [--limit N]\n" +
      "Write exact title + developer matches: node scripts/enrich-app-store-games.mjs --write\n",
    );
    return;
  }

  let profiles;
  try {
    profiles = JSON.parse(readFileSync(profilesPath, "utf8"));
  } catch (error) {
    throw new Error("Could not read src/data/studio-profiles.json.", { cause: error });
  }

  const groups = collectMissingArtworkGames(profiles);
  const counts = {
    titleGroupsQueried: 0,
    matchedRecords: 0,
    notFound: 0,
    developerMismatch: 0,
    ambiguous: 0,
    missingAssets: 0,
    requestFailures: 0,
  };
  const unresolved = [];
  const failures = [];

  for (const group of groups) {
    if (counts.titleGroupsQueried >= args.limit) break;
    if (counts.titleGroupsQueried > 0) await delay(REQUEST_INTERVAL_MS);

    let response;
    try {
      response = await searchAppStore(group.title);
    } catch (error) {
      counts.requestFailures += 1;
      failures.push({ title: group.title, error: String(error).slice(0, 180) });
      continue;
    }
    counts.titleGroupsQueried += 1;

    for (const studio of [...new Set(group.entries.map(entry => entry.studio))]) {
      const result = selectExactAppStoreMatch(group.title, studio, response);
      if (result.status === "matched") {
        for (const entry of group.entries.filter(item => item.studio === studio)) {
          if (result.appStoreArtworkUrl) entry.game.appStoreArtworkUrl = result.appStoreArtworkUrl;
          if (result.appStoreUrl) entry.game.appStoreUrl = result.appStoreUrl;
          counts.matchedRecords += 1;
        }
      } else {
        const countKey = {
          not_found: "notFound",
          developer_mismatch: "developerMismatch",
          ambiguous: "ambiguous",
          missing_assets: "missingAssets",
        }[result.status] || "notFound";
        counts[countKey] += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      }
    }
  }

  if (failures.length) {
    process.stdout.write(JSON.stringify({ requestFailures: failures.slice(0, 20) }, null, 2) + "\n");
  }

  if (args.write) {
    writeFileSync(profilesPath, JSON.stringify(profiles, null, 2) + "\n", "utf8");
    process.stdout.write("Updated studio profiles with exact-title, developer-matched App Store artwork and links.\n");
  } else {
    process.stdout.write("Dry run only; no files were changed. Re-run with --write to persist verified App Store metadata.\n");
  }

  process.stdout.write(JSON.stringify({ ...counts, unresolvedRecords: unresolved.length }, null, 2) + "\n");
  for (const item of unresolved.slice(0, 40)) {
    process.stdout.write("- " + item.status + ": " + item.title + " [" + item.studio + "]\n");
  }
  if (unresolved.length > 40) {
    process.stdout.write("- " + (unresolved.length - 40) + " additional unresolved records omitted.\n");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write((error?.stack || String(error)) + "\n");
    process.exitCode = 1;
  });
}
