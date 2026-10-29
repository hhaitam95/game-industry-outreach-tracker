#!/usr/bin/env node
import { readFile, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { validateOpportunitySnapshot } from "../src/lib/opportunities/snapshot-validation.mjs";

export const DEFAULT_SNAPSHOT_URL =
  "https://raw.githubusercontent.com/hhaitam95/game-industry-outreach-tracker/discovery-state/public/public-opportunities.json";
export const DEFAULT_DESTINATION = fileURLToPath(new URL("../src/data/public-opportunities.json", import.meta.url));

/** @param {string} source */
async function readSource(source) {
  if (/^https?:\/\//i.test(source)) {
    const url = new URL(source);
    if (url.protocol !== "https:") throw new Error("Snapshot URL must use HTTPS.");
    const response = await fetch(url);
    if (!response.ok) throw new Error("Snapshot download failed with HTTP " + response.status + ".");
    return response.text();
  }
  return readFile(resolve(source), "utf8");
}

/**
 * Validate before touching the destination. Failed reads/validation leave an
 * existing generated snapshot unchanged.
 * @param {{from?: string, destination?: string}} [options]
 * @returns {Promise<{destination: string, roleCount: number}>}
 */
export async function syncPublicSnapshot({ from = DEFAULT_SNAPSHOT_URL, destination = DEFAULT_DESTINATION } = {}) {
  const sourceText = await readSource(from);
  let parsed;
  try {
    parsed = JSON.parse(sourceText);
  } catch {
    throw new Error("Snapshot source is not valid JSON.");
  }
  const validated = validateOpportunitySnapshot(parsed);
  const destinationPath = resolve(destination);
  const temporaryPath = destinationPath + ".tmp-" + process.pid;
  const serialized = JSON.stringify(validated, null, 2) + "\n";

  await mkdir(dirname(destinationPath), { recursive: true });
  try {
    await writeFile(temporaryPath, serialized, { flag: "wx", encoding: "utf8" });
    await rename(temporaryPath, destinationPath);
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
  return { destination: destinationPath, roleCount: validated.opportunities.length };
}

/** @param {string[]} args */
function parseArgs(args) {
  let from = DEFAULT_SNAPSHOT_URL;
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== "--from" || !args[index + 1]) {
      throw new Error("Usage: npm run data:sync -- [--from <path|https-url>]");
    }
    from = args[index + 1];
    index += 1;
  }
  return { from };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const result = await syncPublicSnapshot(parseArgs(process.argv.slice(2)));
    process.stdout.write("Validated " + result.roleCount + " public role links into " + result.destination + ".\n");
  } catch (error) {
    process.stderr.write(
      "Public snapshot sync failed: " + (error instanceof Error ? error.message : "Unknown error") + "\n",
    );
    process.exitCode = 1;
  }
}
