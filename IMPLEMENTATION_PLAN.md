# Implementation Plan

**Status:** Current roadmap is M0–M8 for the worldwide speculative-application directory; earlier phase notes below describe retained pre-refocus implementation.  
**Last updated:** 2026-10-29

## Current roadmap — M0 through M8

- **M0 — Land existing work and record refocus.** Existing PRs #7, #8 and #9 are already merged; the M0 refocus ADR is reviewed separately. Retain the Pages workflow and artifact/privacy checker.
- **M1 — Feature flag and reframing.** Set `FEATURES.roleExplorer = false`, hide legacy role counts/explorer copy, rename the navigation to “Speculative applications”, and align public copy/docs.
- **M2 — Domain contract.** Add a versioned `SpeculativeRoute` JSON Schema consumed by JS and Python validators, fail-closed URL/evidence validation, minimal studio entities, curated JSON loading and synthetic sample data.
- **M3 — Directory UI and private tracking.** Search/filter/sort/paginate routes, expose evidence/date/status, and add an encrypted-vault Applied/Planned marker with a clean v2-to-v3 migration.
- **M4 — Seed research.** Add no more than 30 routes per PR. Fetch each official page, document rejected/non-verifiable candidates and independently re-fetch 10% of each research batch.
- **M5 — Verification automation.** Add a route-health check and only documented public ATS adapters. Keep dispatch manual; preserve last-known records and output health data to `discovery-state`.
- **M6 — Candidate discovery at scale.** Run bounded discovery over known studios and licensed public studio lists; candidates remain unverified until direct human-level official-page evidence is recorded.
- **M7 — Publishing.** Reuse same-repository Pages Actions and the artifact/privacy checker. Validate first, deploy only from `main` after owner approval, and do not enable a schedule before explicit approval.
- **M8 — Integration and closeout.** Add speculative-application draft templates and discipline-based Resume Lab mode; verify every claimed route, privacy boundaries, role flag and green CI.

## Delivery and engineering standards

- Create a short milestone design note and definition of done before implementation; record deviations after.
- Keep domain logic, I/O adapters, validation and UI separate. Use one versioned contract per boundary and tests in each language that consumes it.
- Use synthetic/offline fixtures for ordinary tests, including negative and failure-preservation paths.
- Run configured formatting, lint, TypeScript, tests, audit, production build, privacy/artifact and browser checks on the exact PR head. Do not push formatter-diagnostic commits; fix all reported formatting issues before committing.
- Keep PRs scoped to one milestone. Push to that milestone branch; the owner merges. No schedule, publication, visibility, force-push, history rewrite, branch deletion, new dependency, secret, or workflow-permission change without explicit approval.
- Keep `STATUS.md` as the single volatile status and evidence source; keep design records in `docs/decisions/` and changelog fragments in `changelog.d/`.

## Retained pre-refocus implementation notes

The Phase 0–9 sections below document code already delivered for the earlier standard-role discovery direction. They are not the current milestone order. Preserve compatible components and tests where ADR-059 directs it; do not treat the old opportunity model as the directory’s qualifying route data.

## Phase 0 — Requirements and architecture documentation

### Scope
- Document approved requirements and living-document policy.
- Document GitHub Pages constraints, same-repository Pages artifact deployment, Actions monitoring, change detection and CV workflow.
- Add resume guidance sources and synthesized guidelines.
- Establish repository hygiene, AI-agent instructions, decision records, and handoff.
- Keep source code and non-sensitive project context in the source repository; because it is public, keep all personal context out of it.

### Exit criteria
- Architecture and privacy boundaries are documented.
- User has reviewed the decision to publish only static code/public data to a public Pages target.
- No application code or public-data workflow is claimed to exist until implemented.

## Phase 1 — Static frontend shell and safe local project setup

**Implementation status:** Implemented; current verification evidence and remaining limitations are maintained in [STATUS.md](STATUS.md).

