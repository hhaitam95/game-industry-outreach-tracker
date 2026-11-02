import { useEffect, useMemo, useState } from "react";
import type { TrackedApplication, TrackerStatus } from "./components/studio.types";
import StudioDirectory from "./components/StudioDirectory";
import ApplicationTracker from "./components/ApplicationTracker";
import CandidateProfile from "./components/CandidateProfile";
import MatchingDashboard from "./components/MatchingDashboard";
import { createApplicationTrackerBackup, parseStoredApplicationTracker, readApplicationTrackerBackup } from "./tracker/application-backup.mjs";

const STORAGE_KEY = "studio-outreach-tracker-v1";
const THEME_STORAGE_KEY = "studio-outreach-theme-v1";
type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

type NavigationIconName = "studios" | "matches" | "applications" | "profile";

function NavigationIcon({ name }: { name: NavigationIconName }) {
  return (
    <svg
      className="navigation-icon"
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "studios" ? (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.7" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.7" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.7" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.7" />
        </>
      ) : null}
      {name === "matches" ? (
        <>
          <path d="m12 2.9 2.15 6.95L21.1 12l-6.95 2.15L12 21.1l-2.15-6.95L2.9 12l6.95-2.15L12 2.9Z" />
          <path d="m19 2 .55 1.8L21.4 4.4l-1.85.6L19 6.8l-.55-1.8-1.85-.6 1.85-.6L19 2Z" />
        </>
      ) : null}
      {name === "applications" ? (
        <>
          <rect x="3" y="7.5" width="18" height="13" rx="2" />
          <path d="M8 7.5V5.8A1.8 1.8 0 0 1 9.8 4h4.4A1.8 1.8 0 0 1 16 5.8v1.7M3 12h18M10 12v2h4v-2" />
        </>
      ) : null}
      {name === "profile" ? (
        <>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
        </>
      ) : null}
    </svg>
  );
}

type StudioSummary = {
  name: string;
  websiteUrl: string;
  applicationUrl: string;
  country: string;
  countryCode?: string;
  evidenceUrl?: string;
  checkedAt?: string;
  notes?: string;
  applicationResearch?: {
    routeType?: string;
    routeStatus?: string;
    workModel?: string;
    submissionMethods?: string[];
    eligibleLocations?: string[];
    disciplineScope?: string[];
  };
};

type StudioLocation = {
  country: string;
  countryCode?: string;
  hqLabel: string;
  applicationLocation: string;
};

