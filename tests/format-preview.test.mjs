import { spawnSync } from "node:child_process";
import test from "node:test";

const paths = [
  "src/App.tsx",
  "src/components/OpportunityExplorer.tsx",
  "src/components/StudioCatalog.tsx",
  "src/styles.css",
  "scripts/browser-vault-smoke.mjs",
];

test("temporary formatter preview for Phase 5a UI files", () => {
  for (const path of paths) {
    const result = spawnSync("node_modules/.bin/prettier", [path], { encoding: "utf8" });
    if (result.status !== 0) throw new Error("Could not format " + path + ": " + result.stderr);
    console.log("=== PRETTIER START " + path + " ===");
    console.log(result.stdout);
    console.log("=== PRETTIER END " + path + " ===");
  }
});