### Scope
- Initialize the chosen frontend toolchain (proposed TypeScript + Vite, lightweight component architecture).
- Add base routing/navigation, styling, static build command, and local preview.
- Add deployment-path/base-URL configuration for a GitHub Pages project site.
- Add lint/format/test scripts and minimal CI checks; run each check independently after install and audit production dependencies.
- Retain Python toolchain for future Actions discovery scripts.
- Update safe .gitignore/configuration for Node build outputs and private user files.

### Exit criteria
- Site builds to static files; the automated Vite Preview smoke test confirms the shell HTML is served and generated JavaScript/CSS assets return successfully.
- The page and asset URLs use the configured repository subpath (`/game-industry-outreach-tracker/`). The HTTP smoke test does not verify visual layout or browser interaction.
- No server runtime, secrets or personal files are required.

## Phase 2 — Browser-local private data foundation

**Implementation status:** Implemented; current verification evidence and remaining limitations are maintained in [STATUS.md](STATUS.md).

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

**Implementation status:** Implemented; current verification evidence and remaining limitations are maintained in [STATUS.md](STATUS.md).

### Scope
- Define canonical studio, site, ownership, game, credit, opportunity, application-route, source-evidence and change-event schemas.
- Use distinct company credit roles: developer, co-developer, publisher, porting, support and other.
- Add field-level provenance and last verification dates.
- Add validation, stable identifiers, normalization and duplicate handling.
- Seed four manually curated studios with official website/career sources, selected locations, explicit game-credit roles, and directly evidenced career routes.
- Keep opportunities and change events empty until actual roles or changes are directly observed; a career page is not itself a vacancy.
- Keep public studio catalogue records separate from the encrypted private workspace; application tracker integration is a separate later decision.

### Exit criteria
- UI can display sourced studio details and verified/unverified states.
- Credits and ownership relationships are not flattened into ambiguous text.
- Schema supports manual entry without automated discovery.
- The UI displays sourced studio details, direct career links, distinct credit roles, and unknown ownership where no relationship is sourced.
- Validation rejects invalid IDs, duplicate studio names, unsupported fields/statuses, unsafe URLs, broken entity references, and verified routes without direct matching evidence.

## Phase 4 — Manual GitHub Actions discovery

**Implementation status:** Accepted for manual-only best-effort monitoring, with source limitations tracked in [STATUS.md](STATUS.md).

### Scope
- Maintain a curated registry of official career URLs and registry-owned host/path allowlists.
- Use manual `workflow_dispatch` for deterministic fixture runs and owner-authorized live checks; do not add a schedule as part of Phase 4.
- Run bounded, conservative requests to official public sources only. Respect access controls, response limits, timeouts, redirects, and rate limits.
- Record observations, provenance, freshness, and failure categories in the dedicated `discovery-state` branch without routine scan-state commits to `main`. Because this branch lives in a public repository, it must contain only public job records and operational metadata, never private candidate/application data.
- Use stable IDs and change detection; never infer closure from a failed fetch, a missing link, an incomplete listing, or a source requiring manual review.
- Keep dynamic, blocked, or inconsistent sources in `needs-review` until a permitted, reviewed adapter is available.
- Generate a strict allowlisted public projection as a short-lived Actions artifact for review. Do not commit, publish, or deploy this artifact in Phase 4; publication and hosting decisions remain in Phase 8.
- Keep the manual workflow's concurrency/timeout and separated state-persistence protections.

### Exit criteria
- Fixture tests cover new, updated, explicitly closed, stale, blocked, and link-only `last-seen` behavior.
- Failed fetches and incomplete listings preserve existing records and never create false closure events.
- Public projection validation accepts exactly the approved public fields and excludes operational/private candidate data.
- At least one owner-directed live run is reviewed on `main`, with each source's status and coverage limitations recorded.
- The accepted operational mode is manual-only; a future schedule requires a separate decision after source coverage is improved and reviewed.

## Phase 5a — Studio research and snapshot explorer

**Implementation status:** The research UI, snapshot validation/sync path, and discovery-state persistence flow are implemented; current review and verification state live in [STATUS.md](STATUS.md).

