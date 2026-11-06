import assert from "node:assert/strict";
import test from "node:test";
import { parseStoredApplicationTracker } from "../src/tracker/application-backup.mjs";

function application(overrides = {}) {
  return {
    id: "example-studio",
    studioName: "Example Studio",
    websiteUrl: "https://example.test",
    applicationUrl: "https://example.test/careers",
    country: "Hungary",
    hqLabel: "Studio",
    status: "in_progress",
    createdAt: "2026-11-02T10:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z",
    appliedAt: null,
    note: "Keep the original tracker notes.",
    ...overrides,
  };
}

test("a missing local tracker is a valid empty tracker", () => {
  assert.deepEqual(parseStoredApplicationTracker(null), {
    ok: true,
    applications: [],
  });
});

test("valid saved tracker records load with their notes and route context", () => {
  const record = application({
    routeType: "open",
    routeStatus: "active",
    routeCheckedAt: "2026-11-02",
    routeEvidenceUrl: "https://example.test/careers",
    workModel: "hybrid",
    disciplineScope: ["Technical support"],
  });
  const result = parseStoredApplicationTracker(JSON.stringify([record]));

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.applications.length, 1);
  assert.equal(result.applications[0].note, "Keep the original tracker notes.");
  assert.equal(result.applications[0].routeType, "open");
  assert.deepEqual(result.applications[0].disciplineScope, ["Technical support"]);
});

test("older valid tracker records receive defaults for fields introduced later", () => {
  const legacy = application({
    country: undefined,
    hqLabel: undefined,
    note: undefined,
  });
  const result = parseStoredApplicationTracker(JSON.stringify([legacy]));

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.applications[0].country, "Not stated");
  assert.equal(result.applications[0].hqLabel, "Not specified");
  assert.equal(result.applications[0].note, "");
  assert.equal(result.applications[0].preparation.routeVerified, false, "Legacy tracker records should receive an empty preparation checklist.");
});

test("invalid JSON is reported instead of being treated as an empty tracker", () => {
  const raw = "{not valid json";
  const result = parseStoredApplicationTracker(raw);

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.message, /not valid JSON/);
  assert.match(result.message, /left untouched/);
  assert.equal(raw, "{not valid json");
});

test("a non-array storage value is rejected without returning an empty list", () => {
  const result = parseStoredApplicationTracker(JSON.stringify({ applications: [application()] }));

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.message, /unsupported data structure/);
});

test("one invalid record rejects the whole tracker rather than silently dropping that record", () => {
  const records = [
    application(),
    { ...application({ id: "broken-record", studioName: "Broken Studio" }), updatedAt: undefined },
  ];
  const result = parseStoredApplicationTracker(JSON.stringify(records));

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.message, /invalid or unsupported record/);
});

test("unsupported statuses and unsafe URLs reject the whole stored tracker", () => {
  const invalidStatus = parseStoredApplicationTracker(JSON.stringify([
    application({ status: "submitted" }),
  ]));
  const unsafeUrl = parseStoredApplicationTracker(JSON.stringify([
    application({ applicationUrl: "javascript:alert(1)" }),
  ]));

  assert.equal(invalidStatus.ok, false);
  assert.equal(unsafeUrl.ok, false);
});

test("duplicate saved applications are rejected as a whole instead of creating colliding rows", () => {
  const result = parseStoredApplicationTracker(JSON.stringify([
    application(),
    application({ id: "second-id", studioName: "example studio" }),
  ]));

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.match(result.message, /invalid or unsupported record/);
});
