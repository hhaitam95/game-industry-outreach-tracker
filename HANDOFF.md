# Project Handoff

**Last updated:** 2026-10-25  
**Project stage:** Phase 2 automated browser acceptance and cloud CI pass on `feat/browser-local-private-data`; ready to plan Phase 3  
**Default branch:** main  
**Baseline branch:** docs/project-foundation  
**Architecture baseline:** architecture/pages-actions-cv
**Phase 1 implementation branch:** feat/static-frontend-shell  
**Phase 2 implementation branch:** feat/browser-local-private-data

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
- Phase 1 standard CI passed for commit `a850adae5cb863b1f021618f22ac8d59c9771ec5` in run [40143560612](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40143560612). Phase 2 standard CI passed for the current implementation in run [40187348311](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348311); the complete feedback suite and automated browser acceptance report passed in run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383).
- `npm run feedback-report` provides optional local diagnostics with fixed-category failure summaries; it omits raw diagnostic lines and filenames.
- Phase 2 adds encrypted browser-local private profile/draft/application records and encrypted backup export/import; see the acceptance gates below.
- Studio discovery, resume extraction/generation, scheduled polling, and public deployment are not implemented.
- Scheduled discovery workflow is specified but not implemented.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- The standard cloud workflow passes all 19 unit tests (3 navigation, 10 private-data/schema/crypto, 6 report-safety), formatting, lint, TypeScript checks, dependency audit (zero vulnerabilities), production build, privacy-boundary scan, and repository-subpath preview smoke test.
- Automated browser acceptance passes 12/12 steps using a temporary headless Chrome profile and synthetic data: vault creation, profile/application persistence, reload-to-locked state, unlock, encrypted IndexedDB and backup checks, lock/unlock, backup restore, and imported-passphrase verification. The sanitized Markdown report is attached to the browser workflow run.
- The earlier baseline install reported 15 npm advisories (2 low, 3 moderate, 10 high); the refreshed lockfile's full npm audit reported zero vulnerabilities, and the current CI dependency-audit step passes.
- Public Pages deployment repository has not been created.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Phase 2 acceptance is complete for the tested flow: standard CI and automated browser acceptance both pass on `feat/browser-local-private-data`.
2. Before using real personal data, understand the local-only storage, unrecoverable passphrase, browser-storage loss, and encrypted-backup limitations; the automated test used only synthetic data and is not a security audit.
3. Phase 3 can define studio/opportunity schemas and seed a small sourced dataset. Build the discovery runner only after the registry, normalizer, and tests exist.

## Known trade-offs

- Static Pages is public; private user data must not be published.
- Browser-local data is per browser/device and can be lost. Encrypted manual export/import is not seamless sync.
- A separate public deployment repository preserves this repo's privacy but adds a deployment token and workflow complexity.
- API-based AI analysis requires a separate backend and cost/privacy decision.
- Daily source monitoring is best effort and cannot guarantee global completeness.

## Handoff rules

Read README.md, PROJECT_SPECS.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, DECISIONS.md, AGENTS.md, and this file. Inspect the actual repository refs, files and tests before acting. Treat source code and GitHub state as authoritative, not prior chat context alone.


## Phase 2 implementation and acceptance status

- Branch: feat/browser-local-private-data, based on Phase 1 commit a850adae5cb863b1f021618f22ac8d59c9771ec5.
- Settings supports create/unlock, profile fields, application records, encrypted backup export/import, explicit lock, and local deletion.
- Private data modules are under src/lib/private-data/: schema.mjs (strict validation), crypto-vault.mjs (PBKDF2/AES-GCM), and indexed-db.mjs (encrypted-envelope-only persistence).
- tests/private-data.test.mjs covers schema rejection, URL validation, encryption round trips, plaintext canaries, wrong-passphrase/tampering, KDF/size bounds, and refusal to store plaintext.
- scripts/check-public-data-boundary.mjs scans tracked paths and public/build output for prohibited private file types/path segments and common credential formats.
- Cloud validation: 19 unit tests pass; formatting, lint, TypeScript, npm audit (zero vulnerabilities), subpath build, privacy-boundary scan, and Vite Preview HTTP smoke test all pass in GitHub Actions run 40144691400.
- Browser UI/IndexedDB/download/restore behavior has been exercised by the automated headless-browser acceptance test using synthetic data only. The browser workflow report is available from run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383). Phase 3 remains the next planned milestone.
