import { useMemo, useState, type ChangeEvent } from "react";
import {
  SPECULATIVE_ROUTE_DIRECTORY,
  SPECULATIVE_ROUTE_DIRECTORY_ERROR,
  SPECULATIVE_ROUTE_DIRECTORY_ORIGIN,
} from "../lib/speculative-routes/validation.mjs";
import { selectSpeculativeRoutes } from "../lib/speculative-routes/directory-model.mjs";
import type { PrivateRouteMarkerStatus, PrivateRouteTrackingState } from "./workspace.types";
import "./speculative-route-directory.css";

type Directory = NonNullable<typeof SPECULATIVE_ROUTE_DIRECTORY>;
type DirectoryRoute = Directory["routes"][number];
type RouteStatusFilter = "all" | "candidate" | "verified" | "needs-review" | "stale";
type RouteTypeFilter = "all" | "dedicated-page" | "ats-posting" | "email-invite" | "talent-community";
type CountryScopeFilter = "all" | "worldwide" | "country-limited" | "unknown";
type DisciplineFilter =
  | "all"
  | "art"
  | "animation"
  | "engineering"
  | "design"
  | "production"
  | "audio"
  | "quality-assurance"
  | "narrative"
  | "other";
type RouteSort = "studio-asc" | "checked-desc" | "checked-asc" | "status-asc";

const STATUS_LABELS: Record<Exclude<RouteStatusFilter, "all">, string> = {
  candidate: "Candidate",
  verified: "Verified",
  "needs-review": "Needs review",
  stale: "Stale",
};

const ROUTE_TYPE_LABELS: Record<Exclude<RouteTypeFilter, "all">, string> = {
  "dedicated-page": "Dedicated page",
  "ats-posting": "ATS posting",
  "email-invite": "Email invitation",
  "talent-community": "Talent community",
};

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    parsed,
  );
}

function markerInput(route: Pick<DirectoryRoute, "id" | "studioId" | "routeUrl">, studioName: string) {
  return {
    routeId: route.id,
    studioId: route.studioId,
    studioName,
    routeUrl: route.routeUrl,
  };
}

