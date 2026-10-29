/** @typedef {string} RoleFamily */
/** @typedef {{family: RoleFamily, label: string, matchedPhrase: string | null}} RoleClassification */

/** @type {Array<{family: RoleFamily, label: string, target: boolean, patterns: RegExp[]}>} */
export const ROLE_FAMILY_RULES = [
  {
    family: "support",
    label: "Support",
    target: true,
    patterns: [
      /\bplayer support\b/i,
      /\bdeveloper support\b/i,
      /\bcustomer support\b/i,
      /\btechnical support\b/i,
      /\bproduct support\b/i,
      /\bit support\b/i,
      /\bsupport engineer\b/i,
      /\bsupport specialist\b/i,
      /\bsupport analyst\b/i,
      /\bsupport representative\b/i,
      /\bsupport technician\b/i,
      /\bhelp desk\b/i,
      /\bservice desk\b/i,
      /\bend[- ]user support\b/i,
    ],
  },
  {
    family: "qa-test",
    label: "QA / Test",
    target: true,
    patterns: [
      /\btest automation\b/i,
      /\bqa engineer\b/i,
      /\bqa analyst\b/i,
      /\bqa tester\b/i,
      /\bqa lead\b/i,
      /\bquality assurance\b/i,
      /\bquality engineer\b/i,
      /\btest engineer\b/i,
      /\btest analyst\b/i,
      /\bsoftware tester\b/i,
      /\bgame tester\b/i,
    ],
  },
  {
    family: "build-release",
    label: "Build / Release",
    target: true,
    patterns: [
      /\bbuild systems\b/i,
      /\bbuild platforms\b/i,
      /\bbuild services\b/i,
      /\bbuild engineer\b/i,
      /\bbuild automation\b/i,
      /\bbuild and release\b/i,
      /\bbuild\/release\b/i,
      /\brelease engineer\b/i,
      /\brelease engineering\b/i,
      /\brelease manager\b/i,
      /\bcontinuous integration\b/i,
      /\bcontinuous delivery\b/i,
      /\bci\/cd\b/i,
    ],
  },
  {
    family: "devops-sre",
    label: "DevOps / SRE",
    target: true,
    patterns: [
      /\bsite reliability\b/i,
      /\bdevops\b/i,
      /\bsre\b/i,
      /\breliability engineer\b/i,
      /\bplatform engineer\b/i,
      /\bplatform engineering\b/i,
    ],
  },
  {
    family: "tools-devex",
    label: "Tools / Developer Experience",
    target: true,
    patterns: [
      /\bdeveloper experience\b/i,
      /\bdeveloper connections\b/i,
      /\bdeveloper productivity\b/i,
      /\bengine\s*(?:&|and)\s*tools\b/i,
      /\btools engineer\b/i,
      /\btools programmer\b/i,
      /\btools developer\b/i,
      /\btooling engineer\b/i,
      /\binternal tools\b/i,
    ],
  },
  {
    family: "technical-production",
    label: "Technical Production",
    target: false,
    patterns: [
      /\btechnical producer\b/i,
      /\btechnical production\b/i,
      /\btechnical project manager\b/i,
      /\btechnical program manager\b/i,
      /\bproduction technology\b/i,
    ],
  },
  {
    family: "other",
    label: "Other",
    target: false,
    patterns: [
      /\bgame designer\b/i,
      /\blevel designer\b/i,
      /\bcharacter artist\b/i,
      /\benvironment artist\b/i,
      /\banimator\b/i,
      /\baudio designer\b/i,
      /\blocali[sz]ation specialist\b/i,
    ],
  },
];

export const TARGET_ROLE_FAMILIES = Object.freeze(["support", "qa-test", "build-release", "devops-sre", "tools-devex"]);

/**
 * Match only phrases that indicate the role family, not broad team words.
 * @param {string} rawTitle
 * @returns {RoleClassification}
 */
export function classifyRoleFamily(rawTitle) {
  const title = typeof rawTitle === "string" ? rawTitle : "";
  for (const rule of ROLE_FAMILY_RULES) {
    for (const pattern of rule.patterns) {
      const match = title.match(pattern);
      if (match) return { family: rule.family, label: rule.label, matchedPhrase: match[0] };
    }
  }
  return { family: "unclassified", label: "Unclassified", matchedPhrase: null };
}
