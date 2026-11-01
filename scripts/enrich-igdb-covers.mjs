#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const profilesPath = path.join(root, "src/data/studio-profiles.json");
const API_BASE = "https://api.igdb.com/v4";
const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const REQUEST_INTERVAL_MS = 325;

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

export function selectExactIgdbMatch(title, results) {
  const normalizedTitle = normalizeGameTitle(title);
  const exactMatches = (Array.isArray(results) ? results : []).filter(
    result => normalizeGameTitle(result?.name) === normalizedTitle,
  );

  if (exactMatches.length === 0) {
    return { status: "not_found", exactMatchCount: 0 };
  }
  if (exactMatches.length > 1) {
    return { status: "ambiguous", exactMatchCount: exactMatches.length };
  }

  const game = exactMatches[0];
  const covers = Array.isArray(game.cover) ? game.cover : game.cover ? [game.cover] : [];
  const cover = covers.find(item => typeof item?.image_id === "string" && item.image_id.trim());
  if (!cover) {
    return {
      status: "missing_cover",
      exactMatchCount: 1,
      igdbGameId: game.id,
      igdbSlug: typeof game.slug === "string" ? game.slug : undefined,
    };
  }
  if (!Number.isInteger(game.id) || game.id < 1) {
    return { status: "invalid_result", exactMatchCount: 1 };
  }

  return {
    status: "matched",
    exactMatchCount: 1,
    igdbGameId: game.id,
    igdbSlug: typeof game.slug === "string" ? game.slug : undefined,
    igdbCoverId: cover.image_id,
  };
}

function parseArgs(argv) {
  const args = { write: false, limit: Infinity };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--write") {
      args.write = true;
    } else if (value === "--limit") {
      const parsed = Number(argv[index + 1]);
      if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error("--limit requires a positive integer.");
      }
      args.limit = parsed;
      index += 1;
    } else if (value === "--help" || value === "-h") {
      args.help = true;
    } else {
      throw new Error("Unknown argument: " + value);
    }
  }
  return args;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readResponse(response, label) {
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(label + " failed with HTTP " + response.status + (responseText ? ": " + responseText.slice(0, 300) : "."));
  }
  try {
    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(label + " returned invalid JSON.", { cause: error });
  }
}

async function getAccessToken(clientId, clientSecret) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const token = await readResponse(response, "Twitch application-token request");
  if (typeof token.access_token !== "string" || !token.access_token) {
    throw new Error("Twitch did not return an application access token.");
  }
  return token.access_token;
}

function escapeApicalypse(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function searchIgdb(title, clientId, accessToken) {
  const query = `search "${escapeApicalypse(title)}"; fields id,name,slug,cover.image_id; limit 30;`;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(API_BASE + "/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        Authorization: "Bearer " + accessToken,
        "Content-Type": "text/plain",
      },
      body: query,
    });
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await delay(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
      continue;
    }
    return readResponse(response, "IGDB game search for " + JSON.stringify(title));
  }
  throw new Error("IGDB rate limit persisted after retries.");
}

function readProfiles() {
  try {
    return JSON.parse(readFileSync(profilesPath, "utf8"));
  } catch (error) {
    throw new Error("Could not read src/data/studio-profiles.json.", { cause: error });
  }
}

function collectGameEntries(profiles) {
  const entriesByTitle = new Map();
  for (const [studio, profile] of Object.entries(profiles)) {
    for (const game of profile.popularGames || []) {
      const key = normalizeGameTitle(game.title);
      if (!key) continue;
      const group = entriesByTitle.get(key) || { title: game.title, entries: [], studioNames: [] };
      group.entries.push(game);
      group.studioNames.push(studio);
      entriesByTitle.set(key, group);
    }
  }
  return [...entriesByTitle.values()];
}

function copyMetadata(target, match) {
  target.igdbGameId = match.igdbGameId;
  if (match.igdbSlug) target.igdbSlug = match.igdbSlug;
  target.igdbCoverId = match.igdbCoverId;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      "IGDB artwork metadata enrichment\n\n" +
      "Requires IGDB_CLIENT_ID and IGDB_CLIENT_SECRET environment variables.\n" +
      "Dry run: node scripts/enrich-igdb-covers.mjs [--limit N]\n" +
      "Write exact, unambiguous matches: node scripts/enrich-igdb-covers.mjs --write\n",
    );
    return;
  }

  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in the environment. Do not commit either value.");
  }

  const profiles = readProfiles();
  const groups = collectGameEntries(profiles);
  const existingByTitle = new Map();
  for (const group of groups) {
    const existing = group.entries.find(game =>
      Number.isInteger(game.igdbGameId) && typeof game.igdbCoverId === "string" && game.igdbCoverId,
    );
    if (existing) existingByTitle.set(normalizeGameTitle(group.title), existing);
  }

  const token = await getAccessToken(clientId, clientSecret);
  const counts = { queried: 0, matched: 0, ambiguous: 0, notFound: 0, missingCover: 0, reused: 0 };
  const unresolved = [];

  for (const group of groups) {
    const key = normalizeGameTitle(group.title);
    const existing = existingByTitle.get(key);
    if (existing) {
      const metadata = {
        igdbGameId: existing.igdbGameId,
        igdbSlug: existing.igdbSlug,
        igdbCoverId: existing.igdbCoverId,
      };
      for (const game of group.entries) {
        if (!game.igdbCoverId) copyMetadata(game, metadata);
      }
      counts.reused += 1;
      continue;
    }

    if (counts.queried >= args.limit) break;
    if (counts.queried > 0) await delay(REQUEST_INTERVAL_MS);
    const results = await searchIgdb(group.title, clientId, token);
    counts.queried += 1;
    const match = selectExactIgdbMatch(group.title, results);

    if (match.status === "matched") {
      counts.matched += 1;
      for (const game of group.entries) copyMetadata(game, match);
    } else {
      if (match.status === "ambiguous") counts.ambiguous += 1;
      else if (match.status === "missing_cover") counts.missingCover += 1;
      else counts.notFound += 1;
      unresolved.push({ title: group.title, studios: [...new Set(group.studioNames)], status: match.status });
    }
  }

  if (args.write) {
    const serialized = JSON.stringify(profiles, null, 2) + "\n";
    writeFileSync(profilesPath, serialized, "utf8");
    process.stdout.write("Updated src/data/studio-profiles.json with exact IGDB title matches.\n");
  } else {
    process.stdout.write("Dry run only; no files were changed. Re-run with --write to persist exact matches.\n");
  }

  process.stdout.write(JSON.stringify({ ...counts, unresolved: unresolved.length }, null, 2) + "\n");
  for (const item of unresolved.slice(0, 30)) {
    process.stdout.write("- " + item.status + ": " + item.title + " [" + item.studios.join(", ") + "]\n");
  }
  if (unresolved.length > 30) process.stdout.write("- " + (unresolved.length - 30) + " additional unresolved titles omitted.\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    process.stderr.write((error?.stack || String(error)) + "\n");
    process.exitCode = 1;
  });
}
