import { RESUME_GUIDANCE_DOCUMENTS } from "../lib/resume/guidance.mjs";

export function ResumeGuidancePanel() {
  return (
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
  );
}