### Scope
- Preserve sourced studio profiles, verified careers routes, and evidence; display per-studio observed-link coverage without equating no observed links with no vacancies.
- Prefer the gitignored, locally synced `src/data/public-opportunities.json` when present; otherwise use tracked `sample-public-opportunities.json` and visibly label it “Sample data - not a real scan”. Never fetch career pages or role data at runtime.
- Validate the exact 16 opportunity fields, statuses, HTTPS URLs, timestamps and unique IDs with one validator shared by the UI and sync CLI; fail closed if a synced file is invalid. The sync CLI validates completely before writing.
- Show snapshot date, source status, last-seen date and freshness; never present `last-seen` as proof a role is open.
- Parse only explicit title clues, label each as `parsed from listing text`, and never infer work authorization or eligibility.
- Classify by precise keyword phrases; filter/search and sort by target family, seniority and last-seen date, with option counts and a target-family preset.
- Display source unknowns as “Not listed in source”; paginate 50 roles at a time.

### Exit criteria
- The sample validates against the exact allowlist/status enum; the generated file remains ignored by Git and is synced from `discovery-state/public/public-opportunities.json` only after validation.
- UI shows role counts, studio coverage/manual-check messages, title parsing provenance, snapshot freshness and the permanent last-seen disclaimer.
- Unit tests cover validator, parser, classification, freshness, filters, counts, sorting and golden role-title examples from the reviewed snapshot.
- Component-level render tests verify the explorer's sample-data and uncertainty labels; browser acceptance verifies explorer rendering, a reducing filter, visible snapshot date, sample fallback wording and no unsupported open/available claims.
- The user can research a public role link without implying completeness or current availability; no runtime role-source requests occur.

## Phase 5b — Profile-aware role review and lead handoff

**Implementation status:** Proposed for review on `feat/profile-aware-role-review-20261029`; exact-head CI and owner acceptance are not yet verified. See [STATUS.md](STATUS.md) for current release and verification state.

### Delivered in the proposed change
- Opt-in literal text comparison between a selected public role and the unlocked browser-local candidate profile.
- Display literal target-role/skill matches, description terms not mentioned in the profile, evidence used, and questions to verify. Absence is not presented as proof of a skill gap; there is no numeric fit score or eligibility inference.
- Optional pasted role descriptions are bounded to 150,000 characters and held only in component memory. The panel clears them on close or when the profile becomes unavailable; text is not uploaded or persisted.
- Explicit handoff into the existing Applications form, prefilled with the role, studio and official URL. The user must save the lead; the handoff does not submit or silently persist anything.
- Role browsing remains available when the vault is locked, with a clear path to Settings.
- Overview tracker metrics are driven by unlocked-vault state instead of static placeholder text; stale user-facing phase labels are removed.

### Boundaries and limitations
- The role list is a limited configured-source snapshot, not global discovery or proof of current availability. Verify the official posting.
- Text comparison is explanatory, not a fit score, fact check, or eligibility decision.
- No resume text persistence, new dependency, backend, paid API, public schema change, or automatic outbound action is introduced.
- Source-adapter coverage and live-site acceptance remain separate follow-up work.

## Phase 6 — Resume guidance and browser-side document workflow

**Implementation status:** Phase 6a/6b are merged into `main`; Phase 6c implementation and review-hardening are implemented and verified for owner review. Phase 6 is ready for the owner's review of draft PR #7; current check evidence and remaining limitations are maintained in [STATUS.md](STATUS.md).

### Delivery slices
- **Phase 6a:** build-time bundled guidance; local DOCX/PDF/TXT intake and text extraction; safe failure/warning states; strict file/page/text limits; no text persistence or network upload.
- **Phase 6b:** deterministic baseline checks and role/profile comparison with evidence-aware findings. Use literal mention detection only; missing text is not evidence that a skill is absent, and never calculate a fit score.
- **Phase 6c:** editable structured content and before/after diff, local DOCX/PDF generation, and optional manual ChatGPT handoff after a separate disclosure/redaction step. Do not persist generated resume content by default.

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

