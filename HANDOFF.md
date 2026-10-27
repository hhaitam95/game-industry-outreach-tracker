# Project Handoff

**Last updated:** 2026-10-27  
**Project stage:** Phase 3 accepted; Phase 4 implementation is merged to `main` but remains unaccepted. Step 1 stabilization is being built on `stabilize/baseline-fixes`; see `STATUS.md`.  
**Default branch:** `main` at `f9a9cf61466d3de0dd9a77b079ceddd57fca5da8`  
**Working branch:** `stabilize/baseline-fixes`  
**Architecture baseline:** `architecture/pages-actions-cv`  
**Repository visibility:** Public. Do not commit personal records, contact details, resumes, application data, credentials, or secrets.

## Purpose

Build a personal tool to discover game studios/opportunities worldwide, verify official application routes, build evidence-backed studio profiles, assess role fit with transferable technical skills, analyze a CV, prepare reviewed studio-specific outreach drafts, and track outcomes.

## Repository baseline

- Repository: https://github.com/hhaitam95/game-industry-outreach-tracker
- This repository is public; private records, CVs, drafts, application history, contact details, and credentials must stay out of source control and public artifacts.
- Initial documentation foundation commit: 064d9487ad9b43d0b3a46d886b07d96b6371a09c on docs/project-foundation.
- Architecture baseline commit: `3a94de576a04d33b49ea8b0f5920acd143e74448` on `architecture/pages-actions-cv`.
- Phase 1 implementation is on `feat/static-frontend-shell`; inspect the live branch head and its GitHub Actions run when resuming.

## Current architecture direction

- GitHub Pages is the public static frontend; it cannot run server-side Python and is not private cloud storage.
- Defer the Pages hosting/deployment-target decision to Phase 8. No publishing, deployment, or visibility change is approved during stabilization; revisit the public-data boundary before any release.
- Browser-side processing for uploaded CVs; no upload to server by default.
- Encrypted browser-local profile/draft/application data with user-controlled encrypted export/import; no automatic cloud sync in first release.
- Discovery uses manual workflows only. Scheduling is disabled, publishing is disabled, and no further live scan is authorized during stabilization.
- Use conservative change detection; failures/blocking are not closure evidence.
- Static rules-based CV analysis and DOCX/PDF generation; optional manual ChatGPT handoff; no API key/direct model API call in frontend.
- Resume guidance belongs under docs/resume-guidelines/ and must retain sources/review dates.
- Personal salary floor does not filter or rank opportunities; salary estimates are optional and evidence-backed.
- Human reviews and sends all emails/applications.
- In-scope commits and pushes to `stabilize/baseline-fixes` are approved for this phase. The owner merges one PR after the checklist is complete or a remaining item is explicitly blocked; do not change `main` directly.

## Current implementation state

- Phase 1 adds the responsive React + TypeScript + Vite frontend shell, simple local navigation, placeholder screens, and a subpath-capable static build. GitHub Actions also starts Vite Preview with the repository base path and verifies the HTML shell plus generated JavaScript and CSS assets are served successfully.
- Phase 1 standard CI passed for commit `a850adae5cb863b1f021618f22ac8d59c9771ec5` in run [40143560612](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40143560612). Phase 2 browser acceptance previously passed on `feat/browser-local-private-data` in run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383); Phase 3 acceptance for the combined workspace is recorded below.
- `npm run feedback-report` provides optional local diagnostics with fixed-category failure summaries; it omits raw diagnostic lines and filenames.
- Phase 2 adds encrypted browser-local private profile/draft/application records and encrypted backup export/import; see the acceptance gates below.
- Phase 3 adds a source-linked manual catalogue for CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games. The schema separately represents studios, sites, ownership relationships, games, credit roles, opportunities, application routes, source evidence, and change events.
- Phase 4 has a standard-library discovery runner, curated registry, offline fixture suite, and strict public projection. The current fixture suite passes 36 tests. Phase 4 is not accepted: link-only roles now use `last-seen`, schedules remain disabled, and one earlier manual live run had imperfect coverage. The owner will perform the agreed single manual verification only after the stabilization PR is merged.
- Daily scheduling and public publishing remain disabled. The manual live workflow is guarded to the reviewed default branch and only persists operational state to the dedicated `discovery-state` branch.
- Resume extraction/generation and public deployment are not implemented.
- Phase 3 code acceptance is green for commit `843d6c38954ed381f3cc30ba53f25c991ecfdf47`: standard CI run [40340001102](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340001102) and combined Phase 2/3 browser acceptance run [40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974) both passed.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- Latest Frontend CI on stabilization commit `55b1c62` reports 31 passing npm tests, successful TypeScript checks, and successful production build; overall CI remains blocked only by Prettier formatting in `src/lib/studios/catalog.mjs`. Discovery fixture CI passes all 36 Python tests. See `STATUS.md` for run links and retries.
- Automated browser acceptance passed on the Phase 3 code revision using a temporary headless Chrome profile and synthetic data, including vault create/save/reload/lock/unlock, encrypted export/restore checks, incorrect-passphrase rejection, and the four-studio catalogue UI/source-link checks. The sanitized Markdown report is attached to the passing [Phase 2/3 browser workflow](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974). This is functional acceptance, not a security audit; no real personal data was used.
- The earlier baseline install reported 15 npm advisories (2 low, 3 moderate, 10 high); the refreshed lockfile's full npm audit reported zero vulnerabilities, and the current CI dependency-audit step passes.
- Pages hosting and deployment target are deferred to Phase 8; no deployment repository or publishing workflow is approved yet.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Complete the stabilization checklist on `stabilize/baseline-fixes`; the owner will merge the single PR after all items are completed or explicitly blocked.
2. Resolve the remaining documented Frontend CI formatting blocker or retain it as an explicit blocker in `STATUS.md`; the fixture suite and frontend tests/build must remain passing.
3. After the owner merges the stabilization PR, the owner performs one manual live scan on `main` to check CD PROJEKT RED and Naughty Dog, then reviews source coverage, source failures, public projection and durable state.
4. Keep scheduling, publishing, and deployment disabled until the owner accepts the relevant gates in a later phase; Pages hosting is deferred to Phase 8.
5. Before using real personal data, understand local-only storage, the unrecoverable vault passphrase, browser-storage loss, and encrypted-backup limitations. Automated acceptance uses synthetic data and is not a security audit.

## Known trade-offs

- Static Pages is public; private user data must not be published.
- Browser-local data is per browser/device and can be lost. Encrypted manual export/import is not seamless sync.
- Any future separate deployment repository and publishing credential would add workflow complexity and need explicit approval; the target decision is deferred to Phase 8.
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
- Historical Phase 2 baseline: 19 npm unit tests passed in run [40144691400](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40144691400). Current totals are 31 frontend unit tests and 36 discovery fixture tests; see the current status section above.
- Browser UI/IndexedDB/download/restore behavior has been exercised by the automated headless-browser acceptance test using synthetic data only. The browser workflow report is available from run [40187348383](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40187348383). Phase 3 manual studio catalogue is implemented on `feat/phase3-manual-studio-catalog`; see the current implementation summary above.
