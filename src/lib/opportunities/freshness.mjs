const DAY_MS = 24 * 60 * 60 * 1000;

/** @param {string} value */
function utcDay(value) {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return null;
  const date = new Date(time);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * \`lastSeenAt\` is observation history, not proof a role is open.
 * The comparison is calendar-day based to avoid treating scan-time seconds
 * as separate scans.
 * @param {{lastSeenAt: string}} role
 * @param {string} snapshotGeneratedAt
 * @returns {{key: "latest" | "older", label: string, daysAgo: number, seenInLatestScan: boolean}}
 */
export function getRoleFreshness(role, snapshotGeneratedAt) {
  const snapshotDay = utcDay(snapshotGeneratedAt);
  const lastSeenDay = utcDay(role.lastSeenAt);
  if (snapshotDay === null || lastSeenDay === null || lastSeenDay < snapshotDay) {
    const daysAgo =
      snapshotDay === null || lastSeenDay === null ? 0 : Math.max(1, Math.floor((snapshotDay - lastSeenDay) / DAY_MS));
    return {
      key: "older",
      label: "Not seen in latest scan (" + daysAgo + " days ago)",
      daysAgo,
      seenInLatestScan: false,
    };
  }
  return { key: "latest", label: "Seen in latest scan", daysAgo: 0, seenInLatestScan: true };
}

/**
 * @param {string} generatedAt
 * @param {Date | string} [now]
 * @returns {{ageDays: number, tone: "neutral" | "warning"}}
 */
export function getSnapshotFreshness(generatedAt, now = new Date()) {
  const generatedDay = utcDay(generatedAt);
  const nowValue = now instanceof Date ? now.toISOString() : now;
  const nowDay = utcDay(nowValue);
  if (generatedDay === null || nowDay === null) return { ageDays: 0, tone: "warning" };
  const ageDays = Math.max(0, Math.floor((nowDay - generatedDay) / DAY_MS));
  return { ageDays, tone: ageDays >= 7 ? "warning" : "neutral" };
}
