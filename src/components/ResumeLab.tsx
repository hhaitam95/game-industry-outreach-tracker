import { useRef, useState, type ChangeEvent } from "react";
import {
  extractResumeDocument,
  getResumeExtractionErrorMessage,
  getResumeWarningMessage,
} from "../lib/resume/document-extractor.mjs";
import { RESUME_GUIDANCE_DOCUMENTS, RESUME_GUIDANCE_VERSION } from "../lib/resume/guidance.mjs";
import { analyzeResume } from "../lib/resume/analysis.mjs";
import { IS_SYNTHETIC_SNAPSHOT, OPPORTUNITY_SNAPSHOT } from "../lib/opportunities/snapshot.mjs";
import type { validateWorkspaceData } from "../lib/private-data/schema.mjs";

type Extraction = Awaited<ReturnType<typeof extractResumeDocument>>;
type ResumeProfile = ReturnType<typeof validateWorkspaceData>["profile"];
type ResumeAnalysis = ReturnType<typeof analyzeResume>;

export default function ResumeLab({ profile = null }: { profile?: ResumeProfile | null }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [attemptedFileName, setAttemptedFileName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState("");
  const [customRoleTitle, setCustomRoleTitle] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const selectedOpportunity =
    OPPORTUNITY_SNAPSHOT?.opportunities.find((opportunity) => opportunity.id === selectedOpportunityId) ?? null;
  const roleTitle = selectedOpportunity?.title ?? customRoleTitle.trim();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setAttemptedFileName(file.name);
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await extractResumeDocument(file);
      setExtraction(result);
      setNotice(
        result.status === "ready"
          ? "Text extraction finished. Review the preview before relying on the result."
          : "Text extraction finished with a warning. Review the message and preview before relying on the result.",
      );
    } catch (extractError) {
      setError(getResumeExtractionErrorMessage(extractError));
      setNotice(extraction ? "The previous successful extraction was kept unchanged." : "");
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  function clearExtraction() {
    setExtraction(null);
    setAttemptedFileName("");
    setSelectedOpportunityId("");
    setCustomRoleTitle("");
    setRoleDescription("");
    setAnalysis(null);
    setAnalysisError("");
    setError("");
    setNotice("Selected file, extracted text, role description and analysis cleared from this screen.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function runBaselineReview() {
    if (!extraction?.text) return;
    setAnalysisError("");
    try {
      setAnalysis(analyzeResume({ resumeText: extraction.text, profile, roleTitle, roleDescription }));
    } catch {
      setAnalysis(null);
      setAnalysisError(
        "The review could not complete within the supported limits. Clear or shorten the role description and try again.",
      );
    }
  }

  return (
    <div className="resume-lab page-stack" data-testid="resume-lab">
      <section className="resume-lab-intro">
        <div>
          <span className="eyebrow">PHASE 6A · BROWSER-LOCAL DOCUMENT INTAKE</span>
          <h2>Review a resume without uploading it</h2>
          <p>
            This workspace extracts text from DOCX, text-based PDF, and UTF-8 TXT files, then offers deterministic
            checks and explicit text-term comparisons. It does not score fit, infer eligibility, rewrite the original,
            or export a new document in this slice.
          </p>
        </div>
        <span className="resume-guidance-version" data-testid="resume-guidance-version">
          Guidance {RESUME_GUIDANCE_VERSION}
        </span>
      </section>

      <section className="resume-lab-card" aria-labelledby="resume-upload-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">LOCAL FILE · READ ONLY</span>
            <h2 id="resume-upload-title">1. Select a document</h2>
          </div>
          <span className="resume-limit-label">10 MiB maximum</span>
        </div>
        <p className="resume-privacy-note" role="note" data-testid="resume-privacy-note">
          Your selected file is read in this browser tab. The original and extracted text are not uploaded, logged, or
          saved to the local vault. Leaving this screen or clearing the extraction removes the current text from this
          component's state.
        </p>
        <label className="resume-file-label" htmlFor="resume-document-input">
          Resume document
          <input
            ref={fileInputRef}
            id="resume-document-input"
            data-testid="resume-file-input"
            type="file"
            accept=".docx,.pdf,.txt"
            onChange={(event) => void handleFileChange(event)}
            disabled={busy}
          />
        </label>
        <p className="resume-helper-text">
          DOCX, text-based PDF, or UTF-8 TXT only. Scanned/image-only PDFs need OCR, which is intentionally not enabled.
          PDFs are limited to 100 pages and extracted text to 150,000 characters.
        </p>
        {busy ? (
          <p className="resume-progress" role="status" aria-live="polite">
            Reading the selected document in this tab…
          </p>
        ) : null}
        {error ? (
          <p className="resume-message resume-message-error" role="alert" data-testid="resume-error">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="resume-message" role="status" aria-live="polite">
            {notice}
          </p>
        ) : null}
        {attemptedFileName && !busy ? (
          <p className="resume-file-name" data-testid="resume-attempted-name">
            Last selected file: {attemptedFileName}
          </p>
        ) : null}

        {extraction ? (
          <div className="resume-extraction" data-testid="resume-extraction">
            <div className="resume-extraction-heading">
              <div>
                <span className="eyebrow">EXTRACTION RESULT</span>
                <h3>Text preview</h3>
                <p data-testid="resume-result-kind" data-kind={extraction.kind}>
                  {extraction.kind.toUpperCase()} · {extraction.characterCount.toLocaleString()} characters
                  {extraction.pageCount ? " · " + extraction.pageCount + " PDF pages" : ""}
                </p>
              </div>
              <span
                className={
                  extraction.status === "ready"
                    ? "resume-status resume-status-ready"
                    : "resume-status resume-status-warning"
                }
                data-testid="resume-status"
                data-status={extraction.status}
              >
                {extraction.status === "ready" ? "Text extracted" : "Review warning"}
              </span>
            </div>
            {extraction.warnings.map((warning) => (
              <p className="resume-message resume-message-warning" key={warning} role="note">
                {getResumeWarningMessage(warning)}
              </p>
            ))}
            {extraction.text ? (
              <label className="resume-preview-label" htmlFor="resume-extracted-text">
                Extracted text (read only)
                <textarea
                  id="resume-extracted-text"
                  data-testid="resume-extracted-text"
                  value={extraction.text}
                  readOnly
                  rows={16}
                  spellCheck={false}
                />
              </label>
            ) : (
              <p className="resume-no-text" data-testid="resume-no-text">
                No text preview is available. Choose a text-based copy or correct the document before continuing.
              </p>
            )}
            <button className="button button-secondary" type="button" onClick={clearExtraction} disabled={busy}>
              Clear extracted text
            </button>
          </div>
        ) : null}
      </section>

      <section className="resume-lab-card" aria-labelledby="resume-analysis-title" data-testid="resume-analysis-section">
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
              onChange={(event) => {
                setSelectedOpportunityId(event.target.value);
                setCustomRoleTitle("");
                setAnalysis(null);
                setAnalysisError("");
              }}
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
                onChange={(event) => {
                  setCustomRoleTitle(event.target.value);
                  setAnalysis(null);
                  setAnalysisError("");
                }}
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
              onChange={(event) => {
                setRoleDescription(event.target.value);
                setAnalysis(null);
                setAnalysisError("");
              }}
              placeholder="Paste only the role text you want to compare. This input is not saved or sent."
              rows={7}
              value={roleDescription}
            />
          </label>
          <p className="resume-helper-text" data-testid="resume-analysis-privacy-note">
            The pasted role text, extracted resume, profile projection, and findings remain in browser memory only.
            No career page is fetched automatically, and nothing is uploaded or written into your vault.
          </p>
          {profile ? (
            <p className="resume-message" role="status" data-testid="resume-analysis-profile-status">
              Using the current in-memory profile from the unlocked vault. Unsaved edits may be included; save profile
              changes in Settings if you want them encrypted for next time. Locking the vault clears this profile
              projection.
            </p>
          ) : (
            <p className="resume-message resume-message-warning" role="note" data-testid="resume-analysis-profile-status">
              The saved profile is unavailable while the vault is locked. Baseline checks and role-text comparison can
              still run; unlock the vault in Settings to include your saved skills and target roles.
            </p>
          )}
          <div className="vault-actions">
            <button
              className="button button-primary"
              data-testid="resume-analysis-run"
              disabled={!extraction?.text || busy}
              onClick={runBaselineReview}
              type="button"
            >
              Run baseline review
            </button>
            <button
              className="button button-secondary"
              data-testid="resume-analysis-clear"
              disabled={!analysis && !roleDescription && !selectedOpportunityId && !customRoleTitle}
              onClick={() => {
                setSelectedOpportunityId("");
                setCustomRoleTitle("");
                setRoleDescription("");
                setAnalysis(null);
                setAnalysisError("");
              }}
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
                <p className="resume-message resume-message-warning" role="note" data-testid="resume-analysis-title-only">
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

      <section className="resume-lab-card" aria-labelledby="resume-guidance-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">BUNDLED AT BUILD TIME</span>
            <h2 id="resume-guidance-title">2. Resume guidance library</h2>
          </div>
          <span className="resume-limit-label">{RESUME_GUIDANCE_DOCUMENTS.length} references</span>
        </div>
        <p className="resume-helper-text">
          These Markdown guides are bundled with the app at build time. Opening them does not fetch a private or remote
          guidance file. Recommendations are heuristics; employer instructions, role context, and your actual evidence
          take precedence.
        </p>
        <div className="resume-guidance-list">
          {RESUME_GUIDANCE_DOCUMENTS.map((document) => (
            <details className="resume-guidance-item" key={document.id} data-testid={"resume-guidance-" + document.id}>
              <summary>
                <span>{document.title}</span>
                <small>{document.relevance}</small>
              </summary>
              <pre>{document.markdown}</pre>
            </details>
          ))}
        </div>
      </section>
      <p className="privacy-footnote">
        The next slice will add editable structured content and a review diff, then local DOCX/PDF downloads. Optional
        ChatGPT handoff remains manual, explicit, and subject to disclosure/redaction safeguards.
      </p>
    </div>
  );
}
