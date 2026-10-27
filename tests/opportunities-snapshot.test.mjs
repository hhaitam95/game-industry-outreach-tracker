import assert from "node:assert/strict";
import test from "node:test";
import sampleSnapshot from "../src/data/sample-public-opportunities.json" with { type: "json" };
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
    assert.equal(role.status, "last-seen");
    assert.ok(PUBLIC_OPPORTUNITY_STATUSES.includes(role.status));
  }
});

test("snapshot validator rejects missing/unsupported fields, statuses, duplicate IDs and unsafe URLs", () => {
  const missing = structuredClone(sampleSnapshot);
  delete missing.generatedAt;
  assert.throws(() => validateOpportunitySnapshot(missing), /missing or unsupported fields/);

  const extra = structuredClone(sampleSnapshot);
  extra.privateNotes = "must never enter a public snapshot";
  assert.throws(() => validateOpportunitySnapshot(extra), /missing or unsupported fields/);

  const extraField = structuredClone(sampleSnapshot);
  extraField.opportunities[0].candidateProfile = {};
  assert.throws(() => validateOpportunitySnapshot(extraField), /missing or unsupported fields/);

  const badStatus = structuredClone(sampleSnapshot);
  badStatus.opportunities[0].status = "open";
  assert.throws(() => validateOpportunitySnapshot(badStatus), /unsupported public opportunity status/);

  const duplicate = structuredClone(sampleSnapshot);
  duplicate.opportunities[1].id = duplicate.opportunities[0].id;
  assert.throws(() => validateOpportunitySnapshot(duplicate), /Duplicate public opportunity ID/);

  for (const url of ["http://example.com/role", "javascript:alert(1)", "https://user:pass@example.com/role"]) {
    const invalid = structuredClone(sampleSnapshot);
    invalid.opportunities[0].url = url;
    assert.throws(() => validateOpportunitySnapshot(invalid), /HTTPS URL/);
  }
});

test("loadOpportunitySnapshot returns a controlled error with origin", () => {
  const invalid = structuredClone(sampleSnapshot);
  invalid.opportunities[0].status = "open";
  const result = loadOpportunitySnapshot(invalid, "live");
  assert.equal(result.snapshot, null);
  assert.equal(result.origin, "live");
  assert.match(result.error, /unsupported public opportunity status/);
});
