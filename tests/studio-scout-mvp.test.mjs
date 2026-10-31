import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { createServer } from "vite";

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

test("studio directory renders the small studio table and working filter controls", async () => {
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
    assert.match(markup, /Work model/);
    assert.match(markup, /Application route/);
    assert.match(markup, /Notable work/);
    assert.match(markup, /Sort by Studio/);
    assert.match(markup, /aria-controls="studio-details-4a-games"/);
    assert.match(markup, /Metro Exodus/);
    assert.match(markup, /popular-game-cover/);
    assert.match(markup, /library_600x900/);
    assert.match(markup, /data-game-title="Metro Exodus"/);
    assert.match(markup, /Bossa Studios/);
    assert.match(markup, /Application/);
    assert.match(markup, /Website/);
    assert.match(markup, /Click a row for studio details/);
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
