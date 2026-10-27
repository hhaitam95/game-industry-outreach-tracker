import type { filterOpportunities } from "../lib/opportunities/filter.mjs";

type PreparedOpportunity = ReturnType<typeof filterOpportunities>["roles"][number];

export function displayDate(value: string | null | undefined) {
  return value && Number.isFinite(Date.parse(value)) ? value.slice(0, 10) : "Not listed in source";
}

function displayStatus(status: string) {
  return status === "last-seen" ? "Last seen" : status.replaceAll("-", " ");
}

type Props = {
  role: PreparedOpportunity;
  synthetic: boolean;
};

export default function OpportunityRoleCard({ role, synthetic }: Props) {
  return (
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
          {synthetic ? "Open placeholder URL" : "Open official posting"} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}
