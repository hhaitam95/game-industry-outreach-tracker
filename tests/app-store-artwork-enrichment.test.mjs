import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidAppStoreArtworkUrl,
  isValidAppStorePageUrl,
  collectMissingArtworkGames,
  normalizeDeveloperName,
  normalizeGameTitle,
  selectExactAppStoreMatch,
} from "../scripts/enrich-app-store-games.mjs";

test("normalizes App Store titles conservatively without fuzzy title matching", () => {
  assert.equal(normalizeGameTitle("LETZ Match!"), "letz match");
  assert.notEqual(normalizeGameTitle("WarFriends"), normalizeGameTitle("War Friends 2"));
});

test("accepts an exact App Store title and matching developer", () => {
  const result = selectExactAppStoreMatch("WarFriends", "About Fun", {
    results: [{
      kind: "software",
      trackName: "WarFriends",
      artistName: "About Fun",
      sellerName: "About Fun s.r.o.",
      artworkUrl512: "https://is1-ssl.mzstatic.com/image/thumb/Purple123/512x512bb.webp",
      trackViewUrl: "https://apps.apple.com/us/app/warfriends/id123456789",
    }],
  });
  assert.deepEqual(result, {
    status: "matched",
    appStoreArtworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple123/512x512bb.webp",
    appStoreUrl: "https://apps.apple.com/us/app/warfriends/id123456789",
  });
});

test("rejects title variants and seller mismatches rather than guessing", () => {
  assert.equal(
    selectExactAppStoreMatch("WarFriends", "About Fun", {
      results: [{
        kind: "software",
        trackName: "War Friends 2",
        artistName: "About Fun",
        artworkUrl512: "https://is1-ssl.mzstatic.com/image/thumb/Purple123/512x512bb.webp",
        trackViewUrl: "https://apps.apple.com/us/app/war-friends-2/id123456789",
      }],
    }).status,
    "not_found",
  );
  assert.equal(
    selectExactAppStoreMatch("Hidden City", "AB Games", {
      results: [{
        kind: "software",
        trackName: "Hidden City",
        artistName: "G5 Entertainment",
        sellerName: "G5 Entertainment AB",
      }],
    }).status,
    "developer_mismatch",
  );
});

test("rejects ambiguous exact-title App Store listings from the same developer", () => {
  const result = selectExactAppStoreMatch("Example Game", "Example Studio", {
    results: [
      { kind: "software", trackName: "Example Game", artistName: "Example Studio", trackViewUrl: "https://apps.apple.com/us/app/one/id1" },
      { kind: "software", trackName: "Example Game", sellerName: "Example Studio", trackViewUrl: "https://apps.apple.com/us/app/two/id2" },
    ],
  });
  assert.deepEqual(result, { status: "ambiguous", candidateCount: 2 });
});

test("validates Apple artwork and App Store page hosts", () => {
  assert.equal(isValidAppStoreArtworkUrl("https://is1-ssl.mzstatic.com/image/thumb/example/512x512bb.webp"), true);
  assert.equal(isValidAppStoreArtworkUrl("http://is1-ssl.mzstatic.com/image/example.jpg"), false);
  assert.equal(isValidAppStoreArtworkUrl("https://images.example.com/example.jpg"), false);
  assert.equal(isValidAppStorePageUrl("https://apps.apple.com/us/app/example/id123"), true);
  assert.equal(isValidAppStorePageUrl("https://example.com/app/id123"), false);
});


test("does not treat a wide Steam header as a substitute for a square mobile cover", () => {
  const groups = collectMissingArtworkGames({
    "Studio One": {
      popularGames: [
        { title: "Mobile Game", appId: 12345, steamHeaderUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/12345/header.jpg" },
        { title: "Already Has IGDB Cover", igdbCoverId: "coverhash" },
        { title: "Unannounced Project", stage: "In development" },
      ],
    },
  });
  assert.equal(groups.length, 1);
  assert.equal(groups[0].title, "Mobile Game");
  assert.equal(groups[0].entries[0].studio, "Studio One");
});