### Phase 6b exit criteria
- Baseline analysis reports only reproducible counts, section detections and count-only contact/link indicators.
- Profile skill and target-role comparisons use the active vault profile projection; lock/delete clears the projection from app state.
- Opportunity comparisons clearly distinguish synthetic sample records and last-seen statuses; no live-page fetch or fit score is introduced.
- Role descriptions and analysis remain in component memory and are cleared when the Resume Lab is left or reset.

### Full Phase 6 exit criteria
- Supported sample CV files can be processed locally and export valid DOCX/PDF.
- No file upload/network transfer occurs by default.
- Suggested changes are explainable and do not invent experience.
- Resume standards are traceable to dated source references.

### Phase 6c — Editable resume structure, provenance and local export

Design: ADR-045 in DECISIONS.md; review hardening and regression coverage: ADR-049. The design and definition of done are committed before implementation.

#### Scope
- Convert extracted text to bounded editable blocks using recognized section headings only; preserve unrecognized text in Other and do not infer job boundaries or rewrite claims.
- Provide add/edit/remove/reorder controls for block content and section, plus a before/after diff against the imported baseline.
- Label each block as imported, typed, or AI-pasted; highlight modified blocks and terms absent from the original resume and approved profile projection for human review.
- Generate an ATS-safe single-column DOCX locally without adding a dependency; test ZIP/XML and round-trip with Mammoth.
- Render a dedicated print sheet with print CSS and open the browser print dialog for user-initiated PDF saving.
- Offer a separate manual AI disclosure/copy step with editable redaction of email, phone-like and URL patterns; pasted text remains explicitly AI-pasted.
- Keep model, edits, analysis, role description and export state in memory. No vault migration, local storage, API, server, network upload, OCR, fit score, or automatic sending.

#### Definition of done
- Pure model tests cover valid/invalid shapes, bounds, stable IDs, recognized-heading splits, Other fallback, diff, provenance and unsupported-term flags.
- DOCX exports contain safely escaped Unicode text and required Office Open XML parts; malformed input fails safely; output round-trips through the current text extractor/Mammoth.
- Component tests cover editing, clearing, source labels, diff, print-sheet output, disclosure and redaction controls; browser acceptance validates the export/review path.
- No source CV, extracted text or generated block content appears in repository fixtures, logs, URLs, workspace schema or network traffic. Only synthetic test text is used.
- Format, lint, typecheck, unit/component tests, audit, build, privacy check, repository-subpath preview, browser acceptance and discovery fixtures pass on the exact final head. Any limitation/deviation is recorded here and in STATUS.md.
## Phase 7 — Outreach drafting and application tracker

**Implementation status:** Initial implementation is on `feat/phase7-outreach-tracker`. It is not merged. Design and contracts are in ADR-050; current exact-head checks and PR state are maintained in [STATUS.md](STATUS.md).

### Delivered scope

- A v2 encrypted-workspace schema with strict exact-field validation and an explicit v1 migration that preserves profile, resume metadata, legacy draft text, legacy applications, and notes.
- Editable studio-specific outreach drafts built from sourced studio context, approved saved profile fields, and the user's own stated motivation. Templates do not invent roles, skills, achievements, or game credits.
- Heuristic pre-send review for personalization, role context, motivation, literal profile-phrase matches, generic wording, tone, and common contact/link patterns. Results are prompts for human review, not factual verification or a readiness score.
- Private immutable draft revisions with series/version/parent IDs, saved studio/role/source URL, profile timestamp, user-supplied CV label (metadata only), bundled guidance version, and user-selected review state.
- An application pipeline with manually confirmed submission status, status/activity history, responses, interviews, outcomes, and next follow-up date. Leads created from drafts do not imply that a message was sent or an application submitted.
- No outbound send/submit function, AI API, new dependency, backend, localStorage, raw CV persistence, or publication behavior. All personal records remain in the existing encrypted browser-local vault.

### Definition of done

