import { useMemo, useState } from "react";
import { IS_SYNTHETIC_SNAPSHOT, OPPORTUNITY_SNAPSHOT } from "../lib/opportunities/snapshot.mjs";
import { RESUME_GUIDANCE_VERSION } from "../lib/resume/guidance.mjs";
import { STUDIO_PROFILES } from "../lib/studios/catalog.mjs";
import { buildOutreachDraft, checkOutreachDraft } from "../lib/outreach/draft-checks.mjs";
import { validateWorkspaceData } from "../lib/private-data/schema.mjs";

type Workspace = ReturnType<typeof validateWorkspaceData>;
type DraftRecord = Workspace["drafts"][number];
type Purpose = "role-application" | "speculative-introduction" | "networking";
type ReviewStatus = "draft" | "reviewed" | "ready-for-user";

type Props = {
  workspace: Workspace;
  onSaveWorkspace: (next: Workspace, message: string) => Promise<boolean>;
};

const PURPOSE_LABELS: Record<Purpose, string> = {
  "role-application": "Advertised role",
  "speculative-introduction": "Speculative introduction",
  networking: "Professional networking",
};

function nowIso() {
  return new Date().toISOString();
}

function summarizePurpose(purpose: string) {
  return PURPOSE_LABELS[purpose as Purpose] ?? "Imported legacy draft";
}

