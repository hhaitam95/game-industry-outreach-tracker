import assert from "node:assert/strict";
import test from "node:test";
import { createApplicationId } from "../src/tracker/application-identity.mjs";

test("application IDs use a readable normalized studio slug", () => {
  assert.equal(createApplicationId("4A Games"), "4a-games");
  assert.equal(createApplicationId("  Supermassive Games  "), "supermassive-games");
});

test("application IDs remain unique when different studio names normalize identically", () => {
  assert.equal(createApplicationId("North-Star Games", ["north-star-games"]), "north-star-games-2");
  assert.equal(createApplicationId("North Star Games", ["north-star-games", "north-star-games-2"]), "north-star-games-3");
});

test("non-Latin studio names receive a non-empty unique fallback ID", () => {
  assert.equal(createApplicationId("東京ゲームスタジオ"), "studio");
  assert.equal(createApplicationId("서울 게임 스튜디오", ["studio"]), "studio-2");
});

test("generated IDs do not collide with existing suffixed names", () => {
  assert.equal(createApplicationId("Studio", ["studio", "studio-2"]), "studio-3");
});
