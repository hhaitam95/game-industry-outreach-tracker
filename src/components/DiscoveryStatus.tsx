import { useEffect, useState } from "react";

const WORKFLOW_RUNS_URL =
  "https://api.github.com/repos/hhaitam95/studioscout/actions/workflows/discover-studios.yml/runs?per_page=10";
const WORKFLOW_URL =
  "https://github.com/hhaitam95/studioscout/actions/workflows/discover-studios.yml";
const SUMMARY_URL = import.meta.env.BASE_URL + "discovery-run-summary.json";

type WorkflowRun = {
  status?: string;
  conclusion?: string | null;
  updated_at?: string;
  html_url?: string;
};
type DiscoveryRunSummary = {
  completedAt?: string;
  newStudiosAdded?: number;
  routesChecked?: number;
  publicDatasetChanged?: boolean;
};
type Snapshot = {
  latest: WorkflowRun | null;
  lastSuccessful: WorkflowRun | null;
  summary: DiscoveryRunSummary | null;
};

function formatTimestamp(value?: string): string {
  if (!value) return "time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "time unavailable"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function summaryText(summary: DiscoveryRunSummary | null): string {
  if (!summary) return "New-studio results for the latest batch are not available yet.";
  const added = Number.isInteger(summary.newStudiosAdded) ? Math.max(0, summary.newStudiosAdded || 0) : 0;
  const routes = Number.isInteger(summary.routesChecked) ? Math.max(0, summary.routesChecked || 0) : 0;
  return (added
    ? added + " new " + (added === 1 ? "studio" : "studios") + " added in the latest check"
    : "No new studios added in the latest check") +
    (routes ? " · " + routes + " existing routes rechecked" : "") + ".";
}

export default function DiscoveryStatus({
  showNewOnly,
  onToggleNewOnly,
}: {
  showNewOnly: boolean;
  onToggleNewOnly: (checked: boolean) => void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(WORKFLOW_RUNS_URL, { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" })
        .then(async response => {
          if (!response.ok) throw new Error("GitHub Actions status request failed");
          return await response.json() as { workflow_runs?: WorkflowRun[] };
        }),
      fetch(SUMMARY_URL, { cache: "no-store" })
        .then(async response => response.ok ? await response.json() as DiscoveryRunSummary : null)
        .catch(() => null),
    ]).then(([payload, summary]) => {
      if (!active) return;
      const runs = Array.isArray(payload.workflow_runs) ? payload.workflow_runs : [];
      setSnapshot({
        latest: runs[0] || null,
        lastSuccessful: runs.find(run => run.status === "completed" && run.conclusion === "success") || null,
        summary: summary && typeof summary === "object" ? summary : null,
      });
    }).catch(() => {
      if (active) setUnavailable(true);
    });
    return () => { active = false; };
  }, []);

  const filter = (
    <label className="form-check form-switch new-only-filter">
      <input id="new-only-filter" className="form-check-input" type="checkbox"
        checked={showNewOnly} onChange={event => onToggleNewOnly(event.target.checked)}
        aria-label="Show only newly added studios" />
      <span className="form-check-label">✨ New studios</span>
    </label>
  );

  if (unavailable) {
    return <div className="automation-status-wrap">
      <div className="automation-status" role="status">
        <span className="badge text-bg-secondary">Status unavailable</span>
        <span>Hourly discovery status could not be loaded.</span>
        <a href={WORKFLOW_URL} target="_blank" rel="noopener noreferrer">View automation</a>
        {filter}
      </div>
      <div className="automation-status-detail">New-studio results for the latest batch are unavailable.</div>
    </div>;
  }
  if (!snapshot) {
    return <div className="automation-status-wrap">
      <div className="automation-status" role="status" aria-live="polite">
        <span className="badge text-bg-secondary">Checking</span>
        <span>Checking the latest hourly discovery run…</span>
        {filter}
      </div>
    </div>;
  }

  const latest = snapshot.latest;
  const lastSuccessful = snapshot.lastSuccessful;
  const isRunning = latest?.status !== "completed";
  const latestSucceeded = latest?.conclusion === "success";
  const latestFailed = latest?.status === "completed" && !latestSucceeded;

  return <div className="automation-status-wrap">
    <div className="automation-status" role="status" aria-live="polite">
      {isRunning ? <span className="badge text-bg-primary">Running</span>
        : latestSucceeded ? <span className="badge text-bg-success">Healthy</span>
        : <span className="badge text-bg-warning">Check run</span>}
      <span>Hourly discovery</span>
      {latestFailed ? <span>Latest attempt {latest.conclusion || "did not complete"} ·</span> : null}
      {lastSuccessful
        ? <span>Last successful run: {formatTimestamp(lastSuccessful.updated_at)} (local time)</span>
        : <span>No successful run is recorded in the latest 10 attempts.</span>}
      <a href={latest?.html_url || lastSuccessful?.html_url || WORKFLOW_URL} target="_blank" rel="noopener noreferrer">View run</a>
      {filter}
    </div>
    <div className="automation-status-detail">
      {summaryText(snapshot.summary)}
      {snapshot.summary?.completedAt ? " Last batch: " + formatTimestamp(snapshot.summary.completedAt) + "." : ""}
    </div>
  </div>;
}
