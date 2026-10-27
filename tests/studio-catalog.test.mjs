import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLICATION_ROUTE_STATUSES,
  CATALOG_SCHEMA_VERSION,
  STUDIO_CATALOG_DATA,
  STUDIO_CREDIT_ROLES,
  STUDIO_PROFILES,
  STUDIO_REGISTRY,
  assertEnabledRegistrySourcesHaveVerifiedRoutes,
  searchStudioProfiles,
  validateStudioCatalog,
  validateStudioRegistry,
} from "../src/lib/studios/catalog.mjs";

test("starter registry contains four uniquely identified studios", () => {
  assert.equal(STUDIO_CATALOG_DATA.schemaVersion, CATALOG_SCHEMA_VERSION);
  assert.equal(STUDIO_CATALOG_DATA.studios.length, 4);
  assert.equal(new Set(STUDIO_CATALOG_DATA.studios.map((studio) => studio.id)).size, 4);
  assert.deepEqual(
    STUDIO_CATALOG_DATA.studios.map((studio) => studio.name),
    ["CD PROJEKT RED", "Naughty Dog", "Santa Monica Studio", "Riot Games"],
  );
});

test("each studio website and career route has direct HTTPS source evidence", () => {
  const sourcesById = new Map(STUDIO_CATALOG_DATA.sources.map((source) => [source.id, source]));
  for (const studio of STUDIO_CATALOG_DATA.studios) {
    assert.ok(studio.sourceIds.some((sourceId) => sourcesById.get(sourceId)?.url === studio.officialWebsiteUrl));
    const routes = STUDIO_CATALOG_DATA.applicationRoutes.filter((route) => route.studioId === studio.id);
    assert.ok(routes.length >= 1);
    for (const route of routes) {
      assert.equal(route.status, "verified");
      assert.ok(route.sourceIds.some((sourceId) => sourcesById.get(sourceId)?.url === route.url));
      assert.equal(new URL(route.url).protocol, "https:");
    }
  }
});

