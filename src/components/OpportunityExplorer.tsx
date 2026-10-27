import { useMemo, useState } from "react";
import { STUDIO_PROFILES } from "../lib/studios/catalog.mjs";
import {
  IS_SYNTHETIC_SNAPSHOT,
  OPPORTUNITY_SNAPSHOT,
  OPPORTUNITY_SNAPSHOT_ERROR,
} from "../lib/opportunities/snapshot.mjs";
import { ROLE_FAMILY_RULES } from "../lib/opportunities/classify.mjs";
import { filterOpportunities } from "../lib/opportunities/filter.mjs";
import { getSnapshotFreshness } from "../lib/opportunities/freshness.mjs";
import { SENIORITY_ORDER } from "../lib/opportunities/parse.mjs";

const FAMILIES = [
  ...ROLE_FAMILY_RULES.map((rule) => ({ family: rule.family, label: rule.label })),
  { family: "unclassified", label: "Unclassified" },
];

function displayDate(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value)) ? value.slice(0, 10) : "Not listed in source";
}

function displayStatus(status: string) {
  return status === "last-seen" ? "Last seen" : status.replaceAll("-", " ");
}

export default function OpportunityExplorer() {
  const [query, setQuery] = useState("");
  const [studioId, setStudioId] = useState("");
  const [family, setFamily] = useState("");
  const [seniority, setSeniority] = useState("");
  const [country, setCountry] = useState("");
  const [contract, setContract] = useState("");
  const [freshness, setFreshness] = useState<"" | "latest" | "older">("");
  const [targetOnly, setTargetOnly] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(50);

  const snapshot = OPPORTUNITY_SNAPSHOT;
  const allRoles = snapshot?.opportunities ?? [];
  const generatedAt = snapshot?.generatedAt ?? "";
  const snapshotAge = getSnapshotFreshness(generatedAt);
  const results = useMemo(
    () =>
      filterOpportunities(allRoles, {
        generatedAt,
        studioId,
        family,
        seniority,
        country,
        contract: contract === "" ? null : contract === "contract",
        freshness,
        query,
        targetFamiliesOnly: targetOnly,
      }),
    [allRoles, generatedAt, studioId, family, seniority, country, contract, freshness, query, targetOnly],
  );
  const allFamilyCount = Object.values(results.counts.roleFamilies).reduce<number>(
    (sum, value) => sum + Number(value),
    0,
  );
  const invalidSnapshot = snapshot === null || OPPORTUNITY_SNAPSHOT_ERROR !== null;
  const resetPage = () => setVisibleLimit(50);

  return (
    <section
      className="opportunity-explorer"
      aria-labelledby="opportunity-explorer-title"
      data-testid="opportunity-explorer"
    >
      <div className="opportunity-explorer-intro">
        <div>
          <span className="eyebrow">PHASE 5A · BUNDLED ROLE SNAPSHOT</span>
          <h2 id="opportunity-explorer-title">Opportunity explorer</h2>
          <p>
            Browse public role links from a reviewed snapshot. Career sites and role data are not fetched at runtime.
          </p>
        </div>
        {snapshot ? (
          <div className={snapshotAge.tone === "warning" ? "snapshot-age snapshot-age-warning" : "snapshot-age"}>
            <span>Snapshot generated</span>
            <time data-testid="snapshot-generated-at" dateTime={snapshot.generatedAt}>
              {displayDate(snapshot.generatedAt)}
            </time>
            <span>{snapshotAge.ageDays} days old</span>
          </div>
        ) : null}
      </div>

      {IS_SYNTHETIC_SNAPSHOT && !invalidSnapshot ? (
        <p className="snapshot-synthetic-note" role="note">
          Sample data - not a real scan. These are synthetic examples with placeholder links, not real job postings. Use
          the sync command only after the owner-run discovery workflow has completed successfully.
        </p>
      ) : null}

      {invalidSnapshot ? (
        <div className="snapshot-error-state" role="alert">
          <h3>Opportunity snapshot unavailable</h3>
          <p>
            The bundled public opportunity data failed validation. Role results are hidden until the snapshot is
            corrected. Check verified careers pages on the studio cards directly.
          </p>
        </div>
      ) : (
        <>
          <p className="opportunity-boundary-note">
            Last-seen means a link was observed by a scan; it does not prove that a role is open or currently available.
            Seniority, location, contract and relocation clues are parsed from listing text, not structured source
            fields. Work authorization and hiring eligibility are never inferred.
          </p>

          <div className="opportunity-filter-panel" aria-label="Opportunity filters">
            <label className="opportunity-search-label" htmlFor="opportunity-search">
              Search role titles
              <input
                id="opportunity-search"
                data-testid="opportunity-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  resetPage();
                }}
                placeholder="Title, team or location"
                autoComplete="off"
              />
            </label>

            <div className="opportunity-select-filters">
              <label htmlFor="opportunity-studio-filter">
                Studio
                <select
                  aria-label="Filter by studio"
                  id="opportunity-studio-filter"
                  value={studioId}
                  onChange={(event) => {
                    setStudioId(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="">All studios ({allRoles.length})</option>
                  {STUDIO_PROFILES.map((studio) => (
                    <option key={studio.id} value={studio.id}>
                      {studio.name} ({Number(results.counts.studios[studio.name] ?? 0)})
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="opportunity-seniority-filter">
                Seniority
                <select
                  aria-label="Filter by seniority"
                  id="opportunity-seniority-filter"
                  value={seniority}
                  onChange={(event) => {
                    setSeniority(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="">Any seniority</option>
                  {SENIORITY_ORDER.map((item) => (
                    <option key={item} value={item}>
                      {item} ({Number(results.counts.seniorities[item] ?? 0)})
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="opportunity-country-filter">
                Derived country
                <select
                  aria-label="Filter by country"
                  id="opportunity-country-filter"
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="">Any country</option>
                  {Object.entries(results.counts.countries)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([item, count]) => (
                      <option key={item} value={item}>
                        {item} ({Number(count)})
                      </option>
                    ))}
                </select>
              </label>
              <label htmlFor="opportunity-contract-filter">
                Contract
                <select
                  aria-label="Filter by contract mention"
                  id="opportunity-contract-filter"
                  value={contract}
                  onChange={(event) => {
                    setContract(event.target.value);
                    resetPage();
                  }}
                >
                  <option value="">Any contract type ({results.totalCount})</option>
                  <option value="contract">Contract mention ({results.counts.contract.contract})</option>
                  <option value="non-contract">No contract mention ({results.counts.contract.nonContract})</option>
                </select>
              </label>
              <label htmlFor="opportunity-freshness-filter">
                Freshness
                <select
                  aria-label="Filter by freshness"
                  id="opportunity-freshness-filter"
                  value={freshness}
                  onChange={(event) => {
                    setFreshness(event.target.value as "" | "latest" | "older");
                    resetPage();
                  }}
                >
                  <option value="">Any freshness ({results.totalCount})</option>
                  <option value="latest">Seen in latest scan ({results.counts.freshness.latest})</option>
                  <option value="older">Not seen in latest scan ({results.counts.freshness.older})</option>
                </select>
              </label>
            </div>

            <div className="opportunity-family-filter">
              <span className="filter-group-label">Role family</span>
              <div className="opportunity-filter-chips" role="group" aria-label="Filter by role family">
                <button
                  type="button"
                  className={family === "" ? "filter-chip filter-chip-active" : "filter-chip"}
                  aria-pressed={family === ""}
                  data-testid="family-filter-all"
                  onClick={() => {
                    setFamily("");
                    resetPage();
                  }}
                >
                  All families ({allFamilyCount})
                </button>
                {FAMILIES.map((item) => (
                  <button
                    key={item.family}
                    type="button"
                    className={family === item.family ? "filter-chip filter-chip-active" : "filter-chip"}
                    aria-pressed={family === item.family}
                    data-testid={"family-filter-" + item.family}
                    onClick={() => {
                      setFamily((current) => (current === item.family ? "" : item.family));
                      resetPage();
                    }}
                  >
                    {item.label} ({results.counts.roleFamilies[item.family] ?? 0})
                  </button>
                ))}
                <button
                  type="button"
                  className={
                    targetOnly ? "filter-chip filter-chip-preset filter-chip-active" : "filter-chip filter-chip-preset"
                  }
                  aria-pressed={targetOnly}
                  data-testid="target-families-only"
                  onClick={() => {
                    setTargetOnly((current) => !current);
                    resetPage();
                  }}
                >
                  Target families only
                </button>
              </div>
            </div>
          </div>

          <p
            className="opportunity-results-count"
            role="status"
            aria-live="polite"
            data-testid="opportunity-results-count"
            data-total={results.totalCount}
          >
            Showing {Math.min(visibleLimit, results.totalCount)} of {results.totalCount} role links in the snapshot
          </p>

          {results.totalCount === 0 ? (
            <div className="opportunity-empty-state" role="status">
              <h3>No roles match these filters</h3>
              <p>Clear one or more filters, or check the studio's official careers page.</p>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setQuery("");
                  setStudioId("");
                  setFamily("");
                  setSeniority("");
                  setCountry("");
                  setContract("");
                  setFreshness("");
                  setTargetOnly(false);
                  resetPage();
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="opportunity-results-list" data-testid="opportunity-results-list">
              {results.roles.slice(0, visibleLimit).map((role) => (
                <article className="opportunity-row" data-testid="opportunity-row" key={role.id}>
                  <div className="opportunity-row-heading">
                    <div className="opportunity-row-title">
                      <h3>{role.title}</h3>
                      <span className={"opportunity-status opportunity-status-" + role.status.replaceAll("-", "")}>
                        Snapshot status: {displayStatus(role.status)}
                      </span>
                    </div>
                    <div className="opportunity-family-chip">
                      <span>{role.classification.label}</span>
                      <small>
                        {role.classification.matchedPhrase
                          ? "Matched phrase: “" + role.classification.matchedPhrase + "”"
                          : "No precise keyword match"}
                      </small>
                    </div>
                  </div>
                  <dl className="opportunity-detail-grid">
                    <div>
                      <dt>Seniority (parsed from listing text)</dt>
                      <dd>{role.parsed.seniority}</dd>
                    </div>
                    <div>
                      <dt>Location (parsed from listing text)</dt>
                      <dd>{role.parsed.location?.label ?? "Not listed in source"}</dd>
                    </div>
                    <div>
                      <dt>Last seen</dt>
                      <dd>
                        <time dateTime={role.lastSeenAt}>{displayDate(role.lastSeenAt)}</time>
                      </dd>
                    </div>
                    <div>
                      <dt>Freshness</dt>
                      <dd>{role.freshness.label}</dd>
                    </div>
                    <div>
                      <dt>Employment type</dt>
                      <dd>{role.employmentType.length ? role.employmentType.join(", ") : "Not listed in source"}</dd>
                    </div>
                    <div>
                      <dt>Posted date</dt>
                      <dd>{role.datePosted ? displayDate(role.datePosted) : "Not listed in source"}</dd>
                    </div>
                  </dl>
                  <div className="opportunity-row-footer">
                    <div className="opportunity-derived-tags">
                      {role.parsed.contract ? <span>Contract mention (parsed from listing text)</span> : null}
                      {role.parsed.relocationMentioned ? (
                        <span>Relocation mention (parsed from listing text)</span>
                      ) : null}
                    </div>
                    <a className="opportunity-posting-link" href={role.url} target="_blank" rel="noopener noreferrer">
                      {IS_SYNTHETIC_SNAPSHOT ? "Open placeholder URL" : "Open official posting"}{" "}
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
          {results.totalCount > visibleLimit ? (
            <button
              className="button button-secondary opportunity-show-more"
              type="button"
              onClick={() => setVisibleLimit((current) => current + 50)}
            >
              Show more ({results.totalCount - visibleLimit} remaining)
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
