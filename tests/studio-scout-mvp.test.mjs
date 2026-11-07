import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { createServer } from "vite";
import { normalizeScale, normalizeStudioProfileTags } from "../scripts/normalize-studio-tags.mjs";

async function withViteModules(callback) {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    await callback(server);
  } finally {
    await server.close();
  }
}

test("studio directory renders separate studio facets and integrated filters", async () => {
  await withViteModules(async (server) => {
    const module = await server.ssrLoadModule("/src/components/StudioDirectory.tsx");
    const markup = renderToStaticMarkup(
      React.createElement(module.default, {
        applications: [],
        onSave: () => {},
      }),
    );

    assert.match(markup, /Studio directory/);
    assert.match(markup, /Search/);
    assert.match(markup, /Continent/);
    assert.match(markup, /Country/);
    assert.doesNotMatch(markup, /More filters/);
    assert.doesNotMatch(markup, /At a glance/);
    assert.match(markup, /Sort by Scale/);
    assert.match(markup, /Sort by Studio role/);
    assert.match(markup, /Sort by Platform/);
    assert.match(markup, /New studios/);
    assert.ok(markup.includes('<th scope="col">Scale</th>'));
    assert.match(markup, /Notable work/);
    assert.match(markup, /Sort by Studio/);
    assert.match(markup, /aria-controls="studio-details-4a-games"/);
    assert.match(markup, /Metro Exodus/);
    assert.match(markup, /popular-game-cover/);
    assert.match(markup, /popular-game-caption/);
    assert.match(markup, /GTFO/);
    assert.match(markup, />2021</);
    assert.match(markup, /data-artwork-source="IGDB"/);
    assert.match(markup, /data-game-title="Metro Exodus"/);
    assert.match(markup, /Showing/);
    assert.match(markup, /of \d+ studios/);
    assert.match(markup, /<th scope="col">Tracker<\/th>/);
    assert.doesNotMatch(markup, /class="link-cell"|<th[^>]*>Links<\/th>/);
    assert.match(markup, /Click a studio row to see its profile/);
    assert.doesNotMatch(markup, /Studio type/);
    assert.match(markup, /Platform/);
    assert.match(markup, /Focus/);
    assert.doesNotMatch(markup, /Studio information sources|Source 1|Studio highlights/);
  });
});

test("Games directory renders popularity and store metadata columns", async () => {
  await withViteModules(async (server) => {
    const module = await server.ssrLoadModule("/src/components/GamesDirectory.tsx");
    const markup = renderToStaticMarkup(React.createElement(module.default, { onCountChange: () => {} }));
    assert.match(markup, /<h1>Games/);
    assert.match(markup, /Popularity/);
    assert.match(markup, /Release date/);
    assert.match(markup, /Developer/);
    assert.match(markup, /Publisher/);
    assert.match(markup, /Steam reviews/);
    assert.match(markup, /of \\d+ games/);
    assert.match(markup, /Steam user reviews/);
    assert.doesNotMatch(markup, /NaN/);
  });
});

