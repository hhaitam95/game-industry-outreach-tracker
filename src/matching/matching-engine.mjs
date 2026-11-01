// @ts-check

/**
 * Candidate-facing matching is deliberately qualitative. It never produces a hiring
 * probability and never changes the public studio directory.
 *
 * @typedef {import("../profile/profile.types").CandidateProfile} CandidateProfile
 * @typedef {"strong" | "potential" | "weak" | "not_assessed"} RelevanceLevel
 * @typedef {"active" | "needs_verification" | "unavailable"} RouteReadiness
 * @typedef {"high" | "preferred" | "neutral" | "low"} PriorityLevel
 * @typedef {{group: string, pattern: RegExp, disciplines: string[]}} RoleRule
 * @typedef {{level: RelevanceLevel, reasons: string[], evidence: EvidenceItem[], gaps: string[], limitedRoleInformation: boolean}} RelevanceAssessment
 * @typedef {{level: RouteReadiness, reasons: string[]}} RouteAssessment
 * @typedef {{description?: string, companyType?: string[], industryScale?: string, focus?: string[]}} StudioProfile
 * @typedef {{routeType?: string, submissionMethods?: string[], workModel?: string, eligibleLocations?: string[], disciplineScope?: string[], routeStatus?: string, nextReviewAt?: string | null}} ApplicationResearch
 *
 * @typedef {Object} MatchStudio
 * @property {string} name
 * @property {string} [country]
 * @property {string} [countryCode]
 * @property {string} [websiteUrl]
 * @property {string} [applicationUrl]
 * @property {string} [evidenceUrl]
 * @property {string} [checkedAt]
 * @property {string} [notes]
 * @property {string[]} [continents]
 * @property {StudioProfile} [profile]
 * @property {ApplicationResearch} [applicationResearch]
 *
 * @typedef {Object} EvidenceItem
 * @property {string} name
 * @property {"demonstrated" | "transferable" | "learning_exposure"} evidence
 * @property {string} details
 * @property {string} source
 * @property {"discipline" | "supporting_context"} relationship
 *
 * @typedef {Object} PriorityAssessment
 * @property {PriorityLevel} level
 * @property {string} label
 * @property {number} score
 * @property {string[]} reasons
 *
 * @typedef {Object} StudioMatchAssessment
 * @property {string} id
 * @property {string} name
 * @property {string} country
 * @property {string} [countryCode]
 * @property {string} websiteUrl
 * @property {string} applicationUrl
 * @property {string} evidenceUrl
 * @property {string} checkedAt
 * @property {string} [notes]
 * @property {string} [nextReviewAt]
 * @property {string} routeType
 * @property {string} workModel
 * @property {string[]} submissionMethods
 * @property {string[]} eligibleLocations
 * @property {string[]} disciplineScope
 * @property {string[]} studioTypes
 * @property {string[]} focus
 * @property {RelevanceLevel} relevance
 * @property {string} relevanceLabel
 * @property {string[]} relevanceReasons
 * @property {EvidenceItem[]} evidence
 * @property {string[]} gaps
 * @property {boolean} limitedRoleInformation
 * @property {RouteReadiness} routeReadiness
 * @property {string} routeReadinessLabel
 * @property {string[]} routeReasons
 * @property {PriorityAssessment} priority
 */

const ROLE_RULES = [
  {
    group: "support",
    pattern: /(developer|technical|product|it|systems)\s+support|support\s+(engineer|specialist)|technical operations/,
    disciplines: ["programming", "software", "game development", "tools", "build", "release", "devops", "qa", "quality assurance", "automation", "infrastructure", "operations", "network", "api"],
  },
  {
    group: "devops",
    pattern: /\bdevops\b|site reliability|\bsre\b|platform engineer|infrastructure|build and release|release engineer|cloud engineer/,
    disciplines: ["programming", "software", "game development", "build", "release", "devops", "cloud", "infrastructure", "operations", "tools", "automation", "linux", "network"],
  },
  {
    group: "software",
    pattern: /software engineer|software developer|programmer|gameplay programming|tools programmer|backend|full stack|game engineer/,
    disciplines: ["programming", "software", "game development", "engineering", "c++", "c#", "python", "java", "unity", "unreal", "backend", "tools"],
  },
  {
    group: "qa",
    pattern: /\bqa\b|quality assurance|test automation|software tester|test engineer/,
    disciplines: ["qa", "quality assurance", "testing", "automation", "programming", "software"],
  },
  {
    group: "vfx",
    pattern: /\bvfx\b|visual effects|technical artist|shader|rendering|realtime effects/,
    disciplines: ["vfx", "visual effects", "technical art", "shaders", "rendering", "art", "animation"],
  },
  {
    group: "art",
    pattern: /\bartist\b|2d art|3d art|environment art|character art|concept art|animator|animation/,
    disciplines: ["art", "animation", "character", "environment", "concept", "2d", "3d"],
  },
  {
    group: "design",
    pattern: /game designer|level designer|systems designer|narrative designer/,
    disciplines: ["design", "game design", "level design", "narrative", "systems design"],
  },
];

