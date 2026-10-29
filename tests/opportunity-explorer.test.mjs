import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("OpportunityExplorer component renders the public-data trust boundary", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = await server.ssrLoadModule("/src/components/OpportunityExplorer.tsx");
    const markup = renderToStaticMarkup(React.createElement(module.default));
    assert.match(markup, /Opportunity explorer/);
    assert.match(markup, /Sample data - not a real scan/);
    assert.match(markup, /Last-seen means a link was observed by a scan/);
    assert.match(markup, /Coverage is limited to configured career sources and may be incomplete/);
    assert.match(markup, /Review role against your profile/);
    assert.match(markup, /Target families only/);
    assert.match(markup, /Open placeholder URL/);
    assert.equal((markup.match(/data-testid="opportunity-row"/g) ?? []).length, 15);
    assert.doesNotMatch(markup, /<div[^>]+role="alert"/);
  } finally {
    await server.close();
  }
});