test("game posters prefer IGDB covers and retain a verified Steam destination", async () => {
  await withViteModules(async (server) => {
    const module = await server.ssrLoadModule("/src/components/GamePosters.tsx");
    const igdbFirst = renderToStaticMarkup(
      React.createElement(module.default, {
        game: {
          title: "Example Game",
          releaseYear: 2019,
          releaseYearSourceUrl: "https://www.igdb.com/games/example-game",
          appId: 12345,
          igdbGameId: 67890,
          igdbSlug: "example-game",
          igdbCoverId: "cover-hash",
        },
      }),
    );
    assert.match(igdbFirst, /data-artwork-source="IGDB"/);
    assert.match(igdbFirst, /data-release-year="2019"/);
    assert.ok(igdbFirst.includes(">2019</small>"));
    assert.match(igdbFirst, /images\.igdb\.com/);
    assert.match(igdbFirst, /href="https:\/\/store\.steampowered\.com\/app\/12345\//);
    assert.doesNotMatch(igdbFirst, /Steam · IGDB fallback/);

    const igdbOnly = renderToStaticMarkup(
      React.createElement(module.default, {
        game: {
          title: "Example Game",
          igdbGameId: 67890,
          igdbSlug: "example-game",
          igdbCoverId: "cover-hash",
        },
      }),
    );
    assert.match(igdbOnly, /data-artwork-source="IGDB"/);
    assert.ok(igdbOnly.includes("https://images.igdb.com/igdb/image/upload/t_cover_big/cover-hash.jpg"));
    assert.ok(igdbOnly.includes('href="https://www.igdb.com/games/example-game"'));
    assert.doesNotMatch(igdbOnly, /IGDB cover|Steam artwork|Official artwork/);
  });
});

test("application tracker renders status tabs, studio links and status controls", async () => {
  await withViteModules(async (server) => {
    const module = await server.ssrLoadModule("/src/components/ApplicationTracker.tsx");
    const now = "2026-10-30T12:00:00.000Z";
    const markup = renderToStaticMarkup(
      React.createElement(module.default, {
        initialTab: "saved",
        applications: [
          {
            id: "example-studio",
            studioName: "Example Games",
            websiteUrl: "https://example.com/",
            applicationUrl: "https://example.com/careers",
            country: "Canada",
            hqLabel: "Montreal · HQ",
            applicationLocation: "Canada",
            status: "saved",
            createdAt: now,
            updatedAt: now,
            appliedAt: null,
            note: "",
          },
        ],
        onChangeStatus: () => {},
        onRemove: () => {},
        onOpenDirectory: () => {},
      }),
    );

    assert.match(markup, /My applications/);
    assert.match(markup, /Saved/);
    assert.match(markup, /In progress/);
    assert.match(markup, /Applied/);
    assert.match(markup, /Interview/);
    assert.match(markup, /Offer/);
    assert.match(markup, /Example Games/);
    assert.match(markup, /Open route/);
    assert.match(markup, /Update status|Status for Example Games/);
    assert.match(markup, /Remove/);
    assert.match(markup, /saved in this browser only/);
  });
});

test("scale normalization avoids guessing when the stored scale is ambiguous", () => {
  assert.equal(normalizeScale("AAA"), "AAA");
  assert.equal(normalizeScale("AA · editorial indication"), "AA");
  assert.equal(normalizeScale("Indie / AA · editorial indication"), null);
  assert.equal(normalizeScale("Mixed / Unclassified"), null);
});

test("studio tag normalization keeps scale, platform, focus and role categories distinct", () => {
  const normalized = normalizeStudioProfileTags({
    industryScale: "Indie",
    companyType: ["Developer", "Independent", "Mobile games"],
    focus: ["PC", "Mobile", "Horror", "Co-op", "Unreal Engine"],
  });
  assert.equal(normalized.scale, "Indie");
  assert.deepEqual(normalized.platforms, ["PC", "Mobile"]);
  assert.deepEqual(normalized.gameFocus, ["Horror", "Co-op"]);
  assert.deepEqual(normalized.studioRoles, ["Developer"]);
  assert.deepEqual(normalized.companyType, ["Developer", "Independent", "Mobile games"]);
  assert.deepEqual(normalized.focus, ["PC", "Mobile", "Horror", "Co-op", "Unreal Engine"]);
});

test("company marks use recognizable domain icons with accessible labels", async () => {
  await withViteModules(async (server) => {
    const module = await server.ssrLoadModule("/src/components/CompanyMarks.tsx");
    const markup = renderToStaticMarkup(
      React.createElement(module.default, {
        value: "Subsidiary of Activision Blizzard · part of Microsoft Gaming",
      }),
    );
    assert.match(markup, /company-mark-list/);
    assert.match(markup, /domain=activision\.com/);
    assert.match(markup, /domain=blizzard\.com/);
    assert.match(markup, /domain=microsoft\.com/);
    assert.match(markup, /alt="Microsoft"/);
  });
});
