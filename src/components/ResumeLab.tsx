import { useRef, useState, type ChangeEvent } from "react";
import {
  extractResumeDocument,
  getResumeExtractionErrorMessage,
  getResumeWarningMessage,
} from "../lib/resume/document-extractor.mjs";
import { RESUME_GUIDANCE_VERSION } from "../lib/resume/guidance.mjs";
import { analyzeResume } from "../lib/resume/analysis.mjs";
import { OPPORTUNITY_SNAPSHOT } from "../lib/opportunities/snapshot.mjs";
import type { ResumeAnalysis, ResumeProfile, Extraction } from "./resume-lab.types";
import { ResumeAnalysisPanel } from "./ResumeAnalysisPanel";
import { ResumeGuidancePanel } from "./ResumeGuidancePanel";
import { ResumeEditorPanel } from "./ResumeEditorPanel";

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

  function selectOpportunity(value: string) {
    setSelectedOpportunityId(value);
    setCustomRoleTitle("");
    setAnalysis(null);
    setAnalysisError("");
  }

  function changeCustomRoleTitle(value: string) {
    setCustomRoleTitle(value);
    setAnalysis(null);
    setAnalysisError("");
  }

  function changeRoleDescription(value: string) {
    setRoleDescription(value);
    setAnalysis(null);
    setAnalysisError("");
  }

  function clearRoleComparison() {
    setSelectedOpportunityId("");
    setCustomRoleTitle("");
    setRoleDescription("");
    setAnalysis(null);
    setAnalysisError("");
  }

  return (
    <div className="resume-lab page-stack" data-testid="resume-lab">
      <section className="resume-lab-intro">
        <div>
          <span className="eyebrow">PHASE 6A · BROWSER-LOCAL DOCUMENT INTAKE</span>
          <h2>Review a resume without uploading it</h2>
          <p>
            This workspace extracts DOCX, text-based PDF and UTF-8 TXT files, offers transparent baseline checks, and
            lets you create an editable structured draft with local DOCX export or browser Print / Save as PDF. It does
            not score fit, infer eligibility, contact an AI service, or claim to preserve the original layout.
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

      <ResumeAnalysisPanel
        analysis={analysis}
        analysisError={analysisError}
        busy={busy}
        customRoleTitle={customRoleTitle}
        extraction={extraction}
        onClearRoleComparison={clearRoleComparison}
        onCustomRoleTitleChange={changeCustomRoleTitle}
        onRoleDescriptionChange={changeRoleDescription}
        onRunBaselineReview={runBaselineReview}
        onSelectedOpportunityChange={selectOpportunity}
        profile={profile}
        roleDescription={roleDescription}
        selectedOpportunity={selectedOpportunity}
        selectedOpportunityId={selectedOpportunityId}
      />

      <ResumeGuidancePanel />
      {extraction?.text ? <ResumeEditorPanel sourceText={extraction.text} profile={profile} /> : null}
      <p className="privacy-footnote">
        All structured changes remain in this tab until you choose an export. Manual AI handoff is optional, selective,
        redacted by default for common contact patterns, and never sent by this app.
      </p>
    </div>
  );
}
