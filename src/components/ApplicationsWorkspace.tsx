import { useState, type FormEvent } from "react";
import { APPLICATION_STATUSES } from "../lib/private-data/schema.mjs";
import { STUDIO_PROFILES } from "../lib/studios/catalog.mjs";
import { validateWorkspaceData } from "../lib/private-data/schema.mjs";

type Workspace = ReturnType<typeof validateWorkspaceData>;
type ApplicationRecord = Workspace["applications"][number];
type ActivityType = "note" | "response" | "follow-up" | "interview" | "outcome";
type ApplicationStatus = "interested" | "applied" | "interview" | "rejected" | "offered" | "withdrawn";

type Props = {
  workspace: Workspace;
  onSaveWorkspace: (next: Workspace, message: string) => Promise<boolean>;
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: "Interested / lead",
  applied: "Applied — manually confirmed",
  interview: "Interview",
  rejected: "Rejected",
  offered: "Offer",
  withdrawn: "Withdrawn",
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: "Note",
  response: "Response received",
  "follow-up": "Follow-up",
  interview: "Interview",
  outcome: "Outcome",
};

function nowIso() {
  return new Date().toISOString();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ApplicationsWorkspace({ workspace, onSaveWorkspace }: Props) {
  const [studioId, setStudioId] = useState("");
  const [otherStudio, setOtherStudio] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [outreachDraftId, setOutreachDraftId] = useState("");
  const [activityTypes, setActivityTypes] = useState<Record<string, ActivityType>>({});
  const [activityNotes, setActivityNotes] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState("all");
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");

  const applications = [...workspace.applications].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  const today = todayIso();
  const active = applications.filter((app) => !["rejected", "withdrawn"].includes(app.status));
  const dueFollowUps = active.filter((app) => app.nextFollowUpAt && app.nextFollowUpAt <= today);
  const byStatus = (status: ApplicationStatus) => applications.filter((app) => app.status === status).length;
  const filtered = filterStatus === "all" ? applications : applications.filter((app) => app.status === filterStatus);
  const selectedStudio = STUDIO_PROFILES.find((studio) => studio.id === studioId) ?? null;

  async function addApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError("");
    const name = selectedStudio?.name ?? otherStudio.trim();
    if (!name || !roleTitle.trim()) {
      setLocalError("Enter both a studio name and a role or outreach purpose.");
      return;
    }
    if (workspace.applications.length >= 1_000) {
      setLocalError("The private workspace has reached its 1,000-application limit.");
      return;
    }
    const now = nowIso();
    const application = {
      id: crypto.randomUUID(),
      studioName: name,
      roleTitle: roleTitle.trim(),
      status: "interested",
      applicationUrl: applicationUrl.trim(),
      notes: notes.trim(),
      createdAt: now,
      updatedAt: now,
      studioId: selectedStudio?.id ?? "",
      opportunityId: "",
      outreachDraftId,
      nextFollowUpAt: null,
      history: [
        {
          id: crypto.randomUUID(),
          type: "note",
          occurredAt: now,
          note: "Tracking record created manually. No message was sent and no application was submitted.",
        },
      ],
    };
    if (
      await onSaveWorkspace(
        { ...workspace, applications: [application, ...workspace.applications] },
        "Interested lead encrypted and saved locally.",
      )
    ) {
      setStudioId("");
      setOtherStudio("");
      setRoleTitle("");
      setApplicationUrl("");
      setNotes("");
      setOutreachDraftId("");
      setNotice("Added an interested lead. The record does not indicate a submission.");
    }
  }

  async function updateApplication(application: ApplicationRecord, patch: Partial<ApplicationRecord>, message: string) {
    setLocalError("");
    const nextApplications = workspace.applications.map((item) =>
      item.id === application.id ? { ...item, ...patch, updatedAt: nowIso() } : item,
    );
    const success = await onSaveWorkspace({ ...workspace, applications: nextApplications }, message);
    if (success) setNotice(message);
    return success;
  }

  async function changeStatus(application: ApplicationRecord, rawStatus: string) {
    if (!(APPLICATION_STATUSES as readonly string[]).includes(rawStatus)) return;
    const status = rawStatus as ApplicationStatus;
    if (status === application.status) return;
    if (
      status === "applied" &&
      !window.confirm(
        "Confirm that you personally submitted this application. This only records your confirmation; the app will not submit anything. Continue?",
      )
    ) {
      return;
    }
    if (status === "withdrawn" && !window.confirm("Confirm that you want to mark this application withdrawn?")) return;
    const now = nowIso();
    const note =
      status === "applied"
        ? "User explicitly confirmed they personally submitted the application."
        : "Status manually changed from " + application.status + " to " + status + ".";
    const event = {
      id: crypto.randomUUID(),
      type: status === "applied" ? "submitted" : ["rejected", "offered"].includes(status) ? "outcome" : "status-change",
      occurredAt: now,
      note,
    };
    await updateApplication(
      application,
      {
        status,
        history: [...application.history, event],
      } as Partial<ApplicationRecord>,
      status === "applied"
        ? "Manual submission confirmation recorded."
        : "Application status updated and activity logged.",
    );
  }

  async function addActivity(event: FormEvent<HTMLFormElement>, application: ApplicationRecord) {
    event.preventDefault();
    const note = (activityNotes[application.id] ?? "").trim();
    const type = activityTypes[application.id] ?? "note";
    if (!note) {
      setLocalError("Write a short note before adding an activity.");
      return;
    }
    if (application.history.length >= 200) {
      setLocalError("This record has reached its 200-event history limit.");
      return;
    }
    const eventRecord = { id: crypto.randomUUID(), type, occurredAt: nowIso(), note };
    if (
      await updateApplication(
        application,
        { history: [...application.history, eventRecord] },
        "Activity logged locally.",
      )
    ) {
      setActivityNotes((current) => ({ ...current, [application.id]: "" }));
    }
  }

  async function changeFollowUp(application: ApplicationRecord, date: string) {
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setLocalError("Choose a valid calendar date.");
      return;
    }
    const note = date ? "Follow-up date set to " + date + "." : "Follow-up date cleared.";
    const now = nowIso();
    const event = { id: crypto.randomUUID(), type: "follow-up", occurredAt: now, note };
    await updateApplication(
      application,
      {
        nextFollowUpAt: date || null,
        history: [...application.history, event],
      } as Partial<ApplicationRecord>,
      date ? "Follow-up date saved locally." : "Follow-up date cleared.",
    );
  }

  return (
    <div className="phase7-page page-stack" data-testid="applications-workspace">
      <section className="phase7-intro">
        <span className="eyebrow">PHASE 7 · APPLICATION TRACKER</span>
        <h2>Track what actually happened.</h2>
        <p>
          Leads, submissions, replies, interviews, follow-ups and outcomes are private encrypted records. Status is
          never inferred from a draft or job listing. The “Applied” status requires you to confirm a real submission.
        </p>
      </section>

      <section className="phase7-metrics" aria-label="Application summary">
        <article className="phase7-metric">
          <span>Total records</span>
          <strong>{applications.length}</strong>
        </article>
        <article className="phase7-metric">
          <span>Interested leads</span>
          <strong>{byStatus("interested")}</strong>
        </article>
        <article className="phase7-metric">
          <span>Applied</span>
          <strong>{byStatus("applied")}</strong>
        </article>
        <article className="phase7-metric">
          <span>Interviews</span>
          <strong>{byStatus("interview")}</strong>
        </article>
        <article className="phase7-metric">
          <span>Offers</span>
          <strong>{byStatus("offered")}</strong>
        </article>
        <article className={"phase7-metric " + (dueFollowUps.length ? "phase7-metric-alert" : "")}>
          <span>Follow-ups due</span>
          <strong>{dueFollowUps.length}</strong>
        </article>
      </section>

      <section className="phase7-card">
        <div className="phase7-section-heading">
          <div>
            <span className="eyebrow">1 · ADD A LEAD</span>
            <h3>Start tracking a studio or role</h3>
          </div>
        </div>
        <form className="phase7-form-grid" onSubmit={(event) => void addApplication(event)}>
          <label>
            Sourced studio (optional)
            <select
              value={studioId}
              onChange={(event) => {
                setStudioId(event.target.value);
                setOtherStudio("");
              }}
            >
              <option value="">Other / enter manually</option>
              {STUDIO_PROFILES.map((studio) => (
                <option key={studio.id} value={studio.id}>
                  {studio.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            {selectedStudio ? "Role or outreach purpose" : "Studio name"}
            {!selectedStudio ? (
              <input
                maxLength={180}
                value={otherStudio}
                onChange={(event) => setOtherStudio(event.target.value)}
                required
                placeholder="Studio or company"
              />
            ) : (
              <input value={selectedStudio.name} readOnly />
            )}
          </label>
          <label>
            Role / purpose
            <input
              maxLength={180}
              value={roleTitle}
              onChange={(event) => setRoleTitle(event.target.value)}
              required
              placeholder="e.g. Developer Support Specialist"
            />
          </label>
          <label>
            Official role/application URL (optional)
            <input
              type="url"
              maxLength={2000}
              value={applicationUrl}
              onChange={(event) => setApplicationUrl(event.target.value)}
              placeholder="https://…"
            />
          </label>
          <label>
            Link a saved outreach draft (optional)
            <select value={outreachDraftId} onChange={(event) => setOutreachDraftId(event.target.value)}>
              <option value="">No linked draft</option>
              {workspace.drafts.map((draft) => (
                <option key={draft.id} value={draft.id}>
                  {draft.title} · v{draft.versionNumber}
                </option>
              ))}
            </select>
          </label>
          <label className="phase7-full-width">
            Private notes (optional)
            <textarea
              maxLength={4000}
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Why this is a lead, what to verify, or the next manual step."
            />
          </label>
          <div className="phase7-full-width phase7-actions">
            <button
              className="button button-primary"
              type="submit"
              disabled={!roleTitle.trim() || (!selectedStudio && !otherStudio.trim())}
            >
              Save interested lead
            </button>
            <span className="phase7-hint">Saving a lead does not mean an application was submitted.</span>
          </div>
        </form>
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
            <span className="eyebrow">2 · PIPELINE</span>
            <h3>Tracked opportunities</h3>
          </div>
          <label className="phase7-filter">
            Filter status
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="all">All statuses</option>
              {APPLICATION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status as ApplicationStatus]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filtered.length ? (
          <div className="phase7-application-list">
            {filtered.map((application) => (
              <article className="phase7-application" key={application.id} data-testid="application-record">
                <div className="phase7-application-head">
                  <div>
                    <h4>{application.studioName}</h4>
                    <p>{application.roleTitle}</p>
                    <span className="phase7-meta">
                      Added {new Date(application.createdAt).toLocaleDateString()} · Updated{" "}
                      {new Date(application.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <label className="phase7-status-field">
                    Status
                    <select
                      aria-label={"Status for " + application.studioName + " — " + application.roleTitle}
                      data-testid="application-status"
                      value={application.status}
                      onChange={(event) => void changeStatus(application, event.target.value)}
                    >
                      {APPLICATION_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status as ApplicationStatus]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {application.applicationUrl ? (
                  <p className="phase7-source-link">
                    <a href={application.applicationUrl} target="_blank" rel="noreferrer">
                      Open saved role/application URL
                    </a>
                  </p>
                ) : null}
                {application.notes ? <p className="phase7-application-notes">{application.notes}</p> : null}
                {application.outreachDraftId ? (
                  <p className="phase7-meta">
                    Linked draft:{" "}
                    {workspace.drafts.find((draft) => draft.id === application.outreachDraftId)?.title ??
                      "Legacy or unavailable draft"}
                  </p>
                ) : null}
                <div className="phase7-followup">
                  <label>
                    Next follow-up date
                    <input
                      type="date"
                      data-testid="application-follow-up-date"
                      value={application.nextFollowUpAt ?? ""}
                      onChange={(event) => void changeFollowUp(application, event.target.value)}
                    />
                  </label>
                  {application.nextFollowUpAt ? (
                    <span className={application.nextFollowUpAt <= today ? "phase7-due" : "phase7-meta"}>
                      {application.nextFollowUpAt <= today ? "Follow-up due" : "Upcoming follow-up"}
                    </span>
                  ) : (
                    <span className="phase7-meta">No follow-up date</span>
                  )}
                </div>
                <details className="phase7-activity">
                  <summary>Activity history ({application.history.length})</summary>
                  <form className="phase7-activity-form" onSubmit={(event) => void addActivity(event, application)}>
                    <label>
                      Activity type
                      <select
                        data-testid="application-activity-type"
                        value={activityTypes[application.id] ?? "note"}
                        onChange={(event) =>
                          setActivityTypes((current) => ({
                            ...current,
                            [application.id]: event.target.value as ActivityType,
                          }))
                        }
                      >
                        {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      What happened?
                      <textarea
                        maxLength={2000}
                        rows={2}
                        data-testid="application-activity-note"
                        value={activityNotes[application.id] ?? ""}
                        onChange={(event) =>
                          setActivityNotes((current) => ({ ...current, [application.id]: event.target.value }))
                        }
                        placeholder="Record a reply, follow-up, interview, outcome, or note."
                      />
                    </label>
                    <button
                      className="button button-secondary"
                      type="submit"
                      data-testid="application-activity-submit"
                      disabled={!(activityNotes[application.id] ?? "").trim() || application.history.length >= 200}
                    >
                      Add activity
                    </button>
                  </form>
                  {application.history.length ? (
                    <ol className="phase7-timeline">
                      {[...application.history]
                        .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
                        .map((item) => (
                          <li key={item.id}>
                            <div>
                              <strong>{item.type.replaceAll("-", " ")}</strong>
                              <span>{new Date(item.occurredAt).toLocaleString()}</span>
                            </div>
                            <p>{item.note}</p>
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="phase7-empty">No activity has been recorded.</p>
                  )}
                </details>
              </article>
            ))}
          </div>
        ) : (
          <p className="phase7-empty">
            {applications.length
              ? "No records match this filter."
              : "No application records yet. Add a lead above or create one from a saved outreach draft."}
          </p>
        )}
      </section>
    </div>
  );
}
