import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";
import { createServer } from "vite";
import { createEmptyWorkspace, validateWorkspaceData } from "../src/lib/private-data/schema.mjs";

const NOW = "2026-10-29T12:00:00.000Z";

function syntheticWorkspace() {
  const workspace = createEmptyWorkspace(NOW);
  workspace.profile = {
    ...workspace.profile,
    displayName: "Synthetic Candidate",
    headline: "Technical support engineer",
    professionalSummary: "Synthetic profile facts only.",
    targetRoles: ["Developer Support Specialist"],
    skills: ["Python", "REST APIs"],
    updatedAt: NOW,
  };
  workspace.drafts = [
    {
      id: "draft-ui-1",
      seriesId: "series-ui-1",
      versionNumber: 1,
      previousVersionId: null,
      title: "Synthetic Studio — Developer Support",
      body: "Synthetic message only.",
      updatedAt: NOW,
      studioId: "cd-projekt-red",
      studioName: "CD PROJEKT RED",
      roleTitle: "Developer Support Specialist",
      opportunityId: "",
      sourceUrl: "https://example.com/careers",
      purpose: "role-application",
      profileUpdatedAt: NOW,
      resumeLabel: "Synthetic CV label",
      guidanceVersion: "Synthetic guidance version",
      reviewStatus: "reviewed",
    },
  ];
  workspace.applications = [
    {
      id: "application-ui-1",
      studioName: "CD PROJEKT RED",
      roleTitle: "Developer Support Specialist",
      status: "interested",
      applicationUrl: "https://example.com/careers",
      notes: "Synthetic tracker note.",
      createdAt: NOW,
      updatedAt: NOW,
      studioId: "cd-projekt-red",
      opportunityId: "",
      outreachDraftId: "draft-ui-1",
      nextFollowUpAt: "2026-11-02",
      history: [
        {
          id: "activity-ui-1",
          type: "note",
          occurredAt: NOW,
          note: "Synthetic activity only.",
        },
      ],
    },
  ];
  return validateWorkspaceData(workspace);
}

test("OutreachWorkspace renders sourced context, editable drafting, reviews and private version history", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = await server.ssrLoadModule("/src/components/OutreachWorkspace.tsx");
    const markup = renderToStaticMarkup(
      React.createElement(module.default, {
        workspace: syntheticWorkspace(),
        onSaveWorkspace: async () => true,
      }),
    );
    assert.match(markup, /data-testid="outreach-workspace"/);
    assert.match(markup, /data-testid="outreach-draft-body"/);
    assert.match(markup, /data-testid="outreach-motivation"/);
    assert.match(markup, /Generate editable template/);
    assert.match(markup, /PRE-SEND REVIEW/);
    assert.match(markup, /PRIVATE VERSION HISTORY/);
    assert.match(markup, /Synthetic CV label/);
    assert.match(markup, /Choose a studio/);
    assert.match(markup, /does not send messages or contact any service/);
    assert.doesNotMatch(markup, /<script|onerror=/i);
  } finally {
    await server.close();
  }
});

test("ApplicationsWorkspace renders status confirmation controls, history, links and follow-up state", async () => {
  const server = await createServer({
    configFile: "vite.config.ts",
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "silent",
  });
  try {
    const module = await server.ssrLoadModule("/src/components/ApplicationsWorkspace.tsx");
    const markup = renderToStaticMarkup(
      React.createElement(module.default, {
        workspace: syntheticWorkspace(),
        onSaveWorkspace: async () => true,
      }),
    );
    assert.match(markup, /data-testid="applications-workspace"/);
    assert.match(markup, /data-testid="application-status"/);
    assert.match(markup, /data-testid="application-follow-up-date"/);
    assert.match(markup, /data-testid="application-activity-note"/);
    assert.match(markup, /Synthetic tracker note/);
    assert.match(markup, /Synthetic activity only/);
    assert.match(markup, /requires you to confirm a real submission/i);
    assert.match(markup, /No .*sent|never inferred|will not submit/i);
    assert.doesNotMatch(markup, /<script|onerror=/i);
  } finally {
    await server.close();
  }
});
