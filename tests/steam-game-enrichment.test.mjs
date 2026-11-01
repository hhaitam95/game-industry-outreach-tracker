import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeDeveloperName,
  normalizeGameTitle,
  selectExactSteamMatch,
} from "../scripts/enrich-steam-games.mjs";

test("normalizes game titles without fuzzy matching", () => {
  assert.equal(normalizeGameTitle("  The Smurfs – Dreams  "), "the smurfs dreams");
  assert.notEqual(normalizeGameTitle("The Smurfs: Dreams"), normalizeGameTitle("Smurfs"));
});

test("normalizes legal suffixes and the studio word in developer names", () => {
  assert.equal(normalizeDeveloperName("Fast Travel Games AB"), "fast travel games");
  assert.equal(normalizeDeveloperName("Hugecalf Studios Ltd."), "hugecalf");
  assert.equal(normalizeDeveloperName("Ocellus Studio"), "ocellus");
});

test("accepts only an exact Steam title whose app details confirm the studio developer", () => {
  const result = selectExactSteamMatch(
    "Mannequin",
    "Fast Travel Games",
    { items: [{ id: 2409260, name: "Mannequin" }] },
    { "2409260": { success: true, data: { type: "game", name: "Mannequin", developers: ["Fast Travel Games AB"] } } },
  );
  assert.deepEqual(result, { status: "matched", appId: 2409260 });
});

test("rejects exact title matches where the developer does not match the studio", () => {
  const result = selectExactSteamMatch(
    "Hidden City",
    "AB Games",
    { items: [{ id: 2610200, name: "Hidden City" }] },
    { "2610200": { success: true, data: { type: "game", name: "Hidden City", developers: ["Hede"] } } },
  );
  assert.deepEqual(result, { status: "developer_mismatch", appId: 2610200 });
});

test("rejects ambiguous title matches instead of selecting the first", () => {
  const result = selectExactSteamMatch(
    "Horizon",
    "AstroBeam",
    { items: [{ id: 1, name: "Horizon" }, { id: 2, name: "Horizon" }] },
    {},
  );
  assert.deepEqual(result, { status: "ambiguous", candidateCount: 2 });
});

test("rejects non-game Steam items and title variants", () => {
  assert.equal(
    selectExactSteamMatch("The Trail", "22cans", { items: [{ id: 10, name: "The Trail" }] }, {
      "10": { success: true, data: { type: "software", name: "The Trail", developers: ["22cans"] } },
    }).status,
    "not_a_game",
  );
  assert.equal(
    selectExactSteamMatch("KARDS", "1939 Games", { items: [{ id: 20, name: "KARDS - The WW2 Card Game" }] }, {}).status,
    "not_found",
  );
});
