import { Fragment, useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import studios from "../data/speculative-route-directory.json" with { type: "json" };
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import type { TrackedApplication } from "./studio.types";
import DiscoveryStatus from "./DiscoveryStatus";
import StudioMark from "./StudioMark";
import CompanyMarks, { hasKnownCompanyMark } from "./CompanyMarks";
import GamePoster, { GamePosterStrip } from "./GamePosters";
import type { PopularGame } from "./GamePosters";
import {
  FOCUS_ORDER,
  PLATFORM_ORDER,
  ROLE_ORDER,
  SCALE_ORDER,
  focusEmoji,
  orderedTags,
  platformEmoji,
} from "./studio-taxonomy";
import type { StudioScale } from "./studio-taxonomy";
import { continentEmoji, continentsForLocation, countryFlagFor, countryPartsFor } from "./location";
import type { ContinentLabel } from "./location";
import "./directory.css";

type Studio = (typeof studios)[number] & { addedAt?: string };
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
  studioRoles?: string[];
  ownership?: string;
  parentCompany?: string | null;
  industryScale?: string;
  scale?: StudioScale;
  scaleBasis?: "recorded" | "editorial";
  teamSize?: string;
  teamSizeAsOf?: string | null;
  focus?: string[];
  platforms?: string[];
  gameFocus?: string[];
  popularGames?: PopularGame[];
  profileSources?: string[];
  socialLinks?: { label: string; url: string }[];
  applicationLocation?: string;
  reachHighlights?: string;
};
const profiles = profilesJson as Record<string, Profile>;

const workModelLabels: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  on_site: "On-site",
  mixed: "Mixed",
  not_stated: "Not stated",
};
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
type SortKey = "name" | "location" | "popularWork" | "scale" | "role" | "platform" | "focus";
type SortDirection = "asc" | "desc";

