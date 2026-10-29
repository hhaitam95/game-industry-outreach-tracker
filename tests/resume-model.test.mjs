import assert from "node:assert/strict";
import test from "node:test";
import {
  addResumeBlock,
  getResumeDiff,
  getUnsupportedTermWarnings,
  moveResumeBlock,
  redactResumeText,
  removeResumeBlock,
  structureResumeText,
  updateResumeBlock,
  validateResumeDocument,
  MAX_RESUME_TEXT_CHARS,
} from "../src/lib/resume/resume-model.mjs";

test("structureResumeText recognizes known headings and keeps unrecognized text in Other", () => {
  const document = structureResumeText(
    [
      "Synthetic Person",
      "Professional Summary",
      "Technical support and incident response.",
      "Experience: Maintained Python services.",
      "Skills",
      "Python, REST APIs",
    ].join("\n"),
  );
  assert.deepEqual(
    document.blocks.map((block) => block.section),
    ["Other", "Summary", "Experience", "Skills"],
  );
  assert.equal(document.blocks[2].content, "Maintained Python services.");
  assert.equal(document.blocks[3].content, "Python, REST APIs");
  assert.equal(document.blocks[0].origin, "imported");
  assert.equal(document.baseline.length, document.blocks.length);
});

test("structureResumeText preserves all text in Other when recognized headings exceed the block limit", () => {
  const source = Array.from({ length: 41 }, (_, index) => "Skills\nSynthetic section " + (index + 1)).join("\n");
  const document = structureResumeText(source);
  assert.equal(document.blocks.length, 1);
  assert.equal(document.blocks[0].section, "Other");
  assert.equal(document.blocks[0].content, source);
  assert.match(document.blocks[0].content, /Synthetic section 41/);
});

test("structureResumeText preserves all text when no supported headings are present", () => {
  const document = structureResumeText("Synthetic evidence only\nFirst line\nSecond line");
  assert.equal(document.blocks.length, 1);
  assert.equal(document.blocks[0].section, "Other");
  assert.equal(document.blocks[0].content, "Synthetic evidence only\nFirst line\nSecond line");
});

test("model validates exact keys, origins, duplicate IDs, and length limits", () => {
  const base = structureResumeText("Skills\nPython");
  assert.throws(() => validateResumeDocument({ ...base, unexpected: true }), /unsupported shape/i);
  assert.throws(
    () => validateResumeDocument({ ...base, blocks: [{ ...base.blocks[0], origin: "unknown" }] }),
    /origin is unsupported/i,
  );
  assert.throws(() => validateResumeDocument({ ...base, blocks: [base.blocks[0], base.blocks[0]] }), /duplicate IDs/i);
  assert.throws(() => structureResumeText("x".repeat(MAX_RESUME_TEXT_CHARS + 1)), /supported limit/i);
  assert.throws(() => updateResumeBlock(base, base.blocks[0].id, { origin: "typed" }), /unsupported field/i);
});

test("updates, additions, removal, and reorder are visible in the review diff", () => {
  let document = structureResumeText("Summary\nOriginal summary\nSkills\nPython");
  const summaryId = document.blocks[0].id;
  const skillsId = document.blocks[1].id;
  document = updateResumeBlock(document, summaryId, { content: "Revised summary" });
  document = addResumeBlock(document, "Projects", "typed", "Synthetic project description");
  document = moveResumeBlock(document, skillsId, -1);
  const diff = getResumeDiff(document);
  assert.equal(
    diff.some((entry) => entry.id === summaryId && entry.status === "modified"),
    true,
  );
  assert.equal(
    diff.some((entry) => entry.status === "reordered"),
    true,
  );
  assert.equal(
    diff.some((entry) => entry.status === "added"),
    true,
  );
  document = removeResumeBlock(document, summaryId);
  assert.equal(
    getResumeDiff(document).some((entry) => entry.id === summaryId && entry.status === "removed"),
    true,
  );
});

test("unsupported wording warnings return only terms absent from source and profile", () => {
  const document = structureResumeText("Experience\nBuilt Python tools for internal users.");
  const edited = updateResumeBlock(document, document.blocks[0].id, {
    content: "Built Python tools and led Orbit Labs migration for 150 engineers.",
  });
  const warnings = getUnsupportedTermWarnings(edited, "Built Python tools for internal users.", "Kubernetes");
  const terms = warnings.flatMap((item) => item.terms);
  assert.equal(terms.includes("orbit"), true);
  assert.equal(terms.includes("150"), true);
  assert.equal(terms.includes("python"), false);
  assert.equal(JSON.stringify(warnings).includes("internal users"), false);
});

test("manual handoff redacts contact patterns by default and supports user-controlled exceptions", () => {
  const text = "Email synthetic.person@example.com, phone +1 (555) 010-0202, website https://example.com/work";
  const safe = redactResumeText(text);
  assert.equal(safe.includes("synthetic.person@example.com"), false);
  assert.equal(safe.includes("+1 (555) 010-0202"), false);
  assert.equal(safe.includes("https://example.com/work"), false);
  assert.equal(redactResumeText(text, { redactEmail: false, redactPhone: false, redactUrl: false }), text);
});
