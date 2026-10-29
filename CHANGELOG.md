# Changelog

Meaningful changes are recorded here. Current branch/review state and verification evidence are maintained only in [STATUS.md](STATUS.md).

## Unreleased

- Hardened Phase 6c resume editing: failed AI-paste additions retain user input, section moves are explicit in the before/after diff, and excessive recognized headings fall back to one text-preserving Other block. Added synthetic unit/component and browser regression coverage.
- Phase 7 adds a v2 encrypted-workspace model with strict v1 migration, reviewable outreach draft revisions, heuristic pre-send checks, and private application status/activity/follow-up tracking. No automatic sending/submission, paid AI API, backend, or personal data in repository files.
- Phase 8 supersedes the separate-repository proposal with same-repository GitHub Pages deployment through an Actions artifact. The manual workflow defaults to validation-only, requires an explicit publish selection on main, uses separate least-privilege build/deploy jobs, and enforces a static-artifact privacy gate. A live site is not deployed until the owner selects GitHub Actions as the repository's Pages source and a publish run succeeds.
- Bounded DOCX/PDF resume parsing to 30 seconds, moved Mammoth into a terminable worker, disabled PDF.js XFA, and kept parser timeouts on the existing safe error category. The pinned pdfjs-dist 6.4.299 no longer supports `isEvalSupported` as a document initialization option, so no ineffective property is passed.
- Replaced the lone non-canonical dependency tarball URL with `registry.npmjs.org` without changing its integrity hash; added offline registry-origin tests and an enforced Frontend CI check. Applied the exact formatter-diff correction to the new test file in the follow-up.
- Updated the Phase 6 browser smoke flow to navigate to Settings before adding and checking the synthetic application record; no application behavior changed.
- Fixed the Phase 6 browser smoke harness so the baseline-analysis privacy/result check invokes and reads its assertion result; product behavior and persistence boundaries are unchanged.
- Phase 6b adds deterministic, browser-memory-only resume baseline counts and explicit text-term comparisons against the unlocked profile and selected/manual role text. It does not calculate a fit score, infer eligibility, persist analysis, or invoke an AI API.
- Phase 6a adds a browser-local Resume Lab for DOCX/PDF/TXT extraction, safe parser warnings and bounded input/output, plus build-time bundled source-linked resume guidance. Raw documents/text are not persisted or uploaded; OCR, analysis, editing, export and AI handoff are not included in this slice.
- The Phase 6a CI repair tightens JSDoc/type contracts, keeps control-character filtering lint-clean, uses PDF.js loading-task cleanup, and corrects the initial-render test to match the visible scanned-PDF notice.
- Split discovery tests into parser, state-transition, and public-boundary/workflow modules with a shared offline helper module; removed unused pytest configuration because CI enforces unittest discovery.
- Split the opportunity explorer into orchestration, filter-controls and role-card components; added component-level render coverage for the sample-data banner and evidence/availability disclaimers.
- Adopted standing engineering standards for future phases: design notes and definitions of done before code, single-source versioned contracts, inward-pointing architecture, deterministic failure-path tests, enforced CI gates, cohesive reviewed changes, same-commit documentation, automation, and evidence-based closeout reporting. The rules are maintained in AGENTS.md and IMPLEMENTATION_PLAN.md and apply from the current Phase 5 work onward.
- Phase 5a adds a synthetic sample fallback, shared JavaScript snapshot validation, a validated local sync command, a static opportunity explorer with source/freshness labels, and validated persistence of generated public projections on the dedicated discovery-state branch. The app does not fetch career sources at runtime; discovery remains manual-only, with scheduling, publishing and deployment deferred.

## 2026-10-27

- Accepted Phase 4 for manual-only, best-effort monitoring with explicit source-coverage limitations. Link-only records remain last-seen, failed/incomplete sources never imply closure, and scheduling/publication/deployment remain disabled.
- Added the Phase 4 discovery pipeline: official-source registry, conservative change detection, deterministic fixtures, and an allowlisted public projection.
- Closed Phase 3 with sourced studio records, distinct ownership/game-credit relationships, verified career routes, and schema validation.

## 2026-10-25

- Added the encrypted browser-local private-data foundation with validated records, encrypted backup export/import, and browser acceptance coverage. Raw CV content is not persisted.
- Strengthened privacy-boundary checks and the feedback-report flow; configured frontend quality gates cover formatting, lint, type checks, tests, dependency audit, production build, and browser smoke checks.

## Initial project foundation

- Added the React/TypeScript/Vite static workspace, section navigation, responsive styling, repository-subpath build configuration, and GitHub Actions validation.
- Added a privacy-conscious local feedback report and documented macOS/VS Code setup.
- Documented the static-hosting privacy model, evidence-backed studio research, discovery workflow, browser-first resume processing, source-linked resume guidance, outreach drafting, and application tracking.
