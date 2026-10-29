import assert from "node:assert/strict";
import test from "node:test";
import {
  APPLICATION_STATUSES,
  createEmptyWorkspace,
  validateWorkspaceData,
  WORKSPACE_SCHEMA_VERSION,
} from "../src/lib/private-data/schema.mjs";
import { buildOutreachDraft, checkOutreachDraft } from "../src/lib/outreach/draft-checks.mjs";

const NOW = "2026-10-29T12:00:00.000Z";

function withProfile() {
  const workspace = createEmptyWorkspace(NOW);
  workspace.profile = {
    ...workspace.profile,
    displayName: "Synthetic Candidate",
    headline: "Technical support engineer",
    professionalSummary: "I support internal tools and investigate production incidents.",
    skills: ["Python", "REST APIs"],
    targetRoles: ["Developer Support Specialist"],
    updatedAt: NOW,
  };
  return workspace;
}

function draft(overrides = {}) {
  return {
    id: "draft-2",
    seriesId: "series-1",
    versionNumber: 2,
    previousVersionId: "draft-1",
    title: "CD PROJEKT RED — Developer Support",
    body: "Hello CD PROJEKT RED team",
    updatedAt: NOW,
    studioId: "cd-projekt-red",
    studioName: "CD PROJEKT RED",
    roleTitle: "Developer Support Specialist",
    opportunityId: "",
    sourceUrl: "",
    purpose: "role-application",
    profileUpdatedAt: NOW,
    resumeLabel: "Support CV · 2026-10",
    guidanceVersion: "1.0 draft · reviewed 2026-10-24",
    reviewStatus: "draft",
    ...overrides,
  };
}

function activity(overrides = {}) {
  return {
    id: "activity-1",
    type: "note",
    occurredAt: NOW,
    note: "Synthetic note only.",
    ...overrides,
  };
}

