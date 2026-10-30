import assert from "node:assert/strict";
import test from "node:test";
import { getNavItem, NAV_ITEMS } from "../src/lib/navigation.mjs";

test("navigation contains exactly the two StudioScout MVP pages", () => {
  const identifiers = NAV_ITEMS.map((item) => item.id);

  assert.deepEqual(identifiers, ["studios", "applications"]);
  assert.equal(new Set(identifiers).size, identifiers.length);
});

test("getNavItem returns the requested MVP navigation item", () => {
  assert.equal(getNavItem("studios").label, "Studios");
  assert.equal(getNavItem("applications").label, "My applications");
});

test("unknown navigation identifiers safely fall back to Studios", () => {
  assert.equal(getNavItem("unknown-section").id, "studios");
});
