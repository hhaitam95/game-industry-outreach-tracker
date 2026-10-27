import { useMemo, useState } from "react";
import {
  IS_SYNTHETIC_SNAPSHOT,
  OPPORTUNITY_SNAPSHOT,
  OPPORTUNITY_SNAPSHOT_ERROR,
} from "../lib/opportunities/snapshot.mjs";
import { filterOpportunities } from "../lib/opportunities/filter.mjs";
import { getSnapshotFreshness } from "../lib/opportunities/freshness.mjs";
import OpportunityFilters from "./OpportunityFilters";
import OpportunityRoleCard, { displayDate } from "./OpportunityRoleCard";

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
  const clearFilters = () => {
    setQuery("");
    setStudioId("");
    setFamily("");
    setSeniority("");
    setCountry("");
    setContract("");
    setFreshness("");
    setTargetOnly(false);
    resetPage();
  };

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

          <OpportunityFilters
            query={query}
            setQuery={setQuery}
            studioId={studioId}
            setStudioId={setStudioId}
            family={family}
            setFamily={setFamily}
            seniority={seniority}
            setSeniority={setSeniority}
            country={country}
            setCountry={setCountry}
            contract={contract}
            setContract={setContract}
            freshness={freshness}
            setFreshness={setFreshness}
            targetOnly={targetOnly}
            setTargetOnly={setTargetOnly}
            counts={results.counts}
            totalCount={results.totalCount}
            allRoleCount={allRoles.length}
            allFamilyCount={allFamilyCount}
            resetPage={resetPage}
          />

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
              <button className="button button-secondary" type="button" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="opportunity-results-list" data-testid="opportunity-results-list">
              {results.roles.slice(0, visibleLimit).map((role) => (
                <OpportunityRoleCard key={role.id} role={role} synthetic={IS_SYNTHETIC_SNAPSHOT} />
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
