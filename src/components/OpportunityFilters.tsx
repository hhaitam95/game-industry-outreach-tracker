import type { Dispatch, SetStateAction } from "react";
import { STUDIO_PROFILES } from "../lib/studios/catalog.mjs";
import { ROLE_FAMILY_RULES } from "../lib/opportunities/classify.mjs";
import { SENIORITY_ORDER } from "../lib/opportunities/parse.mjs";
import type { filterOpportunities } from "../lib/opportunities/filter.mjs";

type FilterCounts = ReturnType<typeof filterOpportunities>["counts"];

type Props = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  studioId: string;
  setStudioId: Dispatch<SetStateAction<string>>;
  family: string;
  setFamily: Dispatch<SetStateAction<string>>;
  seniority: string;
  setSeniority: Dispatch<SetStateAction<string>>;
  country: string;
  setCountry: Dispatch<SetStateAction<string>>;
  contract: string;
  setContract: Dispatch<SetStateAction<string>>;
  freshness: "" | "latest" | "older";
  setFreshness: Dispatch<SetStateAction<"" | "latest" | "older">>;
  targetOnly: boolean;
  setTargetOnly: Dispatch<SetStateAction<boolean>>;
  counts: FilterCounts;
  totalCount: number;
  allRoleCount: number;
  allFamilyCount: number;
  resetPage: () => void;
};

const FAMILIES = [
  ...ROLE_FAMILY_RULES.map((rule) => ({ family: rule.family, label: rule.label })),
  { family: "unclassified", label: "Unclassified" },
];

export default function OpportunityFilters({
  query,
  setQuery,
  studioId,
  setStudioId,
  family,
  setFamily,
  seniority,
  setSeniority,
  country,
  setCountry,
  contract,
  setContract,
  freshness,
  setFreshness,
  targetOnly,
  setTargetOnly,
  counts,
  totalCount,
  allRoleCount,
  allFamilyCount,
  resetPage,
}: Props) {
  return (
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
            <option value="">All studios ({allRoleCount})</option>
            {STUDIO_PROFILES.map((studio) => (
              <option key={studio.id} value={studio.id}>
                {studio.name} ({Number(counts.studios[studio.name] ?? 0)})
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
                {item} ({Number(counts.seniorities[item] ?? 0)})
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
            {Object.entries(counts.countries)
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
            <option value="">Any contract type ({totalCount})</option>
            <option value="contract">Contract mention ({counts.contract.contract})</option>
            <option value="non-contract">No contract mention ({counts.contract.nonContract})</option>
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
            <option value="">Any freshness ({totalCount})</option>
            <option value="latest">Seen in latest scan ({counts.freshness.latest})</option>
            <option value="older">Not seen in latest scan ({counts.freshness.older})</option>
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
              {item.label} ({counts.roleFamilies[item.family] ?? 0})
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
  );
}
