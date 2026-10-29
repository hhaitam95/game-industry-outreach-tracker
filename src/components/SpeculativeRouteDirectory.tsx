import { useMemo, useState } from "react";
import {
  SPECULATIVE_ROUTE_DIRECTORY,
  SPECULATIVE_ROUTE_DIRECTORY_ERROR,
  SPECULATIVE_ROUTE_DIRECTORY_ORIGIN,
} from "../lib/speculative-routes/validation.mjs";
import { selectSpeculativeRoutes } from "../lib/speculative-routes/directory-model.mjs";
import type { RoleLeadPrefillData } from "./workspace.types";
import "./speculative-route-directory.css";

type Directory = NonNullable<typeof SPECULATIVE_ROUTE_DIRECTORY>;

const COUNTRY_NAMES: Record<string, string> = {
  GB: "United Kingdom",
  DE: "Germany",
  DK: "Denmark",
  TR: "Türkiye",
};

function formatDate(value: string | null) {
  if (!value) return "Not recorded";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function eligibilityLabel(route: { countryScope: string; countryCodes: string[] }) {
  if (route.countryScope === "worldwide") return "Worldwide";
  if (route.countryScope === "unknown") return "Check the application page";
  if (route.countryCodes.length === 28 && route.countryCodes.includes("GB")) {
    return "United Kingdom + EU";
  }
  if (route.countryCodes.length <= 3) {
    return route.countryCodes.map((code) => COUNTRY_NAMES[code] ?? code).join(", ");
  }
  return `${route.countryCodes.slice(0, 3).join(", ")} +${route.countryCodes.length - 3} more`;
}

function statusLabel(status: string) {
  return status.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function SpeculativeRouteDirectory({
  onTrackRoute,
  directory = SPECULATIVE_ROUTE_DIRECTORY,
  origin = SPECULATIVE_ROUTE_DIRECTORY_ORIGIN,
  loadError = SPECULATIVE_ROUTE_DIRECTORY_ERROR,
}: {
  onTrackRoute: (lead: RoleLeadPrefillData) => void;
  directory?: Directory | null;
  origin?: "curated" | "sample";
  loadError?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const result = useMemo(
    () =>
      directory
        ? selectSpeculativeRoutes(directory, {
            query,
            sort: "studio-asc",
            page,
            pageSize: 25,
          })
        : null,
    [directory, query, page],
  );

  const isSynthetic = origin === "sample";

  return (
    <section className="route-directory" aria-labelledby="route-directory-title">
      <div className="route-directory-intro">
        <span className="eyebrow">WORLDWIDE · OFFICIAL SOURCES</span>
        <h2 id="route-directory-title">Speculative applications</h2>
        <p>
          Game studios that invite applications beyond their advertised vacancies. Open the official route to check the
          current instructions, then add it to your application tracker when you are ready.
        </p>
      </div>

      {isSynthetic ? (
        <div className="route-directory-notice" role="note" data-testid="route-directory-sample-notice">
          <strong>Sample data only</strong>
          <p>
            These illustrative records are not real opportunities. They cannot be added to your application tracker.
          </p>
        </div>
      ) : null}

      {loadError || !directory || !result ? (
        <div className="route-directory-error" role="alert">
          <h3>The speculative application list could not be loaded</h3>
          <p>{loadError || "No validated route directory is available."}</p>
        </div>
      ) : (
        <>
          <div className="route-directory-toolbar">
            <label className="route-directory-search" htmlFor="route-search">
              Search studios and application routes
              <input
                autoComplete="off"
                id="route-search"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Studio, country, discipline, or evidence…"
                type="search"
                value={query}
              />
            </label>
          </div>

          <p className="route-directory-result-count" role="status" aria-live="polite">
            {result.totalCount} application route{result.totalCount === 1 ? "" : "s"} found
          </p>

          {result.items.length ? (
            <div className="route-directory-list">
              {result.items.map((route) => {
                const studio = directory.studios.find((item) => item.id === route.studioId);
                const blockedBySample = isSynthetic;
                return (
                  <article className="route-directory-card" data-testid="speculative-route-card" key={route.id}>
                    <div className="route-directory-card-heading">
                      <div>
                        <h3>{route.studioName}</h3>
                        <p className="route-directory-id">
                          {studio?.homeCountryCode
                            ? (COUNTRY_NAMES[studio.homeCountryCode] ?? studio.homeCountryCode)
                            : "Studio location not recorded"}
                        </p>
                      </div>
                      <span className={"route-directory-status route-directory-status-" + route.status}>
                        {statusLabel(route.status)}
                      </span>
                    </div>

                    <dl className="route-directory-metadata">
                      <div>
                        <dt>Eligibility</dt>
                        <dd>{eligibilityLabel(route)}</dd>
                      </div>
                      <div>
                        <dt>Work model</dt>
                        <dd>{route.workModel === "not-stated" ? "Not stated" : route.workModel}</dd>
                      </div>
                      <div>
                        <dt>Application route</dt>
                        <dd>{route.routeType.replaceAll("-", " ")}</dd>
                      </div>
                    </dl>

                    <div className="route-directory-evidence">
                      <h4>Why it is listed</h4>
                      <p>{route.evidenceSummary}</p>
                    </div>

                    <p className="route-directory-date">Official page checked {formatDate(route.lastCheckedAt)}</p>

                    <div className="route-directory-links">
                      <a href={route.routeUrl} rel="noopener noreferrer" target="_blank">
                        Open application page <span aria-hidden="true">↗</span>
                      </a>
                      {studio ? (
                        <a href={studio.officialWebsiteUrl} rel="noopener noreferrer" target="_blank">
                          Studio website <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                    </div>

                    <div className="route-directory-actions">
                      <button
                        className="button button-primary"
                        data-testid="track-application-route"
                        disabled={blockedBySample}
                        onClick={() =>
                          onTrackRoute({
                            studioId: "",
                            studioName: route.studioName,
                            roleTitle: "Speculative application",
                            applicationUrl: route.routeUrl,
                          })
                        }
                        type="button"
                      >
                        Add to application tracker
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="route-directory-empty">
              No matching application routes. Try another search, or clear the search field.
            </p>
          )}

          {result.pageCount > 1 ? (
            <nav className="route-directory-pagination" aria-label="Application route pages">
              <button
                className="button button-secondary"
                disabled={result.page <= 1}
                onClick={() => setPage(result.page - 1)}
                type="button"
              >
                Previous
              </button>
              <span>
                Page {result.page} of {result.pageCount}
              </span>
              <button
                className="button button-secondary"
                disabled={result.page >= result.pageCount}
                onClick={() => setPage(result.page + 1)}
                type="button"
              >
                Next
              </button>
            </nav>
          ) : null}
        </>
      )}
    </section>
  );
}
