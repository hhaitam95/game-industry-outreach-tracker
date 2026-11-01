import { useEffect, useState } from "react";

const WORKFLOW_RUNS_URL =
  "https://api.github.com/repos/hhaitam95/game-industry-outreach-tracker/actions/workflows/discover-studios.yml/runs?per_page=10";

type WorkflowRun = {
  status?: string;
  conclusion?: string | null;
  updated_at?: string;
  html_url?: string;
};
type DiscoveryStatusSnapshot = {
  latest: WorkflowRun | null;
  lastSuccessful: WorkflowRun | null;
};

function formatTimestamp(value?: string): string {
  if (!value) return "time unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "time unavailable"
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function DiscoveryStatus() {
  const [snapshot, setSnapshot] = useState<DiscoveryStatusSnapshot | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(WORKFLOW_RUNS_URL, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("GitHub Actions status request failed");
        return (await response.json()) as { workflow_runs?: WorkflowRun[] };
      })
      .then((payload) => {
        if (!active) return;
        const runs = Array.isArray(payload.workflow_runs) ? payload.workflow_runs : [];
        setSnapshot({
          latest: runs[0] || null,
          lastSuccessful:
            runs.find((run) => run.status === "completed" && run.conclusion === "success") || null,
        });
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });
    return () => { active = false; };
  }, []);

  const workflowUrl =
    "https://github.com/hhaitam95/game-industry-outreach-tracker/actions/workflows/discover-studios.yml";

  if (unavailable) {
    return (
      <div className="automation-status" role="status">
        <span className="badge text-bg-secondary">Status unavailable</span>
        <span>Hourly discovery status could not be loaded.</span>
        <a href={workflowUrl} target="_blank" rel="noopener noreferrer">View automation</a>
      </div>
    );
  }
  if (!snapshot) {
    return (
      <div className="automation-status" role="status" aria-live="polite">
        <span className="badge text-bg-secondary">Checking</span>
        <span>Checking the latest hourly discovery run…</span>
      </div>
    );
  }

  const latest = snapshot.latest;
  const lastSuccessful = snapshot.lastSuccessful;
  if (!latest && !lastSuccessful) {
    return (
      <div className="automation-status" role="status">
        <span className="badge text-bg-secondary">No run found</span>
        <span>No discovery run is available in the public workflow history.</span>
        <a href={workflowUrl} target="_blank" rel="noopener noreferrer">View automation</a>
      </div>
    );
  }

  const isRunning = latest?.status !== "completed";
  const latestSucceeded = latest?.conclusion === "success";
  const latestFailed = latest?.status === "completed" && !latestSucceeded;

  return (
    <div className="automation-status" role="status" aria-live="polite">
      {isRunning ? (
        <span className="badge text-bg-primary">Running</span>
      ) : latestSucceeded ? (
        <span className="badge text-bg-success">Healthy</span>
      ) : (
        <span className="badge text-bg-warning">Check run</span>
      )}
      <span>Hourly discovery</span>
      {latestFailed ? <span>Latest attempt {latest.conclusion || "did not complete"} ·</span> : null}
      {lastSuccessful ? (
        <span>Last successful run: {formatTimestamp(lastSuccessful.updated_at)} (local time)</span>
      ) : (
        <span>No successful run is recorded in the latest 10 attempts.</span>
      )}
      <a href={latest?.html_url || lastSuccessful?.html_url || workflowUrl} target="_blank" rel="noopener noreferrer">
        View run
      </a>
    </div>
  );
}