const PROGRAMMING_SKILLS = [
  "python", "javascript", "typescript", "java", "c++", "c#", "rust", "go",
  "lua", "programming", "coding", "software development", "unreal engine", "unity",
];
const DEVOPS_SKILLS = [
  "docker", "kubernetes", "aws", "azure", "jenkins", "github actions", "ci/cd",
  "terraform", "ansible", "linux", "bash", "powershell", "prometheus", "grafana",
  "infrastructure", "deployment", "build pipeline",
];
const SUPPORT_SKILLS = [
  "technical support", "product support", "developer support", "troubleshooting",
  "rest api", "sql", "postman", "kibana", "opensearch", "logs", "networking",
  "incident", "debugging", "integration",
];

/** @param {unknown} value @returns {string} */
function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
}

/** @param {string} haystack @param {string} phrase @returns {boolean} */
function hasPhrase(haystack, phrase) {
  const text = normalize(haystack);
  const needle = normalize(phrase);
  return Boolean(text && needle && (text === needle || text.includes(needle)));
}

/** @param {string} name @returns {string} */
function studioId(name) {
  return normalize(name).replace(/\s+/g, "-").replace(/^-|-$/g, "");
}

/** @param {string[]} roleFamilies @returns {RoleRule[]} */
function roleRulesFor(roleFamilies) {
  return ROLE_RULES.filter((rule) =>
    roleFamilies.some((role) => rule.pattern.test(normalize(role))),
  );
}

/** @param {string} skillName @param {string} discipline @returns {boolean} */
function skillSupportsDiscipline(skillName, discipline) {
  const skill = normalize(skillName);
  const target = normalize(discipline);
  if (!skill || !target) return false;
  if (skill === target || skill.includes(target) || target.includes(skill)) return true;
  if (/programming|software|game development|engineering/.test(target)) {
    return PROGRAMMING_SKILLS.some((item) => skill.includes(normalize(item)));
  }
  if (/devops|cloud|infrastructure|build|release|operations|platform/.test(target)) {
    return DEVOPS_SKILLS.some((item) => skill.includes(normalize(item)));
  }
  if (/support|technical|network|api|integration/.test(target)) {
    return SUPPORT_SKILLS.some((item) => skill.includes(normalize(item)));
  }
  if (/quality assurance|(^| )qa($| )|testing|test automation/.test(target)) {
    return /test|quality assurance|\bqa\b|automation/.test(skill);
  }
  if (/vfx|visual effects|technical art|shaders|rendering/.test(target)) {
    return /vfx|visual effects|shader|render|niagara|houdini|after effects|embergen/.test(skill);
  }
  if (/art|animation|character|environment|concept/.test(target)) {
    return /art|animation|character|environment|concept|blender|maya|3d|2d/.test(skill);
  }
  if (/design|narrative|level/.test(target)) {
    return /design|narrative|level/.test(skill);
  }
  return false;
}

/**
 * @param {CandidateProfile["skills"][number]} skill
 * @returns {skill is CandidateProfile["skills"][number] & { evidence: "demonstrated" | "transferable" | "learning_exposure" }}
 */
function isUsableEvidence(skill) {
  return Boolean(skill.name.trim()) &&
    ["demonstrated", "transferable", "learning_exposure"].includes(skill.evidence);
}

/**
 * @param {CandidateProfile} profile
 * @param {MatchStudio} studio
 * @returns {RelevanceAssessment}
 */
