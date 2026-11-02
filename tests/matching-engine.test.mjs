import test from "node:test";
import assert from "node:assert/strict";
import {
  assessStudioMatch,
  resolveStudioLocation,
  sortStudioMatches,
} from "../src/matching/matching-engine.mjs";

function emptyProfile() {
  return {
    schemaVersion: 1,
    updatedAt: "2026-11-01T12:00:00.000Z",
    personal: {
      fullName: "", email: "", phone: "", currentLocation: "",
      linkedinUrl: "", portfolioUrl: "", otherLink: "",
    },
    professionalSummary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    materials: {
      masterResume: null,
      resumeText: "",
      motivationLetter: "",
      motivationDocument: null,
    },
    preferences: {
      roleFamilies: [], studioTypes: [], workModels: [],
      preferredRegions: [], acceptableRegions: [], lowPriorityRegions: [],
      additionalConsiderations: "",
    },
  };
}

function studio(overrides = {}) {
  return {
    name: "Example Games",
    country: "Poland",
    countryCode: "PL",
    websiteUrl: "https://example.test/",
    applicationUrl: "https://example.test/careers/",
    evidenceUrl: "https://example.test/careers/",
    checkedAt: "2026-10-30",
    notes: "The employer accepts open applications.",
    continents: ["Europe"],
    profile: {
      description: "Independent game developer.",
      companyType: ["Developer", "Independent"],
      industryScale: "Indie",
      focus: ["PC", "Action"],
    },
    applicationResearch: {
      routeType: "open",
      submissionMethods: ["email"],
      workModel: "not_stated",
      eligibleLocations: [],
      disciplineScope: [],
      routeStatus: "active",
      nextReviewAt: "2027-01-28",
    },
    ...overrides,
  };
}

test("general open routes remain potential when the employer does not specify a discipline", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support", "DevOps"];
  profile.skills = [
    {
      id: "1", name: "REST APIs", category: "Technical", evidence: "demonstrated",
      evidenceDetails: "Investigated production API issues.", evidenceSource: "Work",
    },
  ];

  const result = assessStudioMatch(profile, studio(), new Date("2026-11-01T12:00:00Z"));
  assert.equal(result.relevance, "potential");
  assert.equal(result.limitedRoleInformation, true);
  assert.match(result.relevanceReasons.join(" "), /does not list a specific discipline/);
  assert.equal(result.routeReadiness, "active");
});

test("demonstrated skill evidence can support a stated discipline", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Software engineer"];
  profile.skills = [
    {
      id: "1", name: "Python", category: "Programming", evidence: "demonstrated",
      evidenceDetails: "Used for development automation.", evidenceSource: "Project",
    },
  ];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      routeType: "discipline_specific",
      submissionMethods: ["ats"],
      workModel: "hybrid",
      eligibleLocations: [],
      disciplineScope: ["Programming"],
      routeStatus: "active",
      nextReviewAt: "2027-01-28",
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(result.relevance, "strong");
  assert.equal(result.evidence[0].name, "Python");
  assert.equal(result.evidence[0].relationship, "discipline");
});

test("unrelated explicit disciplines are weak, not automatically not applicable", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [
    {
      id: "1", name: "REST APIs", category: "Technical", evidence: "demonstrated",
      evidenceDetails: "", evidenceSource: "Work",
    },
  ];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      routeType: "discipline_specific",
      submissionMethods: ["email"],
      workModel: "not_stated",
      eligibleLocations: [],
      disciplineScope: ["Concept art", "Animation"],
      routeStatus: "active",
      nextReviewAt: "2027-01-28",
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(result.relevance, "weak");
  assert.notEqual(result.relevance, "not_assessed");
});

test("confirmed route conditions and review dates are shown separately from professional relevance", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];

  const fresh = assessStudioMatch(profile, studio(), new Date("2026-11-01T12:00:00Z"));
  const overdue = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      nextReviewAt: "2026-10-01",
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(fresh.routeReadiness, "active");
  assert.equal(overdue.routeReadiness, "needs_verification");
  assert.equal(fresh.relevance, overdue.relevance);
});

