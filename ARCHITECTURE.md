# Architecture

**Status:** Approved direction for static hosting and browser-side private workflows; implementation details remain provisional  
**Last updated:** 2026-10-24

## 1. Architectural goals

- Deliver a low-cost, global studio discovery and outreach-preparation workflow.
- Use GitHub Actions for periodic source monitoring and data generation.
- Use GitHub Pages for a static public interface and public studio/opportunity data only.
- Keep candidate CVs, profile details, tailored resumes, drafts, and application history out of public repositories and static assets.
- Support resume processing in the browser without uploading user files to a server by default.
- Avoid paid AI APIs in the initial release through deterministic checks and optional manual ChatGPT handoff.
- Keep data sources, analysis rules, document generation, and deployment replaceable.
- Preserve evidence and uncertainty for external facts.
- Keep requirements living and architecture recoverable through repository documentation.

## 2. Hosting decision and constraints

GitHub Pages serves static HTML, CSS and JavaScript. It does not run Python or server-side application code. GitHub Free Pages requires a public source repository; published Pages content is publicly accessible. Current references:
- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

The current source/specification repository is private and contains project context. Do not switch it to public by default. The proposed zero-cost arrangement is:
1. Keep this source repository private.
2. Create a separate public deployment repository containing built static assets and sanitized public studio/opportunity JSON.
3. Run the discovery/build pipeline in the private source repository; maintain durable check history on a dedicated discovery-state branch; publish an allowlisted static artifact/data set to the public deployment repository only when public data materially changes.
4. Keep all candidate-specific data in browser-local encrypted storage/export, not in repository data or the static website's files.

A second repository and a narrowly scoped deployment token add complexity. This is a deliberate privacy compromise. If the user later agrees to make source code public after a privacy/history review, a single public repository may be simpler, but it must never contain private candidate data.

GitHub Pages is a public website, not a private dashboard. Browser-local data is not automatic cloud sync. If genuine private multi-device storage becomes a requirement, use a separate authenticated backend and persistent storage; Pages can remain the frontend.

## 3. Proposed technology stack

### Static frontend
- TypeScript and Vite for a bundled static build.
- React or a similarly lightweight component framework for dashboard workflows; confirm during the first frontend slice.
- Browser-side APIs for file selection, Web Crypto, encrypted export/import, and downloads.
- Browser-side document libraries chosen after testing DOCX/PDF extraction and generation quality.
- No external CDN or analytics script in the privacy-sensitive app path; vendor/bundle dependencies into the static build where possible.

### Discovery runner
- Python for scheduled discovery, parsing and normalization.
- pytest for source parsing, change-state, data contract, and error-handling tests.
- Ruff for Python linting.
- YAML/JSON for the curated source registry and generated public data contract.

### Persistence
- Public studio/opportunity data: normalized source data in the private repository; sanitized published JSON in the public deployment repository.
- Private candidate profile, CV-derived fields, draft text, and application interactions: browser-local encrypted records and encrypted user-controlled export/import. Do not persist raw uploaded CV files by default.
- No server-side database in the first release. A future authenticated backend would require a separate decision.

The previous Streamlit/SQLite proposal is superseded for the user-facing hosted app. Python remains useful for the Actions runner; SQLite is not required for the static/browser-local first release.

## 4. Deployment and data flow

### Public data pipeline
Curated registry on main → scheduled Action → source adapters → normalized observations → change detection → durable private state on discovery-state branch → validated public data contract → build static assets → publish sanitized files to Pages repository only when its public projection changes.

The source repo may retain operational state and richer research notes. The public deployment output must be created using an explicit allowlist, not by copying the whole source repository. Only public company facts, approved official career-route facts, public vacancy metadata, source URLs, verification state, and public change events may be published. Personal application state, private profile data, uploaded resume text, draft messages, private notes, and named personal contact notes must not be included.

If cross-repository publication is used, store the deployment token as a GitHub Actions secret with the minimum permissions required for the target repository. It must never be placed in source, JSON, HTML, JavaScript, build artifacts or logs.

### Private browser flow
User-selected file → browser memory → local text extraction → deterministic analysis and review → structured editable resume proposal → browser-generated DOCX/PDF download. Private profile/tracker records are stored locally using an encrypted client-side format and can be exported/imported by the user. The app should not transmit a CV or private data unless the user deliberately copies selected content into a separate external service.

## 5. GitHub Actions discovery workflow

The planned workflow file is .github/workflows/discover-studios.yml. Implement it after the registry/data contract and initial source adapter exist; a daily workflow that points to nonexistent scripts is not useful.

### Triggers
- Scheduled daily run, preferably at a non-top-of-hour time in Europe/Budapest (initial example: 04:23).
- workflow_dispatch for manual test, refresh and troubleshooting.
- Optional push trigger restricted to changes in the curated source registry/configuration paths.

GitHub schedule workflows run from the default branch and may be delayed or dropped under high load, especially at the start of an hour. The workflow file must be on the default branch before scheduled runs become active. In a public repository, schedules may be disabled after 60 days with no repository activity. References:
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/actions/how-tos/troubleshoot-workflows

