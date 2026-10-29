import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  createEncryptedSession,
  MAX_ENCRYPTED_BACKUP_BYTES,
  openEncryptedSession,
} from "../lib/private-data/crypto-vault.mjs";
import { createIndexedDbVaultStore } from "../lib/private-data/indexed-db.mjs";
import { validateWorkspaceData } from "../lib/private-data/schema.mjs";
import type {
  PrivateRouteMarkerStatus,
  PrivateRouteTrackingState,
  PrivateWorkspaceSummary,
  RoleLeadPrefill,
  SpeculativeRouteMarkerInput,
} from "./workspace.types";
import OutreachWorkspace from "./OutreachWorkspace";
import ApplicationsWorkspace from "./ApplicationsWorkspace";
import "./phase7.css";

function describeError(error: unknown) {
  return error instanceof Error ? error.message : "The requested action could not be completed.";
}

type PrivateWorkspace = ReturnType<typeof validateWorkspaceData>;
type WorkspaceProfile = PrivateWorkspace["profile"];

function downloadBackup(contents: string) {
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "studio-outreach-encrypted-backup.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PrivateDataSettings({
  onProfileChange,
  onWorkspaceSummaryChange = () => undefined,
  onRouteTrackingStateChange = () => undefined,
  activePageId,
  onNavigate,
  initialLead = null,
  onLeadPrefillConsumed = () => undefined,
}: {
  onProfileChange: (profile: WorkspaceProfile | null) => void;
  onWorkspaceSummaryChange?: (summary: PrivateWorkspaceSummary | null) => void;
  onRouteTrackingStateChange?: (state: PrivateRouteTrackingState | null) => void;
  activePageId: string;
  onNavigate: (pageId: string) => void;
  initialLead?: RoleLeadPrefill | null;
  onLeadPrefillConsumed?: () => void;
}) {
  const storeRef = useRef<ReturnType<typeof createIndexedDbVaultStore> | null>(null);
  if (!storeRef.current) storeRef.current = createIndexedDbVaultStore();
  const store = storeRef.current;

  const reportWorkspaceSummary = useCallback((current: PrivateWorkspace | null) => {
    if (!current) {
      onWorkspaceSummaryChange(null);
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const activeApplications = current.applications.filter(
      (application) => !["rejected", "withdrawn"].includes(application.status),
    );
    onWorkspaceSummaryChange({
      draftCount: current.drafts.length,
      applicationCount: current.applications.length,
      dueFollowUpCount: activeApplications.filter(
        (application) => application.nextFollowUpAt && application.nextFollowUpAt <= today,
      ).length,
    });
  }, [onWorkspaceSummaryChange]);

  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const [vaultExists, setVaultExists] = useState(false);
  const [session, setSession] = useState<Awaited<ReturnType<typeof createEncryptedSession>>["session"] | null>(null);
  const [workspace, setWorkspace] = useState<PrivateWorkspace | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [backupPassphrase, setBackupPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [studioName, setStudioName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    void store
      .load()
      .then((encryptedEnvelope) => {
        if (cancelled) return;
        setVaultExists(Boolean(encryptedEnvelope));
        setStorageReady(true);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setStorageReady(false);
        setError(describeError(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  function updateProfile(field: "displayName" | "headline" | "professionalSummary", value: string) {
    const nextProfile = workspace ? { ...workspace.profile, [field]: value } : null;
    setWorkspace((current) =>
      current
        ? {
            ...current,
            profile: { ...current.profile, [field]: value },
          }
        : current,
    );
    if (nextProfile) onProfileChange(nextProfile);
    setDirty(true);
    setNotice("Unsaved changes — save the profile before locking or leaving this page.");
  }

  function updateProfileList(field: "targetRoles" | "skills", value: string) {
    const items = value
      .split(/\r?\n/u)
      .map((item) => item.trim())
      .filter(Boolean);
    const nextProfile = workspace ? { ...workspace.profile, [field]: items } : null;
    setWorkspace((current) =>
      current
        ? {
            ...current,
            profile: { ...current.profile, [field]: items },
          }
        : current,
    );
    if (nextProfile) onProfileChange(nextProfile);
    setDirty(true);
    setNotice("Unsaved changes — save the profile before locking or leaving this page.");
  }

  const persistWorkspace = useCallback(async (nextWorkspace: PrivateWorkspace, successMessage: string) => {
    if (!session) {
      setError("Unlock the local vault before saving.");
      return false;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = validateWorkspaceData({ ...nextWorkspace, updatedAt: new Date().toISOString() });
      await store.save(await session.encrypt(updated));
      setWorkspace(updated);
      onProfileChange(updated.profile);
      reportWorkspaceSummary(updated);
      setDirty(false);
      setVaultExists(true);
      setNotice(successMessage);
      return true;
    } catch (saveError) {
      setError(describeError(saveError));
      return false;
    } finally {
      setBusy(false);
    }
  }, [session, store, onProfileChange, reportWorkspaceSummary]);

  const setRouteMarker = useCallback(async (
    route: SpeculativeRouteMarkerInput,
    status: PrivateRouteMarkerStatus | null,
  ) => {
    if (!workspace || !session) {
      setError("Unlock the local vault before saving private route markers.");
      return false;
    }
    const now = new Date().toISOString();
    const existing = workspace.routeMarkers.find((marker) => marker.routeId === route.routeId);
    const routeMarkers = status === null
      ? workspace.routeMarkers.filter((marker) => marker.routeId !== route.routeId)
      : existing
        ? workspace.routeMarkers.map((marker) =>
            marker.routeId === route.routeId ? { ...marker, ...route, status, updatedAt: now } : marker,
          )
        : [{ id: crypto.randomUUID(), ...route, status, createdAt: now, updatedAt: now }, ...workspace.routeMarkers];
    return persistWorkspace(
      { ...workspace, routeMarkers },
      status ? "Private route marker encrypted and saved locally." : "Private route marker removed and saved locally.",
    );
  }, [workspace, session, persistWorkspace]);

  useEffect(() => {
    if (!workspace || !session) {
      onRouteTrackingStateChange(null);
      return;
    }
    onRouteTrackingStateChange({ markers: workspace.routeMarkers, setMarker: setRouteMarker });
  }, [workspace, session, setRouteMarker, onRouteTrackingStateChange]);

  async function handleCreateOrUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (vaultExists) {
        const encryptedEnvelope = await store.load();
        if (!encryptedEnvelope) throw new Error("No local vault was found. Refresh the page and try again.");
        const opened = await openEncryptedSession(encryptedEnvelope, passphrase);
        setSession(opened.session);
        setWorkspace(opened.data);
        onProfileChange(opened.data.profile);
        reportWorkspaceSummary(opened.data);
        setDirty(false);
        setNotice("Vault unlocked. Private records are held in this page's memory until you lock it or close the tab.");
      } else {
        const created = await createEncryptedSession(passphrase);
        await store.save(created.envelope);
        setSession(created.session);
        setWorkspace(created.data);
        onProfileChange(created.data.profile);
        reportWorkspaceSummary(created.data);
        setVaultExists(true);
        setDirty(false);
        setNotice("Encrypted local vault created. Download an encrypted backup before adding important records.");
      }
      setPassphrase("");
      setStorageReady(true);
    } catch (unlockError) {
      setError(describeError(unlockError));
      setPassphrase("");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace) return;
    const profile = { ...workspace.profile, updatedAt: new Date().toISOString() };
    await persistWorkspace({ ...workspace, profile }, "Profile encrypted and saved to this browser.");
  }

  async function handleAddApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workspace) return;
    const now = new Date().toISOString();
    const next = {
      ...workspace,
      applications: [
        {
          id: crypto.randomUUID(),
          studioName: studioName.trim(),
          roleTitle: roleTitle.trim(),
          status: "interested" as const,
          applicationUrl: applicationUrl.trim(),
          notes: "",
          createdAt: now,
          updatedAt: now,
          studioId: "",
          opportunityId: "",
          outreachDraftId: "",
          nextFollowUpAt: null,
          history: [
            {
              id: crypto.randomUUID(),
              type: "note" as const,
              occurredAt: now,
              note: "Lead created manually in Settings. No submission is implied.",
            },
          ],
        },
        ...workspace.applications,
      ],
    };
    if (await persistWorkspace(next, "Application encrypted and saved locally.")) {
      setStudioName("");
      setRoleTitle("");
      setApplicationUrl("");
    }
  }

  async function handleExport() {
    if (!workspace || !session) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = validateWorkspaceData({ ...workspace, updatedAt: new Date().toISOString() });
      const encryptedEnvelope = await session.encrypt(updated);
      await store.save(encryptedEnvelope);
      downloadBackup(encryptedEnvelope);
      setWorkspace(updated);
      setDirty(false);
      setNotice(
        "Encrypted backup downloaded. Keep the file and passphrase safe; neither can be recovered by this app.",
      );
    } catch (exportError) {
      setError(describeError(exportError));
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !session) return;
    if (file.size > MAX_ENCRYPTED_BACKUP_BYTES) {
      setError("Choose an encrypted backup no larger than 5 MiB.");
      return;
    }
    if (
      !window.confirm(
        "Importing this backup replaces the current local workspace. Export current data first if needed. Continue?",
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const serialized = await file.text();
      const restored = await openEncryptedSession(serialized, backupPassphrase);
      const validated = validateWorkspaceData(restored.data);
      await store.save(serialized);
      setSession(restored.session);
      setWorkspace(validated);
      onProfileChange(validated.profile);
      reportWorkspaceSummary(validated);
      setBackupPassphrase("");
      setDirty(false);
      setVaultExists(true);
      setNotice("Backup restored. The local vault now uses the imported backup's passphrase.");
    } catch (importError) {
      setError(describeError(importError));
      setBackupPassphrase("");
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    if (dirty && !window.confirm("You have unsaved edits. Locking discards them. Lock anyway?")) return;
    setSession(null);
    setWorkspace(null);
    onProfileChange(null);
    reportWorkspaceSummary(null);
    setDirty(false);
    setPassphrase("");
    setBackupPassphrase("");
    setNotice("Vault locked. Decrypted records have been cleared from the interface state.");
    setError("");
  }

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete the encrypted vault from this browser? This cannot be undone. Download a backup first if needed.",
      )
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await store.clear();
      setSession(null);
      setWorkspace(null);
      onProfileChange(null);
      reportWorkspaceSummary(null);
      setVaultExists(false);
      setDirty(false);
      setPassphrase("");
      setBackupPassphrase("");
      setNotice("Encrypted local vault deleted from this browser.");
    } catch (deleteError) {
      setError(describeError(deleteError));
    } finally {
      setBusy(false);
    }
  }

  const unlocked = Boolean(session && workspace);

  return (
    <div className="private-data-page page-stack">
      {activePageId === "settings" ? (
        <section className="private-data-intro">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PRIVATE DATA FOUNDATION</span>
              <h2>Private workspace storage</h2>
            </div>
            <span className={unlocked ? "vault-state vault-state-open" : "vault-state"}>
              <span aria-hidden="true" className="vault-state-dot" />
              {unlocked ? "Unlocked in memory" : vaultExists ? "Locked" : "Not set up"}
            </span>
          </div>
          <p>
            Profile and tracker records are encrypted before being written to this browser's IndexedDB. The passphrase
            is not saved, and decrypted records stay in memory only while unlocked.
          </p>
          <ul className="privacy-facts">
            <li>AES-256-GCM encryption with a passphrase-derived key (PBKDF2-SHA-256, 600,000 iterations).</li>
            <li>Only encrypted envelopes are stored locally; the key and decrypted workspace are not persisted.</li>
            <li>
              Raw CV files and extracted resume text are not stored. Resume metadata is optional and contains no
              original file contents.
            </li>
          </ul>
        </section>
      ) : (
        <section className="private-data-intro phase7-vault-context">
          <div className="section-heading">
            <div>
              <span className="eyebrow">PRIVATE WORKSPACE</span>
              <h2>{activePageId === "outreach" ? "Outreach" : "Applications"}</h2>
            </div>
            <span className={unlocked ? "vault-state vault-state-open" : "vault-state"}>
              <span aria-hidden="true" className="vault-state-dot" />
              {unlocked ? "Unlocked in memory" : vaultExists ? "Locked" : "Not set up"}
            </span>
          </div>
          <p>
            Personal drafts, context, follow-ups and application history are encrypted in this browser. Unlock the same
            local vault to access them; nothing is synced to a server.
          </p>
        </section>
      )}

      {error ? (
        <p className="vault-message vault-message-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="vault-message" role="status">
          {notice}
        </p>
      ) : null}

      {storageReady === null ? (
        <section className="private-data-card">
          <p>Checking this browser's local storage support…</p>
        </section>
      ) : storageReady === false ? (
        <section className="private-data-card">
          <h3>Local storage is unavailable</h3>
          <p>
            Open this site in a current browser over HTTPS or localhost, and check whether browser storage is blocked.
          </p>
        </section>
      ) : !unlocked ? (
        <section className="private-data-card">
          <h3>{vaultExists ? "Unlock your local vault" : "Create an encrypted vault"}</h3>
          <p>
            {vaultExists
              ? "Enter the passphrase used for this vault. The passphrase is never saved."
              : "Choose a unique passphrase of at least 12 characters. A forgotten passphrase cannot be reset by this app."}
          </p>
          <form className="vault-form" onSubmit={handleCreateOrUnlock}>
            <label htmlFor="vault-passphrase">Vault passphrase</label>
            <input
              autoComplete={vaultExists ? "current-password" : "new-password"}
              id="vault-passphrase"
              minLength={vaultExists ? undefined : 12}
              onChange={(event) => setPassphrase(event.target.value)}
              required
              type="password"
              value={passphrase}
            />
            <button className="button button-primary" disabled={busy || !passphrase} type="submit">
              {busy ? "Please wait…" : vaultExists ? "Unlock vault" : "Create local vault"}
            </button>
          </form>
          {!vaultExists ? (
            <p className="vault-warning">
              Browser data clearing, device loss, or storage eviction can remove this vault. Export backups regularly.
            </p>
          ) : null}
        </section>
      ) : workspace ? (
        activePageId === "settings" ? (
          <>
            <section className="private-data-card">
              <div className="section-heading">
                <div>
                  <h3>Candidate profile</h3>
                  <p>Use dummy information first to validate storage and recovery before adding real data.</p>
                </div>
                <span className="record-count">Private record</span>
              </div>
              <form className="vault-form" onSubmit={handleSaveProfile}>
                <label htmlFor="profile-display-name">Display name</label>
                <input
                  id="profile-display-name"
                  maxLength={120}
                  onChange={(event) => updateProfile("displayName", event.target.value)}
                  value={workspace.profile.displayName}
                />
                <label htmlFor="profile-headline">Professional headline</label>
                <input
                  id="profile-headline"
                  maxLength={180}
                  onChange={(event) => updateProfile("headline", event.target.value)}
                  value={workspace.profile.headline}
                />
                <label htmlFor="profile-summary">Professional summary</label>
                <textarea
                  id="profile-summary"
                  maxLength={2000}
                  onChange={(event) => updateProfile("professionalSummary", event.target.value)}
                  rows={4}
                  value={workspace.profile.professionalSummary}
                />
                <label htmlFor="profile-target-roles">Target roles (one per line, up to 30)</label>
                <textarea
                  id="profile-target-roles"
                  maxLength={3629}
                  onChange={(event) => updateProfileList("targetRoles", event.target.value)}
                  placeholder={"Developer Support Specialist\nTechnical Artist"}
                  rows={3}
                  value={workspace.profile.targetRoles.join("\n")}
                />
                <label htmlFor="profile-skills">Skills (one per line, up to 80)</label>
                <textarea
                  id="profile-skills"
                  maxLength={8079}
                  onChange={(event) => updateProfileList("skills", event.target.value)}
                  placeholder={"Python\nREST APIs\nKibana"}
                  rows={4}
                  value={workspace.profile.skills.join("\n")}
                />
                <p className="resume-helper-text">
                  Resume comparison checks exact text mentions only. A missing mention does not mean you lack the skill.
                  Save the profile to encrypt these fields in this browser.
                </p>
                <div className="vault-actions">
                  <button className="button button-primary" disabled={busy || !dirty} type="submit">
                    {busy ? "Saving…" : "Encrypt and save profile"}
                  </button>
                  <span className="muted-note">{dirty ? "Unsaved edits" : "No unsaved edits"}</span>
                </div>
              </form>
            </section>

            <section className="private-data-card">
              <div className="section-heading">
                <div>
                  <h3>Applications</h3>
                  <p>Add a dummy record to test local saving, unlock, and backup restoration.</p>
                </div>
                <span className="record-count">{workspace.applications.length} record(s)</span>
              </div>
              <form className="vault-form" onSubmit={handleAddApplication}>
                <label htmlFor="application-studio">Studio</label>
                <input
                  autoComplete="off"
                  id="application-studio"
                  maxLength={180}
                  onChange={(event) => setStudioName(event.target.value)}
                  required
                  value={studioName}
                />
                <label htmlFor="application-role">Role title</label>
                <input
                  autoComplete="off"
                  id="application-role"
                  maxLength={180}
                  onChange={(event) => setRoleTitle(event.target.value)}
                  required
                  value={roleTitle}
                />
                <label htmlFor="application-url">Official application URL (optional)</label>
                <input
                  autoComplete="url"
                  id="application-url"
                  maxLength={2000}
                  onChange={(event) => setApplicationUrl(event.target.value)}
                  placeholder="https://…"
                  type="url"
                  value={applicationUrl}
                />
                <button
                  className="button button-primary"
                  disabled={busy || !studioName.trim() || !roleTitle.trim()}
                  type="submit"
                >
                  Encrypt and add application
                </button>
              </form>
              {workspace.applications.length ? (
                <div className="private-record-list" aria-label="Saved applications">
                  {workspace.applications.map((application) => (
                    <article className="private-record-row" key={application.id}>
                      <div>
                        <h4>{application.studioName}</h4>
                        <p>{application.roleTitle}</p>
                        {application.applicationUrl ? (
                          <p className="private-record-url">{application.applicationUrl}</p>
                        ) : null}
                      </div>
                      <span className="record-status">{application.status}</span>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="empty-record-note">No application records yet.</p>
              )}
            </section>

            <section className="private-data-card">
              <h3>Encrypted backup and recovery</h3>
              <p>
                Export before changing browsers or devices. Importing a backup replaces the current local workspace
                after confirmation.
              </p>
              <div className="vault-actions vault-actions-wrap">
                <button
                  className="button button-primary"
                  disabled={busy}
                  onClick={() => void handleExport()}
                  type="button"
                >
                  Download encrypted backup
                </button>
                <button className="button button-secondary" disabled={busy} onClick={handleLock} type="button">
                  Lock workspace
                </button>
                <button
                  className="button button-danger"
                  disabled={busy}
                  onClick={() => void handleDelete()}
                  type="button"
                >
                  Delete local vault
                </button>
              </div>
              <div className="vault-form import-form">
                <label htmlFor="backup-passphrase">Backup passphrase</label>
                <input
                  autoComplete="off"
                  id="backup-passphrase"
                  onChange={(event) => setBackupPassphrase(event.target.value)}
                  type="password"
                  value={backupPassphrase}
                />
                <label htmlFor="backup-file">Encrypted backup file (maximum 5 MiB)</label>
                <input
                  accept="application/json,.json"
                  id="backup-file"
                  onChange={(event) => void handleImport(event)}
                  type="file"
                />
                <p className="muted-note">
                  The imported backup's passphrase becomes the local vault passphrase. The file is validated and
                  decrypted before replacing the current vault.
                </p>
              </div>
            </section>
          </>
        ) : dirty ? (
          <section className="private-data-card">
            <h3>Save or discard your Settings changes first</h3>
            <p>
              Outreach uses only the saved candidate profile. There are unsaved edits in Settings, so this workspace is
              paused until you save them or lock and discard them.
            </p>
            <button className="button button-primary" type="button" onClick={() => onNavigate("settings")}>
              Return to Settings
            </button>
          </section>
        ) : activePageId === "outreach" ? (
          <OutreachWorkspace workspace={workspace} onSaveWorkspace={persistWorkspace} />
        ) : activePageId === "applications" ? (
          <ApplicationsWorkspace
            workspace={workspace}
            onSaveWorkspace={persistWorkspace}
            initialLead={initialLead}
            onLeadPrefillConsumed={onLeadPrefillConsumed}
          />
        ) : null
      ) : null}

      {activePageId === "settings" ? (
        <section className="private-data-card private-data-caveats">
          <h3>Before using real personal data</h3>
          <p>
            This browser-local encryption is not protection against compromised browser software, malicious extensions,
            or malicious site code while unlocked. Data is per browser/device; clearing browser storage can remove it. A
            lost passphrase cannot be recovered. Keep original resumes outside the app. No data is synced to a server.
          </p>
        </section>
      ) : null}
    </div>
  );
}
