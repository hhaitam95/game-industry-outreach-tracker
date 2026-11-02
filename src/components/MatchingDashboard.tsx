import { useCallback, useEffect, useMemo, useState } from "react";
import type { CandidateProfile } from "../profile/profile.types";
import {
  loadCandidateProfile,
} from "../profile/profile-storage";
import {
  assessStudioMatch,
  resolveStudioLocation,
  sortStudioMatches,
} from "../matching/matching-engine.mjs";

type StudioMatchAssessment = ReturnType<typeof assessStudioMatch>;
import studiosJson from "../data/speculative-route-directory.json" with { type: "json" };
import profilesJson from "../data/studio-profiles.json" with { type: "json" };
import { continentsForLocation } from "./location";
import StudioMark from "./StudioMark";
import "./matching.css";

type DirectoryStudio = {
  name: string;
  country?: string;
  websiteUrl?: string;
  applicationUrl?: string;
  evidenceUrl?: string;
  checkedAt?: string;
  notes?: string;
  applicationResearch?: {
    routeType?: string;
    submissionMethods?: string[];
    workModel?: string;
    eligibleLocations?: string[];
    disciplineScope?: string[];
    routeStatus?: string;
    nextReviewAt?: string | null;
  };
};

type StudioProfile = {
  description?: string;
  headquarters?: {
    city?: string | null;
    country?: string;
    countryCode?: string | null;
  } | null;
  companyType?: string[];
  industryScale?: string;
  scale?: string;
  studioRoles?: string[];
  platforms?: string[];
  gameFocus?: string[];
  focus?: string[];
  popularGames?: { title: string }[];
};

const studios = studiosJson as DirectoryStudio[];
const studioProfiles = profilesJson as Record<string, StudioProfile>;

type RelevanceFilter = "all" | "strong" | "potential" | "weak" | "not_assessed";
type PriorityFilter = "all" | "high" | "preferred" | "neutral" | "low";
type RouteFilter = "all" | "active" | "needs_verification";
type SortMode = "relevance" | "priority" | "name";

const relevanceLabels: Record<RelevanceFilter, string> = {
  all: "All relevance levels",
  strong: "Strong match",
  potential: "Potential match",
  weak: "Weak match",
  not_assessed: "Needs profile details",
};

const priorityLabels: Record<PriorityFilter, string> = {
  all: "All priorities",
  high: "High personal priority",
  preferred: "Preferred",
  neutral: "Neutral",
  low: "Lower priority",
};

const evidenceLabels: Record<string, string> = {
  demonstrated: "Demonstrated",
  transferable: "Transferable",
  learning_exposure: "Learning / exposure",
};

