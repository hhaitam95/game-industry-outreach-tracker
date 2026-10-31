import { useEffect, useMemo, useState } from "react";
import type { TrackedApplication, TrackerStatus } from "./components/studio.types";
import StudioDirectory from "./components/StudioDirectory";
import ApplicationTracker from "./components/ApplicationTracker";

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
const VALID_STATUSES = new Set<TrackerStatus>([
  "saved",
  "in_progress",
  "applied",
  "interview",
  "offer",
  "archived",
]);

type StudioSummary = {
  name: string;
  websiteUrl: string;
  applicationUrl: string;
  country: string;
  countryCode?: string;
};

type StudioLocation = {
  country: string;
  countryCode?: string;
  hqLabel: string;
  applicationLocation: string;
};

function readApplications(): TrackedApplication[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item: unknown): item is TrackedApplication => {
      if (!item || typeof item !== "object") return false;
      const application = item as Partial<TrackedApplication>;
      return (
        typeof application.id === "string" &&
        typeof application.studioName === "string" &&
        typeof application.websiteUrl === "string" &&
        typeof application.applicationUrl === "string" &&
        typeof application.status === "string" &&
        VALID_STATUSES.has(application.status as TrackerStatus)
      );
    });
  } catch {
    return [];
  }
}

export default function App() {
  const [page, setPage] = useState<"studios" | "applications">("studios");
  const [trackerInitialTab, setTrackerInitialTab] = useState("saved");
  const [applications, setApplications] = useState<TrackedApplication[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);

  useEffect(() => {
    setApplications(readApplications());
    setLoaded(true);
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
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [applications, loaded]);

  const trackedCount = useMemo(() => applications.length, [applications]);

  function trackStudio(
    studio: StudioSummary,
    status: TrackerStatus,
    location?: StudioLocation,
  ) {
    const timestamp = new Date().toISOString();
    setApplications((previous) => {
      if (previous.some((item) => item.studioName === studio.name)) return previous;

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

  function removeApplication(id: string) {
    const item = applications.find((application) => application.id === id);
    if (!item || !window.confirm("Remove " + item.studioName + " from your tracker?")) return;
    setApplications((previous) => previous.filter((application) => application.id !== id));
  }

  function openTracker(tab = "saved") {
    setTrackerInitialTab(tab);
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
              Studios
            </button>
            <button
              className={page === "applications" ? "nav-link active" : "nav-link"}
              type="button"
              onClick={() => openTracker()}
              aria-current={page === "applications" ? "page" : undefined}
            >
              My applications
              <span className="nav-count">{trackedCount}</span>
            </button>
          </nav>

          <div className="header-tools">
            <button
              className="btn btn-outline-secondary btn-sm theme-toggle"
              type="button"
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={theme === "dark"}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <span className="workspace-label">PERSONAL WORKSPACE</span>
          </div>
        </div>
      </header>

      <main className="page-container">
        {page === "studios" ? (
          <StudioDirectory
            applications={applications}
            onSave={(studio, location) => trackStudio(studio, "saved", location)}
          />
        ) : (
          <ApplicationTracker
            initialTab={trackerInitialTab}
            applications={applications}
            onChangeStatus={changeStatus}
            onRemove={removeApplication}
            onOpenDirectory={() => setPage("studios")}
          />
        )}
        {storageError ? (
          <p className="storage-warning" role="alert">
            Your browser could not save changes to local storage. Check your browser's site
            storage settings.
          </p>
        ) : null}
      </main>

      <footer className="app-footer">
        <span>Game Industry Outreach Tracker</span>
        <span>Studio directory · Application tracker</span>
        <span>Tracker data stays in this browser · Theme preference is saved locally</span>
      </footer>
    </div>
  );
}