export default function OutreachWorkspace({ workspace, onSaveWorkspace }: Props) {
  const [studioId, setStudioId] = useState("");
  const [opportunityId, setOpportunityId] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("speculative-introduction");
  const [motivation, setMotivation] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [resumeLabel, setResumeLabel] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingDraftId, setEditingDraftId] = useState("");
  const [notice, setNotice] = useState("");
  const [localError, setLocalError] = useState("");
  const studio = STUDIO_PROFILES.find((item) => item.id === studioId) ?? null;
  const careerRoute = studio?.routes.find((item) => item.status === "verified") ?? studio?.routes[0] ?? null;
  const availableOpportunities = !IS_SYNTHETIC_SNAPSHOT
    ? (OPPORTUNITY_SNAPSHOT?.opportunities ?? []).filter((item) =>
        STUDIO_PROFILES.some((catalogStudio) => catalogStudio.id === item.studioId),
      )
    : [];
  const activeSavedDraft = workspace.drafts.find((item) => item.id === editingDraftId) ?? null;

  const review = useMemo(() => {
    if (!body.trim() || !studio) return null;
    try {
      return checkOutreachDraft({
        body,
        studioName: studio.name,
        roleTitle,
        motivation,
        profile: workspace.profile,
      });
    } catch {
      return null;
    }
  }, [body, studio, roleTitle, motivation, workspace.profile]);

  function handleOpportunityChange(value: string) {
    setOpportunityId(value);
    const selected = availableOpportunities.find((item) => item.id === value);
    if (!selected) return;
    setStudioId(selected.studioId);
    setRoleTitle(selected.title);
    setSourceUrl(selected.url);
    setPurpose("role-application");
    setTitle(selected.studioName + " — " + selected.title);
  }

  function startNewDraft() {
    setEditingDraftId("");
    setTitle(studio ? studio.name + " — " + (roleTitle || "Outreach") : "");
    setBody("");
    setNotice("");
    setLocalError("");
  }

  function generateTemplate() {
    if (!studio) {
      setLocalError("Choose a studio from the sourced catalogue first.");
      return;
    }
    try {
      const generated = buildOutreachDraft({
        profile: workspace.profile,
        studioName: studio.name,
        roleTitle,
        purpose,
        motivation,
      });
      setBody(generated);
      setTitle(studio.name + " — " + (roleTitle || summarizePurpose(purpose)));
      setEditingDraftId("");
      setNotice(
        "Editable template created from the selected studio, your saved profile fields, and your stated motivation. Review every sentence.",
      );
      setLocalError("");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "The draft template could not be generated.");
      setNotice("");
    }
  }

  function loadDraft(draft: DraftRecord) {
    setEditingDraftId(draft.id);
    setTitle(draft.title);
    setBody(draft.body);
    setStudioId(draft.studioId);
    setRoleTitle(draft.roleTitle);
    setOpportunityId(draft.opportunityId);
    setPurpose(draft.purpose);
    setSourceUrl(draft.sourceUrl);
    setResumeLabel(draft.resumeLabel);
    setMotivation("");
    setNotice(
      "Loaded saved version " + draft.versionNumber + ". Saving will create a new revision and preserve this version.",
    );
    setLocalError("");
  }

  async function saveDraft(reviewStatus: ReviewStatus) {
    if (!studioId || !studio) {
      setLocalError("Choose a sourced studio before saving this draft.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      setLocalError("Add a draft title and message before saving.");
      return;
    }
    if (workspace.drafts.length >= 500) {
      setLocalError(
        "The private workspace has reached its 500-draft limit. Export a backup and review old records before continuing.",
      );
      return;
    }
    const previous = workspace.drafts.find((item) => item.id === editingDraftId) ?? null;
    const seriesId = previous?.seriesId ?? crypto.randomUUID();
    const nextVersion =
      Math.max(0, ...workspace.drafts.filter((item) => item.seriesId === seriesId).map((item) => item.versionNumber)) +
      1;
    const now = nowIso();
    const saved: DraftRecord = {
      id: crypto.randomUUID(),
      seriesId,
      versionNumber: nextVersion,
      previousVersionId: previous?.id ?? null,
      title: title.trim(),
      body,
      updatedAt: now,
      studioId: studio.id,
      studioName: studio.name,
      roleTitle: roleTitle.trim(),
      opportunityId,
      sourceUrl: sourceUrl.trim(),
      purpose,
      profileUpdatedAt: workspace.profile.updatedAt,
      resumeLabel: resumeLabel.trim(),
      guidanceVersion: RESUME_GUIDANCE_VERSION,
      reviewStatus,
    };
    const next = { ...workspace, drafts: [saved, ...workspace.drafts] };
    if (await onSaveWorkspace(next, "Draft version " + nextVersion + " encrypted and saved locally.")) {
      setEditingDraftId(saved.id);
      setNotice("Saved version " + nextVersion + ". Earlier versions remain available; nothing was sent.");
      setLocalError("");
    }
  }

  async function createApplicationFromDraft() {
    const saved = workspace.drafts.find((item) => item.id === editingDraftId);
    if (!saved || !saved.studioName.trim()) {
      setLocalError(
        "Save a draft for a named studio first. Legacy drafts without studio context cannot create a linked record yet.",
      );
      return;
    }
    if (workspace.applications.length >= 1_000) {
      setLocalError("The private workspace has reached its application-record limit.");
      return;
    }
    const now = nowIso();
    const app = {
      id: crypto.randomUUID(),
      studioName: saved.studioName,
      roleTitle: saved.roleTitle.trim() || "Speculative outreach",
      status: "interested",
      applicationUrl: saved.sourceUrl,
      notes: "",
      createdAt: now,
      updatedAt: now,
      studioId: saved.studioId,
      opportunityId: saved.opportunityId,
      outreachDraftId: saved.id,
      nextFollowUpAt: null,
      history: [
        {
          id: crypto.randomUUID(),
          type: "note",
          occurredAt: now,
          note:
            "Tracking record created from outreach draft version " +
            saved.versionNumber +
            ". No message was sent and no application was submitted.",
        },
      ],
    };
    if (
      await onSaveWorkspace(
        { ...workspace, applications: [app, ...workspace.applications] },
        "Lead saved locally as interested. It is not marked as submitted.",
      )
    ) {
      setNotice(
        "Created an interested lead linked to draft version " +
          saved.versionNumber +
          ". Confirm a real submission later in Applications.",
      );
      setLocalError("");
    }
  }

  async function copyDraft() {
    if (!body.trim()) return;
    try {
      await navigator.clipboard.writeText(body);
      setNotice("Draft copied to the clipboard. Nothing was sent by this app.");
      setLocalError("");
    } catch {
      setLocalError("Clipboard access was blocked. Select and copy the reviewed draft manually.");
    }
  }

  const recentDrafts = [...workspace.drafts]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 30);

  return (
    <div className="phase7-page page-stack" data-testid="outreach-workspace">
      <section className="phase7-intro">
        <span className="eyebrow">PHASE 7 · OUTREACH DRAFTING</span>
        <h2>Write a thoughtful introduction, not a mass message.</h2>
        <p>
          Drafts and revision history are saved only inside the encrypted local vault. Templates use the selected
          studio, your saved profile fields, and the motivation you provide. This page does not send messages or contact
          any service.
        </p>
        <div className="phase7-inline-facts">
          <span>{workspace.drafts.length} saved version(s)</span>
          <span>Guidance {RESUME_GUIDANCE_VERSION}</span>
          <span>
            {workspace.profile.updatedAt
              ? "Profile snapshot " + new Date(workspace.profile.updatedAt).toLocaleDateString()
              : "No saved profile snapshot"}
          </span>
        </div>
      </section>

      {!workspace.profile.headline.trim() &&
      !workspace.profile.professionalSummary.trim() &&
      workspace.profile.skills.length === 0 ? (
        <section className="phase7-message phase7-warning" role="note">
          Your saved profile has few approved facts. You can still draft, but add supported profile details in Settings
          before relying on factual-grounding checks.
        </section>
      ) : null}

      <section className="phase7-card">
        <div className="phase7-section-heading">
          <div>
            <span className="eyebrow">1 · CONTEXT</span>
            <h3>Choose who you are contacting</h3>
          </div>
          {studio ? <span className="phase7-pill">Sourced studio</span> : null}
        </div>
        <div className="phase7-form-grid">
          <label>
            Studio
            <select
              value={studioId}
              onChange={(event) => {
                setStudioId(event.target.value);
                setOpportunityId("");
                setSourceUrl("");
              }}
            >
              <option value="">Choose a studio…</option>
              {STUDIO_PROFILES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Purpose
            <select value={purpose} onChange={(event) => setPurpose(event.target.value as Purpose)}>
              {(Object.keys(PURPOSE_LABELS) as Purpose[]).map((key) => (
                <option key={key} value={key}>
                  {PURPOSE_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Role title (optional for speculative outreach)
            <input
              maxLength={180}
              value={roleTitle}
              onChange={(event) => {
                setRoleTitle(event.target.value);
                setOpportunityId("");
              }}
              placeholder="e.g. Developer Support Specialist"
            />
          </label>
          <label>
            Official role/application URL (optional)
            <input
              type="url"
              maxLength={2000}
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://…"
            />
          </label>
          <label className="phase7-full-width">
            Specific reason for contacting this team
            <textarea
              maxLength={2000}
              rows={3}
              required
              value={motivation}
              data-testid="outreach-motivation"
              onChange={(event) => setMotivation(event.target.value)}
              placeholder="Mention a project, team focus, technical problem, or other genuine reason you can explain."
            />
          </label>
          <label className="phase7-full-width">
            Resume label (optional metadata only)
            <input
              maxLength={120}
              value={resumeLabel}
              onChange={(event) => setResumeLabel(event.target.value)}
              list="phase7-resume-labels"
              placeholder="e.g. Developer Support CV — Oct 2026"
            />
            <datalist id="phase7-resume-labels">
              {workspace.resumes.map((resume) => (
                <option key={resume.id} value={resume.label} />
              ))}
            </datalist>
            <small>No resume file or extracted text is stored with the draft.</small>
          </label>
        </div>

        {studio ? (
          <div className="phase7-source-card">
            <strong>{studio.name}</strong>
            <p>{studio.summary}</p>
            {careerRoute ? (
              <p>
                Official career route:{" "}
                <a href={careerRoute.url} target="_blank" rel="noreferrer">
                  {careerRoute.label}
                </a>
                <span className="phase7-source-state">
                  {" "}
                  · {careerRoute.status === "verified" ? "Verified route" : "Needs review"}
                </span>
              </p>
            ) : (
              <p>No sourced career route is listed; verify the appropriate channel manually.</p>
            )}
          </div>
        ) : null}

        {availableOpportunities.length ? (
          <label className="phase7-full-width">
            Optional observed role from the public snapshot
            <select value={opportunityId} onChange={(event) => handleOpportunityChange(event.target.value)}>
              <option value="">Keep manually entered role</option>
              {availableOpportunities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.studioName} — {item.title} ({item.status})
                </option>
              ))}
            </select>
            <small>Snapshot status and source freshness are evidence, not a guarantee that a role is still open.</small>
          </label>
        ) : (
          <p className="phase7-message" role="note">
            {IS_SYNTHETIC_SNAPSHOT
              ? "The bundled opportunity list is synthetic sample data, not a real scan. It is deliberately excluded from role suggestions; enter a role manually or use the official career link above."
              : "No role snapshot is available. Enter a role manually and verify it on the linked official site."}
          </p>
        )}
      </section>

      <section className="phase7-card">
        <div className="phase7-section-heading">
          <div>
            <span className="eyebrow">2 · DRAFT</span>
            <h3>Edit every sentence before saving or copying</h3>
          </div>
          {editingDraftId ? (
            <span className="phase7-pill">Editing a saved revision</span>
          ) : (
            <span className="phase7-pill">New draft</span>
          )}
        </div>
        <div className="phase7-form-grid">
          <label className="phase7-full-width">
            Draft title
            <input
              maxLength={180}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Studio — role or purpose"
            />
          </label>
          <label className="phase7-full-width">
            Message body
            <textarea
              data-testid="outreach-draft-body"
              maxLength={20_000}
              rows={12}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Generate an editable template or write your own message."
            />
          </label>
        </div>
        <div className="phase7-actions">
          <button
            className="button button-secondary"
            type="button"
            data-testid="outreach-generate-template"
            onClick={generateTemplate}
            disabled={!studioId}
          >
            Generate editable template
          </button>
          <button className="button button-secondary" type="button" onClick={startNewDraft}>
            Start new draft
          </button>
          <button
            className="button button-primary"
            type="button"
            data-testid="outreach-save-draft"
            onClick={() => void saveDraft("draft")}
            disabled={!title.trim() || !body.trim() || !studioId}
          >
            Save draft version
          </button>
          <button
            className="button button-primary"
            type="button"
            data-testid="outreach-save-reviewed"
            onClick={() => void saveDraft("reviewed")}
            disabled={!title.trim() || !body.trim() || !studioId}
          >
            Mark reviewed & save version
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={() => void copyDraft()}
            disabled={!body.trim()}
          >
            Copy reviewed text
          </button>
        </div>
        {editingDraftId ? (
          <div className="phase7-actions">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => void createApplicationFromDraft()}
              disabled={!activeSavedDraft?.studioName.trim()}
            >
              Create interested lead from saved version
            </button>
            <span className="phase7-hint">
              Creates a tracker record only. It does not send this message or mark anything as submitted.
            </span>
          </div>
        ) : null}
        {localError ? (
          <p className="phase7-message phase7-error" role="alert">
            {localError}
          </p>
        ) : null}
        {notice ? (
          <p className="phase7-message phase7-success" role="status">
            {notice}
          </p>
        ) : null}
      </section>

      <section className="phase7-card">
        <div className="phase7-section-heading">
          <div>
            <span className="eyebrow">3 · PRE-SEND REVIEW</span>
            <h3>Checks to support your judgment</h3>
          </div>
          <span className="phase7-pill">Heuristic only</span>
        </div>
        {review ? (
          <>
            <ul className="phase7-check-list">
              {review.checks.map((item) => (
                <li key={item.id} className={"phase7-check phase7-check-" + item.status}>
                  <span className="phase7-check-state">
                    {item.status === "pass" ? "Check" : item.status === "warning" ? "Review" : "Human review"}
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.message}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="phase7-message" role="note">
              These checks cannot verify facts or replace reading the draft yourself. Nothing can be sent from this
              screen.
            </p>
          </>
        ) : (
          <p className="phase7-empty">Choose a studio and write or generate a draft to see review checks.</p>
        )}
      </section>

      <section className="phase7-card">
        <div className="phase7-section-heading">
          <div>
            <span className="eyebrow">4 · PRIVATE VERSION HISTORY</span>
            <h3>Saved draft versions</h3>
          </div>
          <span className="record-count">{workspace.drafts.length} total</span>
        </div>
        {recentDrafts.length ? (
          <div className="phase7-saved-list">
            {recentDrafts.map((draft) => (
              <article className="phase7-saved-row" key={draft.id} data-testid="outreach-draft-row">
                <div>
                  <strong>{draft.title}</strong>
                  <p>
                    {draft.studioName || "Studio not recorded"}
                    {draft.roleTitle ? " · " + draft.roleTitle : ""}
                  </p>
                  <p>
                    Version {draft.versionNumber} · {draft.reviewStatus} · {new Date(draft.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    Profile snapshot:{" "}
                    {draft.profileUpdatedAt ? new Date(draft.profileUpdatedAt).toLocaleDateString() : "legacy/unknown"}{" "}
                    · Resume label: {draft.resumeLabel || "not recorded"} · Guidance: {draft.guidanceVersion}
                  </p>
                  {draft.sourceUrl ? (
                    <p>
                      <a href={draft.sourceUrl} target="_blank" rel="noreferrer">
                        Open saved role/application source
                      </a>
                    </p>
                  ) : null}
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  data-testid="outreach-load-draft"
                  onClick={() => loadDraft(draft)}
                >
                  Load revision
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="phase7-empty">No outreach drafts have been saved in this vault yet.</p>
        )}
      </section>
    </div>
  );
}
