import { readFileSync } from "node:fs";
import { findUnexpectedRegistryUrls } from "./lib/lockfile-registry.mjs";

let lockfile;
try {
  lockfile = JSON.parse(readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
} catch {
  console.error("Could not read or parse package-lock.json.");
  process.exitCode = 1;
}

if (lockfile) {
  const violations = findUnexpectedRegistryUrls(lockfile);
  if (violations.length > 0) {
    console.error("Lockfile contains resolved package URLs outside the approved registry origin.");
    for (const violation of violations) {
      console.error("- " + violation.packagePath + ": " + violation.reason);
    }
    process.exitCode = 1;
  } else {
    const count = Object.values(lockfile.packages).filter(
      (metadata) => metadata && typeof metadata.resolved === "string",
    ).length;
    console.log("Verified " + count + " resolved package URLs use https://registry.npmjs.org.");
  }
}
