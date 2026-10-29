import assert from "node:assert/strict";
import test from "node:test";
import curatedDirectory from "../src/data/speculative-route-directory.json" with { type: "json" };
import sampleDirectory from "../src/data/sample-speculative-route-directory.json" with { type: "json" };
import {
  SPECULATIVE_ROUTE_DIRECTORY,
  SPECULATIVE_ROUTE_DIRECTORY_ERROR,
  SPECULATIVE_ROUTE_DIRECTORY_ORIGIN,
  SPECULATIVE_ROUTE_STATUSES,
  SPECULATIVE_ROUTE_TYPES,
  loadSpeculativeRouteDirectory,
  validateSpeculativeRouteDirectory,
} from "../src/lib/speculative-routes/validation.mjs";

function clone(value) {
  return structuredClone(value);
}

test("shared speculative-route schema accepts the explicit synthetic sample", () => {
  const validated = validateSpeculativeRouteDirectory(sampleDirectory);
  assert.equal(validated.schemaVersion, 1);
  assert.equal(validated.routes.length, 1);
  assert.equal(validated.routes[0].status, "candidate");
  assert.equal(validated.studios[0].name, "Synthetic Example Studio (not real)");
  assert.deepEqual(SPECULATIVE_ROUTE_TYPES, ["dedicated-page", "ats-posting", "email-invite", "talent-community"]);
  assert.deepEqual(SPECULATIVE_ROUTE_STATUSES, ["candidate", "verified", "needs-review", "stale"]);
});

test("empty curated data selects the sample and reports its origin explicitly", () => {
  const result = loadSpeculativeRouteDirectory(curatedDirectory, sampleDirectory);
  assert.equal(result.error, null);
  assert.equal(result.origin, "sample");
  assert.equal(result.directory.routes.length, 1);
  assert.equal(SPECULATIVE_ROUTE_DIRECTORY_ORIGIN, "sample");
  assert.equal(SPECULATIVE_ROUTE_DIRECTORY_ERROR, null);
  assert.equal(SPECULATIVE_ROUTE_DIRECTORY.routes[0].status, "candidate");
});

test("a populated valid curated directory takes precedence over sample data", () => {
  const curated = clone(sampleDirectory);
  const result = loadSpeculativeRouteDirectory(curated, sampleDirectory);
  assert.equal(result.error, null);
  assert.equal(result.origin, "curated");
  assert.equal(result.directory.routes.length, 1);
});

test("invalid curated data fails closed instead of silently substituting sample data", () => {
  const invalid = clone(curatedDirectory);
  invalid.privateNotes = "must not enter the public contract";
  const result = loadSpeculativeRouteDirectory(invalid, sampleDirectory);
  assert.equal(result.directory, null);
  assert.equal(result.origin, "curated");
  assert.match(result.error, /missing or unsupported fields/);
});

test("rejects unsafe HTTP and credential-bearing evidence URLs", () => {
  const badRoute = clone(sampleDirectory);
  badRoute.routes[0].routeUrl = "http://example.com/speculative";
  assert.throws(() => validateSpeculativeRouteDirectory(badRoute), /required pattern/);

  const badEvidence = clone(sampleDirectory);
  badEvidence.routes[0].evidenceUrl = "https://user:password@example.com/evidence";
  assert.throws(() => validateSpeculativeRouteDirectory(badEvidence), /without embedded credentials/);
});

test("requires complete evidence and rejects unsupported extra fields", () => {
  const missingEvidence = clone(sampleDirectory);
  delete missingEvidence.routes[0].evidenceSummary;
  assert.throws(() => validateSpeculativeRouteDirectory(missingEvidence), /missing or unsupported fields/);

  const extraField = clone(sampleDirectory);
  extraField.routes[0].personalNotes = "private";
  assert.throws(() => validateSpeculativeRouteDirectory(extraField), /missing or unsupported fields/);
});

test("rejects dangling studio references and duplicate route identifiers", () => {
  const dangling = clone(sampleDirectory);
  dangling.routes[0].studioId = "missing-studio";
  assert.throws(() => validateSpeculativeRouteDirectory(dangling), /unknown studio/);

  const duplicate = clone(sampleDirectory);
  duplicate.routes.push(clone(duplicate.routes[0]));
  assert.throws(() => validateSpeculativeRouteDirectory(duplicate), /Duplicate ID/);
});

test("verified routes require verification dates and candidates cannot claim verification", () => {
  const missingDate = clone(sampleDirectory);
  missingDate.routes[0].status = "verified";
  assert.throws(() => validateSpeculativeRouteDirectory(missingDate), /require lastVerifiedAt/);

  const candidateWithDate = clone(sampleDirectory);
  candidateWithDate.routes[0].lastVerifiedAt = "2000-01-02T00:00:00.000Z";
  assert.throws(() => validateSpeculativeRouteDirectory(candidateWithDate), /cannot claim a previous verification/);
});

test("enforces country scope, talent-community labelling and timestamp chronology", () => {
  const missingCountry = clone(sampleDirectory);
  missingCountry.routes[0].countryScope = "country-limited";
  assert.throws(() => validateSpeculativeRouteDirectory(missingCountry), /list at least one country code/);

  const wrongTalentLabel = clone(sampleDirectory);
  wrongTalentLabel.routes[0].routeType = "talent-community";
  assert.throws(() => validateSpeculativeRouteDirectory(wrongTalentLabel), /labelled separately/);

  const badTime = clone(sampleDirectory);
  badTime.routes[0].lastCheckedAt = "1999-12-31T00:00:00.000Z";
  assert.throws(() => validateSpeculativeRouteDirectory(badTime), /cannot be earlier/);
});

test("rejects duplicate country codes, unsafe hashes and unknown lifecycle states", () => {
  const countries = clone(sampleDirectory);
  countries.routes[0].countryScope = "country-limited";
  countries.routes[0].countryCodes = ["US", "US"];
  assert.throws(() => validateSpeculativeRouteDirectory(countries), /duplicate items/);

  const hash = clone(sampleDirectory);
  hash.routes[0].contentHash = "not-a-sha256";
  assert.throws(() => validateSpeculativeRouteDirectory(hash), /required pattern/);

  const state = clone(sampleDirectory);
  state.routes[0].status = "maybe";
  assert.throws(() => validateSpeculativeRouteDirectory(state), /unsupported value/);
});
