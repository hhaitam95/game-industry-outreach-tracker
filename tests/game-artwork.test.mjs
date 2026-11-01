import assert from "node:assert/strict";
import test from "node:test";
import {
  gameDestination,
  gameLinkLabel,
  getGameArtworkSources,
} from "../src/components/game-artwork.ts";

test("prefers Steam portrait art, then IGDB and official art before a wide header", () => {
  const sources = getGameArtworkSources({
    title: "Example Game",
    appId: 12345,
    igdbCoverId: "cover-hash",
    officialArtworkUrl: "https://studio.example/images/example.webp",
    officialArtworkLayout: "square",
    steamHeaderUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/12345/header.jpg",
  });

  assert.equal(sources[0].layout, "portrait");
  assert.equal(sources[0].source, "Steam");
  assert.equal(sources[3].source, "IGDB");
  assert.equal(sources[4].source, "Official site");
  assert.equal(sources[4].layout, "square");
  assert.equal(sources[5].source, "Steam");
  assert.equal(sources[5].layout, "landscape");
});

test("uses a verified Steam landscape header when no portrait or IGDB art is available", () => {
  const sources = getGameArtworkSources({
    title: "The Trail",
    appId: 3544920,
    steamHeaderUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/example/header.jpg",
  });

  assert.equal(sources.at(-2)?.url, "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3544920/example/header.jpg");
  assert.equal(sources.at(-2)?.layout, "landscape");
  assert.equal(sources.at(-1)?.layout, "landscape");
});

test("removes duplicate artwork URLs from the fallback sequence", () => {
  const sources = getGameArtworkSources({
    title: "Duplicate",
    appId: 12345,
    steamHeaderUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/12345/header.jpg",
  });
  assert.equal(new Set(sources.map(source => source.url)).size, sources.length);
});

test("uses a studio-owned official image as a fallback and preserves its declared layout", () => {
  const sources = getGameArtworkSources({
    title: "The Tablet of Destinies",
    officialArtworkUrl: "https://d4ngames.com/images/tablet_thumbnail.webp",
    officialArtworkLayout: "landscape",
  });
  assert.deepEqual(sources, [{
    source: "Official site",
    url: "https://d4ngames.com/images/tablet_thumbnail.webp",
    layout: "landscape",
  }]);
});

test("links directly to Steam when an app ID is known", () => {
  assert.equal(
    gameDestination({ title: "The Trail", appId: 3544920 }),
    "https://store.steampowered.com/app/3544920/",
  );
});

test("uses the official game page before an IGDB page when Steam is unavailable", () => {
  assert.equal(
    gameDestination({
      title: "The Tablet of Destinies",
      officialUrl: "https://www.d4ngames.com/games/tablet-of-destinies",
      igdbSlug: "tablet-of-destinies",
    }),
    "https://www.d4ngames.com/games/tablet-of-destinies",
  );
  assert.equal(
    gameLinkLabel({
      title: "The Tablet of Destinies",
      officialUrl: "https://www.d4ngames.com/games/tablet-of-destinies",
    }),
    "Open The Tablet of Destinies on the official website",
  );
});

test("uses the direct IGDB game page when no Steam or official page is known", () => {
  assert.equal(
    gameDestination({ title: "Example", igdbSlug: "example-game" }),
    "https://www.igdb.com/games/example-game",
  );
});

test("does not create generic Steam search links when no verified destination exists", () => {
  assert.equal(gameDestination({ title: "The Tablet of Destinies" }), null);
  assert.equal(gameLinkLabel({ title: "The Tablet of Destinies" }), null);
});

test("uses the Steam capsule image after the verified header image", () => {
  const sources = getGameArtworkSources({
    title: "Example Game",
    appId: 12345,
    steamHeaderUrl: "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/12345/hash/header.jpg",
    steamCapsuleUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/12345/capsule_231x87.jpg",
  });
  const headerIndex = sources.findIndex(source => source.url.endsWith("/header.jpg"));
  const capsuleIndex = sources.findIndex(source => source.url.endsWith("/capsule_231x87.jpg"));
  assert.ok(headerIndex >= 0);
  assert.ok(capsuleIndex > headerIndex);
  assert.equal(sources[capsuleIndex].layout, "landscape");
});

test("uses square App Store art as a fallback and links to the direct App Store page", () => {
  const game = {
    title: "WarFriends",
    appStoreArtworkUrl: "https://is1-ssl.mzstatic.com/image/thumb/Purple123/512x512bb.webp",
    appStoreUrl: "https://apps.apple.com/us/app/warfriends/id123456789",
  };
  const sources = getGameArtworkSources(game);
  assert.deepEqual(sources, [{
    source: "App Store",
    url: game.appStoreArtworkUrl,
    layout: "square",
  }]);
  assert.equal(gameDestination(game), game.appStoreUrl);
  assert.equal(gameLinkLabel(game), "Open WarFriends on the App Store");
});
