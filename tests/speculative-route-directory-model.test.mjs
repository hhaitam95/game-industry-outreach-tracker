import assert from "node:assert/strict";
import test from "node:test";
import sampleDirectory from "../src/data/sample-speculative-route-directory.json" with { type: "json" };
import { selectSpeculativeRoutes } from "../src/lib/speculative-routes/directory-model.mjs";

function expandedDirectory() {
  const directory = structuredClone(sampleDirectory);
  directory.studios = Array.from({ length: 12 }, (_, index) => ({
    id: "synthetic-studio-" + String(index + 1).padStart(2, "0"),
    name: "Synthetic Studio " + String(index + 1).padStart(2, "0"),
    officialWebsiteUrl: "https://example.com/studio-" + (index + 1),
    homeCountryCode: null,
  }));
  directory.routes = directory.studios.map((studio, index) => ({
    ...structuredClone(sampleDirectory.routes[0]),
    id: "synthetic-route-" + String(index + 1).padStart(2, "0"),
    studioId: studio.id,
    status: index % 2 ? "candidate" : "needs-review",
    countryScope: index % 3 ? "unknown" : "country-limited",
    countryCodes: index % 3 ? [] : ["US"],
    disciplineTags: index % 2 ? ["art"] : ["engineering"],
    evidenceSummary: "Synthetic evidence for record " + (index + 1),
    firstSeenAt: "2000-01-" + String(index + 1).padStart(2, "0") + "T00:00:00.000Z",
    lastCheckedAt: "2000-01-" + String(index + 1).padStart(2, "0") + "T00:00:00.000Z",
  }));
  return directory;
}

test("directory model joins studio names and filters by metadata", () => {
  const directory = expandedDirectory();
  const filtered = selectSpeculativeRoutes(directory, {
    status: "candidate",
    countryScope: "unknown",
    discipline: "art",
    query: "synthetic studio 02",
  });
  assert.equal(filtered.totalCount, 1);
  assert.equal(filtered.items[0].studioName, "Synthetic Studio 02");
  assert.equal(filtered.items[0].id, "synthetic-route-02");
});

test("directory model search spans evidence, route type, and route URLs", () => {
  const directory = expandedDirectory();
  assert.equal(selectSpeculativeRoutes(directory, { query: "record 12" }).items[0].id, "synthetic-route-12");
  assert.equal(selectSpeculativeRoutes(directory, { query: "example.com/studio-4" }).items[0].id, "synthetic-route-04");
  assert.equal(selectSpeculativeRoutes(directory, { query: "dedicated-page" }).totalCount, 12);
});

test("directory model sorts deterministically and paginates without overlap", () => {
  const directory = expandedDirectory();
  const first = selectSpeculativeRoutes(directory, { page: 1, pageSize: 5, sort: "checked-asc" });
  const second = selectSpeculativeRoutes(directory, { page: 2, pageSize: 5, sort: "checked-asc" });
  assert.equal(first.pageCount, 3);
  assert.equal(first.items.length, 5);
  assert.equal(second.items.length, 5);
  assert.equal(first.items[0].id, "synthetic-route-01");
  assert.equal(second.items[0].id, "synthetic-route-06");
  assert.equal(new Set([...first.items, ...second.items].map((route) => route.id)).size, 10);
});

test("directory model clamps invalid pages and gives an explicit empty result", () => {
  const directory = expandedDirectory();
  const last = selectSpeculativeRoutes(directory, { page: 500, pageSize: 10 });
  assert.equal(last.page, 2);
  assert.equal(last.items.length, 2);
  const empty = selectSpeculativeRoutes(directory, { query: "no matching synthetic record" });
  assert.equal(empty.totalCount, 0);
  assert.equal(empty.items.length, 0);
  assert.equal(empty.page, 1);
  assert.equal(empty.pageCount, 1);
});