Treat daily polling as best-effort rather than real-time monitoring. Keep manual dispatch and surface the most recent successful run/error summary.

### Minimal permissions and safety
- Use least-privilege workflow permissions. Grant contents: write only to a job that must update data in its own repository.
- For a different public site repo, use a separate narrowly scoped deploy credential in Actions secrets; a default GITHUB_TOKEN should not be assumed to write to another repository.
- Pin third-party actions to reviewed full commit SHAs where practical.
- Never expose secrets to build artifacts or logs.
- Set timeouts, bounded retries, per-domain request delays, concurrency controls, and safe failure handling.
- Do not run write-enabled publishing steps on untrusted pull-request code.
- Avoid infinite loops: registry changes may trigger a scan, while generated outputs should not retrigger a scan except where deliberately configured.

GitHub Actions permissions reference: https://docs.github.com/en/actions/security-guides/automatic-token-authentication

## 6. Studio registry and source adapters

The curated registry should include stable studio ID, canonical name/domain, official career URL, source adapter/source type, location hints when known, enabled flag, and notes. Monitoring the registry is different from discovering every studio on the internet: the daily workflow watches known studios, while broad discovery/adding new studios is a separate search/import task.

Source priority:
1. Official public board endpoint or documented public API where permitted.
2. Structured JobPosting metadata, public sitemap/feed or official ATS listing.
3. Official studio career page with source-specific parsing.
4. Manual review for inconsistent, dynamic, blocked or ambiguous sources.

Use official URLs and public data only. Do not bypass authentication, CAPTCHA, bot protections, or disallowed access. Mark blocked/unreliable pages as unavailable or needs-review, do not keep retrying aggressively, and offer a manual URL/review task.

Use modest per-domain request rates, timeouts, conditional requests (ETag/Last-Modified) when supported, sensible retries, caching, structured logs, and parser fixtures.

## 7. Normalization and change detection

Maintain a normalized observation for each job/application route. Prefer stable provider IDs; otherwise derive a stable ID from a canonicalized official URL plus studio identity. Normalize whitespace, HTML-derived text, relative URLs, locations, titles, and known fields before comparison.

For advertised jobs, capture applicable fields:
- source/provider ID and canonical URL;
- title, studio, location, workplace type, department/team, description text/hash, application URL;
- first seen, last seen, last meaningful change, current status, and source freshness;
- change-event references and evidence URLs.

For speculative/application routes, capture route type, official URL, accepted disciplines/restrictions when stated, relevant contact route, source evidence, and verification state.

Compare normalized field values and content hashes; record changes with fields changed and timestamps. Suggested events: new, updated, application-link-changed, contact-route-changed, confirmed-closed, stale, source-unavailable, and needs-review.

Closure rules:
- Explicit closure or a confirmed removal from an official job board is strong evidence.
- A timeout, 403, CAPTCHA, challenge page, parse failure, empty error page or temporary 404 is not proof of closure.
- If a previously listed job is absent, require explicit closure or repeated successful scans confirming absence before marking closed.
- Mark the source unavailable/stale and retain the previous last-known record if fetch/parse fails.
- Preserve the previous application URL and event history when a route changes.
- Keep discovery-run metadata and error counts.
- Do not store full downloaded HTML snapshots unless there is a documented, legally appropriate need. Prefer normalized fields, small relevant excerpts, hashes and evidence links.

## 8. Public data contract

Proposed generated files:
- data/public/studios.json — sanitized studio summaries and public sources.
- data/public/opportunities.json — current advertised opportunities and explicitly verified speculative routes.
- data/public/changes.json — recent public status/change events.
- data/public/metadata.json — schema version, public data snapshot timestamp, and coverage summary for the published snapshot. This is not a claim of the last successful scan time.
- data/private/monitor-state.json — private runner state/history stored on the dedicated discovery-state branch, never published. Action run history/summary is the source for the latest scan time.

The exact schema should be defined alongside the first data implementation and versioned. Routine scan time belongs in GitHub Actions run metadata; the public metadata file should report data publication freshness, not pretend to be a live scan heartbeat. Before publish, validate the public allowlist and fail the build if private-field names or unexpected keys are found. The public site should display source and freshness state, not suggest it discovered every studio globally.

## 9. Studio data model and evidence

Separate studios from opportunities, application routes, games, ownership relationships and company credits. Represent developer, co-developer, publisher, porting, support and other roles explicitly; do not infer that a publisher developed a game.

Store claim-level source URL, source type, retrieved-at/verified-at timestamps, status/confidence, supporting evidence note, and conflict notes for important facts. Distinguish verified, potential, stale, conflicting and unknown information.

## 10. Matching and role analysis

Use transparent rules first; role matching may use responsibilities and skill concepts rather than titles only. Consider support, developer experience, tooling, build/release, technical QA/automation, live services/operations, DevOps/platform, integration and other plausible adjacent role families.

Explain strengths, transferable skills, gaps, eligibility uncertainties and role stretch. Unknown salary or sponsorship must not be interpreted as a negative mismatch. No personal salary floor is used. Salary estimates remain optional and informational.

