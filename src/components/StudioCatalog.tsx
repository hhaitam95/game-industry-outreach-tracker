import { useMemo, useState } from "react";
import { STUDIO_CATALOG_DATA, STUDIO_PROFILES, searchStudioProfiles } from "../lib/studios/catalog.mjs";
import OpportunityExplorer from "./OpportunityExplorer";
import { OPPORTUNITY_SNAPSHOT } from "../lib/opportunities/snapshot.mjs";

const creditLabels: Record<string, string> = {
  developer: "Developer",
  "co-developer": "Co-developer",
  publisher: "Publisher",
  porting: "Porting",
  support: "Support",
  other: "Other credit",
};

export default function StudioCatalog() {
  const [query, setQuery] = useState("");
  const studios = useMemo(() => searchStudioProfiles(query), [query]);

  return (
    <section className="catalog-page" aria-labelledby="studio-catalog-title">
      <div className="catalog-intro">
        <span className="eyebrow">PHASE 5A · STUDIO RESEARCH</span>
        <h2 id="studio-catalog-title">A small, sourced starting list</h2>
        <p>
          Four hand-curated studios with official websites, career entry points, known titles, locations, and source
          evidence. Role links below come from a bundled snapshot and do not prove that a role is open. This is a studio
          registry, not a live list of vacancies.
        </p>
      </div>

      <div className="catalog-toolbar">
        <label className="catalog-search-label" htmlFor="studio-search">
          Search studios
          <input
            id="studio-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, location, owner, or game"
            autoComplete="off"
          />
        </label>
        <p className="catalog-count" role="status" aria-live="polite">
          Showing {studios.length} of {STUDIO_PROFILES.length} studios
        </p>
      </div>

      {studios.length === 0 ? (
        <div className="catalog-empty" role="status">
          <h3>No studios match this search</h3>
          <p>Try a studio name, city, country, ownership name, or game title.</p>
          <button className="button button-secondary" type="button" onClick={() => setQuery("")}>
            Clear search
          </button>
        </div>
      ) : (
        <div className="catalog-grid">
          {studios.map((studio) => {
            const opportunityCount =
              OPPORTUNITY_SNAPSHOT?.opportunities.filter((role) => role.studioId === studio.id).length ?? null;
            const verifiedCareersRoute = studio.routes.find((route) => route.status === "verified");
            return (
              <article className="studio-card" key={studio.id}>
                <div className="studio-card-heading">
                  <div>
                    <h3>{studio.name}</h3>
                    <span className="studio-type">
                      {studio.businessType === "game-developer-publisher" ? "Developer · Publisher" : "Game developer"}
                    </span>
                  </div>
                  <span className="studio-reviewed">Reviewed {STUDIO_CATALOG_DATA.cataloguedOn}</span>
                </div>

                <p className="studio-summary">{studio.summary}</p>

                <section className="studio-facts" aria-label={studio.name + " details"}>
                  <div>
                    <h4>Locations</h4>
                    {studio.sites.length ? (
                      <ul className="catalog-tag-list">
                        {studio.sites.map((site) => (
                          <li key={site.id}>
                            {site.city}, {site.region ? site.region + ", " : ""}
                            {site.country}
                            <span className="studio-site-kind">{site.siteType}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="studio-unknown">No location recorded in the starter sources.</p>
                    )}
                  </div>

                  <div>
                    <h4>Ownership relationship</h4>
                    {studio.ownershipRelationships.length ? (
                      <ul className="catalog-tag-list">
                        {studio.ownershipRelationships.map((relationship) => (
                          <li key={relationship.id}>
                            {relationship.ownerName}
                            <span className="studio-site-kind">
                              {relationship.relationshipType.replaceAll("-", " ")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="studio-unknown">
                        Not verified in this starter entry; this does not imply independent ownership.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4>Selected game credits</h4>
                    <ul className="catalog-credit-list">
                      {studio.credits.map((credit) => (
                        <li key={credit.id}>
                          <span>{credit.gameTitle}</span>
                          <span className="credit-role">{creditLabels[credit.role] ?? "Other credit"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>

                <div className="studio-actions">
                  <a href={studio.officialWebsiteUrl} target="_blank" rel="noopener noreferrer">
                    Official website <span aria-hidden="true">↗</span>
                  </a>
                  {studio.routes.map((route) => (
                    <a key={route.id} href={route.url} target="_blank" rel="noopener noreferrer">
                      {route.label} <span aria-hidden="true">↗</span>
                      <span
                        className={route.status === "verified" ? "route-status route-status-verified" : "route-status"}
                      >
                        {route.status === "verified" ? "Verified" : route.status}
                      </span>
                    </a>
                  ))}
                </div>

                <div className="studio-opportunity-coverage" aria-label={studio.name + " opportunity coverage"}>
                  {opportunityCount === null ? (
                    <>
                      <p>
                        <strong>Manual check needed.</strong> The opportunity snapshot is unavailable; check the
                        official careers page directly.
                      </p>
                      {verifiedCareersRoute ? (
                        <a href={verifiedCareersRoute.url} target="_blank" rel="noopener noreferrer">
                          {verifiedCareersRoute.label}
                        </a>
                      ) : null}
                    </>
                  ) : opportunityCount > 0 ? (
                    <p>Link monitoring: {opportunityCount} roles last seen (partial; closure cannot be detected)</p>
                  ) : (
                    <>
                      <p>
                        <strong>Manual check needed.</strong> No roles observed from this source. Check the careers page
                        directly.
                      </p>
                      {verifiedCareersRoute ? (
                        <a href={verifiedCareersRoute.url} target="_blank" rel="noopener noreferrer">
                          {verifiedCareersRoute.label}
                        </a>
                      ) : null}
                    </>
                  )}
                </div>

                <details className="studio-sources">
                  <summary>Evidence and sources ({studio.sourceIds.length})</summary>
                  <ul>
                    {studio.sourceIds.map((sourceId) => {
                      const source = STUDIO_CATALOG_DATA.sources.find((item) => item.id === sourceId);
                      if (!source) return null;
                      return (
                        <li key={source.id}>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.label}
                          </a>
                          <span>
                            {source.sourceType.replaceAll("-", " ")} · accessed {source.accessedOn}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              </article>
            );
          })}
        </div>
      )}

      <p className="catalog-boundary-note">
        The studio catalogue is manually maintained. The explorer uses a bundled snapshot and never fetches career sites
        or role data at runtime. Snapshot status and last-seen dates do not prove that a role is open.
      </p>
      <OpportunityExplorer />
    </section>
  );
}
