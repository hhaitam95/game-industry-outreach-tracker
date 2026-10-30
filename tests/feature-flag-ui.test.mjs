import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("default app exposes only the studio directory and application tracker", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const [appModule, featureModule] = await Promise.all([
      server.ssrLoadModule("/src/App.tsx"),
      server.ssrLoadModule("/src/config/features.mjs"),
    ]);
    const app = renderToStaticMarkup(React.createElement(appModule.default));

    assert.equal(featureModule.FEATURES.roleExplorer, false);
    assert.equal(featureModule.isRoleExplorerEnabled(), false);
    assert.match(app, /StudioScout/);
    assert.match(app, /Studio directory/);
    assert.match(app, /My applications/);
    assert.match(app, /PERSONAL WORKSPACE/);
    assert.doesNotMatch(app, /Resume lab|Outreach workspace|Settings|Opportunity explorer/);
  } finally {
    await server.close();
  }
});
