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
    description:
      "Browse sourced studio profiles and a build-time role snapshot with freshness and unknowns clearly marked.",
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
    description: "Create sourced, editable outreach drafts and review them before you copy or send anything yourself.",
  },
  {
    id: "applications",
    label: "Applications",
    icon: "applications",
    description: "Privately track manually confirmed submissions, replies, interviews, follow-ups and outcomes.",
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
