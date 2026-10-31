import { Fragment, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import studios from "../data/speculative-route-directory.json" with { type: "json" };
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import type { TrackedApplication } from "./studio.types";
import DiscoveryStatus from "./DiscoveryStatus";
import StudioMark from "./StudioMark";
import { continentsForLocation, countryFlagFor } from "./location";
import type { ContinentLabel } from "./location";
import "./directory.css";

type Studio = (typeof studios)[number] & { addedAt?: string };
type PopularGame = {
  title: string;
  appId?: number | null;
  stage?: string;
};
type Profile = {
  description?: string;
  headquarters?: {
    city: string | null;
    country: string;
    countryCode?: string | null;
    label?: string;
  } | null;
  otherLocations?: string[];
  companyType?: string[];
  ownership?: string;
  parentCompany?: string | null;
  industryScale?: string;
  teamSize?: string;
  teamSizeAsOf?: string | null;
  focus?: string[];
  popularGames?: PopularGame[];
  profileSources?: string[];
  applicationLocation?: string;
  reachHighlights?: string;
};
const profiles = profilesJson as Record<string, Profile>;

const routeLabels: Record<string, string> = {
  speculative: "Speculative",
  unsolicited: "Unsolicited",
  spontaneous: "Spontaneous",
  open: "Open application",
  general: "General application",
  discipline_specific: "Discipline-specific",
};
const workModelLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  on_site: "On-site",
  mixed: "Mixed",
  not_stated: "Not stated",
};
const NEW_STUDIO_WINDOW_MS = 24 * 60 * 60 * 1000;
const CONTINENT_ORDER = [
  "Europe",
  "Asia",
  "Africa",
  "North America",
  "South America",
  "Oceania",
  "Remote / distributed",
  "Not stated",
];
type SortKey = "name" | "location" | "popularWork" | "type" | "workModel" | "route";
type SortDirection = "asc" | "desc";

