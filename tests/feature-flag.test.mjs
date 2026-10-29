import assert from "node:assert/strict";
import test from "node:test";
import { FEATURES, isRoleExplorerEnabled } from "../src/config/features.mjs";

test("the shipped role explorer feature flag is disabled by default", () => {
  assert.equal(FEATURES.roleExplorer, false);
  assert.equal(isRoleExplorerEnabled(), false);
});

test("role explorer can be explicitly enabled for isolated compatibility tests", () => {
  assert.equal(isRoleExplorerEnabled({ roleExplorer: true }), true);
  assert.equal(isRoleExplorerEnabled({ roleExplorer: false }), false);
  assert.equal(isRoleExplorerEnabled({}), false);
});
