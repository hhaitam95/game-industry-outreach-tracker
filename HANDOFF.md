# Project Handoff

**Last updated:** 2026-10-26  
**Project stage:** Phase 3 accepted; Phase 4 discovery pipeline first increment implemented on `feat/phase4-discovery-pipeline` (pending commit/CI and a reviewed live scan)  
**Default branch:** main  
**Baseline branch:** docs/project-foundation  
**Architecture baseline:** architecture/pages-actions-cv
**Phase 1 implementation branch:** feat/static-frontend-shell  
**Phase 2 implementation branch:** feat/browser-local-private-data  
**Phase 3 implementation branch:** feat/phase3-manual-studio-catalog
**Phase 4 implementation branch:** feat/phase4-discovery-pipeline

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
- Phase 1 standard CI passed for commit `a850adae5cb863b1f021618f22ac8d59c9771ec5` in run [40143560612](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40143560612). Phase 2 browser acceptance previously passed on `feat/browser-local-private-data` in run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383); Phase 3 acceptance for the combined workspace is recorded below.
- `npm run feedback-report` provides optional local diagnostics with fixed-category failure summaries; it omits raw diagnostic lines and filenames.
- Phase 2 adds encrypted browser-local private profile/draft/application records and encrypted backup export/import; see the acceptance gates below.
- Phase 3 adds a source-linked manual catalogue for CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games. The schema separately represents studios, sites, ownership relationships, games, credit roles, opportunities, application routes, source evidence, and change events.
- Phase 4 now has a standard-library Python discovery runner, a four-source curated registry, fixture-backed parsing/change-detection tests, a strict public-data projection, and manual-only GitHub Actions workflows. This is the first increment, not Phase 4 closeout: the local fixture suite passes 29 tests, but the full repository CI has not yet run on the patch and no live scan has been reviewed.
- Daily scheduling and public publishing remain disabled. The manual live workflow is guarded to the reviewed default branch and only persists operational state to the dedicated `discovery-state` branch.
- Resume extraction/generation and public deployment are not implemented.
- Phase 3 code acceptance is green for commit `843d6c38954ed381f3cc30ba53f25c991ecfdf47`: standard CI run [40340001102](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340001102) and combined Phase 2/3 browser acceptance run [40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974) both passed.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- Standard cloud CI passes all 28 unit tests (3 navigation, 10 private-data/schema/crypto, 6 report-safety, 9 studio-catalogue), formatting, lint, TypeScript checks, dependency audit (zero vulnerabilities), production build, privacy-boundary scan, and repository-subpath preview smoke test.
- Automated browser acceptance passed on the Phase 3 code revision using a temporary headless Chrome profile and synthetic data, including vault create/save/reload/lock/unlock, encrypted export/restore checks, incorrect-passphrase rejection, and the four-studio catalogue UI/source-link checks. The sanitized Markdown report is attached to the passing [Phase 2/3 browser workflow](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974). This is functional acceptance, not a security audit; no real personal data was used.
- The earlier baseline install reported 15 npm advisories (2 low, 3 moderate, 10 high); the refreshed lockfile's full npm audit reported zero vulnerabilities, and the current CI dependency-audit step passes.
- Public Pages deployment repository has not been created.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Commit the reviewed Phase 4 increment on `feat/phase4-discovery-pipeline` only after explicit approval; `main` remains unchanged.
2. Run the new discovery fixture workflow plus the complete existing frontend CI and browser acceptance checks on the candidate branch.
3. After merge to `main), run one explicitly selected manual live scan and inspect source coverage, source failure summaries, public projection, and durable state behavior. The configured link adapters cannot prove listing completeness and must not close vacancies based on absence.
4. Keep daily scheduling and public publishing disabled until live-source behavior and the public-data boundary have been reviewed. The separate public deployment repository and scoped publishing credentials do not yet exist.
5. Before using real personal data, understand local-only storage, the unrecoverable vault passphrase, browser-storage loss, and encrypted-backup limitations. Automated acceptance uses synthetic data and is not a security audit.

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
- Browser UI/IndexedDB/download/restore behavior has been exercised by the automated headless-browser acceptance test using synthetic data only. The browser workflow report is available from run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383). Phase 3 manual studio catalogue is implemented on `feat/phase3-manual-studio-catalog`; see the current implementation summary above.