function formatDate(value?: string): string {
  if (!value) return "Not recorded";
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + "T12:00:00" : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function labelFromKey(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function platformIcon(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("pc")) return "💻";
  if (normalized.includes("mobile")) return "📱";
  if (normalized.includes("vr")) return "🥽";
  if (normalized.includes("console")) return "🎮";
  return "🕹️";
}

function focusIcon(value: string): string {
  const normalized = value.toLowerCase();
  if (normalized.includes("horror")) return "👻";
  if (normalized.includes("strategy")) return "🧠";
  if (normalized.includes("narrative")) return "📖";
  if (normalized.includes("action")) return "⚔️";
  if (normalized.includes("co-op") || normalized.includes("coop")) return "🤝";
  return "🎯";
}

function hasProfileEvidence(profile: CandidateProfile): boolean {
  return profile.skills.some((skill) =>
    skill.name.trim() &&
    ["demonstrated", "transferable", "learning_exposure"].includes(skill.evidence),
  ) || profile.experience.some((item) => item.title.trim());
}

function buildStudioMatches(profile: CandidateProfile): StudioMatchAssessment[] {
  const activeStudios = studios.filter(
    (studio) => studio.applicationResearch?.routeStatus === "active",
  );
  return activeStudios.map((studio) => {
    const savedProfile = studioProfiles[studio.name];
    const { country, countryCode } = resolveStudioLocation(
      studio.country,
      savedProfile?.headquarters?.country,
      savedProfile?.headquarters?.countryCode || undefined,
    );
    return assessStudioMatch(profile, {
      ...studio,
      country,
      countryCode,
      continents: continentsForLocation(country, countryCode),
      profile: savedProfile,
    });
  });
}

function AssessmentDetails({ assessment }: { assessment: StudioMatchAssessment }) {
  return (
    <div className="match-details">
      <div className="match-detail-grid">
        <section>
          <h3>Professional relevance</h3>
          <ul className="match-reason-list">
            {assessment.relevanceReasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          {assessment.evidence.length ? (
            <>
              <h4>Profile evidence considered</h4>
              <ul className="match-evidence-list">
                {assessment.evidence.map((item, index) => (
                  <li key={item.name + "-" + index}>
                    <span className="match-evidence-name">{item.name}</span>
                    <span className="match-evidence-status">{evidenceLabels[item.evidence] || item.evidence}</span>
                    <span className="match-evidence-relation">
                      {item.relationship === "discipline" ? "Maps to stated discipline" : "Supporting technical context"}
                    </span>
                    {item.details ? <p>{item.details}</p> : null}
                    {item.source ? <small>Evidence source: {item.source}</small> : null}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="match-muted">No skill or experience evidence was available for this assessment.</p>
          )}
          {assessment.gaps.length ? (
            <>
              <h4>Not evidenced in the profile</h4>
              <ul className="match-reason-list">
                {assessment.gaps.map((gap) => <li key={gap}>{gap}</li>)}
              </ul>
            </>
          ) : null}
        </section>

        <section>
          <h3>Application route and instructions</h3>
          <p className="match-detail-status">{assessment.routeReadinessLabel}</p>
          <ul className="match-reason-list">
            {assessment.routeReasons.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          <dl className="match-fact-list">
            <div><dt>Route type</dt><dd>{labelFromKey(assessment.routeType)}</dd></div>
            <div><dt>Submission channel</dt><dd>{assessment.submissionMethods.length ? assessment.submissionMethods.map(labelFromKey).join(", ") : "Not specified"}</dd></div>
            <div><dt>Work model</dt><dd>{assessment.workModel === "not_stated" ? "Not stated" : labelFromKey(assessment.workModel)}</dd></div>
            <div><dt>Directory check</dt><dd>{formatDate(assessment.checkedAt)}</dd></div>
            <div><dt>Next review date</dt><dd>{formatDate(assessment.nextReviewAt)}</dd></div>
          </dl>
          {assessment.disciplineScope.length ? (
            <>
              <h4>Employer-stated discipline scope</h4>
              <div className="match-tag-list">
                {assessment.disciplineScope.map((item) => <span className="match-tag" key={item}>{item}</span>)}
              </div>
            </>
          ) : (
            <p className="match-muted">No specific discipline is recorded for this open route. This is unknown, not evidence of a mismatch.</p>
          )}
          {assessment.eligibleLocations.length ? (
            <>
              <h4>Location / eligibility information recorded</h4>
              <ul className="match-reason-list">
                {assessment.eligibleLocations.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </>
          ) : null}
        </section>
      </div>

      {assessment.notes ? (
        <section className="match-source-summary">
          <h3>Research summary</h3>
          <p>{assessment.notes}</p>
        </section>
      ) : null}

      <div className="match-source-links">
        {assessment.applicationUrl ? (
          <a href={assessment.applicationUrl} target="_blank" rel="noopener noreferrer">Open application route</a>
        ) : null}
        {assessment.evidenceUrl ? (
          <a href={assessment.evidenceUrl} target="_blank" rel="noopener noreferrer">View supporting employer source</a>
        ) : null}
        {assessment.websiteUrl ? (
          <a href={assessment.websiteUrl} target="_blank" rel="noopener noreferrer">Studio website</a>
        ) : null}
      </div>
      <p className="match-caveat">
        A recorded route is not a guarantee that the form is currently available or that you meet its
        requirements. Confirm the employer's latest instructions, work location and eligibility yourself.
      </p>
    </div>
  );
}

export default function MatchingDashboard({
  onOpenProfile,
}: {
  onOpenProfile: () => void;
}) {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState<RelevanceFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("priority");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    setRefreshing(true);
    setError("");
    try {
      const saved = await loadCandidateProfile();
      setProfile(saved);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your private profile.");
      setProfile(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const assessments = useMemo(() => {
    if (!profile) return [];
    return sortStudioMatches(buildStudioMatches(profile), sortMode);
  }, [profile, sortMode]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return assessments.filter((assessment) => {
      const profile = studioProfiles[assessment.name];
      const searchable = [
        assessment.name,
        assessment.country,
        ...assessment.studioTypes,
        ...assessment.focus,
        ...assessment.disciplineScope,
        ...(profile?.popularGames || []).map((game) => game.title),
      ].join(" ").toLowerCase();
      return (
        (!term || searchable.includes(term)) &&
        (relevanceFilter === "all" || assessment.relevance === relevanceFilter) &&
        (priorityFilter === "all" || assessment.priority.level === priorityFilter) &&
        (routeFilter === "all" ||
          (routeFilter === "active"
            ? assessment.routeReadiness === "active"
            : assessment.routeReadiness === "needs_verification"))
      );
    });
  }, [assessments, query, relevanceFilter, priorityFilter, routeFilter]);

  const counts = useMemo(() => ({
    strong: assessments.filter((item) => item.relevance === "strong").length,
    potential: assessments.filter((item) => item.relevance === "potential").length,
    weak: assessments.filter((item) => item.relevance === "weak").length,
    notAssessed: assessments.filter((item) => item.relevance === "not_assessed").length,
    routeNeedsReview: assessments.filter((item) => item.routeReadiness === "needs_verification").length,
  }), [assessments]);

  const profileHasRoles = Boolean(profile?.preferences.roleFamilies.length);
  const profileHasEvidence = profile ? hasProfileEvidence(profile) : false;
  const isEmptyProfile = !profileHasRoles && !profileHasEvidence;

  if (loading) {
    return <section className="matching-page"><p className="matching-loading">Loading your private profile and preparing matches…</p></section>;
  }

  if (error) {
    return (
      <section className="matching-page">
        <div className="page-heading"><div><h1>Your matches</h1><p>Private, on-device comparison of your profile with the global studio directory.</p></div></div>
        <div className="matching-state-panel" role="alert">
          <h2>Profile storage could not be read</h2>
          <p>{error}</p>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void refreshProfile()}>Try again</button>
        </div>
      </section>
    );
  }

  if (!profile || isEmptyProfile) {
    return (
      <section className="matching-page">
        <div className="page-heading">
          <div>
            <h1>Your matches</h1>
            <p>Private, on-device comparison of your profile with the global studio directory.</p>
          </div>
        </div>
        <div className="matching-state-panel">
          <h2>Complete the basics of your profile first</h2>
          <p>
            Add at least one target role family and some evidenced skills or work experience. The
            matcher will not invent qualifications or guess which roles a studio might hire for.
          </p>
          <button className="btn btn-primary btn-sm" type="button" onClick={onOpenProfile}>Open my profile</button>
        </div>
        <div className="matching-privacy-note">
          Profile data stays in this browser. Matching is calculated on this device and is not sent to
          the public directory or a remote service.
        </div>
      </section>
    );
  }

  return (
    <section className="matching-page">
      <div className="page-heading matching-page-heading">
        <div>
          <h1>Your matches</h1>
          <p>Compare your saved profile with active, employer-backed application routes.</p>
        </div>
        <div className="matching-actions">
          <span className="matching-profile-date">
            Profile saved {profile.updatedAt ? formatDate(profile.updatedAt) : "date not recorded"}
          </span>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => void refreshProfile()} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh profile"}
          </button>
          <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onOpenProfile}>Edit profile</button>
        </div>
      </div>

      <div className="matching-principle-note">
        Professional relevance, application-route readiness and personal priority are assessed
        separately. These labels are qualitative guidance, not a hiring probability or a promise of
        eligibility. The global studio directory is not filtered or changed by your preferences.
      </div>

      {!profileHasRoles ? (
        <div className="matching-incomplete-note">
          No target role families are saved. The matcher can still compare evidenced skills, but
          professional relevance may remain broad until you add the roles you are pursuing.
          <button className="text-button" type="button" onClick={onOpenProfile}>Add target roles</button>
        </div>
      ) : null}
      {!profileHasEvidence ? (
        <div className="matching-incomplete-note">
          No evidenced skills or experience have been saved. Add evidence to distinguish a target
          role from demonstrated or transferable capability.
          <button className="text-button" type="button" onClick={onOpenProfile}>Add profile evidence</button>
        </div>
      ) : null}

      <div className="matching-summary-grid" aria-label="Match summary">
        <div className="matching-summary-card"><strong>{assessments.length}</strong><span>Active routes assessed</span></div>
        <div className="matching-summary-card"><strong>{counts.strong}</strong><span>Strong matches</span></div>
        <div className="matching-summary-card"><strong>{counts.potential}</strong><span>Potential matches</span></div>
        <div className="matching-summary-card"><strong>{counts.routeNeedsReview}</strong><span>Routes needing verification</span></div>
      </div>

      <div className="matching-toolbar">
        <label className="form-field matching-search" htmlFor="matching-search">
          <span>Search matches</span>
          <input
            id="matching-search"
            className="form-control"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Studio, country, focus or discipline"
          />
        </label>
        <label className="form-field" htmlFor="matching-relevance-filter">
          <span>Professional relevance</span>
          <select id="matching-relevance-filter" className="form-select" value={relevanceFilter} onChange={(event) => setRelevanceFilter(event.target.value as RelevanceFilter)}>
            {Object.entries(relevanceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="form-field" htmlFor="matching-priority-filter">
          <span>Personal priority</span>
          <select id="matching-priority-filter" className="form-select" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}>
            {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="form-field" htmlFor="matching-route-filter">
          <span>Route status</span>
          <select id="matching-route-filter" className="form-select" value={routeFilter} onChange={(event) => setRouteFilter(event.target.value as RouteFilter)}>
            <option value="all">All route statuses</option>
            <option value="active">Active on directory</option>
            <option value="needs_verification">Needs verification</option>
          </select>
        </label>
        <label className="form-field" htmlFor="matching-sort">
          <span>Sort by</span>
          <select id="matching-sort" className="form-select" value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
            <option value="relevance">Professional relevance</option>
            <option value="priority">Personal priority</option>
            <option value="name">Studio name</option>
          </select>
        </label>
      </div>

      <div className="matching-results-meta">
        <strong>{filtered.length} of {assessments.length} active routes</strong>
        <span>Sorted by {sortMode === "name" ? "studio name" : sortMode === "priority" ? "personal priority" : "professional relevance"}</span>
      </div>

      <div className="matching-results">
        {filtered.map((assessment) => {
          const expanded = expandedId === assessment.id;
          const studioInfo = studios.find(studio => studio.name === assessment.name);
          const studioProfile = studioProfiles[assessment.name];
          const visualTags = [
            ...(studioProfile?.scale ? [{ label: studioProfile.scale, kind: "scale" }] : []),
            ...(studioProfile?.studioRoles || []).slice(0, 1).map(value => ({ label: "🛠️ " + value, kind: "role" })),
            ...(studioProfile?.platforms || []).slice(0, 2).map(value => ({ label: platformIcon(value) + " " + value, kind: "platform" })),
            ...(studioProfile?.gameFocus || []).slice(0, 2).map(value => ({ label: focusIcon(value) + " " + value, kind: "focus" })),
          ].slice(0, 5);
          return (
            <article
              className={"match-card relevance-" + assessment.relevance}
              key={assessment.id}
              data-studio-id={assessment.id}
              data-relevance={assessment.relevance}
              data-priority={assessment.priority.level}
            >
              <div className="match-card-header">
                <div className="match-card-identity">
                  <div className="match-studio-title">
                    <StudioMark name={assessment.name} websiteUrl={studioInfo?.websiteUrl || ""} />
                    <div>
                      <h2>{assessment.name}</h2>
                      <p>🌐 {assessment.country} · recorded studio country · {labelFromKey(assessment.routeType)} route</p>
                    </div>
                  </div>
                  {assessment.studioTypes.length ? (
                    <div className="match-tag-list">
                      {assessment.studioTypes.map((item) => <span className="match-tag" key={item}>{item}</span>)}
                    </div>
                  ) : null}
                  {visualTags.length ? (
                    <div className="match-tag-list match-visual-tags">
                      {visualTags.map((tag, index) => <span className={"match-tag match-tag-" + tag.kind} key={tag.kind + tag.label + index}>{tag.label}</span>)}
                    </div>
                  ) : null}
                </div>
                <div className="match-badges">
                  <span className={"match-badge relevance-badge " + assessment.relevance}>{assessment.relevanceLabel}</span>
                  <span className={"match-badge priority-badge " + assessment.priority.level}>{assessment.priority.label}</span>
                  <span className={"match-badge route-badge " + assessment.routeReadiness}>{assessment.routeReadinessLabel}</span>
                </div>
              </div>

              <div className="match-card-summary">
                <div>
                  <h3>Professional relevance</h3>
                  <p>{assessment.relevanceReasons[0]}</p>
                  {assessment.limitedRoleInformation ? <small>Limited employer role information</small> : null}
                </div>
                <div>
                  <h3>Personal priority</h3>
                  <p>{assessment.priority.reasons[0]}</p>
                </div>
              </div>

              <div className="match-card-actions">
                <button
                  className="text-button"
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedId((current) => current === assessment.id ? null : assessment.id)}
                >
                  {expanded ? "Hide assessment details" : "View assessment details"}
                </button>
                {assessment.applicationUrl ? (
                  <a href={assessment.applicationUrl} target="_blank" rel="noopener noreferrer">Open application route</a>
                ) : null}
              </div>
              {expanded ? <AssessmentDetails assessment={assessment} /> : null}
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <div className="matching-state-panel matching-empty-results">
            <h2>No matches for these filters</h2>
            <p>Try a different search or reset the filters to see the full active route set.</p>
            <button
              className="btn btn-outline-secondary btn-sm"
              type="button"
              onClick={() => {
                setQuery("");
                setRelevanceFilter("all");
                setPriorityFilter("all");
                setRouteFilter("all");
                setSortMode("priority");
              }}
            >
              Reset match filters
            </button>
          </div>
        ) : null}
      </div>

      <div className="matching-privacy-note">
        Matches are recalculated in this browser from your saved profile and the public directory.
        The matching assessment is not currently saved as an application or queue item. Your profile
        and its documents are not uploaded or synchronized.
      </div>
    </section>
  );
}
