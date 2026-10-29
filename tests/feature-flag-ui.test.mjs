import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("default Overview and directory hide legacy role-explorer UI", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const [appModule, catalogModule, navigationModule] = await Promise.all([
      server.ssrLoadModule("/src/App.tsx"),
      server.ssrLoadModule("/src/components/StudioCatalog.tsx"),
      server.ssrLoadModule("/src/lib/navigation.mjs"),
    ]);
    const overview = renderToStaticMarkup(
      React.createElement(appModule.OverviewPage, {
        onNavigate: () => undefined,
        workspaceSummary: null,
      }),
    );
    const directory = renderToStaticMarkup(
      React.createElement(catalogModule.default, { features: { roleExplorer: false } }),
    );

    assert.equal(navigationModule.NAV_ITEMS.find((item) => item.id === "studios")?.label, "Speculative applications");
    assert.match(overview, /Build a worldwide, evidence-backed directory/);
    assert.doesNotMatch(overview, /Opportunities|role links last seen|Studios &amp; roles/);
    assert.doesNotMatch(
      directory,
      /Opportunity explorer|roles last seen|No roles observed|Official careers and vacancies/,
    );
    assert.match(directory, /generic careers page is not evidence of speculative-application acceptance/);
  } finally {
    await server.close();
  }
});

test("injected enabled state restores the retained role explorer and Overview count", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const [appModule, catalogModule] = await Promise.all([
      server.ssrLoadModule("/src/App.tsx"),
      server.ssrLoadModule("/src/components/StudioCatalog.tsx"),
    ]);
    const overview = renderToStaticMarkup(
      React.createElement(appModule.OverviewPage, {
        onNavigate: () => undefined,
        workspaceSummary: null,
        roleExplorerEnabled: true,
      }),
    );
    const directory = renderToStaticMarkup(
      React.createElement(catalogModule.default, { features: { roleExplorer: true } }),
    );

    assert.match(overview, /Opportunities/);
    assert.match(overview, /role links last seen/);
    assert.match(directory, /Opportunity explorer/);
    assert.match(directory, /roles last seen/);
  } finally {
    await server.close();
  }
});