- Schema tests cover v1-to-v2 migration, preserving legacy data, strict shapes, status/date/activity bounds, and draft lineage.
- Unit/component tests cover deterministic templates, heuristic checks, sourced context, review controls, activity history, and follow-up controls.
- Browser acceptance covers two saved versions, lead creation, manual confirmation of submission, response logging, follow-up scheduling, no outbound mutation requests, reload persistence, and encrypted backup compatibility.
- Formatting, lint, typecheck, unit/component tests, audit, static build, privacy boundary, repository-subpath smoke, browser acceptance, and discovery fixtures pass on the exact final branch head.
- Documentation records the exact tested commit, actual CI outcomes, remaining limitations, and reconciliation of PR #8 against the Phase 6c squash merge. See STATUS.md for current verification and review state.

## Phase 8 — Public Pages deployment and privacy review

**Selected architecture:** Same-repository GitHub Pages artifact deployment, superseding ADR-054 with ADR-055. The source repository is already public; this phase does not change repository visibility.

### Scope
- Keep source code, tests, private-data logic, documentation, schemas and workflow in this repository; publish only the Vite `dist/` output after the public opportunity snapshot has passed the existing shared schema validator.
- Add a manual-only GitHub Pages Actions workflow. Its default run validates/builds without publication; only the explicit `publish` choice can upload a Pages artifact and deploy. Publish mode is restricted to `main`.
- During an explicitly requested publication run, validate the existing `discovery-state` snapshot via the shared schema before building. Never dispatch discovery or start a schedule from the Pages workflow.
- Use a read-only build job and a separate deployment job with only `pages: write` and `id-token: write`. Use reviewed SHA-pinned actions. Same-repository deployment requires no personal access token or deploy secret.
- Validate generated assets, repository subpath and static-artifact privacy boundary; retain CSP, local assets, and the absence of analytics/CDN scripts.
- Test public-data allowlist, artifact boundary, encrypted browser-local storage, encrypted export/import, restore, and the browser acceptance flow.
- Document that Pages content is public and browser data is per-device, not cloud sync.

### Definition of done
- ADR-055 records the hosting decision, boundaries, failure modes, test plan, rollback, and acceptance criteria before the implementation change.
- The manual-only workflow passes frontend CI, browser acceptance, discovery fixtures, output-boundary checks, and a same-repository base-path production build on the exact reviewed head.
- Only the validated `dist/` artifact is submitted to Pages. The published artifact contains no candidate profile, CV text, private drafts, application history, contact notes, credentials, or tokens.
- The owner configures this repository's GitHub Pages source as GitHub Actions.
- A manually selected publication run from `main` succeeds, the site and local assets load at `https://hhaitam95.github.io/game-industry-outreach-tracker/`, and the public content is reviewed.
- There is no workflow schedule, push trigger, or trigger from discovery completion; no artifact upload or deployment occurs in validation-only mode.
- The last known good publication and rollback procedure are documented.

### External setup dependency
The connected GitHub tools used for implementation do not expose GitHub Pages settings or a workflow-dispatch action. The owner must set this repository's Settings → Pages → Source to GitHub Actions before the first live publish; no repository creation or publishing secret is needed. The site must not be described as deployed until a successful publication and URL/privacy check have actually completed.

## Phase 9 — Launch acceptance, feedback, and stabilization

**Selected approach:** Exercise the real published site, capture feedback in public GitHub Issues using issue forms, fix launch-critical issues in small batches, and cut a stable `v1.0.0` release only after the acceptance gate passes. This phase does not automatically mark the application stable simply because it builds.

### Design and scope
- ADR-056 defines the feedback, privacy, triage, iteration, rollback, and stable-release boundaries before implementation.
- Add GitHub Issue Forms for bugs/regressions and product feedback/enhancements, plus `docs/operations/feedback-and-stability.md` explaining how to test, report, triage, prioritize, and close feedback.
- Add a clear README link to the feedback entry point. State that issues are public and prohibit CVs, resume text, private profile details, application history, correspondence, vault exports, credentials, and identifying screenshots.
- Keep feature ideas separate from defects. Triage into launch blocker, defect/regression, usability polish, and later-version backlog. Prefer a small number of bounded feedback cycles rather than broad rewrites.
- For each fix batch: create a focused branch/PR, run all required CI/browser/privacy checks, merge only after validation, manually deploy, and retest the reported behavior.
- Do not introduce paid services/dependencies, backend/cloud storage, scheduled discovery, automatic email/application submission, or broader product features during stabilization.

