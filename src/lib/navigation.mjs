/** @typedef {"overview" | "studios" | "resume" | "outreach" | "applications" | "settings"} PageId */

/** @type {Array<{ id: PageId, label: string, icon: string, description: string }>} */
export const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: "overview",
    description: "A starting point for your game-industry search.",
  },
  {
    id: "studios",
    label: "Studios & roles",
    icon: "studios",
    description: "Browse a small, source-linked catalogue of studios and official career routes.",
  },
  {
    id: "resume",
    label: "Resume lab",
    icon: "resume",
    description: "Review and tailor your resume for a specific opportunity.",
  },
  {
    id: "outreach",
    label: "Outreach",
    icon: "outreach",
    description: "Prepare thoughtful, evidence-backed introductions.",
  },
  {
    id: "applications",
    label: "Applications",
    icon: "applications",
    description: "Keep track of submissions, replies, and next steps.",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    description: "Configure your workspace and local-data preferences.",
  },
];

/** @param {string} pageId */
export function getNavItem(pageId) {
  return NAV_ITEMS.find((item) => item.id === pageId) ?? NAV_ITEMS[0];
}
