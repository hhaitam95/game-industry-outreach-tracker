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

The source/specification repository `hhaitam95/game-industry-outreach-tracker` is currently public; Phase 8 does not change its visibility. Do not assume source privacy, and never place private candidate records, resumes, drafts, application history, credentials, or secrets in this repository.

ADR-055 selects same-repository GitHub Pages deployment for Phase 8. The source repository `hhaitam95/game-industry-outreach-tracker` is already public and remains the canonical location for source, tests, documentation, data contracts and workflow configuration. The manual workflow uploads only the validated Vite `dist/` directory as a Pages artifact; it does not copy the repository tree into the published website.

The publication workflow is manual-only and defaults to validation without publishing. An explicit `publish` choice may upload/deploy only from `main`; no push trigger, schedule, live-discovery dispatch, or discovery-completion publication is introduced. Configure this repository's Pages source as GitHub Actions before the first deployment. No separate repository or long-lived cross-repository token is required. The design change does not claim a live deployment.

Keep all candidate-specific data in browser-local encrypted storage/export, not in repository data or the static website's files.

GitHub Pages is a public website, not a private dashboard. Browser-local data is not automatic cloud sync. If genuine private multi-device storage becomes a requirement, use a separate authenticated backend and persistent storage; Pages can remain the frontend.

## 3. Proposed technology stack

### Static frontend
- React + TypeScript + Vite for the bundled static interface; this stack is now selected for the initial shell.
- The first shell uses simple client-side state for section navigation rather than adding a routing dependency before deep links are needed.
- Browser-side APIs for file selection, Web Crypto, encrypted export/import, and downloads.
- Browser-side document libraries chosen after testing DOCX/PDF extraction and generation quality.
- No external CDN or analytics script in the privacy-sensitive app path; vendor/bundle dependencies into the static build where possible.

### Discovery runner
- Python for scheduled discovery, parsing and normalization.
- pytest for source parsing, change-state, data contract, and error-handling tests.
- Ruff for Python linting.
- YAML/JSON for the curated source registry and generated public data contract.

### Persistence
- Public studio/opportunity data: normalized monitoring state on `discovery-state`; only the schema-validated public projection is bundled into the static build and published as part of the Pages artifact.
- Private candidate profile, CV-derived fields, draft text, and application interactions: browser-local encrypted records and encrypted user-controlled export/import. Do not persist raw uploaded CV files by default.
- No server-side database in the first release. A future authenticated backend would require a separate decision.

The previous Streamlit/SQLite proposal is superseded for the user-facing hosted app. Python remains useful for the Actions runner; SQLite is not required for the static/browser-local first release.

## 4. Deployment and data flow

### Public data pipeline
Curated registry on main → owner-triggered discovery Action → source adapters → normalized observations → change detection → durable monitoring state on `discovery-state` → validated public data contract → explicitly selected static build → upload only the checked `dist/` artifact → GitHub Pages deployment through the same repository's Actions workflow.

The source repo may retain operational state and richer research notes. The public deployment output must be created using an explicit allowlist, not by copying the whole source repository. Only public company facts, approved official career-route facts, public vacancy metadata, source URLs, verification state, and public change events may be published. Personal application state, private profile data, uploaded resume text, draft messages, private notes, and named personal contact notes must not be included.

The same-repository Pages workflow uses a read-only build job and a separate deploy job with `pages: write` and `id-token: write`; it does not require a personal access token or an Actions secret. If cross-repository publication is explicitly approved in a future decision, its credential must be narrowly scoped and never placed in frontend code, artifacts, or logs.

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
- For the selected same-repository Pages deployment, use GitHub's Pages artifact/OIDC workflow and avoid cross-repository credentials. If another deployment repository is approved in the future, use a narrowly scoped secret rather than assuming the source repository's `GITHUB_TOKEN` can write there.
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

### Phase 6a extraction boundary

The Resume Lab reads user-selected DOCX, text-based PDF, or UTF-8 TXT files in browser memory. It enforces a 10 MiB input limit, 100-page PDF limit, and 150,000-character output limit. It displays plain extracted text, safe parser warnings, and an explicit scanned-PDF/OCR limitation. It never renders DOCX-derived HTML, logs document contents, writes extracted text into the encrypted workspace schema, or sends it to a backend. Resume-guidance Markdown is bundled at build time through Vite raw imports. Role/profile comparisons, deterministic findings, structured editable content, document export, and manual AI handoff remain later Phase 6 slices.

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

