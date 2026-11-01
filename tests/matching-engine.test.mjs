import test from "node:test";
import assert from "node:assert/strict";
import {
  assessStudioMatch,
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
