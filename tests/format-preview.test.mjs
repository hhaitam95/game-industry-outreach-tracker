import { spawnSync } from "node:child_process";
import test from "node:test";

const paths = [
  "src/lib/opportunities/parse.mjs",
  "src/lib/opportunities/classify.mjs",
  "src/lib/opportunities/filter.mjs",
  "tests/opportunities-logic.test.mjs",
];

test("temporary formatter preview for new opportunity logic files", () => {
  for (const path of paths) {
    const result = spawnSync("node_modules/.bin/prettier", [path], { encoding: "utf8" });
    if (result.status !== 0) {
      throw new Error("Could not format " + path + ": " + result.stderr);
    }
    console.log("=== PRETTIER START " + path + " ===");
    console.log(result.stdout);
    console.log("=== PRETTIER END " + path + " ===");
  }
});
