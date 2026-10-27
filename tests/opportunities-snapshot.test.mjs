import assert from "node:assert/strict";
import test from "node:test";
import committedSnapshot from "../src/data/public-opportunities.json" with { type: "json" };
import {
  IS_SYNTHETIC_SNAPSHOT,
  PUBLIC_OPPORTUNITY_FIELDS,
  PUBLIC_OPPORTUNITY_STATUSES,
  loadOpportunitySnapshot,
  validateOpportunitySnapshot,
} from "../src/lib/opportunities/snapshot.mjs";

test("committed synthetic snapshot validates and uses the expected public schema", () => {
  assert.equal(IS_SYNTHETIC_SNAPSHOT, true);
  assert.deepEqual(validateOpportunitySnapshot(committedSnapshot), committedSnapshot);
  assert.equal(committedSnapshot.schemaVersion, 1);
  assert.equal(committedSnapshot.opportunities.length, 8);
  for (const role of committedSnapshot.opportunities) {
    assert.deepEqual(Object.keys(role).sort(), [...PUBLIC_OPPORTUNITY_FIELDS].sort());
    assert.ok(PUBLIC_OPPORTUNITY_STATUSES.includes(role.status));
  }
});

test("snapshot validator rejects missing and unsupported top-level fields", () => {
  const missing = structuredClone(committedSnapshot);
  delete missing.generatedAt;
  assert.throws(() => validateOpportunitySnapshot(missing), /missing or unsupported fields/);

  const extra = structuredClone(committedSnapshot);
  extra.privateNotes = "must never enter a public snapshot";
  assert.throws(() => validateOpportunitySnapshot(extra), /missing or unsupported fields/);
});

test("snapshot validator rejects unsupported role fields and statuses", () => {
  const extraField = structuredClone(committedSnapshot);
  extraField.opportunities[0].candidateProfile = {};
  assert.throws(() => validateOpportunitySnapshot(extraField), /missing or unsupported fields/);

  const badStatus = structuredClone(committedSnapshot);
  badStatus.opportunities[0].status = "open";
  assert.throws(() => validateOpportunitySnapshot(badStatus), /unsupported public opportunity status/);
});

test("snapshot validator rejects duplicate IDs and non-HTTPS or credential URLs", () => {
  const duplicate = structuredClone(committedSnapshot);
  duplicate.opportunities[1].id = duplicate.opportunities[0].id;
  assert.throws(() => validateOpportunitySnapshot(duplicate), /Duplicate public opportunity ID/);

  for (const url of ["http://example.com/role", "javascript:alert(1)", "https://user:pass@example.com/role"]) {
    const invalid = structuredClone(committedSnapshot);
    invalid.opportunities[0].url = url;
    assert.throws(() => validateOpportunitySnapshot(invalid), /HTTPS URL/);
  }

  const invalidSource = structuredClone(committedSnapshot);
  invalidSource.opportunities[0].sourceUrl = "http://careers.example.com";
  assert.throws(() => validateOpportunitySnapshot(invalidSource), /HTTPS URL/);
});

test("loadOpportunitySnapshot exposes a controlled error instead of throwing", () => {
  const invalid = structuredClone(committedSnapshot);
  invalid.opportunities[0].status = "open";
  const result = loadOpportunitySnapshot(invalid);
  assert.equal(result.snapshot, null);
  assert.match(result.error, /unsupported public opportunity status/);
});
