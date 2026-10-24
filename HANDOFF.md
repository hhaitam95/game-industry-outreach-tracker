# Project Handoff

**Last updated:** 2026-10-25  
**Project stage:** Phase 1 automated acceptance checks are implemented and validated on the closeout tree; the feature-branch CI run is the final acceptance gate  
**Default branch:** main  
**Baseline branch:** docs/project-foundation  
**Architecture baseline:** architecture/pages-actions-cv
**Phase 1 implementation branch:** feat/static-frontend-shell

## Purpose

Build a personal tool to discover game studios/opportunities worldwide, verify official application routes, build evidence-backed studio profiles, assess role fit with transferable technical skills, analyze a CV, prepare reviewed studio-specific outreach drafts, and track outcomes.

## Repository baseline

- Repository: https://github.com/hhaitam95/game-industry-outreach-tracker
- Current source/specification repository is private.
- Initial documentation foundation commit: 064d9487ad9b43d0b3a46d886b07d96b6371a09c on docs/project-foundation.
- Architecture baseline commit: `3a94de576a04d33b49ea8b0f5920acd143e74448` on `architecture/pages-actions-cv`.
- Phase 1 implementation is on `feat/static-frontend-shell`; inspect the live branch head and its GitHub Actions run when resuming.

## Current architecture direction

- GitHub Pages is the public static frontend; it cannot run server-side Python and is not private cloud storage.
- Keep this repository private. GitHub Free Pages needs a public source repository, so the plan is a separate public deployment repo with only static assets and allowlisted public studio/opportunity data.
- Browser-side processing for uploaded CVs; no upload to server by default.
- Encrypted browser-local profile/draft/application data with user-controlled encrypted export/import; no automatic cloud sync in first release.
- Daily GitHub Actions schedule plus manual dispatch monitors the known registry; does not discover every studio worldwide.
- Use conservative change detection; failures/blocking are not closure evidence.
- Static rules-based CV analysis and DOCX/PDF generation; optional manual ChatGPT handoff; no API key/direct model API call in frontend.
- Resume guidance belongs under docs/resume-guidelines/ and must retain sources/review dates.
- Personal salary floor does not filter or rank opportunities; salary estimates are optional and evidence-backed.
- Human reviews and sends all emails/applications.
- Explicit approval is required before every commit.

## Current implementation state

- Phase 1 adds the responsive React + TypeScript + Vite frontend shell, simple local navigation, placeholder screens, and a subpath-capable static build. GitHub Actions also starts Vite Preview with the repository base path and verifies the HTML shell plus generated JavaScript and CSS assets are served successfully.
- The isolated closeout validation run passed formatting, lint, type checks, all nine unit tests, dependency audit, the repository-subpath production build, and the preview HTTP smoke test. The standard CI run on the final feature-branch closeout commit remains the acceptance gate.
- `npm run feedback-report` provides optional local diagnostics with fixed-category failure summaries; it omits raw diagnostic lines and filenames.
- Studio discovery, persistent private data, resume extraction/generation, and public deployment are not implemented.
- Scheduled discovery workflow is specified but not implemented.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- Three navigation tests and six report-safety tests are included (nine total). All nine passed in the closeout validation run.
- The earlier baseline install reported 15 npm advisories (2 low, 3 moderate, 10 high); the refreshed lockfile's full npm audit reported zero vulnerabilities, and the current CI dependency-audit step passes.
- Public Pages deployment repository has not been created.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Use the final standard CI run on the `feat/static-frontend-shell` closeout commit as the Phase 1 acceptance gate; do not begin Phase 2 until it is green.
2. The automated preview smoke test checks HTTP delivery of the shell and generated assets under the repository subpath; it does not check visual layout. A visual browser review has not been performed and remains optional.
3. After acceptance, begin the browser-local encrypted storage/export foundation with schemas and dummy test data. Do not use real private CV/application data or deploy publicly as part of that work.
4. Build the discovery runner and scheduled workflow only after the studio registry, normalizer, and tests exist.
5. Do not deploy public data until the public-data allowlist and privacy checks are tested.

## Known trade-offs

- Static Pages is public; private user data must not be published.
- Browser-local data is per browser/device and can be lost. Encrypted manual export/import is not seamless sync.
- A separate public deployment repository preserves this repo's privacy but adds a deployment token and workflow complexity.
- API-based AI analysis requires a separate backend and cost/privacy decision.
- Daily source monitoring is best effort and cannot guarantee global completeness.

## Handoff rules

Read README.md, PROJECT_SPECS.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, DECISIONS.md, AGENTS.md, and this file. Inspect the actual repository refs, files and tests before acting. Treat source code and GitHub state as authoritative, not prior chat context alone.