test("no role or evidence profile data is reported as not assessed rather than a weak match", () => {
  const result = assessStudioMatch(
    emptyProfile(),
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(result.relevance, "not_assessed");
  assert.match(result.relevanceReasons.join(" "), /Add at least one target role/);
});

test("geographic, studio-type and work-model preferences affect priority only", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [
    {
      id: "1", name: "REST APIs", category: "Technical", evidence: "demonstrated",
      evidenceDetails: "", evidenceSource: "Work",
    },
  ];
  profile.preferences.preferredRegions = ["Europe"];
  profile.preferences.studioTypes = ["Independent"];
  profile.preferences.workModels = ["Remote"];

  const preferred = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      workModel: "hybrid",
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  const outsideRegion = assessStudioMatch(
    profile,
    studio({
      country: "Japan",
      countryCode: "JP",
      continents: ["Asia"],
      profile: { description: "Developer", companyType: ["Developer", "Independent"], industryScale: "Indie" },
      applicationResearch: {
        ...studio().applicationResearch,
        workModel: "hybrid",
      },
    }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(preferred.priority.level, "high");
  assert.equal(outsideRegion.priority.level, "neutral");
  assert.equal(preferred.relevance, outsideRegion.relevance);
});

test("user-confirmed gaps are not treated as supporting evidence", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Software engineer"];
  profile.skills = [
    {
      id: "1", name: "Python", category: "Programming", evidence: "user_confirmed_gap",
      evidenceDetails: "", evidenceSource: "",
    },
  ];
  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(result.relevance, "potential");
  assert.equal(result.evidence.length, 0);
  assert.ok(result.gaps.includes("User-confirmed gap: Python"));
});

test("sorting can prioritize professional relevance or personal priority without merging labels", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Software engineer"];
  profile.skills = [{
    id: "1", name: "Python", category: "Programming", evidence: "demonstrated",
    evidenceDetails: "", evidenceSource: "",
  }];
  const strong = assessStudioMatch(profile, studio({
    name: "Alpha Studio",
    applicationResearch: { ...studio().applicationResearch, disciplineScope: ["Programming"] },
  }), new Date("2026-11-01T12:00:00Z"));
  const potential = assessStudioMatch(profile, studio({
    name: "Beta Studio",
    applicationResearch: { ...studio().applicationResearch, disciplineScope: [] },
  }), new Date("2026-11-01T12:00:00Z"));
  assert.deepEqual(sortStudioMatches([potential, strong], "relevance").map((item) => item.name), [
    "Alpha Studio", "Beta Studio",
  ]);
  assert.equal(strong.priority.level, potential.priority.level);
});


test("support and DevOps targets treat programming as adjacent rather than a direct role match", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [{
    id: "1", name: "Python", category: "Programming", evidence: "demonstrated",
    evidenceDetails: "Used for small automation scripts.", evidenceSource: "Project",
  }];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(result.relevance, "potential");
  assert.match(result.relevanceReasons.join(" "), /adjacent relevance/);
});

test("a demonstrated skill in an unrelated discipline cannot create a strong match", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [{
    id: "1", name: "Houdini", category: "VFX", evidence: "demonstrated",
    evidenceDetails: "Created a procedural visual effect.", evidenceSource: "Project",
  }];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming", "Visual Effects"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.notEqual(result.relevance, "strong");
  assert.equal(result.relevance, "potential");
});

test("direct role alignment and demonstrated evidence in the same discipline can be strong", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [{
    id: "1", name: "REST APIs", category: "Technical", evidence: "demonstrated",
    evidenceDetails: "Troubleshot production API integrations.", evidenceSource: "Work",
  }];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Developer Support"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(result.relevance, "strong");
});

test("word-boundary matching does not treat Google Workspace as Go programming or Cartography as art", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Software engineer"];
  profile.skills = [{
    id: "1", name: "Google Workspace", category: "Productivity", evidence: "demonstrated",
    evidenceDetails: "Used for collaboration.", evidenceSource: "Work",
  }];

  const programming = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.notEqual(programming.relevance, "strong");
  assert.equal(programming.evidence.length, 0);

  profile.skills = [{
    id: "go", name: "Go", category: "Programming", evidence: "demonstrated",
    evidenceDetails: "Used for software development.", evidenceSource: "Work",
  }];
  const goLanguage = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Programming"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(goLanguage.relevance, "strong", "The standalone Go language skill should still map to Programming.");

  profile.preferences.roleFamilies = ["Game VFX"];
  profile.skills = [{
    id: "2", name: "Cartography", category: "Other", evidence: "demonstrated",
    evidenceDetails: "Created maps.", evidenceSource: "Project",
  }];
  const visualEffects = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Art"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(visualEffects.evidence.length, 0);
});

