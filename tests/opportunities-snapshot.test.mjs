import assert from "node:assert/strict";
import test from "node:test";
import sampleSnapshot from "../src/data/sample-public-opportunities.json" with { type: "json" };
import publicGoldenSnapshot from "./fixtures/public-opportunities/real-snapshot-golden.json" with { type: "json" };
import invalidPublicSnapshot from "./fixtures/public-opportunities/invalid-status.json" with { type: "json" };
import {
  PUBLIC_OPPORTUNITY_FIELDS,
  PUBLIC_OPPORTUNITY_STATUSES,
  loadOpportunitySnapshot,
  validateOpportunitySnapshot,
} from "../src/lib/opportunities/snapshot.mjs";

test("committed synthetic sample validates the exact public schema", () => {
  assert.deepEqual(validateOpportunitySnapshot(sampleSnapshot), sampleSnapshot);
  assert.equal(sampleSnapshot.schemaVersion, 1);
  assert.match(sampleSnapshot.generatedAt, /^2000-01-01T00:00:00/);
  assert.equal(sampleSnapshot.opportunities.length, 15);
  for (const role of sampleSnapshot.opportunities) {
    assert.deepEqual(Object.keys(role).sort(), [...PUBLIC_OPPORTUNITY_FIELDS].sort());
    assert.ok(PUBLIC_OPPORTUNITY_STATUSES.includes(role.status));
  }
});

test("historical public-data golden records validate against the shared contract", () => {
  assert.deepEqual(validateOpportunitySnapshot(publicGoldenSnapshot), publicGoldenSnapshot);
  assert.equal(publicGoldenSnapshot.opportunities.length, 5);
  assert.ok(publicGoldenSnapshot.opportunities.every((role) => role.status === "last-seen"));
  assert.ok(publicGoldenSnapshot.opportunities.some((role) => role.title.includes("DevOps")));
});

test("JavaScript rejects the shared invalid-status fixture", () => {
  assert.throws(() => validateOpportunitySnapshot(invalidPublicSnapshot), /unsupported value/);
});

test("schema validation rejects extra/missing fields, duplicate IDs, bad types, dates and unsafe URLs", () => {
  const missing = JSON.parse(JSON.stringify(sampleSnapshot));
  delete missing.generatedAt;
  assert.throws(() => validateOpportunitySnapshot(missing), /missing or unsupported fields/);
  const extra = JSON.parse(JSON.stringify(sampleSnapshot));
  extra.privateNotes = "must never enter a public snapshot";
  assert.throws(() => validateOpportunitySnapshot(extra), /missing or unsupported fields/);
  const extraField = JSON.parse(JSON.stringify(sampleSnapshot));
  extraField.opportunities[0].candidateProfile = {};
  assert.throws(() => validateOpportunitySnapshot(extraField), /missing or unsupported fields/);
  const duplicate = JSON.parse(JSON.stringify(sampleSnapshot));
  duplicate.opportunities[1].id = duplicate.opportunities[0].id;
  assert.throws(() => validateOpportunitySnapshot(duplicate), /Duplicate public opportunity ID/);
  const badType = JSON.parse(JSON.stringify(sampleSnapshot));
  badType.opportunities[0].locations = "not-an-array";
  assert.throws(() => validateOpportunitySnapshot(badType), /invalid type/);
  const impossibleTimestamp = JSON.parse(JSON.stringify(sampleSnapshot));
  impossibleTimestamp.generatedAt = "2026-10-32T12:00:00Z";
  assert.throws(() => validateOpportunitySnapshot(impossibleTimestamp), /valid calendar date/);

  const badTimestamp = JSON.parse(JSON.stringify(sampleSnapshot));
  badTimestamp.opportunities[0].lastSeenAt = "not-a-date";
  assert.throws(() => validateOpportunitySnapshot(badTimestamp), /RFC 3339 date-time/);
  const badDate = JSON.parse(JSON.stringify(sampleSnapshot));
  badDate.opportunities[0].datePosted = "2026-02-31";
  assert.throws(() => validateOpportunitySnapshot(badDate), /valid ISO date/);
  for (const url of ["http://example.com/role", "javascript:alert(1)", "https://user:pass@example.com/role"]) {
    const badUrl = JSON.parse(JSON.stringify(sampleSnapshot));
    badUrl.opportunities[0].url = url;
    assert.throws(() => validateOpportunitySnapshot(badUrl), /pattern|HTTPS URL/);
  }
});

test("loadOpportunitySnapshot fails closed and preserves origin metadata", () => {
  const result = loadOpportunitySnapshot(invalidPublicSnapshot, "live");
  assert.equal(result.snapshot, null);
  assert.equal(result.origin, "live");
  assert.match(result.error, /unsupported value/);
});