- Configure this repository's Settings → Pages → Source as GitHub Actions before the first publish. The connected GitHub tools used for implementation do not expose this Pages-settings write, so the owner must complete this one-time setting.
- Choose document libraries after testing sample DOCX/PDF formats and licensing.
- Define exact public JSON schema and initial studio registry.
- Review the implemented IndexedDB/AES-GCM vault and encrypted-backup recovery UX after browser testing.
- Verify first discovery sources and their rules, reliability and permitted access.
- Select no salary data source until evidence quality can be evaluated.
- No private backend or AI API is in scope until separately approved.


## 16. Cloud-first development and feedback workflow

Use GitHub Actions as the default validation environment for committed code. The frontend CI workflow installs the npm lockfile and runs Prettier, ESLint, TypeScript checks, unit tests, and a static production build with a repository-subpath base path. Local testing is optional unless a visual review or environment-specific diagnosis is needed.

The optional local feedback report is generated by `npm run feedback-report`. It records versions, branch/commit metadata, changed path names, and check outcomes. It deliberately omits source content and raw logs, applies conservative redaction, and may omit diagnostic detail when safe classification is uncertain. Redaction is not a guarantee; users must review reports before sharing them. No GitHub token is required by the report script.


## Phase 2 implementation — encrypted browser-local workspace

- Versioned strict schemas support the profile, resume metadata, outreach drafts, and applications. Unknown fields are rejected; raw CV text and original files are not schema fields.
- IndexedDB persistence stores encrypted envelopes only. Decrypted workspace data and a non-extractable AES key remain in memory for the unlocked session; the passphrase is not saved.
- Keys are derived with PBKDF2-HMAC-SHA-256 at 600,000 iterations and a random 16-byte salt. Records use AES-256-GCM with a fresh random 12-byte IV per save/export and authenticated format metadata.
- Encrypted JSON backup import is size/format checked, authenticated/decrypted, and schema-validated before replacing local records. The import action warns that it replaces the current workspace.
- Backup size is capped at 5 MiB. A lost passphrase cannot be recovered. Browser-local encryption does not protect against malicious code/extensions while the vault is unlocked and does not sync between devices.
- The CI privacy check scans tracked paths, public files, and built output for prohibited private file types/path segments and common credential patterns. It is a guardrail, not a guarantee that every sensitive datum will be detected.
- Standard cloud CI passes for commit `a1ebe25ab7e6977fd43b89ae8e9c3fcba0e2edc0` (run 40144691400). Phase 2 remains pending acceptance until the browser storage/export/import flow is smoke-tested with dummy data.


## Phase 7 — Outreach and application workflow

- The Phase 7 feature consumes the existing sourced studio catalogue and only exposes bundled opportunity records when the snapshot is non-synthetic and the opportunity's studio is represented in the sourced catalogue. A last-seen role is never treated as proof of current availability.
- Pure template generation and pre-send checks live in `src/lib/outreach/draft-checks.mjs`. Templates use explicit user motivation and allowlisted saved profile fields; phrase matching is only a clue and never verifies a factual claim.
- The private workspace contract advances to schema v2. `validateWorkspaceData` strictly validates current records and explicitly migrates valid v1 payloads in memory. The next explicit save writes the schema-v2 workspace through the existing AES-GCM encrypted session and IndexedDB store. Unknown fields fail closed; no raw CV text or file bytes have been added to the workspace schema.
- Outreach draft revisions are append-only records with a shared series ID, version number and previous-version reference. Stored context includes the studio/role/source, profile update timestamp, user-provided resume label (metadata only), guidance version, and human review state. Saving an edit creates a new revision; it does not overwrite the earlier version.
- Application records retain their current status plus bounded activity events and an optional calendar-date follow-up. The `applied` transition requires an explicit user confirmation and writes a submitted event. Other state changes and notes are manually recorded. No status is inferred from outreach or from public job data.
- The Outreach and Applications screens are rendered by the existing vault settings/session owner so they share the already-unlocked workspace and encryption persistence path. Unsaved profile changes block these screens until the user saves or discards the changes; the workflow never silently incorporates uncommitted profile edits.
- Draft copy is user-initiated, but the app has no send/submit integration, remote API, backend, new runtime dependency, localStorage persistence, or public/private schema bridge. Browser tests use synthetic data and monitor non-read-only outbound requests during the workflow.
