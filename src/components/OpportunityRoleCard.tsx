import { useEffect, useMemo, useState } from "react";
import type { filterOpportunities } from "../lib/opportunities/filter.mjs";
import { analyzeRoleAgainstProfile } from "../lib/opportunities/role-review.mjs";
import { STUDIO_PROFILES } from "../lib/studios/catalog.mjs";
import type { RoleLeadPrefillData, RoleReviewProfile } from "./workspace.types";

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
  profile?: RoleReviewProfile | null;
  onTrackAsLead?: (lead: RoleLeadPrefillData) => void;
  onOpenSettings?: () => void;
};

export default function OpportunityRoleCard({
  role,
  synthetic,
  profile = null,
  onTrackAsLead = () => undefined,
  onOpenSettings = () => undefined,
}: Props) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");
  const review = useMemo(
    () => (reviewOpen ? analyzeRoleAgainstProfile({ roleTitle: role.title, roleDescription, profile }) : null),
    [reviewOpen, role.title, roleDescription, profile],
  );

  useEffect(() => {
    if (!reviewOpen || !profile) setRoleDescription("");
  }, [reviewOpen, profile]);

  function trackAsLead() {
    const knownStudio = STUDIO_PROFILES.find((studio) => studio.id === role.studioId);
    onTrackAsLead({
      studioId: knownStudio?.id ?? "",
      studioName: knownStudio?.name ?? role.studioName,
      roleTitle: role.title,
      applicationUrl: role.url,
    });
  }

  return (
    <article className="opportunity-row" data-testid="opportunity-row">
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
          {role.parsed.relocationMentioned && <span>Relocation mention (parsed from listing text)</span>}
        </div>
        <a className="opportunity-posting-link" href={role.url} target="_blank" rel="noopener noreferrer">
          {synthetic ? "Open placeholder URL" : "Open official posting"} <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="role-review-entry">
        <button
          className="button button-secondary role-review-toggle"
          type="button"
          aria-expanded={reviewOpen}
          aria-controls={"role-review-" + role.id}
          onClick={() => setReviewOpen((current) => !current)}
        >
          {reviewOpen ? "Close role review" : "Review role against your profile"}
        </button>
      </div>

      {reviewOpen ? (
        <section
          className="role-review-panel"
          id={"role-review-" + role.id}
          aria-label={"Role review for " + role.title}
        >
          <p className="role-review-privacy" role="note">
            This review runs in this browser tab. The profile is read from your unlocked local vault; pasted role text
            is temporary and is not saved, sent, or added to public opportunity data.
          </p>
          {!profile ? (
            <div className="role-review-locked">
              <h4>Unlock your profile to compare role context</h4>
              <p>
                Role browsing still works without a profile. Create or unlock your local vault in Settings, then return
                here.
              </p>
              <button className="button button-secondary" type="button" onClick={onOpenSettings}>
                Open Settings
              </button>
            </div>
          ) : (
            <>
              <p className="role-review-evidence-note">
                Evidence used: role title, the optional description below, and your saved profile headline, summary,
                target roles and skills. No job-page text is fetched automatically.
              </p>
              <label className="role-review-description" htmlFor={"role-description-" + role.id}>
                Optional full role description
                <textarea
                  id={"role-description-" + role.id}
                  maxLength={150_000}
                  rows={7}
                  value={roleDescription}
                  onChange={(event) => setRoleDescription(event.target.value)}
                  placeholder="Paste public role text here for a more useful comparison. Avoid adding personal candidate data."
                />
                <small>
                  Up to 150,000 characters. Text remains in this panel's memory only and is cleared when you close it.
                </small>
              </label>
              <div className="role-review-grid">
                <section>
                  <h4>Relevant phrases found</h4>
                  <p>
                    Literal mentions from your saved target roles and listed skills that also appear in the role text.
                  </p>
                  {review && review.matchedTargetRoles.length + review.matchedSkills.length > 0 ? (
                    <ul>
                      {review.matchedTargetRoles.map((item) => (
                        <li key={"role-" + item}>
                          {item} <span>· target role</span>
                        </li>
                      ))}
                      {review.matchedSkills.map((item) => (
                        <li key={"skill-" + item}>
                          {item} <span>· listed skill</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="role-review-muted">
                      No literal target-role or skill matches found in the available text. This is not proof of poor
                      fit.
                    </p>
                  )}
                </section>
                <section>
                  <h4>Terms not mentioned in your profile</h4>
                  {!review?.hasRoleDescription ? (
                    <p className="role-review-muted">
                      Paste the role description above to check which role terms are absent from the profile text.
                    </p>
                  ) : review.termsNotMentioned.length ? (
                    <>
                      <p>
                        These words appear in the pasted description but not in your saved profile. They are prompts to
                        review, not skill-gap findings.
                      </p>
                      <ul>
                        {review.termsNotMentioned.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="role-review-muted">
                      No additional terms were identified by this simple text comparison. Review the full description
                      manually.
                    </p>
                  )}
                </section>
              </div>
              <section className="role-review-unknowns">
                <h4>Questions to verify before acting</h4>
                <ul>
                  <li>Is the posting still live on the official site?</li>
                  <li>Which requirements are essential versus preferred?</li>
                  <li>Does the hiring location support your work and relocation circumstances?</li>
                  <li>Does the official application route require a form or specific materials?</li>
                </ul>
              </section>
              <p className="role-review-caveat">
                This is a transparent text comparison, not a fit score or eligibility assessment. Missing phrases do not
                mean you lack the skill; source coverage and vacancy status may be incomplete.
              </p>
              <div className="role-review-actions">
                {synthetic ? (
                  <p className="role-review-muted">Lead handoff is disabled for synthetic sample links.</p>
                ) : (
                  <button className="button button-primary" type="button" onClick={trackAsLead}>
                    Track as a lead in Applications
                  </button>
                )}
                <button className="button button-secondary" type="button" onClick={onOpenSettings}>
                  Review or update profile
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}
    </article>
  );
}