function isNewStudio(studio: Studio, now: number): boolean {
  if (!studio.addedAt) return false;
  const addedAt = Date.parse(studio.addedAt);
  return Number.isFinite(addedAt) && addedAt <= now && now - addedAt < NEW_STUDIO_WINDOW_MS;
}
function locationFor(studio: Studio): string {
  const hq = profiles[studio.name]?.headquarters;
  const country = hq?.country || studio.country || "Not stated";
  return [hq?.city, country].filter(Boolean).join(", ");
}
function locationSortFor(studio: Studio): string {
  const hq = profiles[studio.name]?.headquarters;
  const country = hq?.country || studio.country || "Not stated";
  const flag = countryFlagFor(country, hq?.countryCode);
  return [flag, locationFor(studio)].filter(Boolean).join(" ");
}
function studioId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function formatDate(value?: string | null): string {
  if (!value) return "Not recorded";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function StudioDirectory({
  applications,
  onSave,
}: {
  applications: TrackedApplication[];
  onSave: (
    studio: Studio,
    location: { country: string; countryCode: string; hqLabel: string; applicationLocation: string },
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState<ContinentLabel | "All continents">("All continents");
  const [country, setCountry] = useState("All countries");
  const [workModel, setWorkModel] = useState("All work models");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const activeStudios = useMemo(
    () => studios.filter((studio) => studio.applicationResearch?.routeStatus === "active") as Studio[],
    [],
  );
  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          activeStudios.map((studio) => profiles[studio.name]?.headquarters?.country || studio.country),
        ),
      )
        .filter((value) => value && value !== "Not stated" && value !== "Not publicly stated")
        .sort((a, b) => a.localeCompare(b)),
    [activeStudios],
  );
  const continents = useMemo(
    () =>
      Array.from(
        new Set(
          activeStudios.flatMap((studio) => {
            const hq = profiles[studio.name]?.headquarters;
            return continentsForLocation(
              hq?.country || studio.country || "Not stated",
              hq?.countryCode,
            );
          }),
        ),
      ).sort(
        (a, b) =>
          CONTINENT_ORDER.indexOf(a) - CONTINENT_ORDER.indexOf(b) || a.localeCompare(b),
      ),
    [activeStudios],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches = activeStudios.filter((studio) => {
      const profile = profiles[studio.name];
      const studioCountry = profile?.headquarters?.country || studio.country;
      const countryCode = profile?.headquarters?.countryCode || "";
      const studioContinents = continentsForLocation(studioCountry || "Not stated", countryCode);
      const routeWorkModel = studio.applicationResearch?.workModel || "not_stated";
      const searchable = [
        studio.name,
        studio.country,
        locationFor(studio),
        ...(profile?.companyType || []),
        ...(profile?.focus || []),
        ...(profile?.popularGames || []).map((game) => game.title),
        profile?.description || "",
        profile?.ownership || "",
        profile?.parentCompany || "",
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!term || searchable.includes(term)) &&
        (continent === "All continents" || studioContinents.includes(continent)) &&
        (country === "All countries" || studioCountry === country) &&
        (workModel === "All work models" || routeWorkModel === workModel) &&
        (!showNewOnly || isNewStudio(studio, now))
      );
    });

    const sortValue = (studio: Studio): string => {
      const profile = profiles[studio.name];
      switch (sortKey) {
        case "location":
          return locationSortFor(studio);
        case "popularWork":
          return (profile?.popularGames || []).slice(0, 4).map((game) => game.title).join(" ");
        case "type":
          return (profile?.companyType || []).slice(0, 2).join(" · ") || "Not stated";
        case "workModel":
          return workModelLabels[studio.applicationResearch?.workModel || "not_stated"] || "Not stated";
        case "route":
          return routeLabels[studio.applicationResearch?.routeType || "general"] || "Open application";
        case "name":
        default:
          return studio.name;
      }
    };
    const direction = sortDirection === "asc" ? 1 : -1;
    return matches.sort((a, b) => {
      const primary = sortValue(a).localeCompare(sortValue(b), undefined, {
        sensitivity: "base",
        numeric: true,
      });
      if (primary !== 0) return primary * direction;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
    });
  }, [activeStudios, continent, country, now, query, showNewOnly, sortDirection, sortKey, workModel]);

  const tracked = new Set(applications.map((application) => application.studioName));

  function resetFilters() {
    setQuery("");
    setContinent("All continents");
    setCountry("All countries");
    setWorkModel("All work models");
    setSortKey("name");
    setSortDirection("asc");
    setShowNewOnly(false);
    setExpandedStudio(null);
  }

  function requestSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, name: string) {
    const target = event.target;
    if (target instanceof HTMLElement && target.closest("a, button, input, select, label")) return;
    setExpandedStudio((current) => (current === name ? null : name));
  }

  function renderSortHeader(key: SortKey, label: string) {
    const active = sortKey === key;
    const nextDirection = active ? (sortDirection === "asc" ? "descending" : "ascending") : "ascending";
    return (
      <th scope="col" aria-sort={active ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}>
        <button
          className="column-sort-button"
          type="button"
          onClick={() => requestSort(key)}
          aria-label={"Sort by " + label + " (" + nextDirection + ")"}
          title={"Sort by " + label}
        >
          <span>{label}</span>
          <span className="sort-indicator" aria-hidden="true">
            {active ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
          </span>
        </button>
      </th>
    );
  }

  return (
    <section className="directory-page">
      <div className="page-heading">
        <div>
          <h1>Studio directory</h1>
          <p>Game studios with verified speculative and open application routes.</p>
        </div>
        <div className="page-count">
          <strong>{filtered.length}</strong>
          <span>of {activeStudios.length} studios</span>
        </div>
      </div>

      <DiscoveryStatus />

      <div className="directory-toolbar">
        <label className="form-field search-field">
          <span>Search</span>
          <input
            className="form-control"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Studio, game, country or focus"
          />
        </label>
        <label className="form-field">
          <span>Continent</span>
          <select className="form-select" value={continent} onChange={(event) => setContinent(event.target.value as ContinentLabel | "All continents")}>
            <option>All continents</option>
            {continents.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Country</span>
          <select className="form-select" value={country} onChange={(event) => setCountry(event.target.value)}>
            <option>All countries</option>
            {countries.map((value) => (
              <option key={value} value={value}>
                {countryFlagFor(value)} {value}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Work model</span>
          <select className="form-select" value={workModel} onChange={(event) => setWorkModel(event.target.value)}>
            <option>All work models</option>
            {Object.entries(workModelLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="directory-filter-actions">
        <label className="form-check form-switch new-only-filter">
          <input
            id="new-only-filter"
            className="form-check-input"
            type="checkbox"
            checked={showNewOnly}
            onChange={(event) => setShowNewOnly(event.target.checked)}
            aria-label="Show only studios added in the last 24 hours"
          />
          <span className="form-check-label">New studios only (24h)</span>
        </label>
        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      <div className="table-meta">
        <span>Active speculative application routes · Click a row for studio details</span>
        <span>{filtered.length} results</span>
      </div>

      <div className="table-wrap">
        <table className="table table-sm table-hover align-middle studio-table mb-0">
          <thead>
            <tr>
              {renderSortHeader("name", "Studio")}
              {renderSortHeader("location", "Studio location")}
              {renderSortHeader("popularWork", "Notable work")}
              {renderSortHeader("type", "Studio type")}
              {renderSortHeader("workModel", "Work model")}
              {renderSortHeader("route", "Application route")}
              <th scope="col">Links</th>
              <th scope="col">Tracker</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((studio) => {
              const profile = profiles[studio.name];
              const studioCountry = profile?.headquarters?.country || studio.country || "Not stated";
              const countryCode = profile?.headquarters?.countryCode || "";
              const studioLocation = [profile?.headquarters?.city, studioCountry].filter(Boolean).join(", ");
              const types = profile?.companyType?.slice(0, 2).join(" · ") || "Not stated";
              const routeType = studio.applicationResearch?.routeType || "general";
              const workType = studio.applicationResearch?.workModel || "not_stated";
              const isTracked = tracked.has(studio.name);
              const isNew = isNewStudio(studio, now);
              const flag = countryFlagFor(studioCountry, countryCode);
              const notableGames = profile?.popularGames?.slice(0, 4) || [];
              const studioContinents = continentsForLocation(studioCountry, countryCode);
              const isExpanded = expandedStudio === studio.name;
              const detailId = "studio-details-" + studioId(studio.name);

              return (
                <Fragment key={studio.name}>
                  <tr
                    className={isExpanded ? "studio-data-row is-expanded" : "studio-data-row"}
                    data-continents={studioContinents.join("|")}
                    onClick={(event) => handleRowClick(event, studio.name)}
                  >
                    <td>
                      <div className="studio-identity">
                        <StudioMark name={studio.name} websiteUrl={studio.websiteUrl} />
                        <button
                          className="studio-expand-trigger"
                          type="button"
                          aria-expanded={isExpanded}
                          aria-controls={detailId}
                          onClick={() =>
                            setExpandedStudio((current) => (current === studio.name ? null : studio.name))
                          }
                        >
                          <span className="expand-indicator" aria-hidden="true">
                            {isExpanded ? "▾" : "▸"}
                          </span>
                          <span className="studio-name">{studio.name}</span>
                        </button>
                        {isNew ? <span className="badge text-bg-warning new-studio-badge">NEW</span> : null}
                      </div>
                    </td>
                    <td>
                      <span className="location-cell">
                        {flag ? <span className="country-flag" role="img" aria-label={studioCountry + " flag"}>{flag}</span> : null}
                        <span>{studioLocation}</span>
                      </span>
                    </td>
                    <td>
                      {notableGames.length > 0 ? (
                        <span className="popular-work-list">
                          {notableGames.map((game) => (
                            <span className="popular-work-chip" key={game.title}>{game.title}</span>
                          ))}
                        </span>
                      ) : (
                        <span className="unlisted-work">Not listed</span>
                      )}
                    </td>
                    <td>{types}</td>
                    <td><span className="plain-tag">{workModelLabels[workType] || "Not stated"}</span></td>
                    <td>{routeLabels[routeType] || "Open application"}</td>
                    <td className="link-cell">
                      <a href={studio.applicationUrl} target="_blank" rel="noopener noreferrer">Application</a>
                      <a href={studio.websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>
                    </td>
                    <td>
                      <button
                        className={isTracked ? "btn btn-outline-secondary btn-sm" : "btn btn-primary btn-sm"}
                        type="button"
                        disabled={isTracked}
                        onClick={() =>
                          onSave(studio, {
                            country: studioCountry,
                            countryCode,
                            hqLabel: profile?.headquarters?.city
                              ? profile.headquarters.city + " · " + (profile.headquarters.label || "Location")
                              : profile?.headquarters?.label || "Country listed",
                            applicationLocation: profile?.applicationLocation || "See official application route",
                          })
                        }
                      >
                        {isTracked ? "In tracker" : "Save"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="studio-details-row" id={detailId}>
                      <td colSpan={8}>
                        <div className="studio-details-panel">
                          <div className="studio-details-grid">
                            <div className="studio-details-main">
                              <section className="studio-detail-section">
                                <h3>About the studio</h3>
                                <p>{profile?.description || "No studio description is available in the current profile."}</p>
                              </section>
                              <section className="studio-detail-section">
                                <h3>Notable work</h3>
                                {notableGames.length > 0 ? (
                                  <div className="detail-game-list">
                                    {notableGames.map((game) => (
                                      <span className="detail-game-chip" key={game.title}>
                                        <strong>{game.title}</strong>
                                        {game.stage ? <small>{game.stage}</small> : null}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="detail-muted">No game titles are listed in this profile.</p>
                                )}
                              </section>
                              {profile?.reachHighlights ? (
                                <section className="studio-detail-section">
                                  <h3>Why this studio stands out</h3>
                                  <p>{profile.reachHighlights}</p>
                                </section>
                              ) : null}
                              {studio.notes ? (
                                <section className="studio-detail-section">
                                  <h3>Application route notes</h3>
                                  <p>{studio.notes}</p>
                                </section>
                              ) : null}
                              {studio.applicationResearch?.eligibleLocations?.length ? (
                                <section className="studio-detail-section">
                                  <h3>Listed hiring locations</h3>
                                  <p>{studio.applicationResearch.eligibleLocations.join(" · ")}</p>
                                </section>
                              ) : null}
                              {studio.applicationResearch?.disciplineScope?.length ? (
                                <section className="studio-detail-section">
                                  <h3>Listed disciplines</h3>
                                  <div className="focus-tag-list">
                                    {studio.applicationResearch.disciplineScope.slice(0, 8).map((item) => (
                                      <span className="focus-tag" key={item}>{item}</span>
                                    ))}
                                  </div>
                                </section>
                              ) : null}
                            </div>
                            <div className="studio-details-facts">
                              <section className="studio-detail-section">
                                <h3>Studio snapshot</h3>
                                <dl className="studio-facts-list">
                                  <div><dt>Industry scale</dt><dd>{profile?.industryScale || "Not stated"}</dd></div>
                                  <div>
                                    <dt>Team size</dt>
                                    <dd>
                                      {profile?.teamSize || "Not stated"}
                                      {profile?.teamSizeAsOf ? <small> · as of {profile.teamSizeAsOf}</small> : null}
                                    </dd>
                                  </div>
                                  <div><dt>Ownership</dt><dd>{profile?.ownership || "Not stated"}</dd></div>
                                  {profile?.parentCompany ? <div><dt>Parent company</dt><dd>{profile.parentCompany}</dd></div> : null}
                                  <div><dt>Headquarters</dt><dd>{studioLocation || "Not stated"}</dd></div>
                                  {profile?.otherLocations?.length ? (
                                    <div><dt>Other locations</dt><dd>{profile.otherLocations.slice(0, 4).join(" · ")}</dd></div>
                                  ) : null}
                                  <div><dt>Application location</dt><dd>{profile?.applicationLocation || "See the official application route"}</dd></div>
                                </dl>
                              </section>
                              {profile?.focus?.length ? (
                                <section className="studio-detail-section">
                                  <h3>Platforms and focus</h3>
                                  <div className="focus-tag-list">
                                    {profile.focus.slice(0, 10).map((item) => (
                                      <span className="focus-tag" key={item}>{item}</span>
                                    ))}
                                  </div>
                                </section>
                              ) : null}
                            </div>
                          </div>
                          {profile?.profileSources?.length ? (
                            <div className="studio-profile-sources">
                              <span>Profile sources</span>
                              {profile.profileSources.slice(0, 4).map((source, index) => (
                                <a href={source} key={source} target="_blank" rel="noopener noreferrer">
                                  Source {index + 1}
                                </a>
                              ))}
                            </div>
                          ) : null}
                          <div className="studio-verification-meta">
                            <span>Route last checked: <strong>{formatDate(studio.checkedAt)}</strong></span>
                            {studio.applicationResearch?.nextReviewAt ? (
                              <span>Next review target: <strong>{formatDate(studio.applicationResearch.nextReviewAt)}</strong></span>
                            ) : null}
                            {studio.evidenceUrl ? (
                              <a href={studio.evidenceUrl} target="_blank" rel="noopener noreferrer">Route evidence</a>
                            ) : null}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="empty-table" colSpan={8}>
                  No studios match these filters. Use Reset filters above to clear your search and selections.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="directory-note">
        Studio flags and continent filters identify headquarters, not hiring eligibility or a guaranteed work location.
        Application routes are linked to official websites or studio-controlled systems.
      </p>
    </section>
  );
}