test("discipline category fallbacks use phrase boundaries in both directions", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Game VFX"];
  profile.skills = [{
    id: "1", name: "Environment Art", category: "Art", evidence: "demonstrated",
    evidenceDetails: "Created environment assets.", evidenceSource: "Project",
  }];

  const cartography = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Cartography"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(cartography.relevance, "weak");
  assert.equal(cartography.evidence.length, 0);

  profile.preferences.roleFamilies = ["Developer support"];
  profile.skills = [{
    id: "2", name: "REST APIs", category: "Technical", evidence: "demonstrated",
    evidenceDetails: "Investigated API issues.", evidenceSource: "Work",
  }];
  const rapidDevelopment = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Rapid development"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );
  assert.equal(rapidDevelopment.relevance, "weak");
  assert.equal(
    rapidDevelopment.evidence.some((item) => item.relationship === "discipline"),
    false,
    "REST API skills may remain supporting context, but must not count as evidence for Rapid development.",
  );
});

test("audit support is not misclassified as IT support", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Audit support"];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Developer Support"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(result.relevance, "weak");
});

test("work experience responsibilities can support a relevant discipline assessment", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Developer support"];
  profile.experience = [{
    id: "1", employer: "Example employer", title: "Product Support Engineer",
    location: "", startDate: "", endDate: "",
    responsibilities: "Troubleshot REST API integrations and production application issues.",
    achievements: "",
  }];

  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      disciplineScope: ["Technical Support"],
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(result.relevance, "potential");
  assert.ok(result.evidence.some((item) => item.name === "Product Support Engineer"));
});

test("headquarters country cannot override the directory country used for studio prioritisation", () => {
  assert.deepEqual(
    resolveStudioLocation("Mauritius", "France", "FR"),
    { country: "Mauritius", countryCode: undefined },
  );
  assert.deepEqual(
    resolveStudioLocation("France", "France", "FR"),
    { country: "France", countryCode: "FR" },
  );
  assert.deepEqual(
    resolveStudioLocation("Not stated", "United States", "US"),
    { country: "Not stated", countryCode: undefined },
  );
});

test("campaign priority ranks preferred geography before a higher composite score in an acceptable region", () => {
  const profile = emptyProfile();
  profile.preferences.roleFamilies = ["Software engineer"];
  profile.preferences.preferredRegions = ["Europe"];
  profile.preferences.acceptableRegions = ["Canada"];
  profile.preferences.workModels = ["Remote"];
  profile.preferences.studioTypes = ["Indie"];
  profile.skills = [{
    id: "1", name: "Python", category: "Programming", evidence: "demonstrated",
    evidenceDetails: "Used for development automation.", evidenceSource: "Project",
  }];

  const european = assessStudioMatch(
    profile,
    studio({
      name: "European studio",
      country: "Poland",
      countryCode: "PL",
      continents: ["Europe"],
      profile: { description: "Developer", companyType: ["Developer"], industryScale: "AAA" },
      applicationResearch: {
        ...studio().applicationResearch,
        workModel: "hybrid",
        disciplineScope: ["Programming"],
      },
    }),
    new Date("2026-11-01T12:00:00Z"),
  );
  const canadian = assessStudioMatch(
    profile,
    studio({
      name: "Canadian studio",
      country: "Canada",
      countryCode: "CA",
      continents: ["North America"],
      profile: { description: "Developer", companyType: ["Developer", "Independent"], industryScale: "Indie" },
      applicationResearch: {
        ...studio().applicationResearch,
        workModel: "remote",
        disciplineScope: ["Programming"],
      },
    }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(european.priority.regionTier, "preferred");
  assert.equal(canadian.priority.regionTier, "acceptable");
  assert.equal(european.priority.level, "neutral");
  assert.equal(canadian.priority.level, "high");
  assert.deepEqual(
    sortStudioMatches([canadian, european], "priority").map((item) => item.name),
    ["European studio", "Canadian studio"],
  );
});

test("mixed work arrangements do not receive a false personal-priority penalty", () => {
  const profile = emptyProfile();
  profile.preferences.workModels = ["Remote"];
  const result = assessStudioMatch(
    profile,
    studio({ applicationResearch: {
      ...studio().applicationResearch,
      workModel: "mixed",
    } }),
    new Date("2026-11-01T12:00:00Z"),
  );

  assert.equal(result.priority.level, "neutral");
  assert.equal(result.priority.score, 0);
  assert.match(result.priority.reasons.join(" "), /mixed or variable/);
});
