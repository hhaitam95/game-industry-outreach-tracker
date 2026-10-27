# Project Handoff

**Last updated:** 2026-10-27  
**Project stage:** Phase 4 accepted for manual-only use with source-coverage limitations; Phase 5 is next. Step 1 PR #2 is merged, but the Prettier formatting blocker in `src/lib/studios/catalog.mjs` remains.  
**Default branch:** `main` at `d052b51db38b8007cecc317e7ab90b1b8dc598d2`  
**Working branch:** `docs/phase4-closeout-20261027`  
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
- Phase 4 is accepted for manual-only monitoring with limits after owner-directed live run [40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573) on merged `main` commit `d052b51`. Discovery fixture tests passed (36 tests); the live scan and validated-state persistence jobs succeeded.
- Live results: Riot Games produced 183 links, but completeness is false; two prior Riot records were retained, yielding 185 projected records, all `last-seen`. CD PROJEKT RED and Naughty Dog returned `needs-review/no-matching-role-links`; Santa Monica Studio remains `needs-review/adapter-required`. The artifact is not committed or published.
- Scheduling, publishing, and deployment remain disabled. The `discovery-state` branch is in this public repository and must contain only public role observations and operational state, never candidate/application data.
- Resume extraction/generation and public deployment are not implemented.
- Phase 3 code acceptance is green for commit `843d6c38954ed381f3cc30ba53f25c991ecfdf47`: standard CI run [40340001102](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340001102) and combined Phase 2/3 browser acceptance run [40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974) both passed.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are present on the architecture baseline.
- Local setup and the privacy-conscious feedback process are documented in `docs/LOCAL_DEVELOPMENT.md`.
- Frontend CI on merged `main` commit `d052b51` still fails only the Prettier check in `src/lib/studios/catalog.mjs` ([run 40569583825](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569583825)); its other reported checks pass. Discovery fixture tests passed [run 40569583856](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569583856) and again inside the live workflow [run 40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573).
- Automated browser acceptance passed on the Phase 3 code revision using a temporary headless Chrome profile and synthetic data, including vault create/save/reload/lock/unlock, encrypted export/restore checks, incorrect-passphrase rejection, and the four-studio catalogue UI/source-link checks. The sanitized Markdown report is attached to the passing [Phase 2/3 browser workflow](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974). This is functional acceptance, not a security audit; no real personal data was used.
- The earlier baseline install reported 15 npm advisories (2 low, 3 moderate, 10 high); the refreshed lockfile's full npm audit reported zero vulnerabilities, and the current CI dependency-audit step passes.
- Pages hosting and deployment target are deferred to Phase 8; no deployment repository or publishing workflow is approved yet.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Review and merge the Phase 4 closeout PR; do not change `main` directly.
2. Treat Phase 4 as manual-only until the CD PROJEKT RED and Naughty Dog link adapters are reviewed and Santa Monica Studio has a permitted, reviewed adapter. Do not enable the schedule or publish/deploy the report.
3. Resolve the separate Prettier blocker in `src/lib/studios/catalog.mjs` before relying on green frontend CI for Phase 5.
4. Start Phase 5 by integrating a reviewed, allowlisted projection as a build-time bundled input; the browser must not fetch career pages at runtime. Display source freshness and `last-seen` honestly, without presenting it as proof a role is currently open.
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
