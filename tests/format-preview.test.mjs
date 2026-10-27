import { spawnSync } from "node:child_process";
import test from "node:test";

const paths = [
  "src/lib/opportunities/snapshot-validation.mjs",
  "scripts/sync-public-snapshot.mjs",
  "tests/sync-public-snapshot.test.mjs",
];

test("temporary exact Prettier preview for sync implementation files", () => {
  for (const path of paths) {
    const result = spawnSync("node_modules/.bin/prettier", [path], { encoding: "utf8" });
    if (result.status !== 0) throw new Error("Could not format " + path + ": " + result.stderr);
    console.log("=== PRETTIER START " + path + " ===");
    console.log(result.stdout);
    console.log("=== PRETTIER END " + path + " ===");
  }
});
