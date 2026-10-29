import { useEffect, useMemo, useState } from "react";
import { buildResumeDocxBytes } from "../lib/resume/docx-export.mjs";
import {
  addResumeBlock,
  getResumeDiff,
  getUnsupportedTermWarnings,
  MAX_RESUME_TEXT_CHARS,
  moveResumeBlock,
  redactResumeText,
  removeResumeBlock,
  RESUME_MODEL_VERSION,
  RESUME_SECTIONS,
  structureResumeText,
  updateResumeBlock,
} from "../lib/resume/resume-model.mjs";
import type { ResumeProfile, ResumeSection, StructuredResumeDocument } from "./resume-lab.types";

type Props = { sourceText: string; profile: ResumeProfile | null };
type RedactionOptions = { redactEmail: boolean; redactPhone: boolean; redactUrl: boolean };

const DEFAULT_REDACTIONS: RedactionOptions = {
  redactEmail: true,
  redactPhone: true,
  redactUrl: true,
};

function profileEvidenceText(profile: ResumeProfile | null) {
  if (!profile) return "";
  return [profile.displayName, profile.headline, profile.professionalSummary, ...profile.skills, ...profile.targetRoles]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .join("\n");
}

function originLabel(origin: string) {
  if (origin === "ai-paste") return "AI-pasted";
  if (origin === "typed") return "Typed by you";
  return "Imported from extraction";
}