### Launch acceptance gate
- [ ] Owner manually runs the Pages workflow's `validate-only` mode, reviews its checks, then explicitly runs `publish` from `main`.
- [ ] Public URL `https://hhaitam95.github.io/game-industry-outreach-tracker/` loads with valid local JavaScript/CSS assets and correct repository-base routing.
- [ ] Public studio/opportunity data shows source/provenance and freshness caveats; only the validated static artifact is published.
- [ ] Core flows are tested in the real browser: studio/role exploration, vault setup/lock/unlock and encrypted backup/restore, local resume parsing/editing/export, outreach draft creation/versioning, and application tracking. Any remaining unimplemented or sample-only behavior is recorded plainly.
- [ ] No private candidate data is present in the site, repository artifacts, issue reports, or workflow logs.
- [ ] Frontend CI, browser acceptance, discovery fixtures, privacy checks and production asset smoke tests pass on the final reviewed implementation.
- [ ] No unresolved launch-blocking defects remain. Non-blocking issues and known limitations are documented.
- [ ] A stable `v1.0.0` release/tag and concise release notes are created only after the acceptance gate is satisfied.

### Feedback-cycle process
1. Owner tests the deployed build and submits one public issue per defect or improvement using the matching form.
2. Triage severity and scope. Privacy/security issues and core-flow failures block the stable release; enhancements not necessary for launch remain in the later-version backlog.
3. Select a small batch, implement it in a reviewed PR, run all checks, merge, publish manually, and ask the owner to retest that scenario.
4. Repeat until the release gate passes; do not close an issue merely because code merged. Close after the owner confirms the deployed behavior or the item is explicitly deferred with rationale.

### Rollback and later versions
- If deployment or a core workflow regresses, revert the responsible source change in a reviewed PR and manually deploy the last known-good revision. Keep the release tag immutable.
- After `v1.0.0`, new ideas are logged and prioritized as a later version (for example, a compatible minor release); they do not silently expand the stable release scope.
- Update CHANGELOG.md, STATUS.md, HANDOFF.md, and release notes with actual outcomes and known limitations.

## Cross-cutting acceptance checks

- Public/static and private/client data have separate schemas and export paths.
- No API key or deploy token is included in public JavaScript, static JSON, source files or logs.
- GitHub Actions failures are visible and don't corrupt known-good observations.
- Daily workflow is best-effort and manually runnable.
- External sites are accessed within terms and reasonable rate limits.
- Documentation and HANDOFF.md are updated at each meaningful milestone.

## Next phase entry gate

Phase 5b remains deferred until Phase 5a has been accepted. Before starting any new phase or cohesive unit, publish its design note and definition of done before code, then record deviations after implementation. Current branch/review state, verification evidence and next action are maintained only in [STATUS.md](STATUS.md).


### Phase 6a exit criteria
- Resume Lab exposes accessible local-file selection for DOCX, text-based PDF and UTF-8 TXT with a strict 10 MiB input cap, 100-page PDF cap, and 150,000-character extracted-text cap.
- Mammoth raw-text extraction and PDF.js text-layer extraction run from locally bundled packages; PDF.js's worker is a Vite asset. DOCX-derived HTML is never rendered.
- Parser failures produce fixed safe messages; scanned/image-only PDFs and empty documents warn instead of reporting successful extraction.
- Extracted text stays in component memory only. It is not written to the private workspace schema, IndexedDB, logs, reports, URLs, or repository fixtures as candidate data. Reset and navigation clear it.
- Unit, component-render, privacy-boundary, formatting, lint, typecheck, production-build, and browser acceptance checks pass on the tested commit.
- Phase 6b and Phase 6c remain outstanding after this slice.