function assessRelevance(profile, studio) {
  const roleFamilies = profile.preferences.roleFamilies.filter(Boolean);
  const skills = profile.skills.filter(isUsableEvidence);
  const experiences = profile.experience.filter((item) => item.title.trim());
  const hasProfileEvidence = skills.length > 0 || experiences.length > 0;
  const scope = studio.applicationResearch?.disciplineScope?.filter(Boolean) || [];
  const confirmedGaps = profile.skills
    .filter((skill) => skill.evidence === "user_confirmed_gap" && skill.name.trim())
    .filter((skill) =>
      scope.some((discipline) => skillSupportsDiscipline(skill.name, discipline)),
    )
    .map((skill) => "User-confirmed gap: " + skill.name);
  const matchedRoles = roleRulesFor(roleFamilies).filter((rule) =>
    scope.some((discipline) => rule.disciplines.some((term) => hasPhrase(discipline, term))),
  );
  const matchedSkills = skills.filter((skill) =>
    scope.some((discipline) => skillSupportsDiscipline(skill.name, discipline)),
  );
  const technicalRole = roleRulesFor(roleFamilies).some((rule) =>
    ["support", "devops", "software", "qa"].includes(rule.group),
  );
  const contextualSkills = technicalRole
    ? skills.filter((skill) =>
        SUPPORT_SKILLS.some((term) => hasPhrase(skill.name, term)) ||
        DEVOPS_SKILLS.some((term) => hasPhrase(skill.name, term)),
      )
    : [];
  const matchedExperience = experiences.filter((experience) =>
    scope.some((discipline) =>
      hasPhrase(experience.title, discipline) ||
      normalize(experience.title).includes(normalize(discipline)),
    ),
  );

  /** @type {EvidenceItem[]} */
  const evidence = [
    ...matchedSkills.map((skill) => /** @type {EvidenceItem} */ ({
      name: skill.name,
      evidence: skill.evidence,
      details: skill.evidenceDetails,
      source: skill.evidenceSource,
      relationship: "discipline",
    })),
    ...contextualSkills
      .filter((skill) => !matchedSkills.some((item) => item.id === skill.id))
      .slice(0, 5)
      .map((skill) => /** @type {EvidenceItem} */ ({
        name: skill.name,
        evidence: skill.evidence,
        details: skill.evidenceDetails,
        source: skill.evidenceSource,
        relationship: "supporting_context",
      })),
    ...matchedExperience.map((item) => /** @type {EvidenceItem} */ ({
      name: item.title,
      evidence: "transferable",
      details: item.responsibilities || item.achievements,
      source: item.employer,
      relationship: "discipline",
    })),
  ];

  if (!roleFamilies.length && !hasProfileEvidence) {
    return {
      level: "not_assessed",
      reasons: ["Add at least one target role and some evidenced skills or experience to personalize this assessment."],
      evidence,
      gaps: [],
      limitedRoleInformation: scope.length === 0,
    };
  }

  if (scope.length === 0) {
    const reasons = [
      "The application route does not list a specific discipline. This is treated as unknown, not as a mismatch.",
    ];
    if (roleFamilies.length) {
      reasons.push("Your target role preferences are available, but this route does not say which disciplines it is seeking.");
    } else {
      reasons.push("Add target role families to make the professional relevance assessment more specific.");
    }
    return {
      level: "potential",
      reasons,
      evidence,
      gaps: [],
      limitedRoleInformation: true,
    };
  }

  const hasDemonstratedDisciplineEvidence =
    evidence.some((item) => item.relationship === "discipline" && item.evidence === "demonstrated");
  const hasOtherDisciplineEvidence = evidence.some((item) => item.relationship === "discipline");

  if (matchedRoles.length && hasDemonstratedDisciplineEvidence) {
    return {
      level: "strong",
      reasons: [
        "At least one saved target role aligns with a discipline stated in the application route.",
        "The profile contains demonstrated evidence that maps to the stated discipline.",
      ],
      evidence,
      gaps: confirmedGaps,
      limitedRoleInformation: false,
    };
  }

  if (matchedRoles.length || hasOtherDisciplineEvidence) {
    return {
      level: "potential",
      reasons: [
        matchedRoles.length
          ? "At least one saved target role aligns with a discipline stated in the application route."
          : "A saved skill or experience item maps to a discipline stated in the application route.",
        "The available profile evidence is transferable, learning-level or not directly linked to the stated discipline.",
      ],
      evidence,
      gaps: [
        ...confirmedGaps,
        ...scope.filter((discipline) =>
          !matchedSkills.some((skill) => skillSupportsDiscipline(skill.name, discipline)) &&
          !matchedExperience.some((item) => hasPhrase(item.title, discipline)),
        ).map((discipline) => "Not directly evidenced in the profile: " + discipline),
      ],
      limitedRoleInformation: false,
    };
  }

  return {
    level: "weak",
    reasons: [
      "The employer has listed specific disciplines, but no saved target role or evidenced skill currently maps to them.",
      "This is a profile-to-route comparison only; it does not establish that the studio would reject an application.",
    ],
    evidence,
    gaps: [
      ...confirmedGaps,
      ...scope.map((discipline) => "Not evidenced in the profile: " + discipline),
    ],
    limitedRoleInformation: false,
  };
}

/** @param {string} value @returns {boolean} */
function validHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * @param {MatchStudio} studio
 * @param {Date} now
 * @returns {RouteAssessment}
 */
