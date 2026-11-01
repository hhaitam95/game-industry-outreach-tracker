import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidSteamArtworkUrl,
  normalizeDeveloperName,
  normalizeGameTitle,
  releaseYearFromSteamDate,
  selectExactSteamArtwork,
  selectExactSteamMatch,
} from "../scripts/enrich-steam-games.mjs";

test("normalizes game titles without fuzzy matching", () => {
  assert.equal(normalizeGameTitle("  The Smurfs – Dreams  "), "the smurfs dreams");
  assert.notEqual(normalizeGameTitle("The Smurfs: Dreams"), normalizeGameTitle("Smurfs"));
});

test("normalizes legal suffixes and the studio word in developer names", () => {
  assert.equal(normalizeDeveloperName("Fast Travel Games AB"), "fast travel games");
  assert.equal(normalizeDeveloperName("Hugecalf Studios Ltd."), "hugecalf");
  assert.equal(normalizeDeveloperName("Ocellus Studio"), "ocellus");
});

test("accepts only an exact Steam title whose app details confirm the studio developer", () => {
  const result = selectExactSteamMatch(
    "Mannequin",
    "Fast Travel Games",
    { items: [{ id: 2409260, name: "Mannequin" }] },
    { "2409260": { success: true, data: { type: "game", name: "Mannequin", developers: ["Fast Travel Games AB"] } } },
  );
  assert.deepEqual(result, { status: "matched", appId: 2409260 });
});

test("rejects exact title matches where the developer does not match the studio", () => {
  const result = selectExactSteamMatch(
    "Hidden City",
    "AB Games",
    { items: [{ id: 2610200, name: "Hidden City" }] },
    { "2610200": { success: true, data: { type: "game", name: "Hidden City", developers: ["Hede"] } } },
  );
  assert.deepEqual(result, { status: "developer_mismatch", appId: 2610200 });
});

test("rejects ambiguous title matches instead of selecting the first", () => {
  const result = selectExactSteamMatch(
    "Horizon",
    "AstroBeam",
    { items: [{ id: 1, name: "Horizon" }, { id: 2, name: "Horizon" }] },
    {},
  );
  assert.deepEqual(result, { status: "ambiguous", candidateCount: 2 });
});

test("rejects non-game Steam items and title variants", () => {
  assert.equal(
    selectExactSteamMatch("The Trail", "22cans", { items: [{ id: 10, name: "The Trail" }] }, {
      "10": { success: true, data: { type: "software", name: "The Trail", developers: ["22cans"] } },
    }).status,
    "not_a_game",
  );
  assert.equal(
    selectExactSteamMatch("KARDS", "1939 Games", { items: [{ id: 20, name: "KARDS - The WW2 Card Game" }] }, {}).status,
    "not_found",
  );
});

test("accepts a Steam app-details header image only for an exact game title", () => {
  const result = selectExactSteamArtwork("The Trail", {
    success: true,
    data: {
      type: "game",
      name: "The Trail",
      release_date: { date: "May 17, 2017" },
      header_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/hash/header.jpg?t=1",
      capsule_image: "https://cdn.cloudflare.steamstatic.com/steam/apps/3544920/capsule_231x87.jpg",
    },
  });
  assert.deepEqual(result, {
    status: "matched",
    releaseYear: 2017,
    steamHeaderUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/hash/header.jpg?t=1",
    steamCapsuleUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/3544920/capsule_231x87.jpg",
  });
});

test("does not attach an image from a title mismatch or a non-game Steam item", () => {
  assert.equal(
    selectExactSteamArtwork("The Trail", {
      success: true,
      data: { type: "game", name: "Another Trail", header_image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1/header.jpg" },
    }).status,
    "title_mismatch",
  );
  assert.equal(
    selectExactSteamArtwork("The Trail", {
      success: true,
      data: { type: "dlc", name: "The Trail", header_image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1/header.jpg" },
    }).status,
    "not_a_game",
  );
});

test("rejects non-HTTPS and non-Steam artwork hosts", () => {
  assert.equal(isValidSteamArtworkUrl("http://cdn.cloudflare.steamstatic.com/steam/apps/1/header.jpg"), false);
  assert.equal(isValidSteamArtworkUrl("https://images.example.com/header.jpg"), false);
  assert.equal(isValidSteamArtworkUrl("https://user:pass@cdn.cloudflare.steamstatic.com/steam/apps/1/header.jpg"), false);
  assert.equal(isValidSteamArtworkUrl("https://cdn.cloudflare.steamstatic.com/steam/apps/1/header.jpg"), true);
});

test("adds Steam header and capsule artwork metadata when a new app ID is matched", () => {
  const result = selectExactSteamMatch(
    "The Trail",
    "The Trail Team",
    { items: [{ id: 3544920, name: "The Trail" }] },
    {
      "3544920": {
        success: true,
        data: {
          type: "game",
          name: "The Trail",
          developers: ["The Trail Team"],
          release_date: { date: "Jan 1, 2020" },
          header_image: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/hash/header.jpg",
          capsule_image: "https://cdn.cloudflare.steamstatic.com/steam/apps/3544920/capsule_231x87.jpg",
        },
      },
    },
  );
  assert.deepEqual(result, {
    status: "matched",
    appId: 3544920,
    releaseYear: 2020,
    releaseYearSourceUrl: "https://store.steampowered.com/app/3544920/",
    steamHeaderUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/hash/header.jpg",
    steamCapsuleUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/3544920/capsule_231x87.jpg",
  });
});

test("extracts a release year from the date supplied by Steam", () => {
  assert.equal(releaseYearFromSteamDate("9 Dec, 2021"), 2021);
  assert.equal(releaseYearFromSteamDate("2020"), 2020);
  assert.equal(releaseYearFromSteamDate("Coming soon"), null);
});
