import { useMemo, useState } from "react";
import type { TrackedApplication, TrackerStatus } from "./studio.types";
import StudioMark from "./StudioMark";
import { countryFlagFor } from "./location";
import "./tracker.css";

const tabs: { id: string; label: string; status: TrackerStatus }[] = [
  { id: "saved", label: "Saved", status: "saved" },
  { id: "in_progress", label: "In progress", status: "in_progress" },
  { id: "applied", label: "Applied", status: "applied" },
  { id: "interview", label: "Interview", status: "interview" },
  { id: "offer", label: "Offer", status: "offer" },
  { id: "archived", label: "Archived", status: "archived" },
];
const statusLabels: Record<TrackerStatus, string> = {
  saved: "Saved",
  in_progress: "In progress",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  archived: "Not moving forward",
};
function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
}

export default function ApplicationTracker({
  initialTab = "saved",
  applications,
  onChangeStatus,
  onRemove,
  onOpenDirectory,
}: {
  initialTab?: string;
  applications: TrackedApplication[];
  onChangeStatus: (id: string, status: TrackerStatus) => void;
  onRemove: (id: string) => void;
  onOpenDirectory: () => void;
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const active = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  const counts = useMemo(
    () =>
      Object.fromEntries(
        tabs.map((tab) => [
          tab.id,
          applications.filter((application) => application.status === tab.status).length,
        ]),
      ),
    [applications],
  );
  const visible = applications
    .filter(
      (application) =>
        application.status === active.status &&
        [application.studioName, application.country, application.hqLabel]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <section className="tracker-page">
      <div className="page-heading">
        <div>
          <h1>My applications</h1>
          <p>Keep track of the studios you're considering and the applications you've sent.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={onOpenDirectory}>
          Browse studios
        </button>
      </div>

      <div className="tracker-toolbar">
        <div className="tracker-tabs" role="tablist" aria-label="Application status">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "tracker-tab active" : "tracker-tab"}
              type="button"
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              <span>{counts[tab.id] || 0}</span>
            </button>
          ))}
        </div>
        <label className="form-field tracker-search">
          <span>Search tracker</span>
          <input
            className="form-control"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Studio or country"
          />
        </label>
      </div>

      <div className="table-meta">
        <span>{active.label}</span>
        <span>{visible.length} {visible.length === 1 ? "studio" : "studios"}</span>
      </div>

      <div className="table-wrap">
        <table className="table table-sm table-hover align-middle tracker-table mb-0">
          <thead>
            <tr>
              <th scope="col">Studio</th>
              <th scope="col">Location</th>
              <th scope="col">Added</th>
              <th scope="col">Application</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((application) => {
              const flag = countryFlagFor(application.country, application.countryCode);
              return (
                <tr key={application.id}>
                  <td>
                    <div className="studio-identity">
                      <StudioMark name={application.studioName} websiteUrl={application.websiteUrl} />
                      <span className="studio-name">{application.studioName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="location-cell">
                      {flag ? <span className="country-flag" role="img" aria-label={application.country + " flag"}>{flag}</span> : null}
                      <span>{application.country || "Not stated"}</span>
                    </span>
                  </td>
                  <td>{formatDate(application.createdAt)}</td>
                  <td>
                    <a href={application.applicationUrl} target="_blank" rel="noopener noreferrer">Open route</a>
                  </td>
                  <td>
                    <label className="status-select-label">
                      <span className="visually-hidden">Status for {application.studioName}</span>
                      <select
                        className="form-select"
                        value={application.status}
                        onChange={(event) =>
                          onChangeStatus(application.id, event.target.value as TrackerStatus)
                        }
                      >
                        {tabs.map((tab) => (
                          <option key={tab.id} value={tab.status}>{statusLabels[tab.status]}</option>
                        ))}
                      </select>
                    </label>
                  </td>
                  <td>
                    <button
                      className="btn btn-link btn-sm text-danger p-0"
                      type="button"
                      onClick={() => onRemove(application.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            {visible.length === 0 ? (
              <tr>
                <td className="empty-table" colSpan={6}>
                  {query ? "No matching studios in this status." : "No studios in this list yet."}
                  {!query && activeTab === "saved" ? (
                    <button className="text-button" type="button" onClick={onOpenDirectory}>
                      Browse the studio directory
                    </button>
                  ) : null}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <p className="tracker-note">
        Your tracker is saved in this browser only. It is not connected to a server or shared with
        anyone.
      </p>
    </section>
  );
}
