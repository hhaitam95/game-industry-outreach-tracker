import sampleSnapshot from "../../data/sample-public-opportunities.json" with { type: "json" };
import {
  loadOpportunitySnapshot,
  PUBLIC_OPPORTUNITY_FIELDS,
  PUBLIC_OPPORTUNITY_STATUSES,
  validateOpportunitySnapshot,
} from "./snapshot-validation.mjs";

export { loadOpportunitySnapshot, PUBLIC_OPPORTUNITY_FIELDS, PUBLIC_OPPORTUNITY_STATUSES, validateOpportunitySnapshot };

/** @type {Record<string, unknown>} */
const syncedSnapshotModules =
  typeof import.meta.glob === "function"
    ? import.meta.glob("../../data/public-opportunities.json", { eager: true, import: "default" })
    : {};

/**
 * Prefer a locally synced discovery-state snapshot. If it is absent, use safe
 * synthetic sample data. An invalid synced file fails closed instead of silently
 * substituting the sample.
 * @param {Record<string, unknown>} [liveModules]
 * @param {unknown} [sample]
 * @returns {{snapshot: import("./snapshot-validation.mjs").PublicOpportunitySnapshot | null, error: string | null, origin: "live" | "sample"}}
 */
export function loadBundledOpportunitySnapshot(liveModules = syncedSnapshotModules, sample = sampleSnapshot) {
  const livePaths = Object.keys(liveModules).sort();
  const origin = livePaths.length > 0 ? "live" : "sample";
  const input = origin === "live" ? liveModules[livePaths[0]] : sample;
  return loadOpportunitySnapshot(input, origin);
}

const loadedSnapshot = loadBundledOpportunitySnapshot();
export const OPPORTUNITY_SNAPSHOT = loadedSnapshot.snapshot;
export const OPPORTUNITY_SNAPSHOT_ERROR = loadedSnapshot.error;
export const OPPORTUNITY_SNAPSHOT_ORIGIN = loadedSnapshot.origin;
export const IS_SYNTHETIC_SNAPSHOT = loadedSnapshot.origin === "sample";
