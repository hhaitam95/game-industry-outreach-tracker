import { useMemo, useState } from "react";
import studios from "../data/speculative-route-directory.json" with { type: "json" };
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import type { TrackedApplication } from "./studio.types";
import "./directory.css";

type Studio = (typeof studios)[number];
type Profile = {
  headquarters?: {
    city: string | null;
    country: string;
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

function locationFor(studio: Studio) {
  const hq = profiles[studio.name]?.headquarters;
  const country = hq?.country || studio.country || "Not stated";
  return [hq?.city, country].filter(Boolean).join(", ");
}

export default function StudioDirectory({
  applications,
  onSave,
}: {
  applications: TrackedApplication[];
  onSave: (
    studio: Studio,
    location: { country: string; hqLabel: string; applicationLocation: string },
  ) => void;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("All countries");
  const [workModel, setWorkModel] = useState("All work models");
  const [sort, setSort] = useState("name");

  const activeStudios = useMemo(
    () => studios.filter((studio) => studio.applicationResearch?.routeStatus === "active"),
    [],
  );
  const countries = useMemo(
    () =>
      Array.from(new Set(activeStudios.map((studio) => profiles[studio.name]?.headquarters?.country || studio.country)))
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
          (workModel === "All work models" || routeWorkModel === workModel)
        );
      })
      .sort((a, b) =>
        sort === "country"
          ? locationFor(a).localeCompare(locationFor(b)) || a.name.localeCompare(b.name)
          : a.name.localeCompare(b.name),
      );
  }, [activeStudios, country, query, sort, workModel]);

  const tracked = new Set(applications.map((application) => application.studioName));

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

      <div className="directory-toolbar">
        <label className="form-field search-field">
          <span>Search</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Studio name, country or type"
          />
        </label>
        <label className="form-field">
          <span>Country</span>
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option>All countries</option>
            {countries.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Work model</span>
          <select value={workModel} onChange={(event) => setWorkModel(event.target.value)}>
            <option>All work models</option>
            {Object.entries(workModelLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field sort-field">
          <span>Sort by</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Studio name</option>
            <option value="country">Country</option>
          </select>
        </label>
      </div>

      <div className="table-meta">
        <span>Active speculative application routes</span>
        <span>{filtered.length} results</span>
      </div>

      <div className="table-wrap">
        <table className="studio-table">
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
              const studioLocation = [profile?.headquarters?.city, studioCountry].filter(Boolean).join(", ");
              const types = profile?.companyType?.slice(0, 2).join(" · ") || "Not stated";
              const routeType = studio.applicationResearch?.routeType || "general";
              const workType = studio.applicationResearch?.workModel || "not_stated";
              const isTracked = tracked.has(studio.name);

              return (
                <tr key={studio.name}>
                  <td className="studio-name">{studio.name}</td>
                  <td>{studioLocation}</td>
                  <td>{types}</td>
                  <td>
                    <span className="plain-tag">{workModelLabels[workType] || "Not stated"}</span>
                  </td>
                  <td>{routeLabels[routeType] || "Open application"}</td>
                  <td className="link-cell">
                    <a href={studio.applicationUrl} target="_blank" rel="noopener noreferrer">
                      Application
                    </a>
                    <a href={studio.websiteUrl} target="_blank" rel="noopener noreferrer">
                      Website
                    </a>
                  </td>
                  <td>
                    <button
                      className={isTracked ? "button button-small button-muted" : "button button-small button-primary"}
                      type="button"
                      disabled={isTracked}
                      onClick={() =>
                        onSave(studio, {
                          country: studioCountry,
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
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setQuery("");
                      setCountry("All countries");
                      setWorkModel("All work models");
                    }}
                  >
                    Clear filters
                  </button>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="directory-note">
        Application routes are linked to the studio's official website or studio-controlled
        application system. Headquarters are shown as a reference, not as a hiring-location
        guarantee.
      </p>
    </section>
  );
}