function isNewStudio(studio: Studio): boolean {
  return Boolean(studio.addedAt && Number.isFinite(Date.parse(studio.addedAt)));
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

function ScaleBadge({ scale, basis }: { scale: StudioScale; basis?: "recorded" | "editorial" }) {
  const title = basis === "editorial"
    ? "Editorial scale indication; not a company-reported tier."
    : "Scale classification recorded in the studio profile.";
  return <span className={"studio-scale-tag scale-" + scale.toLowerCase()} title={title}>{scale}{basis === "editorial" ? "*" : ""}</span>;
}

function TagList({
  values,
  kind,
  limit,
}: {
  values: string[];
  kind: "platform" | "focus" | "role";
  limit?: number;
}) {
  const selected = limit ? values.slice(0, limit) : values;
  if (!selected.length) return <span className="detail-muted">Not classified</span>;
  return (
    <div className={"studio-tag-list tag-list-" + kind}>
      {selected.map(value => (
        <span className={"studio-facet-tag facet-" + kind} key={value}>
          {kind === "platform" ? <span aria-hidden="true">{platformEmoji(value)}</span> : null}
          {kind === "focus" ? <span aria-hidden="true">{focusEmoji(value)}</span> : null}
          {value}
        </span>
      ))}
    </div>
  );
}

function FilterPicker({
  label,
  emoji,
  options,
  selected,
  onToggle,
}: {
  label: string;
  emoji: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <details className="directory-filter-picker">
      <summary>
        <span className="filter-picker-label"><span aria-hidden="true">{emoji}</span>{label}</span>
        <span className="filter-picker-count">{selected.length || "All"}</span>
      </summary>
      <div className="filter-picker-options" role="group" aria-label={label + " filters"}>
        {options.length ? options.map(value => (
          <label className="filter-picker-option" key={value}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              aria-label={label + ": " + value}
            />
            <span>{value}</span>
          </label>
        )) : <span className="filter-picker-empty">No classified values yet</span>}
      </div>
    </details>
  );
}

function socialGlyph(label: string): string {
  const value = label.toLowerCase();
  if (value.includes("linkedin")) return "in";
  if (value === "x" || value.includes("twitter")) return "𝕏";
  if (value.includes("steam")) return "S";
  if (value.includes("youtube")) return "▶";
  if (value.includes("instagram")) return "◎";
  if (value.includes("discord")) return "◉";
  if (value.includes("github")) return "⌘";
  if (value.includes("artstation")) return "A";
  if (value.includes("facebook")) return "f";
  if (value.includes("tiktok")) return "♪";
  return "↗";
}

function socialDomain(label: string): string | null {
  const value = label.toLowerCase();
  if (value.includes("linkedin")) return "linkedin.com";
  if (value === "x" || value.includes("twitter")) return "x.com";
  if (value.includes("steam")) return "steampowered.com";
  if (value.includes("youtube")) return "youtube.com";
  if (value.includes("instagram")) return "instagram.com";
  if (value.includes("discord")) return "discord.com";
  if (value.includes("github")) return "github.com";
  if (value.includes("artstation")) return "artstation.com";
  if (value.includes("facebook")) return "facebook.com";
  if (value.includes("tiktok")) return "tiktok.com";
  return null;
}

function SocialIcon({ label }: { label: string }) {
  const [failed, setFailed] = useState(false);
  const domain = socialDomain(label);
  return domain && !failed ? (
    <img src={"https://www.google.com/s2/favicons?domain=" + encodeURIComponent(domain) + "&sz=64"}
      alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
  ) : <span aria-hidden="true">{socialGlyph(label)}</span>;
}

export default function StudioDirectory({
  applications,
  onSave,
  onOpenTracker,
}: {
  applications: TrackedApplication[];
  onSave: (
    studio: Studio,
    location: { country: string; countryCode: string; hqLabel: string; applicationLocation: string },
  ) => void;
  onOpenTracker: (studioName: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [continent, setContinent] = useState<ContinentLabel | "All continents">("All continents");
  const [country, setCountry] = useState("All countries");
  const [workModel, setWorkModel] = useState("all");
  const [scaleFilters, setScaleFilters] = useState<string[]>([]);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [focusFilters, setFocusFilters] = useState<string[]>([]);
  const [roleFilters, setRoleFilters] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [expandedStudio, setExpandedStudio] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const activeStudios = useMemo(
    () => studios.filter((studio) => studio.applicationResearch?.routeStatus === "active") as Studio[],
    [],
  );

  const countries = useMemo(
    () =>
      Array.from(
        new Set(
          activeStudios.flatMap((studio) =>
            countryPartsFor(profiles[studio.name]?.headquarters?.country || studio.country),
          ),
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

  const scaleOptions = useMemo(
    () => SCALE_ORDER.filter(value => activeStudios.some(studio => profiles[studio.name]?.scale === value)),
    [activeStudios],
  );
  const platformOptions = useMemo(
    () => orderedTags(
      [...new Set(activeStudios.flatMap(studio => profiles[studio.name]?.platforms || []))],
      PLATFORM_ORDER,
    ),
    [activeStudios],
  );
  const focusOptions = useMemo(
    () => orderedTags(
      [...new Set(activeStudios.flatMap(studio => profiles[studio.name]?.gameFocus || []))],
      FOCUS_ORDER,
    ),
    [activeStudios],
  );
  const roleOptions = useMemo(
    () => ROLE_ORDER.filter(value => activeStudios.some(studio => profiles[studio.name]?.studioRoles?.includes(value))),
    [activeStudios],
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matchesFacet = (selected: string[], available: string[]) =>
      selected.length === 0 || selected.some(value => available.includes(value));

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
        ...(profile?.studioRoles || []),
        ...(profile?.platforms || []),
        ...(profile?.gameFocus || []),
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
        (country === "All countries" || countryPartsFor(studioCountry).includes(country)) &&
        (workModel === "all" || routeWorkModel === workModel) &&
        matchesFacet(scaleFilters, profile?.scale ? [profile.scale] : []) &&
        matchesFacet(platformFilters, profile?.platforms || []) &&
        matchesFacet(focusFilters, profile?.gameFocus || []) &&
        matchesFacet(roleFilters, profile?.studioRoles || []) &&
        (!showNewOnly || isNewStudio(studio, now))
      );
    });

    const sortValue = (studio: Studio): string => {
      const profile = profiles[studio.name];
      switch (sortKey) {
        case "location":
          return locationSortFor(studio);
        case "popularWork":
          return profile?.popularGames?.[0]?.title || "";
        case "scale":
          return profile?.scale || "";
        case "role":
          return orderedTags(profile?.studioRoles || [], ROLE_ORDER).join(" ");
        case "platform":
          return orderedTags(profile?.platforms || [], PLATFORM_ORDER).join(" ");
        case "focus":
          return orderedTags(profile?.gameFocus || [], FOCUS_ORDER).join(" ");
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
  }, [
    activeStudios, continent, country, focusFilters, platformFilters, query,
    roleFilters, scaleFilters, showNewOnly, sortDirection, sortKey, workModel,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, continent, country, workModel, scaleFilters, platformFilters, focusFilters, roleFilters, sortKey, sortDirection, showNewOnly]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = Math.min(currentPage * pageSize, filtered.length);
  const visibleStudios = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tracked = new Set(applications.map((application) => application.studioName));
  const activeFilterCount =
    (continent !== "All continents" ? 1 : 0) +
    (country !== "All countries" ? 1 : 0) +
    scaleFilters.length + platformFilters.length + focusFilters.length + roleFilters.length +
    (workModel !== "all" ? 1 : 0) + (showNewOnly ? 1 : 0);

  function resetFilters() {
    setQuery("");
    setContinent("All continents");
    setCountry("All countries");
    setWorkModel("all");
    setScaleFilters([]);
    setPlatformFilters([]);
    setFocusFilters([]);
    setRoleFilters([]);
    setSortKey("name");
    setSortDirection("asc");
    setShowNewOnly(false);
    setExpandedStudio(null);
  }

  function toggleSelected(setValues: (next: string[] | ((current: string[]) => string[])) => void, value: string) {
    setValues(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
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
    if (target instanceof HTMLElement && target.closest("a, button, input, select, label, summary")) return;
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
          <p>Find studios by scale, platforms and the games they make.</p>
        </div>
        <div className="page-count">
          <strong>{filtered.length}</strong>
          <span>of {activeStudios.length} studios</span>
        </div>
      </div>

      <DiscoveryStatus showNewOnly={showNewOnly} onToggleNewOnly={setShowNewOnly} />

      <div className="directory-toolbar">
        <div className="directory-primary-filters">
          <label className="form-field search-field">
            <span>Search</span>
            <input className="form-control" type="search" value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Studio, game, location or focus" />
          </label>
          <label className="form-field">
            <span>Continent</span>
            <select className="form-select" value={continent} onChange={(event) => setContinent(event.target.value as ContinentLabel | "All continents")}>
              <option>All continents</option>
              {continents.map((value) => <option key={value} value={value}>{continentEmoji(value)} {value}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Country</span>
            <select className="form-select" value={country} onChange={(event) => setCountry(event.target.value)}>
              <option>All countries</option>
              {countries.map((value) => <option key={value} value={value}>{countryFlagFor(value)} {value}</option>)}
            </select>
          </label>
        </div>
        <div className="directory-filter-row" aria-label="Studio filters">
          <FilterPicker label="Scale" emoji="📈" options={[...scaleOptions]} selected={scaleFilters} onToggle={value => toggleSelected(setScaleFilters, value)} />
          <FilterPicker label="Platform" emoji="🖥️" options={platformOptions} selected={platformFilters} onToggle={value => toggleSelected(setPlatformFilters, value)} />
          <FilterPicker label="Focus" emoji="🎯" options={focusOptions} selected={focusFilters} onToggle={value => toggleSelected(setFocusFilters, value)} />
          <FilterPicker label="Studio role" emoji="🏢" options={[...roleOptions]} selected={roleFilters} onToggle={value => toggleSelected(setRoleFilters, value)} />
          <label className="form-field work-model-filter">
            <span>Work model</span>
            <select className="form-select" value={workModel} onChange={(event) => setWorkModel(event.target.value)}>
              <option value="all">All work models</option>
              {Object.entries(workModelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button className="btn btn-outline-secondary btn-sm reset-filters-button" type="button" onClick={resetFilters}>Reset filters</button>
        </div>
      </div>
      {activeFilterCount > 0 ? (
        <div className="active-filter-chips" aria-label="Active filters">
          {continent !== "All continents" ? (
            <button type="button" onClick={() => setContinent("All continents")} className="active-filter-chip">🌎 {continent} <span aria-hidden="true">×</span></button>
          ) : null}
          {country !== "All countries" ? (
            <button type="button" onClick={() => setCountry("All countries")} className="active-filter-chip">{countryFlagFor(country)} {country} <span aria-hidden="true">×</span></button>
          ) : null}
          {scaleFilters.map(value => (
            <button type="button" key={"scale-" + value} onClick={() => toggleSelected(setScaleFilters, value)} className="active-filter-chip">Scale · {value} <span aria-hidden="true">×</span></button>
          ))}
          {platformFilters.map(value => (
            <button type="button" key={"platform-" + value} onClick={() => toggleSelected(setPlatformFilters, value)} className="active-filter-chip">{platformEmoji(value)} {value} <span aria-hidden="true">×</span></button>
          ))}
          {focusFilters.map(value => (
            <button type="button" key={"focus-" + value} onClick={() => toggleSelected(setFocusFilters, value)} className="active-filter-chip">{focusEmoji(value)} {value} <span aria-hidden="true">×</span></button>
          ))}
          {roleFilters.map(value => (
            <button type="button" key={"role-" + value} onClick={() => toggleSelected(setRoleFilters, value)} className="active-filter-chip">{value} <span aria-hidden="true">×</span></button>
          ))}
          {workModel !== "all" ? (
            <button type="button" onClick={() => setWorkModel("all")} className="active-filter-chip">Work model · {workModelLabels[workModel]} <span aria-hidden="true">×</span></button>
          ) : null}
          {showNewOnly ? (
            <button type="button" onClick={() => setShowNewOnly(false)} className="active-filter-chip">✨ New studios <span aria-hidden="true">×</span></button>
          ) : null}
        </div>
      ) : null}

      <div className="table-meta">
        <span>Click a studio row to see its profile and official links</span>
        <span>{filtered.length} results</span>
      </div>

      <div className="table-wrap">
        <table className="table table-sm table-hover align-middle studio-table mb-0">
          <thead>
            <tr>
              {renderSortHeader("name", "Studio")}
              {renderSortHeader("location", "Location")}
              {renderSortHeader("popularWork", "Notable work")}
              {renderSortHeader("scale", "Scale")}
              {renderSortHeader("role", "Studio role")}
              {renderSortHeader("platform", "Platform")}
              {renderSortHeader("focus", "Focus")}
              <th scope="col">Tracker</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudios.map((studio) => {
              const profile = profiles[studio.name];
              const studioCountry = profile?.headquarters?.country || studio.country || "Not stated";
              const countryCode = profile?.headquarters?.countryCode || "";
              const studioLocation = [profile?.headquarters?.city, studioCountry].filter(Boolean).join(", ");
              const studioHeadquarters =
                [profile?.headquarters?.city, profile?.headquarters?.country].filter(Boolean).join(", ") ||
                profile?.headquarters?.label || "Not stated";
              const routeWorkModel = studio.applicationResearch?.workModel || "not_stated";
              const isTracked = tracked.has(studio.name);
              const isNew = isNewStudio(studio);
              const flag = countryFlagFor(studioCountry, countryCode);
              const notableGames = profile?.popularGames?.slice(0, 1) || [];
              const profileGames = profile?.popularGames?.slice(0, 3) || [];
              const platforms = orderedTags(profile?.platforms || [], PLATFORM_ORDER);
              const focus = orderedTags(profile?.gameFocus || [], FOCUS_ORDER);
              const roles = orderedTags(profile?.studioRoles || [], ROLE_ORDER);
              const studioContinents = continentsForLocation(studioCountry, countryCode);
              const isExpanded = expandedStudio === studio.name;
              const detailId = "studio-details-" + studioId(studio.name);
              const aboutText = [profile?.description, profile?.reachHighlights].filter(Boolean).join(" ");

              return (
                <Fragment key={studio.name}>
                  <tr
                    className={isExpanded ? "studio-data-row is-expanded" : "studio-data-row"}
                    data-continents={studioContinents.join("|")}
                    data-scale={profile?.scale || ""}
                    data-platforms={(profile?.platforms || []).join("|")}
                    data-focus={(profile?.gameFocus || []).join("|")}
                    data-studio-roles={(profile?.studioRoles || []).join("|")}
                    data-work-model={routeWorkModel}
                    onClick={(event) => handleRowClick(event, studio.name)}
                  >
                    <td>
                      <div className="studio-identity">
                        <StudioMark name={studio.name} websiteUrl={studio.websiteUrl} />
                        <div className="studio-identity-copy">
                          <button
                            className="studio-expand-trigger"
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={detailId}
                            onClick={() =>
                              setExpandedStudio((current) => (current === studio.name ? null : studio.name))
                            }
                          >
                            <span className="expand-indicator" aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
                            <span className="studio-name">{studio.name}</span>
                          </button>
                          {isNew ? <span className="badge text-bg-warning new-studio-badge">NEW</span> : null}
                        </div>
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
                        <GamePosterStrip games={notableGames} />
                      ) : (
                        <span className="unlisted-work">Not listed</span>
                      )}
                    </td>
                    <td>
                      {profile?.scale ? <ScaleBadge scale={profile.scale} basis={profile.scaleBasis} /> : <span className="unlisted-work">Not classified</span>}
                    </td>
                    <td>{roles.length ? <TagList values={roles} kind="role" /> : <span className="unlisted-work">Not classified</span>}</td>
                    <td>{platforms.length ? <TagList values={platforms} kind="platform" /> : <span className="unlisted-work">Not classified</span>}</td>
                    <td>{focus.length ? <TagList values={focus} kind="focus" limit={3} /> : <span className="unlisted-work">Not classified</span>}</td>
                    <td>
                      <button
                        className={isTracked ? "btn btn-outline-secondary btn-sm tracker-view-button" : "btn btn-primary btn-sm"}
                        type="button"
                        onClick={() => {
                          if (isTracked) {
                            onOpenTracker(studio.name);
                            return;
                          }
                          onSave(studio, {
                            country: studioCountry,
                            countryCode,
                            hqLabel: profile?.headquarters?.city
                              ? profile.headquarters.city + " · " + (profile.headquarters.label || "Location")
                              : profile?.headquarters?.label || "Country listed",
                            applicationLocation: profile?.applicationLocation || "See official application route",
                          });
                        }}
                      >
                        {isTracked ? "↗ View in Tracker" : "＋ Save"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded ? (
                    <tr className="studio-details-row" id={detailId}>
                      <td colSpan={8}>
                        <div className="studio-details-panel studio-profile-panel">
                          <div className="studio-profile-heading">
                            <div className="studio-profile-identity">
                              <StudioMark name={studio.name} websiteUrl={studio.websiteUrl} />
                              <div className="studio-profile-heading-copy">
                                <h2>{studio.name}</h2>
                                <div className="studio-profile-heading-tags">
                                  {profile?.scale ? <ScaleBadge scale={profile.scale} basis={profile.scaleBasis} /> : <span className="scale-unclassified">Scale not classified</span>}
                                  {(profile?.studioRoles || []).map(role => <span className="studio-role-tag" key={role}>{role}</span>)}
                                </div>
                                <p>{flag ? <span className="country-flag" aria-hidden="true">{flag}</span> : null} Headquarters · {studioHeadquarters}</p>
                              </div>
                            </div>
                            <button className="studio-profile-close" type="button" onClick={() => setExpandedStudio(null)} aria-label={"Close " + studio.name + " profile"}>×</button>
                          </div>

                          <div className="studio-details-grid studio-profile-grid">
                            <div className="studio-details-main">
                              <section className="studio-detail-section">
                                <h3>About</h3>
                                <p>{aboutText || "No studio description is available in the current profile."}</p>
                              </section>
                              <section className="studio-detail-section">
                                <h3>Notable work <span className="section-count">· selected titles</span></h3>
                                {profileGames.length > 0 ? (
                                  <div className="game-poster-grid">
                                    {profileGames.map((game) => <GamePoster game={game} key={game.title} />)}
                                  </div>
                                ) : (
                                  <p className="detail-muted">No game titles are listed in this profile.</p>
                                )}
                              </section>
                            </div>

                            <aside className="studio-details-facts">
                              <section className="studio-detail-section">
                                <h3>Platforms</h3>
                                <TagList values={platforms} kind="platform" />
                              </section>
                              <section className="studio-detail-section">
                                <h3>Focus</h3>
                                <TagList values={focus} kind="focus" limit={8} />
                              </section>
                              <section className="studio-detail-section">
                                <h3>Studio details</h3>
                                <dl className="studio-facts-list studio-facts-compact">
                                  <div>
                                    <dt>Team size</dt>
                                    <dd>{profile?.teamSize || "Not stated"}{profile?.teamSizeAsOf ? <small> · checked {profile.teamSizeAsOf}</small> : null}</dd>
                                  </div>
                                  {profile?.ownership ? (
                                    <div>
                                      <dt>Ownership</dt>
                                      <dd className="ownership-value">
                                      {hasKnownCompanyMark(profile.ownership)
                                        ? <CompanyMarks value={profile.ownership} />
                                        : profile.ownership}
                                    </dd>
                                    </div>
                                  ) : null}
                                  {profile?.parentCompany ? (
                                    <div>
                                      <dt>Parent company</dt>
                                      <dd className="ownership-value">
                                      {hasKnownCompanyMark(profile.parentCompany)
                                        ? <CompanyMarks value={profile.parentCompany} />
                                        : profile.parentCompany}
                                    </dd>
                                    </div>
                                  ) : null}
                                  {profile?.otherLocations?.length ? (
                                    <div><dt>Other locations</dt><dd>{profile.otherLocations.join(" · ")}</dd></div>
                                  ) : null}
                                </dl>
                              </section>
                            </aside>
                          </div>

                          <div className="studio-profile-links">
                            <a className="studio-primary-link" href={studio.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <span aria-hidden="true">🌐</span> Official website <span className="external-link-mark" aria-hidden="true">↗</span>
                            </a>
                            <a className="studio-primary-link" href={studio.applicationUrl} target="_blank" rel="noopener noreferrer">
                              <span aria-hidden="true">📨</span> Application <span className="external-link-mark" aria-hidden="true">↗</span>
                            </a>
                            {(profile?.socialLinks || []).map((link) => (
                              <a
                                className="studio-social-icon"
                                href={link.url}
                                key={link.label + link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={link.label}
                                title={link.label}
                              >
                                <SocialIcon label={link.label} />
                              </a>
                            ))}
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
                <td className="empty-table" colSpan={5}>
                  No studios match these filters. Remove an active filter or reset the filters to see more studios.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="directory-pagination" aria-label="Studio result pages">
        <span className="directory-pagination-summary">
          Showing <strong>{pageStart}–{pageEnd}</strong> of <strong>{filtered.length}</strong> studios
        </span>
        <label className="directory-page-size">
          <span>Rows</span>
          <select className="form-select form-select-sm" aria-label="Rows per page" value={pageSize}
            onChange={(event) => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}>
            <option value={25}>25</option><option value={50}>50</option><option value={100}>100</option>
          </select>
          <span>per page</span>
        </label>
        <div className="directory-page-controls">
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1} aria-label="First page">«</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={currentPage <= 1}>Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages}>Next</button>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} aria-label="Last page">»</button>
        </div>
      </div>

      <p className="directory-note">
        Location and flags reflect the recorded headquarters, or the primary location listed in the profile when HQ is unknown. They do not indicate hiring eligibility or a guaranteed work location.
      </p>
    </section>
  );
}