## 11. Resume analysis and generation

### Browser-first workflow
- Accept user-selected DOCX and text-based PDF files.
- Extract text in browser memory; handle extraction failures/scanned PDFs clearly. OCR is out of scope for the first release.
- Preserve the original file unchanged and do not upload it to a server.
- Compare the approved profile and resume text to a selected studio/opportunity and its requirements.
- Use deterministic checks for sections, word count/length, headings, links, formatting, keyword coverage, missing evidence, and unsupported claims.
- Produce an editable structured resume proposal, diff/review display, and downloadable DOCX/PDF output.
- Never claim arbitrary source-document layout can be faithfully preserved. Generate from a structured model and known templates.
- Do not store raw files by default; if the user opts to persist generated records, store them in encrypted browser-local data or let the user export them.

### Reference material
Keep resume guidance in docs/resume-guidelines/ with source URLs, a reviewed date, advice rationale and context-specific caveats. Summaries should be original, not copied articles. Guidance covers ATS-friendly formatting, technical-role evidence, honest keyword use, game-studio context, page length, fonts, section order, grammar/tone, document output and region/application-specific instructions. Recheck sources periodically.

Initial sources:
- University of Pennsylvania Career Services: https://careerservices.upenn.edu/channels/resume/
- Penn State Engineering résumé guidance: https://career.engr.psu.edu/students/basics/resume.aspx
- Epic Games early-career resume/portfolio advice: https://www.epicgames.com/site/earlycareers/career-paths
- PDF.js project documentation: https://mozilla.github.io/pdf.js/
- Mammoth.js documentation: https://github.com/mwilliamson/mammoth.js/

No source gives a universal resume law. Apply clean technical resume defaults, while following each employer's instructions and accounting for role and market. A creative/VFX version may prioritize portfolio work differently from a technical-support or build-engineering version.

## 12. Optional AI use

Do not integrate direct AI API calls into the first static deployment. The app can generate a prompt/context pack based on the selected opportunity and the bundled resume-guidance version. The user chooses which profile/resume details to copy to ChatGPT Free, reviews the privacy warning, and pastes the result back if useful.

ChatGPT Free is a manual external workflow, not a programmatic API. ChatGPT and API billing are separate. Any future API integration must use an authenticated backend with the key only in server-side secret storage; never place a secret in frontend code. Use a factual validation/diff step and human approval before exporting a rewritten resume.

## 13. Private client-side data and security

The public studio dataset and private personal data are separate trust domains:
- Public site/data: company facts, public job metadata, official public career/application routes, sources, verification status, public change summaries.
- Private client-side data: candidate profile, original CV, CV-extracted text, private drafts, application history, response notes and personally selected contacts.

Keep private records in encrypted browser-local storage or a user-controlled encrypted export file; choose the precise scheme during implementation and test recovery. Warn that browser-local data may be lost, does not sync, and client-side encryption cannot defend against malicious page code executing while the data is unlocked.

Security controls:
- No external analytics/CDN scripts on resume/private-data flows.
- Bundle dependencies locally and use a restrictive Content Security Policy where supported.
- Limit browser network access to public site data and required same-origin assets; do not call model APIs from browser code.
- Use a public-data allowlist and automated leak checks before deployment.
- Keep CVs, private generated resumes, database exports, profile files, applications and secrets excluded from Git.
- Use Actions secrets for any cross-repository deployment token; narrow the token's repository and permission scope, set expiry and rotation, avoid logging it, and never pass it into build variables exposed to frontend assets.
- Do not execute or render untrusted DOCX-derived HTML without sanitization; treat uploaded files as untrusted.

## 14. Testing, observability and recovery

- Fixture tests for job board and career page parsers.
- Tests for normalization, stable IDs, duplicate merges, status transitions and close-vs-unavailable rules.
- Tests that enforce public data allowlist and reject private fields.
- Browser tests that verify files are processed locally and not posted to a backend.
- Tests for text extraction warnings, resume-rule checks, structured document generation and preview/export.
- Test encrypted export/import recovery, no silent loss, and explicit warning on failed unlock/import.
- End-to-end manual checks for Pages routing, base URL paths, cache freshness, and Action publish.
- Log scan summaries, source failures, blocked/parse states and generated record counts without logging resume content or secrets.
- Provide a manual workflow trigger and recovery instructions for failed runs.

## 15. Open decisions

- Name/create the public Pages deployment repository and choose its publication flow.
- Confirm whether two-repository publication overhead is acceptable or whether a different hosting plan is chosen.
- Choose exact frontend framework after first static shell; default candidate is TypeScript + Vite with a lightweight component layer.
- Choose document libraries after testing sample DOCX/PDF formats and licensing.
- Define exact public JSON schema and initial studio registry.
- Decide local browser database/encryption format and export recovery UX.
- Verify first discovery sources and their rules, reliability and permitted access.
- Select no salary data source until evidence quality can be evaluated.
- No private backend or AI API is in scope until separately approved.
