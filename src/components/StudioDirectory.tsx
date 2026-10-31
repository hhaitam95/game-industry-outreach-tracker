import { useEffect, useMemo, useState } from "react";
import studios from "../data/speculative-route-directory.json" with { type: "json" };
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import type { TrackedApplication } from "./studio.types";
import DiscoveryStatus from "./DiscoveryStatus";
import StudioMark from "./StudioMark";
import { countryFlagFor } from "./location";
import "./directory.css";

type Studio = (typeof studios)[number] & { addedAt?: string };
type Profile = {
  headquarters?: {
    city: string | null;
    country: string;
    countryCode?: string | null;
    label?: string;
  } | null;
  companyType?: string[];
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
  const [country, setCountry] = useState("All countries");
  const [workModel, setWorkModel] = useState("All work models");
  const [sort, setSort] = useState("name");
  const [showNewOnly, setShowNewOnly] = useState(false);
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

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return activeStudios
      .filter((studio) => {
        const profile = profiles[studio.name];
        const studioCountry = profile?.headquarters?.country || studio.country;
        const routeWorkModel = studio.applicationResearch?.workModel || "not_stated";
        const searchable = [
          studio.name,
          studio.country,
          locationFor(studio),
          ...(profile?.companyType || []),
        ]
          .join(" ")
          .toLowerCase();

        return (
          (!term || searchable.includes(term)) &&
          (country === "All countries" || studioCountry === country) &&
          (workModel === "All work models" || routeWorkModel === workModel) &&
          (!showNewOnly || isNewStudio(studio, now))
        );
      })
      .sort((a, b) =>
        sort === "country"
          ? locationSortFor(a).localeCompare(locationSortFor(b)) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
      );
  }, [activeStudios, country, now, query, showNewOnly, sort, workModel]);

  const tracked = new Set(applications.map((application) => application.studioName));
  function resetFilters() {
    setQuery("");
    setCountry("All countries");
    setWorkModel("All work models");
    setSort("name");
    setShowNewOnly(false);
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
            placeholder="Studio name, country or type"
          />
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
        <label className="form-field sort-field">
          <span>Sort by</span>
          <select className="form-select" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Studio name</option>
            <option value="country">Country</option>
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
        <span>Active speculative application routes</span>
        <span>{filtered.length} results</span>
      </div>

      <div className="table-wrap">
        <table className="table table-sm table-hover align-middle studio-table mb-0">
          <thead>
            <tr>
              <th scope="col">Studio</th>
              <th scope="col">Studio location</th>
              <th scope="col">Studio type</th>
              <th scope="col">Work model</th>
              <th scope="col">Application route</th>
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

              return (
                <tr key={studio.name}>
                  <td>
                    <div className="studio-identity">
                      <StudioMark name={studio.name} websiteUrl={studio.websiteUrl} />
                      <span className="studio-name">{studio.name}</span>
                      {isNew ? <span className="badge text-bg-warning new-studio-badge">NEW</span> : null}
                    </div>
                  </td>
                  <td>
                    <span className="location-cell">
                      {flag ? <span className="country-flag" role="img" aria-label={studioCountry + " flag"}>{flag}</span> : null}
                      <span>{studioLocation}</span>
                    </span>
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
                          applicationLocation: "See official application route",
                        })
                      }
                    >
                      {isTracked ? "In tracker" : "Save"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="empty-table" colSpan={7}>
                  No studios match these filters.
                  <button type="button" className="text-button" onClick={resetFilters}>Reset filters</button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="directory-note">
        Studio flags identify headquarters only, not hiring eligibility or a guaranteed work location.
        Application routes are linked to official websites or studio-controlled systems.
      </p>
    </section>
  );
}