test("ownership, sites, games, and credit roles remain distinct and evidenced", () => {
  assert.equal(STUDIO_CATALOG_DATA.sites.length, 4);
  assert.ok(STUDIO_CATALOG_DATA.ownershipRelationships.length >= 3);
  assert.ok(STUDIO_CATALOG_DATA.games.length >= 8);
  assert.ok(STUDIO_CATALOG_DATA.credits.length >= 8);
  for (const credit of STUDIO_CATALOG_DATA.credits) {
    assert.ok(STUDIO_CATALOG_DATA.studios.some((studio) => studio.id === credit.studioId));
    assert.ok(STUDIO_CATALOG_DATA.games.some((game) => game.id === credit.gameId));
    assert.ok(credit.sourceIds.length > 0);
    assert.ok(STUDIO_CREDIT_ROLES.includes(credit.role));
    assert.match(credit.verifiedOn, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("catalog deliberately contains no live vacancy claims or private application fields", () => {
  assert.deepEqual(STUDIO_CATALOG_DATA.opportunities, []);
  assert.deepEqual(STUDIO_CATALOG_DATA.changeEvents, []);
  for (const studio of STUDIO_CATALOG_DATA.studios) {
    assert.equal(Object.hasOwn(studio, "applicationStatus"), false);
    assert.equal(Object.hasOwn(studio, "personalNotes"), false);
    assert.equal(Object.hasOwn(studio, "candidateProfile"), false);
    assert.equal(Object.hasOwn(studio, "resumeText"), false);
  }
});

test("studio search matches names, locations, ownership and game titles case-insensitively", () => {
  assert.equal(searchStudioProfiles("nAuGhTy DoG").length, 1);
  assert.equal(searchStudioProfiles("Poland")[0].id, "cd-projekt-red");
  assert.equal(searchStudioProfiles("Sony Interactive Entertainment")[0].id, "naughty-dog");
  assert.equal(searchStudioProfiles("God of War")[0].id, "santa-monica-studio");
  assert.equal(searchStudioProfiles("VALORANT")[0].id, "riot-games");
  assert.equal(searchStudioProfiles("no such studio").length, 0);
  assert.equal(searchStudioProfiles(" ").length, STUDIO_PROFILES.length);
});

test("validator rejects too few studios, duplicate names and unsupported properties", () => {
  const tooSmall = structuredClone(STUDIO_CATALOG_DATA);
  tooSmall.studios = tooSmall.studios.slice(0, 2);
  assert.throws(() => validateStudioCatalog(tooSmall), /between 3 and 5 studios/);

  const duplicate = structuredClone(STUDIO_CATALOG_DATA);
  duplicate.studios[1].name = duplicate.studios[0].name.toLowerCase();
  assert.throws(() => validateStudioCatalog(duplicate), /Duplicate studio names/);

  const unknownField = structuredClone(STUDIO_CATALOG_DATA);
  unknownField.studios[0].privateNotes = "must not be in public catalog";
  assert.throws(() => validateStudioCatalog(unknownField), /missing or unsupported fields/);
});

test("validator rejects unsafe URLs and verified routes without matching evidence", () => {
  const unsafeUrl = structuredClone(STUDIO_CATALOG_DATA);
  unsafeUrl.studios[0].officialWebsiteUrl = "javascript:alert(1)";
  assert.throws(() => validateStudioCatalog(unsafeUrl), /HTTPS URL/);

  const unsupportedRoute = structuredClone(STUDIO_CATALOG_DATA);
  unsupportedRoute.applicationRoutes[0].url = "https://example.com/fake-careers";
  assert.throws(() => validateStudioCatalog(unsupportedRoute), /direct matching source evidence/);
});

test("validator rejects dangling relationships, bad dates and invalid credit roles", () => {
  const missingStudio = structuredClone(STUDIO_CATALOG_DATA);
  missingStudio.sites[0].studioId = "does-not-exist";
  assert.throws(() => validateStudioCatalog(missingStudio), /unknown studio/);

  const badRole = structuredClone(STUDIO_CATALOG_DATA);
  badRole.credits[0].role = "publisher-ish";
  assert.throws(() => validateStudioCatalog(badRole), /unsupported value/);

  const badDate = structuredClone(STUDIO_CATALOG_DATA);
  badDate.credits[0].verifiedOn = "2026-02-31";
  assert.throws(() => validateStudioCatalog(badDate), /real calendar date/);
});

test("route statuses explicitly distinguish verified from unknown or stale", () => {
  assert.deepEqual(APPLICATION_ROUTE_STATUSES, ["verified", "unverified", "stale", "conflicting", "unknown"]);
  const changed = structuredClone(STUDIO_CATALOG_DATA);
  changed.applicationRoutes[0].status = "stale";
  assert.equal(validateStudioCatalog(changed).applicationRoutes[0].status, "stale");
});

test("catalogue career routes stay aligned with enabled sources from validated registry", () => {
  assert.doesNotThrow(() => assertEnabledRegistrySourcesHaveVerifiedRoutes(STUDIO_CATALOG_DATA));
  for (const source of STUDIO_REGISTRY.sources.filter((entry) => entry.enabled)) {
    const route = STUDIO_CATALOG_DATA.applicationRoutes.find(
      (entry) => entry.studioId === source.studio_id && entry.status === "verified" && entry.url === source.url,
    );
    assert.ok(route, "expected a verified catalogue route for " + source.id);
  }

  const missingRoute = structuredClone(STUDIO_CATALOG_DATA);
  missingRoute.applicationRoutes = missingRoute.applicationRoutes.filter((route) => route.studioId !== "riot-games");
  assert.throws(
    () => assertEnabledRegistrySourcesHaveVerifiedRoutes(missingRoute),
    /Enabled registry source "riot-games-careers" has no matching verified catalogue route/,
  );
});

test("validated studio registry rejects invalid career URLs", () => {
  const invalidRegistry = structuredClone(STUDIO_REGISTRY);
  invalidRegistry.sources[0].url = "http://www.cdprojektred.com/en/jobs";
  assert.throws(() => validateStudioRegistry(invalidRegistry), /HTTPS URL/);
});