export default function SpeculativeRouteDirectory({
  routeTracking = null,
  onOpenSettings,
  directory = SPECULATIVE_ROUTE_DIRECTORY,
  origin = SPECULATIVE_ROUTE_DIRECTORY_ORIGIN,
  loadError = SPECULATIVE_ROUTE_DIRECTORY_ERROR,
}: {
  routeTracking?: PrivateRouteTrackingState | null;
  onOpenSettings: () => void;
  directory?: Directory | null;
  origin?: "curated" | "sample";
  loadError?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RouteStatusFilter>("all");
  const [routeType, setRouteType] = useState<RouteTypeFilter>("all");
  const [countryScope, setCountryScope] = useState<CountryScopeFilter>("all");
  const [discipline, setDiscipline] = useState<DisciplineFilter>("all");
  const [sort, setSort] = useState<RouteSort>("checked-desc");
  const [requestedPage, setRequestedPage] = useState(1);
  const [savingRouteId, setSavingRouteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const result = useMemo(() => {
    if (!directory) {
      return { items: [], totalCount: 0, page: 1, pageCount: 1 };
    }
    return selectSpeculativeRoutes(directory, {
      query,
      status,
      routeType,
      countryScope,
      discipline,
      sort,
      page: requestedPage,
    });
  }, [directory, query, status, routeType, countryScope, discipline, sort, requestedPage]);

  const activeRouteIds = new Set((directory?.routes ?? []).map((route) => route.id));
  const orphanMarkers = (routeTracking?.markers ?? []).filter((marker) => !activeRouteIds.has(marker.routeId));
  const isSynthetic = origin === "sample";
  const canTrack = Boolean(routeTracking) && !isSynthetic && Boolean(directory) && !loadError;

  function resetPage() {
    setRequestedPage(1);
  }

  async function handleMarkerChange(event: ChangeEvent<HTMLSelectElement>, route: DirectoryRoute, studioName: string) {
    if (!routeTracking || isSynthetic) return;
    const nextStatus = event.target.value as PrivateRouteMarkerStatus | "";
    setSavingRouteId(route.id);
    setFeedback("");
    try {
      const saved = await routeTracking.setMarker(markerInput(route, studioName), nextStatus || null);
      setFeedback(
        saved
          ? nextStatus
            ? "Private marker encrypted and saved in this browser."
            : "Private marker removed from this browser."
          : "The private marker could not be saved. Check that the vault is unlocked.",
      );
    } catch {
      setFeedback("The private marker could not be saved. Check that the vault is unlocked.");
    } finally {
      setSavingRouteId(null);
    }
  }

  return (
    <section className="route-directory" aria-labelledby="route-directory-title">
      <div className="route-directory-intro">
        <span className="eyebrow">OFFICIAL ROUTES · EVIDENCE FIRST</span>
        <h2 id="route-directory-title">Route directory</h2>
        <p>
          Search only routes represented in the route dataset. A generic careers page is not evidence that a studio
          accepts speculative applications. Status describes the evidence record, not a guarantee that an application
          will be accepted.
        </p>
      </div>

      {isSynthetic ? (
        <div className="route-directory-notice" role="note" data-testid="route-directory-sample-notice">
          <strong>Synthetic sample data</strong>
          <p>
            These illustrative records are not real studios or verified opportunities. Private Planned/Applied controls
            are disabled until curated route data is added.
          </p>
        </div>
      ) : null}

      {loadError || !directory ? (
        <div className="route-directory-error" role="alert">
          <h3>The route directory could not be loaded</h3>
          <p>{loadError || "No validated route directory is available."}</p>
          <p>Invalid curated data is not replaced silently with sample records.</p>
        </div>
      ) : (
        <>
          <div className="route-directory-toolbar">
            <label className="route-directory-search" htmlFor="route-search">
              Search routes and evidence
              <input
                autoComplete="off"
                id="route-search"
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder="Studio, discipline, country, evidence…"
                type="search"
                value={query}
              />
            </label>
            <div className="route-directory-filter-grid">
              <label htmlFor="route-status-filter">
                Evidence status
                <select
                  id="route-status-filter"
                  onChange={(event) => {
                    setStatus(event.target.value as RouteStatusFilter);
                    resetPage();
                  }}
                  value={status}
                >
                  <option value="all">All statuses</option>
                  <option value="candidate">Candidate</option>
                  <option value="verified">Verified</option>
                  <option value="needs-review">Needs review</option>
                  <option value="stale">Stale</option>
                </select>
              </label>
              <label htmlFor="route-type-filter">
                Route type
                <select
                  id="route-type-filter"
                  onChange={(event) => {
                    setRouteType(event.target.value as RouteTypeFilter);
                    resetPage();
                  }}
                  value={routeType}
                >
                  <option value="all">All route types</option>
                  <option value="dedicated-page">Dedicated page</option>
                  <option value="ats-posting">ATS posting</option>
                  <option value="email-invite">Email invitation</option>
                  <option value="talent-community">Talent community</option>
                </select>
              </label>
              <label htmlFor="route-country-scope-filter">
                Country scope
                <select
                  id="route-country-scope-filter"
                  onChange={(event) => {
                    setCountryScope(event.target.value as CountryScopeFilter);
                    resetPage();
                  }}
                  value={countryScope}
                >
                  <option value="all">All scopes</option>
                  <option value="worldwide">Worldwide</option>
                  <option value="country-limited">Country-limited</option>
                  <option value="unknown">Unknown</option>
                </select>
              </label>
              <label htmlFor="route-discipline-filter">
                Discipline
                <select
                  id="route-discipline-filter"
                  onChange={(event) => {
                    setDiscipline(event.target.value as DisciplineFilter);
                    resetPage();
                  }}
                  value={discipline}
                >
                  <option value="all">All disciplines</option>
                  <option value="art">Art</option>
                  <option value="animation">Animation</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="production">Production</option>
                  <option value="audio">Audio</option>
                  <option value="quality-assurance">Quality assurance</option>
                  <option value="narrative">Narrative</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label htmlFor="route-sort">
                Sort routes
                <select id="route-sort" onChange={(event) => setSort(event.target.value as RouteSort)} value={sort}>
                  <option value="checked-desc">Recently checked first</option>
                  <option value="checked-asc">Oldest check first</option>
                  <option value="studio-asc">Studio name A–Z</option>
                  <option value="status-asc">Status A–Z</option>
                </select>
              </label>
            </div>
          </div>

          <p className="route-directory-result-count" role="status" aria-live="polite">
            Showing {result.items.length} of {result.totalCount} matching route(s)
          </p>

          {result.items.length ? (
            <div className="route-directory-list">
              {result.items.map((route) => {
                const marker = routeTracking?.markers.find((item) => item.routeId === route.id);
                const trackingDisabled = isSynthetic || !routeTracking || !canTrack || savingRouteId === route.id;
                return (
                  <article className="route-directory-card" data-testid="speculative-route-card" key={route.id}>
                    <div className="route-directory-card-heading">
                      <div>
                        <h3>{route.studioName}</h3>
                        <p className="route-directory-id">Route ID: {route.id}</p>
                      </div>
                      <span className={"route-directory-status route-directory-status-" + route.status}>
                        {STATUS_LABELS[route.status as Exclude<RouteStatusFilter, "all">] ?? route.status}
                      </span>
                    </div>

                    <dl className="route-directory-metadata">
                      <div>
                        <dt>Route type</dt>
                        <dd>
                          {ROUTE_TYPE_LABELS[route.routeType as Exclude<RouteTypeFilter, "all">] ?? route.routeType}
                        </dd>
                      </div>
                      <div>
                        <dt>Country scope</dt>
                        <dd>
                          {route.countryScope === "country-limited"
                            ? route.countryCodes.join(", ")
                            : route.countryScope === "worldwide"
                              ? "Worldwide"
                              : "Unknown"}
                        </dd>
                      </div>
                      <div>
                        <dt>Language</dt>
                        <dd>{route.language ?? "Not stated"}</dd>
                      </div>
                      <div>
                        <dt>Discipline</dt>
                        <dd>{route.disciplineTags.length ? route.disciplineTags.join(", ") : "Not stated"}</dd>
                      </div>
                      <div>
                        <dt>Work model</dt>
                        <dd>{route.workModel.replaceAll("-", " ")}</dd>
                      </div>
                      <div>
                        <dt>Matched phrase</dt>
                        <dd>{route.matchedPhraseCategory.replaceAll("-", " ")}</dd>
                      </div>
                    </dl>

                    <div className="route-directory-evidence">
                      <h4>Evidence summary</h4>
                      <p>{route.evidenceSummary}</p>
                      <p className="route-directory-evidence-hash">Content hash: {route.contentHash}</p>
                    </div>

                    <dl className="route-directory-dates">
                      <div>
                        <dt>First seen</dt>
                        <dd>{formatDate(route.firstSeenAt)}</dd>
                      </div>
                      <div>
                        <dt>Last checked</dt>
                        <dd>{formatDate(route.lastCheckedAt)}</dd>
                      </div>
                      <div>
                        <dt>Last verified</dt>
                        <dd>{formatDate(route.lastVerifiedAt)}</dd>
                      </div>
                    </dl>

                    <div className="route-directory-links">
                      <a href={route.routeUrl} rel="noopener noreferrer" target="_blank">
                        Open application route <span aria-hidden="true">↗</span>
                      </a>
                      <a href={route.evidenceUrl} rel="noopener noreferrer" target="_blank">
                        Open evidence source <span aria-hidden="true">↗</span>
                      </a>
                    </div>

                    <div className="route-directory-marker">
                      <label htmlFor={"route-marker-" + route.id}>
                        Private tracking label
                        <select
                          aria-describedby={"route-marker-help-" + route.id}
                          data-testid="route-marker-select"
                          disabled={trackingDisabled}
                          id={"route-marker-" + route.id}
                          onChange={(event) => void handleMarkerChange(event, route, route.studioName)}
                          value={marker?.status ?? ""}
                        >
                          <option value="">Not tracked</option>
                          <option value="planned">Planned</option>
                          <option value="applied">Applied — manually marked</option>
                        </select>
                      </label>
                      <p id={"route-marker-help-" + route.id}>
                        {isSynthetic
                          ? "Disabled for synthetic sample records."
                          : routeTracking
                            ? "A private label only. This does not submit a form or send a message."
                            : "Unlock your private vault in Settings to track this route."}
                      </p>
                      {!routeTracking && !isSynthetic ? (
                        <button className="button button-secondary" onClick={onOpenSettings} type="button">
                          Unlock private tracking in Settings
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="route-directory-empty" role="status">
              <h3>No routes match these filters</h3>
              <p>Try a broader search or reset the filters. Only records in the route directory are considered.</p>
              <button
                className="button button-secondary"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                  setRouteType("all");
                  setCountryScope("all");
                  setDiscipline("all");
                  setSort("checked-desc");
                  setRequestedPage(1);
                }}
                type="button"
              >
                Reset filters
              </button>
            </div>
          )}

          <div className="route-directory-pagination" aria-label="Route directory pages">
            <button
              className="button button-secondary"
              disabled={result.page <= 1}
              onClick={() => setRequestedPage(result.page - 1)}
              type="button"
            >
              Previous page
            </button>
            <span>
              Page {result.page} of {result.pageCount}
            </span>
            <button
              className="button button-secondary"
              disabled={result.page >= result.pageCount}
              onClick={() => setRequestedPage(result.page + 1)}
              type="button"
            >
              Next page
            </button>
          </div>

          {feedback ? (
            <p className="route-directory-feedback" role="status">
              {feedback}
            </p>
          ) : null}
        </>
      )}

      {orphanMarkers.length ? (
        <section className="route-directory-orphans" aria-labelledby="orphaned-route-markers-title">
          <h3 id="orphaned-route-markers-title">Saved markers for routes not currently listed</h3>
          <p>
            These private records are preserved even when the public directory no longer contains the route. Removing a
            marker is a separate, explicit action.
          </p>
          {orphanMarkers.map((marker) => (
            <article className="route-directory-orphan-row" key={marker.id}>
              <div>
                <strong>{marker.studioName}</strong>
                <p>
                  {marker.routeId} · {marker.status}
                </p>
                <a href={marker.routeUrl} rel="noopener noreferrer" target="_blank">
                  Open saved route
                </a>
              </div>
              <button
                className="button button-secondary"
                disabled={!routeTracking}
                onClick={() => {
                  if (!routeTracking) return;
                  void routeTracking.setMarker(marker, null);
                }}
                type="button"
              >
                Remove private marker
              </button>
            </article>
          ))}
        </section>
      ) : null}

      <p className="route-directory-boundary">
        Private Planned/Applied labels stay in the encrypted browser vault. The app never submits applications or treats
        a private label as confirmation from a studio.
      </p>
    </section>
  );
}
