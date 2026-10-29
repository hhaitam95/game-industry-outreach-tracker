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
    assert.match(
      markup,
      /pasted role text, extracted resume, profile projection, and findings remain in browser memory only/,
    );
    assert.doesNotMatch(markup, /<script|onerror=/i);
  } finally {
    await server.close();
  }
});


test("ResumeEditorPanel exposes structured editing, review, local export, and explicit handoff controls", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = await server.ssrLoadModule("/src/components/ResumeEditorPanel.tsx");
    const markup = renderToStaticMarkup(
      React.createElement(module.ResumeEditorPanel, {
        sourceText: "Professional Summary\nSynthetic support engineer.\nSkills\nPython, REST APIs",
        profile: {
          id: "profile-primary",
          displayName: "Synthetic Profile",
          headline: "Synthetic engineer",
          professionalSummary: "Synthetic profile evidence",
          targetRoles: ["Developer Support"],
          skills: ["Python"],
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      }),
    );
    assert.match(markup, /data-testid="resume-editor"/);
    assert.match(markup, /data-testid="resume-editor-content-block-1"/);
    assert.match(markup, /data-testid="resume-export-docx"/);
    assert.match(markup, /data-testid="resume-export-pdf"/);
    assert.match(markup, /Review before \\/ after changes/);
    assert.match(markup, /Review manual AI handoff/);
    assert.match(markup, /does not connect to ChatGPT/);
    assert.doesNotMatch(markup, /Synthetic profile evidence/);
  } finally {
    await server.close();
  }
});
