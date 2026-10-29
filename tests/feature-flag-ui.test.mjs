import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("default app is a speculative-route directory with the existing application tracker", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const [appModule, navigationModule, featureModule] = await Promise.all([
      server.ssrLoadModule("/src/App.tsx"),
      server.ssrLoadModule("/src/lib/navigation.mjs"),
      server.ssrLoadModule("/src/config/features.mjs"),
    ]);
    const app = renderToStaticMarkup(React.createElement(appModule.default));
    const mainNavigation = app.match(/<nav[^>]*class="main-navigation"[^>]*>(.*?)<\/nav>/)?.[1] ?? "";

    assert.equal(navigationModule.NAV_ITEMS.find((item) => item.id === "studios")?.label, "Speculative applications");
    assert.equal(featureModule.FEATURES.roleExplorer, false);
    assert.equal(featureModule.isRoleExplorerEnabled(), false);
    assert.match(app, /Speculative applications/);
    assert.match(app, /data-testid="speculative-route-card"/);
    assert.match(app, /Add to application tracker/);
    assert.match(app, /Applications/);
    assert.match(app, /Settings/);
    assert.match(mainNavigation, /Speculative applications/);
    assert.match(mainNavigation, /Applications/);
    assert.match(mainNavigation, /Settings/);
    assert.doesNotMatch(mainNavigation, /Resume lab|Outreach|Overview|Opportunity explorer/);
  } finally {
    await server.close();
  }
});