function assessRouteReadiness(studio, now) {
  const route = studio.applicationResearch || {};
  if (route.routeStatus !== "active") {
    return {
      level: "unavailable",
      reasons: ["The directory does not currently list this application route as active."],
    };
  }
  if (!validHttpUrl(studio.applicationUrl || "") || !validHttpUrl(studio.evidenceUrl || "")) {
    return {
      level: "needs_verification",
      reasons: ["An employer application URL or supporting evidence URL is missing or invalid."],
    };
  }

  const checkedAt = studio.checkedAt ? Date.parse(studio.checkedAt + "T23:59:59Z") : Number.NaN;
  const reviewAt = route.nextReviewAt ? Date.parse(route.nextReviewAt + "T23:59:59Z") : Number.NaN;
  const staleByAge = !Number.isFinite(checkedAt) || now.getTime() - checkedAt > 180 * 24 * 60 * 60 * 1000;
  const reviewDue = Number.isFinite(reviewAt) && reviewAt < now.getTime();
  if (staleByAge || reviewDue) {
    return {
      level: "needs_verification",
      reasons: [
        "The route needs a fresh check before relying on it.",
        studio.checkedAt ? "Last directory check: " + studio.checkedAt + "." : "No directory check date is recorded.",
      ],
    };
  }

  return {
    level: "active",
    reasons: [
      "The directory records an active employer application route, last checked " + studio.checkedAt + ".",
      "Read the employer's current instructions and confirm your own eligibility before applying; this is not a submission-readiness guarantee.",
    ],
  };
}

/** @param {string[]} regions @param {MatchStudio} studio @returns {string} */
function regionMatches(regions, studio) {
  const country = normalize(studio.country);
  const countryCode = normalize(studio.countryCode);
  const continents = (studio.continents || []).map(normalize);
  /** @type {Record<string, string>} */
  const countryAliases = {
    uk: "united kingdom",
    britain: "united kingdom",
    england: "united kingdom",
    us: "united states",
    usa: "united states",
    "u s a": "united states",
  };
  return regions.find((region) => {
    const value = normalize(region);
    const canonical = countryAliases[value] || value;
    return canonical === country ||
      canonical === countryCode ||
      (countryAliases[country] || country) === canonical ||
      continents.includes(canonical) ||
      (canonical === "remote" && continents.includes("remote distributed"));
  }) || "";
}

/** @param {string} preference @param {string} workModel @returns {boolean} */
function workModelMatches(preference, workModel) {
  /** @type {Record<string, string>} */
  const aliases = {
    onsite: "on site",
    "on site": "on site",
    "office based": "on site",
    "in office": "on site",
    distributed: "remote",
    "fully remote": "remote",
  };
  const preferred = aliases[normalize(preference)] || normalize(preference);
  const actual = aliases[normalize(workModel).replace(/_/g, " ")] ||
    normalize(workModel).replace(/_/g, " ");
  return preferred === actual;
}

/** @param {string} preference @param {string[]} companyTypes @param {string} industryScale @returns {boolean} */
function typeMatches(preference, companyTypes, industryScale) {
  const preferred = normalize(preference);
  const aliases = preferred === "indie" ? ["independent", "indie"] : [preferred];
  const actual = [...companyTypes, industryScale].filter(Boolean).map(normalize);
  return aliases.some((alias) => actual.some((value) => value === alias || value.includes(alias) || alias.includes(value)));
}

/**
 * @param {CandidateProfile} profile
 * @param {MatchStudio} studio
 * @returns {PriorityAssessment}
 */
