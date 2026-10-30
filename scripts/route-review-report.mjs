import { readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const file = path.join(root, "src/data/speculative-route-directory.json");
const studios = JSON.parse(readFileSync(file, "utf8"));
const asOfArg = process.argv.find((arg) => arg.startsWith("--as-of="));
const asOf = asOfArg ? asOfArg.slice("--as-of=".length) : new Date().toISOString().slice(0, 10);

if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf) || Number.isNaN(Date.parse(asOf + "T00:00:00Z"))) {
  process.stderr.write("Use --as-of=YYYY-MM-DD.\n");
  process.exit(1);
}

const due = studios.filter((studio) =>
  studio.applicationResearch?.routeStatus === "active" &&
  studio.applicationResearch.nextReviewAt <= asOf
);
const overdue = due.filter((studio) => studio.applicationResearch.nextReviewAt < asOf);
const byType = studios.reduce((groups, studio) => {
  const type = studio.applicationResearch?.routeType || "missing";
  groups[type] = (groups[type] || 0) + 1;
  return groups;
}, {});
const countries = new Set(studios.map((studio) => studio.country || "Not stated"));

process.stdout.write("StudioScout route research report\n");
process.stdout.write("As of: " + asOf + "\n");
process.stdout.write("Total records: " + studios.length + "\n");
process.stdout.write("Due for review: " + due.length + " (" + overdue.length + " overdue)\n\n");
process.stdout.write("Route types:\n");
for (const [type, count] of Object.entries(byType).sort(([a], [b]) => a.localeCompare(b))) {
  process.stdout.write("  " + type + ": " + count + "\n");
}
process.stdout.write("\nCountries: " + countries.size + "\n");

if (due.length) {
  process.stdout.write("\nRoutes to review:\n");
  for (const studio of due.sort((a, b) =>
    a.applicationResearch.nextReviewAt.localeCompare(b.applicationResearch.nextReviewAt)
  )) {
    process.stdout.write(
      "  " + studio.applicationResearch.nextReviewAt + "  " + studio.name +
      "  [" + studio.applicationResearch.routeType + "]  " + studio.applicationUrl + "\n"
    );
  }
}
