import assert from "node:assert/strict";
import test from "node:test";
import {
  createApplicationTrackerBackup,
  parseApplicationTrackerBackup,
  readApplicationTrackerBackup,
} from "../src/tracker/application-backup.mjs";

function application(overrides = {}) {
  return {
    id: "example-studio",
    studioName: "Example Studio",
    websiteUrl: "https://example.test",
    applicationUrl: "https://example.test/careers",
    country: "Hungary",
    countryCode: "HU",
    hqLabel: "Studio",
    applicationLocation: "Budapest · hybrid",
    status: "in_progress",
    createdAt: "2026-11-02T10:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z",
    appliedAt: null,
    note: "Prepare the master resume and check the official route.",
    ...overrides,
  };
}

function backup(applications = [application()]) {
  return {
    format: "game-industry-outreach-application-tracker",
    version: 1,
    exportedAt: "2026-11-02T12:00:00.000Z",
    applications,
  };
}

test("application backup preserves tracker records and private notes", () => {
  const parsed = parseApplicationTrackerBackup(backup());
  assert.deepEqual(parsed, [application()]);
});

test("application backup export produces a versioned JSON Blob", async () => {
  const blob = createApplicationTrackerBackup([application()], "2026-11-02T12:00:00.000Z");
  const exported = JSON.parse(await blob.text());
  assert.equal(blob.type, "application/json");
  assert.equal(exported.format, "game-industry-outreach-application-tracker");
  assert.equal(exported.version, 1);
  assert.equal(exported.exportedAt, "2026-11-02T12:00:00.000Z");
  assert.deepEqual(exported.applications, [application()]);
});

test("application backup rejects an unknown format or version", () => {
  assert.throws(() => parseApplicationTrackerBackup({ ...backup(), format: "other" }), /not a supported/);
  assert.throws(() => parseApplicationTrackerBackup({ ...backup(), version: 2 }), /not a supported/);
});

test("application backup rejects malformed records and unsupported statuses", () => {
  assert.throws(() => parseApplicationTrackerBackup({ ...backup(), applications: [null] }), /invalid application/);
  assert.throws(() => parseApplicationTrackerBackup(backup([application({ status: "submitted" })])), /unsupported status/);
  assert.throws(() => parseApplicationTrackerBackup(backup([application({ studioName: "" })])), /studio name/);
  assert.throws(() => parseApplicationTrackerBackup(backup([application({ note: "x".repeat(2001) })])), /2,000 characters/);
});

test("application backup rejects invalid or non-HTTP application URLs", () => {
  assert.throws(() => parseApplicationTrackerBackup(backup([application({ applicationUrl: "javascript:alert(1)" })])), /application URL/);
  assert.throws(() => parseApplicationTrackerBackup(backup([application({ websiteUrl: "not a URL" })])), /studio URL/);
});

test("application backup rejects duplicate IDs or studio names", () => {
  assert.throws(() => parseApplicationTrackerBackup(backup([
    application(),
    application({ id: "different-id", studioName: "example studio" }),
  ])), /duplicate application records/);
  assert.throws(() => parseApplicationTrackerBackup(backup([
    application(),
    application({ id: "example-studio-copy" }),
  ])), /duplicate application records/);
});

test("application backup can be restored from a File-like Blob", async () => {
  const blob = new Blob([JSON.stringify(backup())], { type: "application/json" });
  const file = new File([blob], "application-backup.json", { type: "application/json" });
  assert.deepEqual(await readApplicationTrackerBackup(file), [application()]);
});

test("application backup rejects empty or invalid JSON files", async () => {
  const empty = new File([], "empty.json");
  const invalid = new File(["{not json"], "invalid.json");
  await assert.rejects(readApplicationTrackerBackup(empty), /non-empty/);
  await assert.rejects(readApplicationTrackerBackup(invalid), /valid JSON/);
});
