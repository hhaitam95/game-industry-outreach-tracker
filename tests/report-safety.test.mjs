import assert from "node:assert/strict";
import test from "node:test";
import { isSensitivePath, redactSensitiveText, safeDiagnosticLines } from "../scripts/report-safety.mjs";

test("private-looking file paths are recognized", () => {
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

test("diagnostics report safe categories instead of copying error lines", () => {
  const result = safeDiagnosticLines("normal output\nTypeError: invalid value\nmore normal output");
  assert.deepEqual(result, ["JavaScript runtime or syntax diagnostics detected; details omitted."]);
});

test("diagnostic categories never include personal text, paths, or contact details", () => {
  const hostileOutput =
    "TypeError: candidate Haitam failed at /Users/haitam/private-resumes/resume.pdf, contact person@example.com";
  const result = safeDiagnosticLines(hostileOutput);
  const reportText = result.join(" ");

  assert.deepEqual(result, ["JavaScript runtime or syntax diagnostics detected; details omitted."]);
  for (const sensitive of ["Haitam", "/Users/haitam", "resume.pdf", "person@example.com"]) {
    assert.equal(reportText.includes(sensitive), false);
  }
});

test("generic failures produce one fixed category only when no specific category matches", () => {
  assert.deepEqual(safeDiagnosticLines("Error: something failed"), [
    "Command diagnostics detected; details omitted.",
  ]);
  assert.deepEqual(safeDiagnosticLines("no actionable diagnostic here"), []);
});

test("diagnostic limit of zero returns no categories", () => {
  assert.deepEqual(safeDiagnosticLines("TypeError: invalid value", 0), []);
});
