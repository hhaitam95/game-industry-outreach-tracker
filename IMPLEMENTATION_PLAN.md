# Implementation Plan

**Status:** Revised roadmap following GitHub Pages, scheduled discovery, and browser-first resume decisions  
**Last updated:** 2026-10-24

## Delivery principles

- Build a complete, useful path in incremental steps.
- Keep the source/specification repository private.
- Use GitHub Pages only for public static frontend assets and sanitized public studio/opportunity data.
- Keep all personal CV, profile, draft and application data out of public repositories.
- The initial release must not require a paid AI API.
- Do not enable a scheduled workflow before its runner and source registry exist.
- Test parsing, state changes, public-data sanitization and browser-only privacy behavior before real use.
- Ask explicitly before commits and report diffs/tests.

## Phase 0 — Requirements and architecture documentation

### Scope
- Document approved requirements and living-document policy.
- Document GitHub Pages constraints, public deployment split, Actions monitoring, change detection and CV workflow.
- Add resume guidance sources and synthesized guidelines.
- Establish repository hygiene, AI-agent instructions, decision records, and handoff.
- Keep current code and personal context in the private source repository.

### Exit criteria
- Architecture and privacy boundaries are documented.
- User has reviewed the decision to publish only static code/public data to a public Pages target.
- No application code or public-data workflow is claimed to exist until implemented.

## Phase 1 — Static frontend shell and safe local project setup

**Implementation status:** Added on `feat/static-frontend-shell`; use the latest GitHub Actions run to confirm the acceptance checks.

### Scope
- Initialize the chosen frontend toolchain (proposed TypeScript + Vite, lightweight component architecture).
- Add base routing/navigation, styling, static build command, and local preview.
- Add deployment-path/base-URL configuration for a GitHub Pages project site.
- Add lint/format/test scripts and minimal CI checks; run each check independently after install and audit production dependencies.
- Retain Python toolchain for future Actions discovery scripts.
- Update safe .gitignore/configuration for Node build outputs and private user files.

### Exit criteria
- Site builds to static files and works in local preview.
- Base URLs work when hosted under a repository subpath.
- No server runtime, secrets or personal files are required.

## Phase 2 — Browser-local private data foundation

### Scope
- Define local profile, resume metadata, draft and application record schemas.
- Choose client-side persistence: encrypted IndexedDB or a similarly appropriate browser-local mechanism.
- Design encrypted export/import and recovery warnings.
- Do not store the original CV by default; process selected files in browser memory.
- Enforce separation between private records and public published JSON.
- Add data export/backup tests and public-data leak checks.

### Exit criteria
- A test profile and dummy application can be saved locally, unlocked, exported and restored.
- Private data never appears in public data fixtures or build artifacts.
- Browser-local and cross-device limitations are clearly explained.

## Phase 3 — Studio and opportunity data model

### Scope
- Define canonical studio, site, ownership, game, credit, opportunity, application-route, source-evidence and change-event schemas.
- Use distinct company credit roles: developer, co-developer, publisher, porting, support and other.
- Add field-level provenance and last verification dates.
- Add validation, stable identifiers, normalization and duplicate handling.
- Seed a small manually verified set of studios for realistic tests.

### Exit criteria
- UI can display sourced studio details and verified/unverified states.
- Credits and ownership relationships are not flattened into ambiguous text.
- Schema supports manual entry without automated discovery.

## Phase 4 — Daily GitHub Actions discovery

### Scope
- Implement Python source adapters and a curated registry file.
- Implement workflow triggers: scheduled daily, workflow_dispatch, optionally push on registry changes.
- Run at a non-top-of-hour time in Europe/Budapest; use bounded concurrency, timeout and retries.
- Check official vacancies and speculative/application routes for registered studios.
- Use public APIs/ATS endpoints, structured data, feeds or official pages where permitted.
- Record normalized observations, source evidence, errors and last successful observations in a dedicated private discovery-state branch so main does not receive routine scan-state commits.
- Implement stable-ID and field/hash change detection.
- Add guarded closure/stale logic and “unavailable / needs review” states.
- Add manual review for dynamic, blocked or inconsistent sources; never bypass restrictions.
- Validate public output against an allowlist and publish only sanitized files to the separate public Pages repository.
- Store cross-repository publish credential in GitHub Actions secrets with minimum scope; never inject it into client assets.
- Keep routine state updates on the private discovery-state branch; publish to the public Pages repository only when the normalized public dataset changes. Avoid no-op public commits; retain manual dispatch and Action run summaries.

