import assert from "node:assert/strict";
import test from "node:test";
import { getNavItem, NAV_ITEMS } from "../src/lib/navigation.mjs";

test("navigation identifiers are unique and include the six workspace sections", () => {
  const identifiers = NAV_ITEMS.map((item) => item.id);

  assert.equal(identifiers.length, 6);
  assert.equal(new Set(identifiers).size, identifiers.length);
  assert.deepEqual(identifiers, ["overview", "studios", "resume", "outreach", "applications", "settings"]);
});

test("getNavItem returns the requested navigation item", () => {
  assert.equal(getNavItem("studios").label, "Speculative applications");
  assert.equal(getNavItem("resume").description.includes("resume"), true);
});

test("getNavItem safely falls back to Overview for an unknown section", () => {
  assert.equal(getNavItem("unknown-section").id, "overview");
});
