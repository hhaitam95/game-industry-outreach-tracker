import { useRef, useState, type ChangeEvent } from "react";
import {
  extractResumeDocument,
  getResumeExtractionErrorMessage,
  getResumeWarningMessage,
} from "../lib/resume/document-extractor.mjs";
import { RESUME_GUIDANCE_DOCUMENTS, RESUME_GUIDANCE_VERSION } from "../lib/resume/guidance.mjs";

type Extraction = Awaited<ReturnType<typeof extractResumeDocument>>;

export default function ResumeLab() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [extraction, setExtraction] = useState<Extraction | null>(null);
  const [attemptedFileName, setAttemptedFileName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

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
    setError("");
    setNotice("Selected file and extracted text cleared from this screen.");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="resume-lab page-stack" data-testid="resume-lab">
      <section className="resume-lab-intro">
        <div>
          <span className="eyebrow">PHASE 6A · BROWSER-LOCAL DOCUMENT INTAKE</span>
          <h2>Review a resume without uploading it</h2>
          <p>
            This first slice extracts text from DOCX, text-based PDF, and UTF-8 TXT files. It does not rewrite the
            original document, and it does not yet analyse fit, edit resume content, or export a new document.
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
        Next slices will add deterministic checks and role comparison, then an editable structured proposal and reviewed
        DOCX/PDF export. Optional ChatGPT handoff remains manual and will require a separate disclosure/redaction step.
      </p>
    </div>
  );
}