export default function App() {
  const [page, setPage] = useState<"studios" | "matches" | "applications" | "profile">("studios");
  const [trackerInitialTab, setTrackerInitialTab] = useState("saved");
  const [trackerFocusStudio, setTrackerFocusStudio] = useState<string | null>(null);
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageLoadError, setStorageLoadError] = useState("");
  const [storageError, setStorageError] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    try {
      const stored = parseStoredApplicationTracker(window.localStorage.getItem(STORAGE_KEY));
      if (!stored.ok) {
        setStorageLoadError(stored.message);
        return;
      }
      setApplications(stored.applications);
      setStorageReady(true);
    } catch {
      setStorageLoadError(
        "Your saved application tracker could not be read. The original browser data has been left untouched.",
      );
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme persistence is optional; the selected theme still applies in memory.
    }
  }, [theme]);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [applications, storageReady]);

  const trackedCount = useMemo(() => applications.length, [applications]);

  function trackStudio(
    studio: StudioSummary,
    status: TrackerStatus,
    location?: StudioLocation,
  ) {
    if (!storageReady) {
      setStorageLoadError("Restore a valid application backup before adding or changing tracker records.");
      return;
    }
    const timestamp = new Date().toISOString();
    setApplications((previous) => {
      const normalizedName = studio.name.trim().toLocaleLowerCase();
      if (previous.some((item) => item.studioName.trim().toLocaleLowerCase() === normalizedName)) return previous;

      const next: TrackedApplication = {
        id: studio.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        studioName: studio.name,
        websiteUrl: studio.websiteUrl,
        applicationUrl: studio.applicationUrl,
        country: location?.country || studio.country,
        countryCode: location?.countryCode || studio.countryCode || "",
        hqLabel: location?.hqLabel || "HQ",
        applicationLocation:
          location?.applicationLocation || "Not specified · see official route",
        routeType: studio.applicationResearch?.routeType || "general",
        routeStatus: studio.applicationResearch?.routeStatus || "unknown",
        routeCheckedAt: studio.checkedAt || "",
        routeEvidenceUrl: studio.evidenceUrl || "",
        routeNotes: studio.notes || "",
        workModel: studio.applicationResearch?.workModel || "not_stated",
        submissionMethods: studio.applicationResearch?.submissionMethods || [],
        eligibleLocations: studio.applicationResearch?.eligibleLocations || [],
        disciplineScope: studio.applicationResearch?.disciplineScope || [],
        status,
        createdAt: timestamp,
        updatedAt: timestamp,
        appliedAt: status === "applied" ? timestamp : null,
        note: "",
      };
      return [next, ...previous];
    });
  }

  function changeStatus(id: string, status: TrackerStatus) {
    if (!storageReady) return;
    const current = applications.find((item) => item.id === id);
    if (!current) return;

    if (
      status === "applied" &&
      current.status !== "applied" &&
      !window.confirm(
        "Confirm that you have submitted an application to " + current.studioName + "?",
      )
    ) {
      return;
    }

    setApplications((previous) =>
      previous.map((item) =>
        item.id !== id
          ? item
          : {
              ...item,
              status,
              updatedAt: new Date().toISOString(),
              appliedAt:
                status === "applied"
                  ? item.appliedAt || new Date().toISOString()
                  : item.appliedAt,
            },
      ),
    );
  }

  function updateApplicationNote(id: string, note: string) {
    if (!storageReady) return;
    setApplications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, note, updatedAt: new Date().toISOString() } : item,
      ),
    );
  }

  function removeApplication(id: string) {
    if (!storageReady) return;
    const item = applications.find((application) => application.id === id);
    if (!item || !window.confirm("Remove " + item.studioName + " from your tracker?")) return;
    setApplications((previous) => previous.filter((application) => application.id !== id));
  }

  function exportApplicationBackup() {
    const backup = createApplicationTrackerBackup(applications);
    const url = URL.createObjectURL(backup);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "application-tracker-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importApplicationBackup(file: File): Promise<number | null> {
    const imported = await readApplicationTrackerBackup(file);
    const confirmed = window.confirm(
      "Replace the " + applications.length + " application records currently in this browser with " +
      imported.length + " records from this backup? This cannot be undone.",
    );
    if (!confirmed) return null;
    setApplications(imported);
    setStorageLoadError("");
    setStorageReady(true);
    setStorageError(false);
    return imported.length;
  }

  function openTracker(tab = "saved") {
    setTrackerFocusStudio(null);
    setTrackerInitialTab(tab);
    setPage("applications");
  }

  function openTrackedStudio(studioName: string) {
    const application = applications.find(item => item.studioName === studioName);
    if (!application) return;
    setTrackerInitialTab(application.status);
    setTrackerFocusStudio(studioName);
    setPage("applications");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <button
            className="brand"
            type="button"
            onClick={() => setPage("studios")}
            aria-label="Game Industry Outreach Tracker home"
          >
            <span className="brand-mark">GI</span>
            <span className="brand-name">Game Industry Outreach Tracker</span>
          </button>

          <nav className="main-navigation" aria-label="Main navigation">
            <button
              className={page === "studios" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => setPage("studios")}
              aria-current={page === "studios" ? "page" : undefined}
            >
              <NavigationIcon name="studios" />
              <span className="nav-label">Studios</span>
            </button>
            <button
              className={page === "matches" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => setPage("matches")}
              aria-current={page === "matches" ? "page" : undefined}
            >
              <NavigationIcon name="matches" />
              <span className="nav-label">Matches</span>
            </button>
            <button
              className={page === "applications" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => openTracker()}
              aria-current={page === "applications" ? "page" : undefined}
            >
              <NavigationIcon name="applications" />
              <span className="nav-label">My applications</span>
              <span className="nav-count">{trackedCount}</span>
            </button>
            <button
              className={page === "profile" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => setPage("profile")}
              aria-current={page === "profile" ? "page" : undefined}
            >
              <NavigationIcon name="profile" />
              <span className="nav-label">My profile</span>
            </button>
          </nav>

          <div className="header-tools">
            <button
              className="btn btn-outline-secondary btn-sm theme-toggle"
              type="button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={theme === "dark"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="page-container">
        {page === "studios" ? (
          <StudioDirectory
            applications={applications}
            onSave={(studio, location) => trackStudio(studio, "saved", location)}
            onOpenTracker={openTrackedStudio}
          />
        ) : null}
        {page === "matches" ? (
          <MatchingDashboard
            onOpenProfile={() => setPage("profile")}
            onSaveStudio={(studio, location) => trackStudio(studio, "saved", location)}
            onOpenTrackedStudio={openTrackedStudio}
            trackedStudioNames={applications.map((application) => application.studioName)}
          />
        ) : null}
        {page === "applications" ? (
          <ApplicationTracker
            initialTab={trackerInitialTab}
            focusStudioName={trackerFocusStudio}
            applications={applications}
            onChangeStatus={changeStatus}
            onUpdateNote={updateApplicationNote}
            onRemove={removeApplication}
            onOpenDirectory={() => setPage("studios")}
            onExportBackup={exportApplicationBackup}
            onImportBackup={importApplicationBackup}
          />
        ) : null}
        <div className="profile-route" style={{ display: page === "profile" ? "block" : "none" }}>
          <CandidateProfile />
        </div>
        {storageLoadError ? (
          <p className="storage-warning" role="alert">
            {storageLoadError} Restore a valid application backup before continuing to use the tracker.
            <button className="text-button" type="button" onClick={() => openTracker()}>
              Open My applications to restore a backup
            </button>
          </p>
        ) : null}
        {storageError ? (
          <p className="storage-warning" role="alert">
            Your browser could not save changes to local storage. Check your browser's site
            storage settings. Changes may remain only in memory until storage is available.
          </p>
        ) : null}
      </main>

      <footer className="app-footer">
        <span>Game Industry Outreach Tracker</span>
        <span>Studio directory · Private matches · Candidate profile · Application tracker</span>
        <span>Profile and tracker data stay in this browser · Theme preference is saved locally</span>
      </footer>
    </div>
  );
}
