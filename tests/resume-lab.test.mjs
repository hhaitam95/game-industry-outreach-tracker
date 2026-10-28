import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { createServer } from "vite";

test("ResumeLab bundles source-linked guidance and states local-only extraction limits", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = await server.ssrLoadModule("/src/components/ResumeLab.tsx");
    const markup = renderToStaticMarkup(React.createElement(module.default));
    assert.match(markup, /Review a resume without uploading it/);
    assert.match(markup, /data-testid="resume-file-input"/);
    assert.match(markup, /DOCX, text-based PDF, or UTF-8 TXT/);
    assert.match(markup, /Scanned\/image-only PDFs need OCR, which is intentionally not enabled/);
    assert.match(markup, /Resume guidance library/);
    assert.match(markup, /Penn State Engineering/);
    assert.match(markup, /pdfjs-dist/);
    assert.match(markup, /Mammoth/);
    assert.match(markup, /Baseline checks and role comparison/);
    assert.match(markup, /No fit score/);
    assert.match(markup, /Sample data - not a real scan/);
    assert.match(markup, /pasted role text, extracted resume, profile projection, and findings remain in browser memory only/);
    assert.doesNotMatch(markup, /<script|onerror=/i);
  } finally {
    await server.close();
  }
});
