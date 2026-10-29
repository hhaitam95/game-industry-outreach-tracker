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

    assert.equal(
      navigationModule.NAV_ITEMS.find((item) => item.id === "studios")?.label,
      "Speculative applications",
    );
    assert.equal(featureModule.FEATURES.roleExplorer, false);
    assert.equal(featureModule.isRoleExplorerEnabled(), false);
    assert.match(app, /Speculative applications/);
    assert.match(app, /Supermassive Games/);
    assert.match(app, /Add to application tracker/);
    assert.match(app, /Applications/);
    assert.match(app, /Settings/);
    assert.doesNotMatch(app, /Resume lab|Outreach|Overview|Opportunity explorer/);
    assert.doesNotMatch(app, /Studio research, before route verification/);
  } finally {
    await server.close();
  }
});
