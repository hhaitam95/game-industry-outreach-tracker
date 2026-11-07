#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.cwd();
const profilesPath = path.join(root, "src/data/studio-profiles.json");
const SEARCH_URL = "https://store.steampowered.com/api/storesearch/";
const DETAILS_URL = "https://store.steampowered.com/api/appdetails";
const APP_REVIEWS_URL = "https://store.steampowered.com/appreviews/";
const STEAM_METADATA_REFRESH_MS = 30 * 24 * 60 * 60 * 1000;
const REQUEST_INTERVAL_MS = 800;

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
    .replace(/\b(limited|ltd|incorporated|inc|llc|gmbh|plc|ab|bv|sa|sarl|srl|oy|as)\b/g, " ")
    .replace(/\b(studios|studio)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isValidSteamArtworkUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname.endsWith(".steamstatic.com") &&
      !url.username &&
      !url.password &&
      /\.(?:jpe?g|png|webp)$/i.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export function releaseYearFromSteamDate(value) {
  const match = String(value || "").match(/\b(?:19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

export function selectExactSteamArtwork(title, appDetailsEntry) {
  const detail = appDetailsEntry?.success ? appDetailsEntry.data : null;
  if (!detail || detail.type !== "game") return { status: "not_a_game" };
  if (normalizeGameTitle(detail.name) !== normalizeGameTitle(title)) {
    return { status: "title_mismatch" };
  }

  const headerUrl = isValidSteamArtworkUrl(detail.header_image) ? detail.header_image : undefined;
  const capsuleUrl = isValidSteamArtworkUrl(detail.capsule_image) ? detail.capsule_image : undefined;
  const releaseYear = releaseYearFromSteamDate(detail.release_date?.date);
  if (!headerUrl && !capsuleUrl) return { status: "missing_artwork", ...(releaseYear ? { releaseYear } : {}) };

  return {
    status: "matched",
    ...(releaseYear ? { releaseYear } : {}),
    ...(headerUrl ? { steamHeaderUrl: headerUrl } : {}),
    ...(capsuleUrl ? { steamCapsuleUrl: capsuleUrl } : {}),
  };
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

  const artwork = selectExactSteamArtwork(title, detail);
  return {
    status: "matched",
    appId,
    ...(artwork.releaseYear ? {
      releaseYear: artwork.releaseYear,
      releaseYearSourceUrl: "https://store.steampowered.com/app/" + appId + "/",
    } : {}),
    ...(artwork.steamHeaderUrl ? { steamHeaderUrl: artwork.steamHeaderUrl } : {}),
    ...(artwork.steamCapsuleUrl ? { steamCapsuleUrl: artwork.steamCapsuleUrl } : {}),
  };
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
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if ((response.status === 429 || response.status >= 500) && attempt < 2) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await delay(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1500 * (attempt + 1));
      continue;
    }
    return readJsonResponse(response, label);
  }
  throw new Error(label + " failed after retries.");
}

async function fetchAppDetails(appIds) {
  const url = new URL(DETAILS_URL);
  url.search = new URLSearchParams({
    appids: appIds.join(","),
    cc: "US",
    l: "english",
  }).toString();
  return steamRequest(url, "Steam app details for " + appIds.join(","));
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

  const appDetails = await fetchAppDetails(exactIds);
  return { searchResults, appDetails };
}

function collectGamesMissingAppId(profiles) {
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

function isFreshTimestamp(value, now = Date.now()) {
  const timestamp = Date.parse(value || "");
  return Number.isFinite(timestamp) && timestamp <= now && now - timestamp < STEAM_METADATA_REFRESH_MS;
}

export function selectSteamReviewSummary(payload) {
  if (!payload || (payload.success !== 1 && payload.success !== true)) return null;
  const summary = payload.query_summary;
  if (!summary || !Number.isInteger(summary.total_reviews) ||
      !Number.isInteger(summary.total_positive) || !Number.isInteger(summary.total_negative)) {
    return null;
  }
  return {
    steamReviewCount: Math.max(0, summary.total_reviews),
    steamPositiveReviewCount: Math.max(0, summary.total_positive),
    steamNegativeReviewCount: Math.max(0, summary.total_negative),
    ...(typeof summary.review_score_desc === "string" && summary.review_score_desc.trim()
      ? { steamReviewScoreDesc: summary.review_score_desc.trim() }
      : {}),
  };
}

async function fetchSteamReviewSummary(appId) {
  const url = new URL(String(appId), APP_REVIEWS_URL);
  url.search = new URLSearchParams({
    json: "1",
    language: "all",
    purchase_type: "all",
    num_per_page: "0",
    filter: "summary",
  }).toString();
  return steamRequest(url, "Steam user-review summary for " + appId);
}

function collectGamesMissingSteamArtwork(profiles) {
  const entriesByAppId = new Map();
  for (const [studio, profile] of Object.entries(profiles)) {
    for (const game of profile.popularGames || []) {
      if (!Number.isInteger(game.appId) || game.appId < 1) continue;
      const hasHeaderUrl = game.steamHeaderUrl && isValidSteamArtworkUrl(game.steamHeaderUrl);
      const hasCapsuleUrl = game.steamCapsuleUrl && isValidSteamArtworkUrl(game.steamCapsuleUrl);
      const artworkReady = hasHeaderUrl && hasCapsuleUrl;
      const releaseReady = Number.isInteger(game.releaseYear) || game.stage === "In development";
      const metadataFresh = isFreshTimestamp(game.steamDetailsCheckedAt);
      const reviewsFresh = isFreshTimestamp(game.steamReviewsUpdatedAt);
      if (artworkReady && releaseReady && metadataFresh && reviewsFresh) continue;
      const group = entriesByAppId.get(game.appId) || { appId: game.appId, entries: [] };
      group.entries.push({ studio, game });
      entriesByAppId.set(game.appId, group);
    }
  }
  return [...entriesByAppId.values()];
}

async function enrichKnownSteamArtwork(profiles) {
  const groups = collectGamesMissingSteamArtwork(profiles);
  const counts = {
    existingAppIdsChecked: 0,
    steamHeaderUrlsAdded: 0,
    steamCapsuleUrlsAdded: 0,
    titleMismatches: 0,
    nonGames: 0,
    missingSteamArtwork: 0,
    appDetailsRequestFailures: 0,
    releaseYearsAdded: 0,
    steamMetadataRecordsUpdated: 0,
    steamReviewRecordsUpdated: 0,
    steamReviewRequestFailures: 0,
  };
  const failures = [];

  // Only previously verified Steam app IDs are used. Missing/stale details and
  // aggregate review totals are refreshed every 30 days.
  for (let index = 0; index < groups.length; index += 1) {
    if (index > 0) await delay(REQUEST_INTERVAL_MS);
    const group = groups[index];
    counts.existingAppIdsChecked += 1;
    let response;
    try {
      response = await fetchAppDetails([group.appId]);
    } catch (error) {
      counts.appDetailsRequestFailures += 1;
      failures.push({ appId: group.appId, source: "appdetails", error: String(error).slice(0, 180) });
      continue;
    }

    const entry = response?.[String(group.appId)];
    const detail = entry?.success && entry.data ? entry.data : null;
    const firstGame = group.entries[0]?.game;
    const exactGame = detail?.type === "game" && firstGame &&
      normalizeGameTitle(detail.name) === normalizeGameTitle(firstGame.title);

    if (exactGame) {
      const checkedAt = new Date().toISOString();
      const developers = Array.isArray(detail.developers)
        ? detail.developers.filter(value => typeof value === "string" && value.trim())
        : [];
      const publishers = Array.isArray(detail.publishers)
        ? detail.publishers.filter(value => typeof value === "string" && value.trim())
        : [];
      const releaseDate = typeof detail.release_date?.date === "string" ? detail.release_date.date.trim() : "";

      for (const { game } of group.entries) {
        if (developers.length) game.steamDevelopers = developers;
        if (publishers.length) game.steamPublishers = publishers;
        if (releaseDate) game.steamReleaseDate = releaseDate;
        game.steamDetailsCheckedAt = checkedAt;
        if (releaseDate && !game.releaseYear && game.stage !== "In development") {
          const releaseYear = releaseYearFromSteamDate(releaseDate);
          if (releaseYear) {
            game.releaseYear = releaseYear;
            game.releaseYearSourceUrl = "https://store.steampowered.com/app/" + group.appId + "/";
            counts.releaseYearsAdded += 1;
          }
        }
      }
      counts.steamMetadataRecordsUpdated += group.entries.length;
    }

    for (const { game } of group.entries) {
      const result = selectExactSteamArtwork(game.title, entry);
      if (result.releaseYear && !game.releaseYear && game.stage !== "In development") {
        game.releaseYear = result.releaseYear;
        game.releaseYearSourceUrl = "https://store.steampowered.com/app/" + group.appId + "/";
        counts.releaseYearsAdded += 1;
      }
      if (result.status === "not_a_game") { counts.nonGames += 1; continue; }
      if (result.status === "title_mismatch") { counts.titleMismatches += 1; continue; }
      if (result.status !== "matched") { counts.missingSteamArtwork += 1; continue; }
      if (result.steamHeaderUrl && game.steamHeaderUrl !== result.steamHeaderUrl) {
        game.steamHeaderUrl = result.steamHeaderUrl;
        counts.steamHeaderUrlsAdded += 1;
      }
      if (result.steamCapsuleUrl && game.steamCapsuleUrl !== result.steamCapsuleUrl) {
        game.steamCapsuleUrl = result.steamCapsuleUrl;
        counts.steamCapsuleUrlsAdded += 1;
      }
    }

    await delay(REQUEST_INTERVAL_MS);
    try {
      const reviewPayload = await fetchSteamReviewSummary(group.appId);
      const reviewSummary = selectSteamReviewSummary(reviewPayload);
      if (reviewSummary) {
        const checkedAt = new Date().toISOString();
        for (const { game } of group.entries) Object.assign(game, reviewSummary, { steamReviewsUpdatedAt: checkedAt });
        counts.steamReviewRecordsUpdated += group.entries.length;
      } else {
        failures.push({ appId: group.appId, source: "appreviews", error: "Steam returned no usable aggregate review summary." });
      }
    } catch (error) {
      counts.steamReviewRequestFailures += 1;
      failures.push({ appId: group.appId, source: "appreviews", error: String(error).slice(0, 180) });
    }
  }

  if (failures.length) {
    process.stdout.write(JSON.stringify({ steamMetadataFailures: failures.slice(0, 30) }, null, 2) + "\n");
  }
  return counts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(
      "Enrich verified Steam artwork, release years and missing Steam app IDs from the public Steam Store API.\n\n" +
      "Dry run: node scripts/enrich-steam-games.mjs [--limit N]\n" +
      "Write verified metadata: node scripts/enrich-steam-games.mjs --write\n" +
      "--limit caps the number of missing-title search groups; known app-ID artwork URLs are still refreshed.\n",
    );
    return;
  }

  let profiles;
  try {
    profiles = JSON.parse(readFileSync(profilesPath, "utf8"));
  } catch (error) {
    throw new Error("Could not read src/data/studio-profiles.json.", { cause: error });
  }

  const headerCounts = await enrichKnownSteamArtwork(profiles);
  const groups = collectGamesMissingAppId(profiles);
  const counts = {
    ...headerCounts,
    missingTitleGroupsQueried: 0,
    matchedRecords: 0,
    ambiguous: 0,
    notFound: 0,
    developerMismatch: 0,
    notGame: 0,
    detailsUnavailable: 0,
  };
  const unresolved = [];

  for (const group of groups) {
    if (counts.missingTitleGroupsQueried >= args.limit) break;
    if (counts.missingTitleGroupsQueried > 0) await delay(REQUEST_INTERVAL_MS);
    const { searchResults, appDetails } = await searchSteam(group.title);
    counts.missingTitleGroupsQueried += 1;

    for (const studio of [...new Set(group.entries.map(entry => entry.studio))]) {
      const result = selectExactSteamMatch(group.title, studio, searchResults, appDetails);
      if (result.status === "matched") {
        for (const entry of group.entries.filter(item => item.studio === studio && !item.game.appId)) {
          entry.game.appId = result.appId;
          if (result.steamHeaderUrl) entry.game.steamHeaderUrl = result.steamHeaderUrl;
          if (result.steamCapsuleUrl) entry.game.steamCapsuleUrl = result.steamCapsuleUrl;
          if (result.releaseYear && !entry.game.releaseYear && entry.game.stage !== "In development") {
            entry.game.releaseYear = result.releaseYear;
            entry.game.releaseYearSourceUrl = result.releaseYearSourceUrl;
            counts.releaseYearsAdded += 1;
          }
          counts.matchedRecords += 1;
        }
      } else {
        const countKey = {
          ambiguous: "ambiguous",
          not_found: "notFound",
          developer_mismatch: "developerMismatch",
          not_a_game: "notGame",
          details_unavailable: "detailsUnavailable",
        }[result.status] || "notFound";
        counts[countKey] += 1;
        unresolved.push({ title: group.title, studio, status: result.status });
      }
    }
  }

  if (args.write) {
    writeFileSync(profilesPath, JSON.stringify(profiles, null, 2) + "\n", "utf8");
    process.stdout.write("Updated studio profiles with verified Steam app IDs, artwork URLs and available release years.\n");
  } else {
    process.stdout.write("Dry run only; no files were changed. Re-run with --write to persist verified Steam artwork and release-year metadata.\n");
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
