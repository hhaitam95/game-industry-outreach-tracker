import { IS_SYNTHETIC_SNAPSHOT, OPPORTUNITY_SNAPSHOT } from "../lib/opportunities/snapshot.mjs";
import type { Extraction, ResumeAnalysis, ResumeProfile } from "./resume-lab.types";

type SelectedOpportunity = NonNullable<typeof OPPORTUNITY_SNAPSHOT>["opportunities"][number];

type ResumeAnalysisPanelProps = {
  analysis: ResumeAnalysis | null;
  analysisError: string;
  busy: boolean;
  customRoleTitle: string;
  extraction: Extraction | null;
  onClearRoleComparison: () => void;
  onCustomRoleTitleChange: (value: string) => void;
  onRoleDescriptionChange: (value: string) => void;
  onRunBaselineReview: () => void;
  onSelectedOpportunityChange: (value: string) => void;
  profile: ResumeProfile | null;
  roleDescription: string;
  selectedOpportunity: SelectedOpportunity | null;
  selectedOpportunityId: string;
};

export function ResumeAnalysisPanel({
  analysis,
  analysisError,
  busy,
  customRoleTitle,
  extraction,
  onClearRoleComparison,
  onCustomRoleTitleChange,
  onRoleDescriptionChange,
  onRunBaselineReview,
  onSelectedOpportunityChange,
  profile,
  roleDescription,
  selectedOpportunity,
  selectedOpportunityId,
}: ResumeAnalysisPanelProps) {
  return (
      <section
        className="resume-lab-card"
        aria-labelledby="resume-analysis-title"
        data-testid="resume-analysis-section"
      >
        <div className="section-heading">
          <div>
            <span className="eyebrow">PHASE 6B · DETERMINISTIC REVIEW</span>
            <h2 id="resume-analysis-title">3. Baseline checks and role comparison</h2>
          </div>
          <span className="resume-limit-label">No fit score</span>
        </div>
        <p className="resume-helper-text">
          Counts, section headings, and literal text matches are prompts for human review, not a quality verdict. No
          resume excerpts or contact values are copied into the findings.
        </p>
        {IS_SYNTHETIC_SNAPSHOT ? (
          <p className="resume-message resume-message-warning" role="note" data-testid="resume-analysis-sample-note">
            Sample data - not a real scan. Snapshot role rows and placeholder links are synthetic examples, not actual
            vacancies. You can instead enter a custom title and paste role text you verified yourself.
          </p>
        ) : null}
        <div className="resume-analysis-form">
          <label className="resume-analysis-field" htmlFor="resume-analysis-opportunity">
            Optional role link from the bundled snapshot
            <select
              id="resume-analysis-opportunity"
              data-testid="resume-analysis-opportunity"
              onChange={(event) => onSelectedOpportunityChange(event.target.value)}
              value={selectedOpportunityId}
            >
              <option value="">No linked role — enter a custom title below</option>
              {(OPPORTUNITY_SNAPSHOT?.opportunities ?? []).map((opportunity) => (
                <option key={opportunity.id} value={opportunity.id}>
                  {opportunity.studioName} — {opportunity.title}
                </option>
              ))}
            </select>
          </label>
          {!selectedOpportunity ? (
            <label className="resume-analysis-field" htmlFor="resume-analysis-custom-title">
              Custom role title (optional)
              <input
                id="resume-analysis-custom-title"
                data-testid="resume-analysis-custom-title"
                maxLength={300}
                onChange={(event) => onCustomRoleTitleChange(event.target.value)}
                placeholder="Developer Support Specialist"
                value={customRoleTitle}
              />
            </label>
          ) : (
            <p className="resume-helper-text" data-testid="resume-analysis-role-status">
              Snapshot status: {selectedOpportunity.status}. This does not prove that the role is open.
              {selectedOpportunity.sourceUrl ? (
                <>
                  {" "}
                  <a href={selectedOpportunity.sourceUrl} target="_blank" rel="noreferrer">
                    Open the listed careers source
                  </a>
                </>
              ) : null}
            </p>
          )}
          <label className="resume-analysis-field" htmlFor="resume-analysis-role-description">
            Optional role description or requirements (paste manually)
            <textarea
              id="resume-analysis-role-description"
              data-testid="resume-analysis-role-description"
              maxLength={20000}
              onChange={(event) => onRoleDescriptionChange(event.target.value)}
              placeholder="Paste only the role text you want to compare. This input is not saved or sent."
              rows={7}
              value={roleDescription}
            />
          </label>
          <p className="resume-helper-text" data-testid="resume-analysis-privacy-note">
            The pasted role text, extracted resume, profile projection, and findings remain in browser memory only. No
            career page is fetched automatically, and nothing is uploaded or written into your vault.
          </p>
          {profile ? (
            <p className="resume-message" role="status" data-testid="resume-analysis-profile-status">
              Using the current in-memory profile from the unlocked vault. Unsaved edits may be included; save profile
              changes in Settings if you want them encrypted for next time. Locking the vault clears this profile
              projection.
            </p>
          ) : (
            <p
              className="resume-message resume-message-warning"
              role="note"
              data-testid="resume-analysis-profile-status"
            >
              The saved profile is unavailable while the vault is locked. Baseline checks and role-text comparison can
              still run; unlock the vault in Settings to include your saved skills and target roles.
            </p>
          )}
          <div className="vault-actions">
            <button
              className="button button-primary"
              data-testid="resume-analysis-run"
              disabled={!extraction?.text || busy}
              onClick={onRunBaselineReview}
              type="button"
            >
              Run baseline review
            </button>
            <button
              className="button button-secondary"
              data-testid="resume-analysis-clear"
              disabled={!analysis && !roleDescription && !selectedOpportunityId && !customRoleTitle}
              onClick={onClearRoleComparison}
              type="button"
            >
              Clear role comparison
            </button>
          </div>
          {analysisError ? (
            <p className="resume-message resume-message-error" role="alert" data-testid="resume-analysis-error">
              {analysisError}
            </p>
          ) : null}
          {analysis ? (
            <div className="resume-analysis-results" data-testid="resume-analysis-results">
              <h3>Baseline counts</h3>
              <div className="resume-analysis-stats">
                <div>
                  <span>Words</span>
                  <strong data-testid="resume-analysis-word-count">{analysis.stats.wordCount}</strong>
                </div>
                <div>
                  <span>Characters</span>
                  <strong>{analysis.stats.characterCount.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Lines</span>
                  <strong>{analysis.stats.lineCount}</strong>
                </div>
                <div>
                  <span>Sections detected</span>
                  <strong>{analysis.stats.sectionCount}</strong>
                </div>
              </div>
              <p className="resume-helper-text">
                Contact/link indicators are approximate counts only: {analysis.stats.emailPatternCount} email-like
                pattern(s), {analysis.stats.phoneLikePatternCount} phone-like pattern(s), and {analysis.stats.urlCount}
                URL(s). Matched values are not displayed.
              </p>
              <h3>Common sections detected</h3>
              {analysis.sections.length > 0 ? (
                <ul className="resume-analysis-list" data-testid="resume-analysis-sections">
                  {analysis.sections.map((section) => (
                    <li key={section}>{section}</li>
                  ))}
                </ul>
              ) : (
                <p className="resume-helper-text">
                  No common section headings were confidently detected. This is not a failure; check the original
                  document and the employer's instructions.
                </p>
              )}
              <h3>Saved profile skill mentions</h3>
              {!analysis.profile.available ? (
                <p className="resume-helper-text">Unlock Settings to include the saved profile.</p>
              ) : analysis.profile.skillMentions.length > 0 ? (
                <ul className="resume-analysis-list" data-testid="resume-analysis-skills">
                  {analysis.profile.skillMentions.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.found ? "Exact text mention found" : "No exact text mention detected"}</span>
                      {!item.found ? <small>This does not mean you lack the skill.</small> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="resume-helper-text">No skills are saved in the profile yet. Add them in Settings.</p>
              )}
              <h3>Target roles vs selected title</h3>
              {analysis.profile.targetRoleMatches.length > 0 ? (
                <ul className="resume-analysis-list" data-testid="resume-analysis-target-roles">
                  {analysis.profile.targetRoleMatches.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.found ? "Exact phrase found in title" : "Not an exact phrase match"}</span>
                      <small>Review the full role context manually; this does not determine fit or eligibility.</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="resume-helper-text">
                  {analysis.profile.available
                    ? "Add target roles in Settings and select a role title to compare."
                    : "No saved target-role comparison was run."}
                </p>
              )}
              <h3>Role-text terms to review</h3>
              {analysis.role.terms.length > 0 ? (
                <ul className="resume-analysis-list" data-testid="resume-analysis-role-terms">
                  {analysis.role.terms.map((item) => (
                    <li key={item.label}>
                      <strong>{item.label}</strong>
                      <span>{item.found ? "Exact text mention found" : "No exact text mention detected"}</span>
                      {!item.found ? <small>Review manually; this is not a skills-gap conclusion.</small> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="resume-helper-text">
                  Enter a title or paste role text to see representative terms. These terms are not a complete or
                  authoritative list of requirements.
                </p>
              )}
              {!analysis.role.descriptionProvided && analysis.role.title ? (
                <p
                  className="resume-message resume-message-warning"
                  role="note"
                  data-testid="resume-analysis-title-only"
                >
                  The snapshot supplies only a role title and metadata, not the full job description. This comparison
                  uses the title only; paste a verified description for a broader text scan.
                </p>
              ) : null}
              <p className="privacy-footnote">
                This review is deterministic, does not use an AI service, and does not calculate a fit percentage. All
                missing-term results require human interpretation.
              </p>
            </div>
          ) : null}
        </div>
      </section>
  );
}