test("workspace v1 migration preserves legacy profile, drafts, resumes, and applications", () => {
  const v1 = {
    ...withProfile(),
    schemaVersion: 1,
    resumes: [{ id: "resume-1", label: "Old CV label", kind: "docx", processedAt: NOW }],
    drafts: [{ id: "legacy-draft", title: "Old draft", body: "Synthetic old body", updatedAt: NOW }],
    applications: [
      {
        id: "legacy-application",
        studioName: "Synthetic Studio",
        roleTitle: "Support Engineer",
        status: "interested",
        applicationUrl: "https://example.com/careers",
        notes: "Legacy notes",
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
  };
  delete v1.routeMarkers;
  const migrated = validateWorkspaceData(v1);
  assert.equal(migrated.schemaVersion, WORKSPACE_SCHEMA_VERSION);
  assert.equal(migrated.profile.displayName, "Synthetic Candidate");
  assert.equal(migrated.resumes[0].label, "Old CV label");
  assert.equal(migrated.drafts[0].id, "legacy-draft");
  assert.equal(migrated.drafts[0].body, "Synthetic old body");
  assert.equal(migrated.drafts[0].seriesId, "legacy-draft");
  assert.equal(migrated.drafts[0].versionNumber, 1);
  assert.equal(migrated.drafts[0].guidanceVersion, "legacy-v1");
  assert.equal(migrated.applications[0].notes, "Legacy notes");
  assert.deepEqual(migrated.applications[0].history, []);
});

test("workspace v2 validates draft lineage and application activity links", () => {
  const workspace = withProfile();
  workspace.drafts = [draft({ id: "draft-1", versionNumber: 1, previousVersionId: null }), draft()];
  workspace.applications = [
    {
      id: "application-1",
      studioName: "CD PROJEKT RED",
      roleTitle: "Developer Support Specialist",
      status: "interview",
      applicationUrl: "https://example.com/careers",
      notes: "",
      createdAt: NOW,
      updatedAt: NOW,
      studioId: "cd-projekt-red",
      opportunityId: "",
      outreachDraftId: "draft-2",
      nextFollowUpAt: "2026-11-02",
      history: [activity({ type: "interview", note: "Synthetic interview update." })],
    },
  ];
  const validated = validateWorkspaceData(workspace);
  assert.equal(validated.drafts.length, 2);
  assert.equal(validated.applications[0].outreachDraftId, "draft-2");
  assert.equal(validated.applications[0].history[0].type, "interview");
  assert.equal(validated.applications[0].nextFollowUpAt, "2026-11-02");
});

test("workspace rejects invalid lineage, unknown fields, bad status and malformed activity", () => {
  const workspace = withProfile();
  workspace.drafts = [draft({ previousVersionId: null })];
  assert.throws(
    () => validateWorkspaceData({ ...workspace, drafts: [{ ...workspace.drafts[0], unapproved: true }] }),
    /unsupported field/i,
  );
  assert.throws(
    () => validateWorkspaceData({ ...workspace, drafts: [draft({ previousVersionId: "missing" })] }),
    /previous version/i,
  );
  assert.throws(
    () =>
      validateWorkspaceData({
        ...workspace,
        applications: [
          {
            id: "app-1",
            studioName: "Studio",
            roleTitle: "Role",
            status: "sent",
            applicationUrl: "",
            notes: "",
            createdAt: NOW,
            updatedAt: NOW,
            studioId: "",
            opportunityId: "",
            outreachDraftId: "",
            nextFollowUpAt: null,
            history: [],
          },
        ],
      }),
    /unsupported/i,
  );
  assert.throws(
    () =>
      validateWorkspaceData({
        ...workspace,
        applications: [
          {
            id: "app-1",
            studioName: "Studio",
            roleTitle: "Role",
            status: "interested",
            applicationUrl: "",
            notes: "",
            createdAt: NOW,
            updatedAt: NOW,
            studioId: "",
            opportunityId: "",
            outreachDraftId: "",
            nextFollowUpAt: "2026-02-30",
            history: [],
          },
        ],
      }),
    /calendar date/i,
  );
  assert.throws(
    () =>
      validateWorkspaceData({
        ...workspace,
        applications: [
          {
            id: "app-1",
            studioName: "Studio",
            roleTitle: "Role",
            status: "interested",
            applicationUrl: "",
            notes: "",
            createdAt: NOW,
            updatedAt: NOW,
            studioId: "",
            opportunityId: "",
            outreachDraftId: "",
            nextFollowUpAt: null,
            history: [activity({ type: "imagined" })],
          },
        ],
      }),
    /activity type/i,
  );
  assert.ok(APPLICATION_STATUSES.includes("applied"));
});

test("deterministic outreach template uses only explicit profile facts and user motivation", () => {
  const workspace = withProfile();
  const body = buildOutreachDraft({
    profile: workspace.profile,
    studioName: "CD PROJEKT RED",
    roleTitle: "Developer Support Specialist",
    purpose: "role-application",
    motivation: "I admire the team's mix of game development and technical problem solving.",
  });
  assert.match(body, /Synthetic Candidate/);
  assert.match(body, /Technical support engineer/);
  assert.match(body, /internal tools and investigate production incidents/);
  assert.match(body, /Developer Support Specialist/);
  assert.match(body, /I admire the team's mix/);
  assert.doesNotMatch(body, /shipped Cyberpunk|led a team|ten years/i);
});

test("draft review returns actionable heuristic checks without claiming fact verification", () => {
  const workspace = withProfile();
  const body =
    "Hello CD PROJEKT RED team. I'm a Technical support engineer. I support internal tools and investigate production incidents. What draws me to your team is: I admire your game development and technical problem solving. I'd welcome a conversation about the Developer Support Specialist opportunity.";
  const review = checkOutreachDraft({
    body,
    studioName: "CD PROJEKT RED",
    roleTitle: "Developer Support Specialist",
    motivation: "I admire your game development and technical problem solving.",
    profile: workspace.profile,
  });
  assert.equal(review.checks.find((item) => item.id === "personalization")?.status, "pass");
  assert.equal(review.checks.find((item) => item.id === "role-relevance")?.status, "pass");
  assert.equal(review.checks.find((item) => item.id === "factual-grounding")?.status, "review");
  assert.match(review.checks.find((item) => item.id === "factual-grounding")?.message ?? "", /not fact-checking/i);
  assert.equal(review.checks.find((item) => item.id === "human-control")?.status, "review");
});

test("draft review flags generic language, contact details and unpersonalized drafts", () => {
  const review = checkOutreachDraft({
    body: "Dear Hiring Manager! I am passionate about gaming! I am excited about this opportunity! Email candidate@example.com",
    studioName: "Synthetic Studio",
    roleTitle: "Support Engineer",
    motivation: "",
    profile: null,
  });
  assert.equal(review.checks.find((item) => item.id === "personalization")?.status, "warning");
  assert.equal(review.checks.find((item) => item.id === "generic-language")?.status, "warning");
  assert.equal(review.checks.find((item) => item.id === "privacy")?.status, "review");
  assert.ok(review.genericPhrases.length >= 2);
});
