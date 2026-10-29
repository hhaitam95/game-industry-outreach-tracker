import React, { useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import ApplicationsWorkspace from "../src/components/ApplicationsWorkspace.tsx";
import OpportunityRoleCard from "../src/components/OpportunityRoleCard.tsx";
import { createEmptyWorkspace, validateWorkspaceData } from "../src/lib/private-data/schema.mjs";
import { filterOpportunities } from "../src/lib/opportunities/filter.mjs";
import { OPPORTUNITY_SNAPSHOT } from "../src/lib/opportunities/snapshot.mjs";

const now = "2026-10-29T12:00:00.000Z";
const snapshot = OPPORTUNITY_SNAPSHOT;
if (!snapshot?.opportunities.length) throw new Error("role-handoff-test-snapshot-unavailable");

const preparedRole = filterOpportunities(snapshot.opportunities, { generatedAt: snapshot.generatedAt }).roles[0];
if (!preparedRole) throw new Error("role-handoff-test-role-unavailable");

// This deliberately fabricated role is served only by this test page.
const role = {
  ...preparedRole,
  id: "role-handoff-integration-test",
  title: "Test-only Developer Support Specialist",
  studioId: "cd-projekt-red",
  studioName: "CD PROJEKT RED",
  url: "https://careers.example.test/developer-support",
};
const profile = {
  headline: "Synthetic technical support engineer",
  professionalSummary: "Synthetic fixture profile; no personal data.",
  targetRoles: ["Developer Support Specialist"],
  skills: ["Python"],
};

window.__roleHandoffOutboundAttempts = [];
const nativeFetch = window.fetch.bind(window);
window.fetch = (...args) => {
  const request = args[0];
  const method = (args[1]?.method ?? request?.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) window.__roleHandoffOutboundAttempts.push("fetch");
  return nativeFetch(...args);
};
const nativeOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function (method, ...args) {
  this.__roleHandoffMethod = String(method).toUpperCase();
  return nativeOpen.call(this, method, ...args);
};
const nativeSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (...args) {
  if (this.__roleHandoffMethod && !["GET", "HEAD", "OPTIONS"].includes(this.__roleHandoffMethod)) {
    window.__roleHandoffOutboundAttempts.push("xhr");
  }
  return nativeSend.apply(this, args);
};
if (navigator.sendBeacon) {
  const nativeBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (...args) => {
    window.__roleHandoffOutboundAttempts.push("beacon");
    return nativeBeacon(...args);
  };
}

function RoleHandoffHarness() {
  const [workspace, setWorkspace] = useState(() => createEmptyWorkspace(now));
  const [pendingLead, setPendingLead] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

  const handleSaveWorkspace = useCallback(async (nextWorkspace) => {
    setWorkspace(validateWorkspaceData(nextWorkspace));
    setSaveCount((count) => count + 1);
    return true;
  }, []);
  const handleTrackAsLead = useCallback((lead) => {
    setPendingLead({ ...lead, requestId: "role-handoff-test-request" });
  }, []);
  const handleLeadPrefillConsumed = useCallback(() => setPendingLead(null), []);

  const applications = workspace.applications;
  const submittedEvents = applications
    .flatMap((application) => application.history)
    .filter((item) => item.type === "submitted");

  return React.createElement(
    "main",
    null,
    React.createElement("h1", null, "Role handoff test fixture"),
    React.createElement(
      "p",
      null,
      "Test-only fixture: the role title and URL are fabricated; no real posting is represented.",
    ),
    React.createElement("p", { "data-testid": "role-handoff-saved-count" }, String(applications.length)),
    React.createElement("p", { "data-testid": "role-handoff-save-count" }, String(saveCount)),
    React.createElement("p", { "data-testid": "role-handoff-saved-status" }, applications[0]?.status ?? "none"),
    React.createElement("p", { "data-testid": "role-handoff-submitted-event-count" }, String(submittedEvents.length)),
    React.createElement(OpportunityRoleCard, {
      role,
      synthetic: false,
      profile,
      onTrackAsLead: handleTrackAsLead,
      onOpenSettings: () => undefined,
    }),
    React.createElement(ApplicationsWorkspace, {
      workspace,
      onSaveWorkspace: handleSaveWorkspace,
      initialLead: pendingLead,
      onLeadPrefillConsumed: handleLeadPrefillConsumed,
    }),
  );
}

createRoot(document.getElementById("role-handoff-root")).render(React.createElement(RoleHandoffHarness));
