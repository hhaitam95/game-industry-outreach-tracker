# Project Handoff

**Last updated:** 2026-10-24  
**Project stage:** Phase 1 static frontend implementation committed; check the current cloud CI result  
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

- Phase 1 adds the responsive React + TypeScript + Vite frontend shell, simple local navigation, placeholder screens, and a subpath-capable static build.
- GitHub Actions CI checks formatting, lint, types, tests, and production build; verify the latest run before considering acceptance criteria satisfied.
- `npm run feedback-report` provides optional local diagnostics with conservative redaction.
- Studio discovery, persistent private data, resume extraction/generation, and public deployment are not implemented.
- Scheduled discovery workflow is specified but not implemented.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- Three initial navigation tests and three report-safety tests are included; check cloud Actions status before treating them as passing.
- Public Pages deployment repository has not been created.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Inspect the GitHub Actions result for `feat/static-frontend-shell` and address any verified CI failures.
2. Review the shell visually only if useful; local testing is optional and documented in `docs/LOCAL_DEVELOPMENT.md`.
3. Next implement the browser-local encrypted storage/export foundation and establish the public data contract.
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