function assessPriority(profile, studio) {
  const preferences = profile.preferences;
  const reasons = [];
  let score = 0;
  let evaluated = 0;
  const preferredRegion = regionMatches(preferences.preferredRegions, studio);
  const acceptableRegion = regionMatches(preferences.acceptableRegions, studio);
  const lowPriorityRegion = regionMatches(preferences.lowPriorityRegions, studio);

  if (preferredRegion) {
    score += 2;
    evaluated += 1;
    reasons.push("Location matches your preferred region: " + preferredRegion + ".");
  } else if (acceptableRegion) {
    score += 1;
    evaluated += 1;
    reasons.push("Location matches an acceptable region: " + acceptableRegion + ".");
  } else if (lowPriorityRegion) {
    score -= 2;
    evaluated += 1;
    reasons.push("Location is in a region you marked lower priority: " + lowPriorityRegion + ".");
  } else if (
    preferences.preferredRegions.length ||
    preferences.acceptableRegions.length ||
    preferences.lowPriorityRegions.length
  ) {
    reasons.push("No location priority tier is assigned to this studio's recorded country; it remains in the directory.");
  }

  const workModel = studio.applicationResearch?.workModel || "not_stated";
  if (preferences.workModels.length && workModel !== "not_stated") {
    evaluated += 1;
    if (preferences.workModels.some((item) => workModelMatches(item, workModel))) {
      score += 1;
      reasons.push("Published work model matches one of your preferences.");
    } else {
      score -= 1;
      reasons.push("Published work model differs from your selected preferences.");
    }
  } else if (workModel === "not_stated" && preferences.workModels.length) {
    reasons.push("The employer has not stated a work model, so no preference penalty is applied.");
  }

  const companyTypes = studio.profile?.companyType || [];
  if (preferences.studioTypes.length && companyTypes.length) {
    evaluated += 1;
    if (preferences.studioTypes.some((item) =>
      typeMatches(item, companyTypes, studio.profile?.industryScale || ""),
    )) {
      score += 1;
      reasons.push("Studio type matches one of your preferences.");
    } else {
      score -= 1;
      reasons.push("The recorded studio type does not match your selected categories.");
    }
  }

  if (evaluated === 0) {
    reasons.push("No matching region, work-model or studio-type preference is recorded; priority is neutral.");
  }

  /** @type {PriorityLevel} */
  const level = score >= 2 ? "high" : score === 1 ? "preferred" : score <= -1 ? "low" : "neutral";
  const labels = {
    high: "High personal priority",
    preferred: "Preferred",
    neutral: "Neutral",
    low: "Lower priority",
  };
  return { level, label: labels[level], score, reasons };
}

/**
 * Compute a qualitative, explainable match for one public studio record.
 * All inputs are passed in from browser-loaded data; nothing is persisted or transmitted.
 *
 * @param {CandidateProfile} profile
 * @param {MatchStudio} studio
 * @param {Date} [now]
 * @returns {StudioMatchAssessment}
 */
export function assessStudioMatch(profile, studio, now = new Date()) {
  const relevance = assessRelevance(profile, studio);
  const readiness = assessRouteReadiness(studio, now);
  const priority = assessPriority(profile, studio);
  const route = studio.applicationResearch || {};
  const profileData = studio.profile || {};
  return {
    id: studioId(studio.name),
    name: studio.name,
    country: studio.country || "Not stated",
    countryCode: studio.countryCode,
    websiteUrl: studio.websiteUrl || "",
    applicationUrl: studio.applicationUrl || "",
    evidenceUrl: studio.evidenceUrl || "",
    checkedAt: studio.checkedAt || "",
    notes: studio.notes,
    nextReviewAt: route.nextReviewAt || undefined,
    routeType: route.routeType || "general",
    workModel: route.workModel || "not_stated",
    submissionMethods: route.submissionMethods || [],
    eligibleLocations: route.eligibleLocations || [],
    disciplineScope: route.disciplineScope || [],
    studioTypes: profileData.companyType || [],
    focus: profileData.focus || [],
    relevance: relevance.level,
    relevanceLabel: {
      strong: "Strong match",
      potential: "Potential match",
      weak: "Weak match",
      not_assessed: "Needs profile details",
    }[relevance.level],
    relevanceReasons: relevance.reasons,
    evidence: relevance.evidence,
    gaps: relevance.gaps,
    limitedRoleInformation: relevance.limitedRoleInformation,
    routeReadiness: readiness.level,
    routeReadinessLabel: {
      active: "Active route on record",
      needs_verification: "Needs route verification",
      unavailable: "Not currently active",
    }[readiness.level],
    routeReasons: readiness.reasons,
    priority,
  };
}

/**
 * @param {StudioMatchAssessment[]} assessments
 * @param {"relevance" | "priority" | "name"} sortBy
 */
export function sortStudioMatches(assessments, sortBy = "relevance") {
  const relevanceOrder = { strong: 0, potential: 1, weak: 2, not_assessed: 3 };
  const priorityOrder = { high: 0, preferred: 1, neutral: 2, low: 3 };
  return [...assessments].sort((left, right) => {
    if (sortBy === "name") return left.name.localeCompare(right.name);
    if (sortBy === "priority") {
      return priorityOrder[left.priority.level] - priorityOrder[right.priority.level] ||
        relevanceOrder[left.relevance] - relevanceOrder[right.relevance] ||
        left.name.localeCompare(right.name);
    }
    return relevanceOrder[left.relevance] - relevanceOrder[right.relevance] ||
      priorityOrder[left.priority.level] - priorityOrder[right.priority.level] ||
      left.name.localeCompare(right.name);
  });
}
