/** @typedef {"studios" | "applications"} PageId */
export const NAV_ITEMS = [
  {
    id: "studios",
    label: "Studios",
    description: "Find game studios that accept speculative applications.",
  },
  {
    id: "applications",
    label: "My applications",
    description: "Track your saved studios and application progress.",
  },
];

/** @param {string} pageId */
export function getNavItem(pageId) {
  return NAV_ITEMS.find((item) => item.id === pageId) ?? NAV_ITEMS[0];
}
