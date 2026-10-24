import assert from "node:assert/strict";
import test from "node:test";
import { isSensitivePath, redactSensitiveText, safeDiagnosticLines } from "../scripts/report-safety.mjs";

test("private-looking file paths are omitted from reports", () => {
  assert.equal(isSensitivePath("private-resumes/current.pdf"), true);
  assert.equal(isSensitivePath("personal-data/profile.json"), true);
  assert.equal(isSensitivePath("src/App.tsx"), false);
  assert.equal(isSensitivePath("docs/resume-guidelines/README.md"), false);
});

test("common credentials and contact information are redacted", () => {
  const input = "token=github_pat_abcdefghijklmnopqrstuvwxyz123456 email person@example.com Bearer abc.def";
  const result = redactSensitiveText(input);

  assert.equal(result.includes("github_pat_abcdefghijklmnopqrstuvwxyz123456"), false);
  assert.equal(result.includes("person@example.com"), false);
  assert.equal(result.includes("Bearer abc.def"), false);
  assert.match(result, /redacted/);
});

test("diagnostics are limited to likely issue lines", () => {
  const result = safeDiagnosticLines("normal output\nTypeError: invalid value\nmore normal output");
  assert.equal(result.length, 1);
  assert.match(result[0], /TypeError/);
});
