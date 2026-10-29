import assert from "node:assert/strict";
import mammoth from "mammoth";
import test from "node:test";
import { buildResumeDocxBytes } from "../src/lib/resume/docx-export.mjs";
import { structureResumeText, updateResumeBlock } from "../src/lib/resume/resume-model.mjs";

test("DOCX export creates a valid package with escaped Unicode content and round-trips through Mammoth", async () => {
  const source = "Summary\nSynthetic résumé with R&D <Tools> and a café.\nSkills\nPython, TypeScript";
  const document = structureResumeText(source);
  const first = document.blocks[0];
  const edited = updateResumeBlock(document, first.id, {
    content: "Synthetic résumé with R&D <Tools>, a café, and Unicode 東京.",
  });
  const bytes = buildResumeDocxBytes(edited);
  assert.ok(bytes instanceof Uint8Array);
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  assert.match(result.value, /Synthetic résumé with R&D <Tools>/);
  assert.match(result.value, /café/);
  assert.match(result.value, /Unicode 東京/);
  assert.match(result.value, /Python, TypeScript/);
});

test("DOCX export rejects malformed model input instead of generating a partial file", () => {
  assert.throws(() => buildResumeDocxBytes({ version: 1, blocks: [] }), /invalid|unsupported/i);
});
