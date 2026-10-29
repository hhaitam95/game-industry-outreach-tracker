/** @typedef {"overview" | "studios" | "resume" | "outreach" | "applications" | "settings"} PageId */

/** @type {Array<{ id: PageId, label: string, icon: string, description: string }>} */
export const NAV_ITEMS = [
  {
    id: "overview",
    label: "Overview",
    icon: "overview",
    description: "A starting point for researching official speculative-application routes worldwide.",
  },
  {
    id: "studios",
    label: "Speculative applications",
    icon: "studios",
    description:
      "Research studios and official application routes. A generic careers page alone does not prove speculative applications are accepted.",
  },
  {
    id: "resume",
    label: "Resume lab",
    icon: "resume",
    description: "Review your resume for a speculative application while keeping every claim factual.",
  },
  {
    id: "outreach",
    label: "Outreach",
    icon: "outreach",
    description: "Prepare a tailored speculative-application introduction and review it before you copy or send it yourself.",
  },
  {
    id: "applications",
    label: "Applications",
    icon: "applications",
    description: "Privately track planned or submitted speculative applications, replies, interviews, follow-ups and outcomes.",
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