function downloadDocx(document: StructuredResumeDocument) {
  const bytes = buildResumeDocxBytes(document) as Uint8Array;
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = "resume-draft.docx";
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ResumeEditorPanel({ sourceText, profile }: Props) {
  const [document, setDocument] = useState<StructuredResumeDocument>(
    () => structureResumeText(sourceText) as StructuredResumeDocument,
  );
  const [selectedForHandoff, setSelectedForHandoff] = useState<string[]>([]);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [redactions, setRedactions] = useState<RedactionOptions>(DEFAULT_REDACTIONS);
  const [aiPaste, setAiPaste] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setDocument(structureResumeText(sourceText) as StructuredResumeDocument);
      setSelectedForHandoff([]);
      setHandoffOpen(false);
      setAiPaste("");
      setError("");
      setNotice("");
    } catch {
      setError("The extracted text could not be structured within the supported limits.");
    }
  }, [sourceText]);

  const profileText = useMemo(() => profileEvidenceText(profile), [profile]);
  const changes = useMemo(() => getResumeDiff(document), [document]);
  const changeCount = changes.filter((item) => item.status !== "unchanged").length;
  const warnings = useMemo(
    () => getUnsupportedTermWarnings(document, sourceText, profileText),
    [document, sourceText, profileText],
  );
  const warningTerms = new Map(warnings.map((item) => [item.blockId, item.terms]));
  const handoffSource = useMemo(
    () =>
      document.blocks
        .filter((block) => selectedForHandoff.includes(block.id))
        .map((block) => block.section + "\n" + block.content)
        .join("\n\n")
        .trim(),
    [document, selectedForHandoff],
  );
  const handoffPreview = useMemo(() => redactResumeText(handoffSource, redactions), [handoffSource, redactions]);

  function applyEdit(edit: (current: StructuredResumeDocument) => StructuredResumeDocument) {
    try {
      setDocument(edit(document));
      setError("");
      setNotice("");
    } catch {
      setError(
        "That edit exceeds the supported document limits or contains invalid input. The previous version was kept.",
      );
    }
  }

  function toggleHandoffBlock(id: string, checked: boolean) {
    setSelectedForHandoff((selected) =>
      checked ? (selected.includes(id) ? selected : [...selected, id]) : selected.filter((item) => item !== id),
    );
    setNotice("");
  }

  function addTypedBlock() {
    applyEdit((current) => addResumeBlock(current, "Other", "typed", "") as StructuredResumeDocument);
  }

  function addAiPaste() {
    if (!aiPaste.trim()) return;
    applyEdit((current) => addResumeBlock(current, "Other", "ai-paste", aiPaste.trim()) as StructuredResumeDocument);
    setAiPaste("");
    setNotice("Pasted suggestions were added as AI-pasted text. Review every claim before using or exporting them.");
  }

  function toggleRedaction(field: keyof RedactionOptions, checked: boolean) {
    setRedactions((current) => ({ ...current, [field]: checked }));
  }

  async function copyReviewedHandoff() {
    if (!handoffPreview.trim()) {
      setError("Select at least one non-empty block before preparing a manual AI handoff.");
      return;
    }
    if (!navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
      setError("Clipboard access is unavailable. You can select and copy the reviewed preview manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(handoffPreview);
      setError("");
      setNotice("The reviewed preview was copied. Nothing was sent to ChatGPT or another service by this app.");
    } catch {
      setError("Clipboard copy was blocked. You can select and copy the reviewed preview manually.");
    }
  }

  function exportDocx() {
    try {
      downloadDocx(document);
      setError("");
      setNotice("A generated DOCX download was requested. Review its content and formatting before using it.");
    } catch {
      setError("The DOCX could not be generated. Your current in-memory edits were kept unchanged.");
    }
  }

  return (
    <section
      className="resume-lab-card resume-editor"
      aria-labelledby="resume-editor-title"
      data-testid="resume-editor"
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">PHASE 6C · EDIT AND EXPORT</span>
          <h2 id="resume-editor-title">4. Structure and edit a resume draft</h2>
        </div>
        <span className="resume-limit-label">In-memory only</span>
      </div>
      <p className="resume-editor-privacy" role="note" data-testid="resume-editor-privacy-note">
        This is a generated draft, not a faithful copy of the original layout. Edits, diffs and AI-pasted text stay in
        this tab’s memory and are not saved to the vault, logged, or uploaded. Nothing is copied externally unless you
        open the disclosure step and press the copy button.
      </p>
      <p className="resume-helper-text">
        The importer splits only on recognized section headings. Unrecognized text stays in Other. It does not infer
        employer/date boundaries or rewrite your experience. Review all imported text, changes and warnings.
      </p>

      <div className="resume-editor-actions">
        <button
          className="button button-secondary"
          type="button"
          data-testid="resume-editor-add"
          onClick={addTypedBlock}
        >
          Add a block
        </button>
        <button
          className="button button-primary"
          type="button"
          data-testid="resume-export-docx"
          onClick={exportDocx}
          disabled={document.blocks.length === 0}
        >
          Download DOCX
        </button>
        <button
          className="button button-secondary"
          type="button"
          data-testid="resume-export-pdf"
          onClick={() => window.print()}
          disabled={document.blocks.length === 0}
        >
          Print / Save as PDF
        </button>
      </div>
      <p className="resume-helper-text">
        PDF is produced by your browser’s print dialog. Choose “Save as PDF” there and inspect the saved document.
        Generated DOCX uses a clean, single-column template; neither format preserves the source layout.
      </p>

      {error ? (
        <p className="resume-message resume-message-error" role="alert" data-testid="resume-editor-error">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="resume-message" role="status" data-testid="resume-editor-notice">
          {notice}
        </p>
      ) : null}

      <div className="resume-editor-block-list">
        {document.blocks.map((block, index) => (
          <article className="resume-editor-block" key={block.id} data-testid="resume-editor-block">
            <div className="resume-editor-block-heading">
              <div>
                <span className="resume-editor-origin">{originLabel(block.origin)}</span>
                <strong>Block {index + 1}</strong>
                {block.modified ? <span className="resume-editor-modified">Edited</span> : null}
              </div>
              <div className="resume-editor-order-actions">
                <button
                  type="button"
                  className="button button-tertiary"
                  aria-label={"Move block " + (index + 1) + " up"}
                  onClick={() =>
                    applyEdit((current) => moveResumeBlock(current, block.id, -1) as StructuredResumeDocument)
                  }
                  disabled={index === 0}
                >
                  Move up
                </button>
                <button
                  type="button"
                  className="button button-tertiary"
                  aria-label={"Move block " + (index + 1) + " down"}
                  onClick={() =>
                    applyEdit((current) => moveResumeBlock(current, block.id, 1) as StructuredResumeDocument)
                  }
                  disabled={index === document.blocks.length - 1}
                >
                  Move down
                </button>
                <button
                  type="button"
                  className="button button-tertiary"
                  aria-label={"Remove block " + (index + 1)}
                  onClick={() => {
                    applyEdit((current) => removeResumeBlock(current, block.id) as StructuredResumeDocument);
                    setSelectedForHandoff((selected) => selected.filter((id) => id !== block.id));
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
            <label className="resume-editor-field">
              Section
              <select
                aria-label={"Section for block " + (index + 1)}
                value={block.section}
                onChange={(event) =>
                  applyEdit(
                    (current) =>
                      updateResumeBlock(current, block.id, {
                        section: event.currentTarget.value as ResumeSection,
                      }) as StructuredResumeDocument,
                  )
                }
              >
                {RESUME_SECTIONS.map((section: string) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </label>
            <label className="resume-editor-field">
              Resume content
              <textarea
                data-testid={"resume-editor-content-" + block.id}
                maxLength={MAX_RESUME_TEXT_CHARS}
                rows={Math.min(12, Math.max(4, block.content.split("\n").length))}
                value={block.content}
                onChange={(event) =>
                  applyEdit(
                    (current) =>
                      updateResumeBlock(current, block.id, {
                        content: event.currentTarget.value,
                      }) as StructuredResumeDocument,
                  )
                }
              />
            </label>
            {warningTerms.has(block.id) ? (
              <p
                className="resume-message resume-message-warning"
                role="note"
                data-testid="resume-editor-claim-warning"
              >
                Check wording absent from both the imported resume and the current profile:{" "}
                <strong>{warningTerms.get(block.id)?.join(", ")}</strong>. This heuristic can flag harmless wording and
                cannot verify facts. Confirm every claim yourself; exports remain available.
              </p>
            ) : null}
            <label className="resume-editor-handoff-select">
              <input
                type="checkbox"
                data-testid="resume-handoff-select"
                checked={selectedForHandoff.includes(block.id)}
                onChange={(event) => toggleHandoffBlock(block.id, event.currentTarget.checked)}
              />
              <span>Include this block in the optional manual AI handoff</span>
            </label>
          </article>
        ))}
        {document.blocks.length === 0 ? (
          <p className="resume-message resume-message-warning" role="note">
            All blocks are removed. Add a block to create a draft before exporting.
          </p>
        ) : null}
      </div>

      <details className="resume-editor-diff" data-testid="resume-diff">
        <summary>Review before / after changes ({changeCount})</summary>
        {changeCount === 0 ? (
          <p className="resume-helper-text">No changes from the imported structure yet.</p>
        ) : (
          <div className="resume-editor-diff-list">
            {changes
              .filter((item) => item.status !== "unchanged")
              .map((item) => (
                <article className="resume-editor-diff-item" key={item.id}>
                  <strong>
                    {item.status[0].toUpperCase() + item.status.slice(1)} · {item.section}
                  </strong>
                  {item.beforeContent !== null ? (
                    <div>
                      <span>Before</span>
                      <pre>{item.beforeContent || "(empty)"}</pre>
                    </div>
                  ) : null}
                  {item.afterContent !== null ? (
                    <div>
                      <span>After</span>
                      <pre>{item.afterContent || "(empty)"}</pre>
                    </div>
                  ) : null}
                </article>
              ))}
          </div>
        )}
      </details>

      <section className="resume-editor-handoff" aria-labelledby="resume-handoff-title">
        <h3 id="resume-handoff-title">Optional manual ChatGPT handoff</h3>
        <p className="resume-helper-text">
          This app does not connect to ChatGPT. First select only the blocks you intend to disclose, review the exact
          preview below, and keep or disable redactions deliberately. The clipboard action is user-initiated.
        </p>
        <button
          type="button"
          className="button button-secondary"
          data-testid="resume-handoff-open"
          onClick={() => setHandoffOpen((open) => !open)}
          aria-expanded={handoffOpen}
        >
          {handoffOpen ? "Hide handoff disclosure" : "Review manual AI handoff"}
        </button>
        {handoffOpen ? (
          <div className="resume-editor-handoff-panel" data-testid="resume-handoff-panel">
            <p className="resume-privacy-note">
              You are responsible for any external disclosure. The copy button copies only the selected block content
              shown in the preview, after the redaction options below are applied. No text is transmitted by the app.
            </p>
            <div className="resume-editor-redactions">
              <label>
                <input
                  type="checkbox"
                  checked={redactions.redactEmail}
                  onChange={(event) => toggleRedaction("redactEmail", event.currentTarget.checked)}
                />
                Redact email-like values
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={redactions.redactPhone}
                  onChange={(event) => toggleRedaction("redactPhone", event.currentTarget.checked)}
                />
                Redact phone-like values
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={redactions.redactUrl}
                  onChange={(event) => toggleRedaction("redactUrl", event.currentTarget.checked)}
                />
                Redact web links
              </label>
            </div>
            <label className="resume-editor-field" htmlFor="resume-handoff-preview">
              Exact reviewed content to copy
              <textarea
                id="resume-handoff-preview"
                data-testid="resume-handoff-preview"
                value={handoffPreview}
                readOnly
                rows={8}
              />
            </label>
            <button
              type="button"
              className="button button-primary"
              data-testid="resume-handoff-copy"
              onClick={() => void copyReviewedHandoff()}
              disabled={!handoffPreview.trim()}
            >
              Copy reviewed content
            </button>
            <label className="resume-editor-field" htmlFor="resume-ai-paste">
              Paste reviewed AI suggestions back into this tab
              <textarea
                id="resume-ai-paste"
                data-testid="resume-ai-paste"
                value={aiPaste}
                onChange={(event) => setAiPaste(event.currentTarget.value)}
                maxLength={MAX_RESUME_TEXT_CHARS}
                rows={6}
                placeholder="Paste suggestions here only after reviewing what to bring back."
              />
            </label>
            <button
              type="button"
              className="button button-secondary"
              data-testid="resume-ai-paste-add"
              onClick={addAiPaste}
              disabled={!aiPaste.trim()}
            >
              Add pasted text as AI-pasted block
            </button>
          </div>
        ) : null}
      </section>

      <div className="resume-print-sheet" data-testid="resume-print-sheet">
        <h1>Resume</h1>
        {document.blocks.map((block) => (
          <section className="resume-print-block" key={block.id}>
            <h2>{block.section}</h2>
            {block.content
              .split(/\r\n?|\n/u)
              .filter((line) => line.length > 0)
              .map((line, index) => (
                <p key={block.id + "-" + index}>{line}</p>
              ))}
          </section>
        ))}
      </div>
      <p className="resume-helper-text">
        Exports are generated from the current draft only. The app does not persist the original file, structured
        content, diff, pasted AI suggestions or downloaded output in the vault.
      </p>
      <span hidden data-resume-model-version={RESUME_MODEL_VERSION} />
    </section>
  );
}
