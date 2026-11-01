#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const profilesPath = path.join(root, "src/data/studio-profiles.json");
const SEARCH_URL = "https://store.steampowered.com/api/storesearch/";
const DETAILS_URL = "https://store.steampowered.com/api/appdetails";
const REQUEST_INTERVAL_MS = 800;

export function normalizeGameTitle(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\\s+/g, " ");
}

export function normalizeDeveloperName(value) {
  return normalizeGameTitle(value)
    .replace(/\\b(limited|ltd|incorporated|inc|llc|gmbh|plc|ab|bv|sa|sarl|srl|oy|as)\\b/g, " ")
    .replace(/\\b(studios|studio)\\b/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
}

export function selectExactSteamMatch(title, studioName, searchResults, appDetails) {
  const normalizedTitle = normalizeGameTitle(title);
  const items = Array.isArray(searchResults?.items) ? searchResults.items : [];
  const exactItems = [...new Map(
    items
      .filter(item =>
        Number.isInteger(item?.id) &&
        item.id > 0 &&
        normalizeGameTitle(item?.name) === normalizedTitle,
      )
      .map(item => [item.id, item]),
  ).values()];

  if (exactItems.length === 0) return { status: "not_found" };
  if (exactItems.length > 1) return { status: "ambiguous", candidateCount: exactItems.length };

  const appId = exactItems[0].id;
  const detail = appDetails?.[String(appId)];
  if (!detail?.success || !detail.data) return { status: "details_unavailable", appId };
  if (detail.data.type !== "game" || normalizeGameTitle(detail.data.name) !== normalizedTitle) {
    return { status: "not_a_game", appId };
  }

  const expectedDeveloper = normalizeDeveloperName(studioName);
  const developers = Array.isArray(detail.data.developers) ? detail.data.developers : [];
  const developerMatches = developers.some(name =>
    normalizeDeveloperName(name) === expectedDeveloper,
  );
  if (!developerMatches) return { status: "developer_mismatch", appId };

  return { status: "matched", appId };
}

function parseArgs(argv) {
  const args = { write: false, limit: Infinity };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--write") {
      args.write = true;
    } else if (argv[index] === "--limit") {
      const parsed = Number(argv[index + 1]);
      if (!Number.isInteger(parsed) || parsed < 1) throw new Error("--limit requires a positive integer.");
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

async function steamRequest(url, label) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers: { "Accept": "application/json" } });
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await delay(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
      continue;
    }
    return readJsonResponse(response, label);
  }
  throw new Error(label + " failed after retries.");
}

async function searchSteam(title) {
  const url = new URL(SEARCH_URL);
  url.search = new URLSearchParams({ term: title, l: "english", cc: "US" }).toString();
  const searchResults = await steamRequest(url, "Steam search for " + JSON.stringify(title));
  const exactIds = [...new Set(
    (Array.isArray(searchResults?.items) ? searchResults.items : [])
      .filter(item => Number.isInteger(item?.id) && normalizeGameTitle(item?.name) === normalizeGameTitle(title))
      .map(item => item.id),
  )];
  if (exactIds.length !== 1) return { searchResults, appDetails: {} };

  const detailsUrl = new URL(DETAILS_URL);
  detailsUrl.search = new URLSearchParams({ appids: String(exactIds[0]), cc: "US", l: "english" }).toString();
  const appDetails = await steamRequest(detailsUrl, "Steam app details for " + exactIds[0]);
  return { searchResults, appDetails };
}

function collectGames(profiles) {
  const groups = new Map();
  for (const [studio, profile] of Object.entries(profiles)) {
    for (const game of profile.popularGames || []) {
      const key = normalizeGameTitle(game.title);
      if (!key || game.appId) continue;
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
      "Safely enrich missing Steam app IDs from the public Steam Store API.\\n\\n" +
      "Dry run: node scripts/enrich-steam-games.mjs [--limit N]\\n" +
      "Write exact title + developer matches: node scripts/enrich-steam-games.mjs --write\\n",
    );
    return;
  }

  let profiles;
  try {
    profiles = JSON.parse(readFileSync(profilesPath, "utf8"));
  } catch (error) {
    throw new Error("Could not read src/data/studio-profiles.json.", { cause: error });
  }

  const groups = collectGames(profiles);
  const counts = { queried: 0, matchedRecords: 0, reusedTitleMatches: 0, ambiguous: 0, notFound: 0, developerMismatch: 0, notGame: 0, detailsUnavailable: 0 };
  const unresolved = [];

  for (const group of groups) {
    if (counts.queried >= args.limit) break;
    if (counts.queried > 0) await delay(REQUEST_INTERVAL_MS);
    const { searchResults, appDetails } = await searchSteam(group.title);
    counts.queried += 1;

    const groupResults = [];
    for (const studio of [...new Set(group.entries.map(entry => entry.studio))]) {
      const result = selectExactSteamMatch(group.title, studio, searchResults, appDetails);
      if (result.status === "matched") {
        for (const entry of group.entries.filter(item => item.studio === studio && !item.game.appId)) {
          entry.game.appId = result.appId;
          counts.matchedRecords += 1;
          groupResults.push(studio);
        }
      } else if (result.status === "ambiguous") {
        counts.ambiguous += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      } else if (result.status === "developer_mismatch") {
        counts.developerMismatch += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      } else if (result.status === "not_a_game") {
        counts.notGame += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      } else if (result.status === "details_unavailable") {
        counts.detailsUnavailable += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      } else {
        counts.notFound += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      }
    }
    if (groupResults.length > 1) counts.reusedTitleMatches += groupResults.length - 1;
  }

  if (args.write) {
    writeFileSync(profilesPath, JSON.stringify(profiles, null, 2) + "\\n", "utf8");
    process.stdout.write("Updated studio profiles with exact Steam title and developer matches.\\n");
  } else {
    process.stdout.write("Dry run only; no files were changed. Re-run with --write to persist verified app IDs.\\n");
  }

  process.stdout.write(JSON.stringify({ ...counts, unresolvedRecords: unresolved.length }, null, 2) + "\\n");
  for (const item of unresolved.slice(0, 40)) {
    process.stdout.write("- " + item.status + ": " + item.title + " [" + item.studio + "]\\n");
  }
  if (unresolved.length > 40) {
    process.stdout.write("- " + (unresolved.length - 40) + " additional unresolved records omitted.\\n");
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write((error?.stack || String(error)) + "\\n");
    process.exitCode = 1;
  });
}
