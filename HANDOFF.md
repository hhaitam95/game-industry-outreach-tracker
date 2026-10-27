# Project Handoff

**Last updated:** 2026-10-27  
**Project stage:** Phase 5a sample fallback, sync CLI, explorer, and discovery-state persistence flow implemented on the feature branch; final CI and PR browser acceptance are being checked.  
**Default branch:** `main` at `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged).  
**Working branch:** `feat/phase5-studio-research`  
**Repository visibility:** Public. Never commit private candidate records, CVs, application history, contact details, credentials, or secrets.

## Phase 5a implementation

- `src/data/sample-public-opportunities.json` contains 15 synthetic Riot-style roles, exact 16-field records, all `last-seen`, an obviously synthetic 2000 timestamp, and placeholder `example.com` posting links.
- `src/lib/opportunities/snapshot-validation.mjs` is the shared validator used by the app loader and `scripts/sync-public-snapshot.mjs`.
- `snapshot.mjs` uses Vite's eager glob for the gitignored generated file `src/data/public-opportunities.json`; when that file is absent it falls back to the sample. The UI clearly says **“Sample data - not a real scan”** for the fallback. Invalid synced data fails closed rather than silently showing the sample.
- `npm run data:sync -- --from <path|https-url>` validates before writing. The default is the raw `discovery-state/public/public-opportunities.json` URL. Failed reads or invalid JSON/schema do not modify the destination. Unit tests use local files and no network.
- Only `.github/workflows/discover-studios.yml` was changed among workflow files. A live run stages the projection in the existing handoff artifact; the isolated persistence job checks out `main` with checkout credentials disabled, validates exact public keys through the repository projection validator, then commits `public/public-opportunities.json` alongside monitoring state on `discovery-state`.
- Studio cards remain. The explorer filters by studio, family, title, seniority, country, contract and freshness; last-seen is never described as proof a role is open. No runtime career-page fetches were added.
- Fit/skill-gap explanations and manual lead management are Phase 5b, deferred until a candidate profile and active browser vault session exist.

## CI and approval boundary

- Sample/sync code passed Frontend CI [run 40579250442](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250442) and discovery fixtures [run 40579250434](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250434).
- Discovery-state workflow change passed Frontend CI [run 40579393533](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393533) and discovery fixtures [run 40579393531](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393531).
- The explorer browser acceptance check is part of the PR-triggered browser workflow. It must be observed after creating the single PR; do not dispatch the workflow manually.
- The discovery workflow remains `workflow_dispatch` only and has no schedule. Do not run it from this branch. After merge, the owner will run the live mode once; the projection should be persisted on `discovery-state` and then synced with `npm run data:sync` when needed.
- No merge, schedule, publication, Pages deployment, visibility change, permission/secret change, dependency addition, force-push, history rewrite, or branch deletion is approved.

## Next action

Finish documentation/status, run final CI, create exactly one Phase 5a PR, verify the PR checks, and stop without merging it.
