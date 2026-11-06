/**
 * Generate a stable, DOM/storage-safe application ID from the studio name.
 * If two distinct names normalize to the same slug (or have no Latin slug),
 * append the first available numeric suffix.
 * @param {string} studioName
 * @param {Iterable<string>} existingIds
 * @returns {string}
 */
export function createApplicationId(studioName, existingIds = []) {
  const normalized = String(studioName ?? "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const base = normalized || "studio";
  const used = new Set(existingIds);
  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(base + "-" + suffix)) suffix += 1;
  return base + "-" + suffix;
}