### Exit criteria
- Local/fixture tests cover new/updated/closed/stale/blocked cases.
- A failed fetch never closes a role.
- First manual run successfully processes a small known list.
- Only approved public company/role fields are published.
- Daily schedule is enabled only after workflow is on default branch and manual test succeeds.

## Phase 5 — Studio research and matching UI

### Scope
- Display scannable studio profiles, career routes, source evidence and verification state.
- Filter public studios/opportunities by country, role family, source/status, and fit.
- Explain relevance and skill gaps transparently.
- Track location and hiring eligibility as known/unknown/verified, not inferred.
- Add manual review workflow for potential leads.

### Exit criteria
- The user can research an opportunity and understand why it was found and why it may be relevant.
- Public facts have source and freshness indicators.
- Uncertain facts are visibly marked.

## Phase 6 — Resume guidance and browser-side document workflow

### Scope
- Maintain docs/resume-guidelines/ as versioned, source-linked rules.
- Bundle the applicable guidance into the static app at build time; do not rely on private files fetched from public pages.
- Implement DOCX and text-based PDF extraction in-browser using tested libraries.
- Handle extraction failures/scanned PDFs without false confidence; OCR remains optional/later.
- Implement baseline rules-based checks and role-specific comparison with profile and opportunity.
- Create structured editable resume content and diff/review display.
- Generate downloadable DOCX and PDF without a server.
- Keep original files unchanged and do not upload them to GitHub.
- Add optional manual ChatGPT prompt/copy/paste flow with disclosure warning and redaction choices.

### Exit criteria
- Supported sample CV files can be processed locally and export valid DOCX/PDF.
- No file upload/network transfer occurs by default.
- Suggested changes are explainable and do not invent experience.
- Resume standards are traceable to dated source references.

## Phase 7 — Outreach drafting and application tracker

### Scope
- Build studio-specific drafts from approved profile facts and sourced studio/role data.
- Add pre-send checks for personalization, relevance, factual grounding, generic wording, tone and privacy.
- Save draft versions locally and link them to selected profile/CV/guidance versions.
- Track manual submission confirmations, responses, follow-ups, interviews and outcomes.
- Build dashboard views and basic outcome metrics.

### Exit criteria
- The complete discovery-to-outcome workflow works.
- The tool never sends an email or marks a draft submitted without user confirmation.
- Personal drafts and application history stay out of public data/repository.

## Phase 8 — Public Pages deployment and privacy review

### Scope
- Create/confirm a separate public deployment repository containing only static assets and sanitized public JSON.
- Configure the private source repository workflow to publish the approved output using a narrowly scoped secret.
- Apply least-privilege Actions permissions, pin third-party actions to reviewed commit SHAs where practical, and review build logs/artifacts for secrets.
- Add restrictive client-side security policy where supported, bundle assets locally and avoid analytics/CDN scripts in private-data flows.
- Test public-data allowlist, site URL/base path, public access, private local storage, encrypted export/import and restore.
- Document that the site is public and browser data is per-device, not cloud sync.

### Exit criteria
- The public site exposes no profile/CV/draft/application records or secrets.
- The current source repository remains private.
- The deployed artifact builds and displays public data correctly.
- Manual recovery and privacy checks pass.
- Any real private data is introduced only after the privacy review.

## Phase 9 — Optional improvements

### Scope
- Optional salary estimates, only when defensible source data exists.
- Better discovery coverage, source adapters and confidence metrics.
- Optional backend for private multi-device synchronization, subject to a new security/cost decision.
- Optional AI API integration, subject to separate cost, privacy and deployment approval.
- Advanced analytics and historical ownership/credit changes.

### Exit criteria
- New features address measured limitations.
- Every paid service is explicitly approved.
- No optional feature compromises privacy, factuality or human control.

## Cross-cutting acceptance checks

- Public/static and private/client data have separate schemas and export paths.
- No API key or deploy token is included in public JavaScript, static JSON, source files or logs.
- GitHub Actions failures are visible and don't corrupt known-good observations.
- Daily workflow is best-effort and manually runnable.
- External sites are accessed within terms and reasonable rate limits.
- Documentation and HANDOFF.md are updated at each meaningful milestone.

## Immediate next coding task

Review the Phase 1 GitHub Actions result on `feat/static-frontend-shell` and fix any verified failures. Local execution is optional; use `docs/LOCAL_DEVELOPMENT.md` only when a visual review or machine-specific diagnosis is useful. Do not build the crawler, enable scheduled polling, process real private resume data, or deploy publicly as part of Phase 1.
