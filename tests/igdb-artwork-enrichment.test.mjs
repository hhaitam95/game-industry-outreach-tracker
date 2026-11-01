import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGameTitle, selectExactIgdbMatch } from "../scripts/enrich-igdb-covers.mjs";

test("normalizes punctuation, diacritics and spacing for exact-title comparison", () => {
  assert.equal(normalizeGameTitle("  Café & Sword: The   Return! "), "cafe and sword the return");
});

test("accepts one exact IGDB title match with a cover image ID", () => {
  const match = selectExactIgdbMatch("Metro: Last Light Redux", [
    {
      id: 123,
      name: "Metro: Last Light Redux",
      slug: "metro-last-light-redux",
      cover: { image_id: "cover-hash-123" },
    },
    { id: 456, name: "Metro Exodus", slug: "metro-exodus" },
  ]);
  assert.deepEqual(match, {
    status: "matched",
    exactMatchCount: 1,
    igdbGameId: 123,
    igdbSlug: "metro-last-light-redux",
    igdbCoverId: "cover-hash-123",
  });
});

test("does not guess when multiple IGDB records have the same normalized title", () => {
  const match = selectExactIgdbMatch("Horizon", [
    { id: 1, name: "Horizon", cover: { image_id: "one" } },
    { id: 2, name: "Horizon", cover: { image_id: "two" } },
  ]);
  assert.equal(match.status, "ambiguous");
  assert.equal(match.exactMatchCount, 2);
});

test("leaves missing titles and coverless IGDB records unresolved", () => {
  assert.equal(selectExactIgdbMatch("Unknown", []).status, "not_found");
  assert.equal(selectExactIgdbMatch("No Cover", [{ id: 9, name: "No Cover" }]).status, "missing_cover");
});

test("returns a sourced release year from the exact IGDB match", () => {
  const match = selectExactIgdbMatch("Example Game", [{
    id: 99,
    name: "Example Game",
    slug: "example-game",
    first_release_date: Date.UTC(2020, 6, 15) / 1000,
    cover: { image_id: "example-cover" },
  }]);
  assert.equal(match.releaseYear, 2020);
  assert.equal(match.releaseYearSourceUrl, "https://www.igdb.com/games/example-game");
});

test("preserves the release year when an exact IGDB game has no cover", () => {
  const match = selectExactIgdbMatch("No Cover", [{
    id: 100,
    name: "No Cover",
    slug: "no-cover",
    first_release_date: Date.UTC(2018, 0, 1) / 1000,
  }]);
  assert.equal(match.status, "missing_cover");
  assert.equal(match.releaseYear, 2018);
});
