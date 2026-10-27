# Project Handoff

**Last updated:** 2026-10-27  
**Project stage:** Phase 5a implementation is on `feat/phase5-studio-research`; PR #4 is open, unmerged, with Frontend CI, discovery fixtures, and browser acceptance passing.  
**Default branch:** `main` at `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged).  
**Working branch:** `feat/phase5-studio-research`  
**Repository visibility:** Public. Never commit private candidate records, CVs, application history, contact details, credentials, or secrets.

## Phase 5a implementation

- `src/data/sample-public-opportunities.json` contains 15 synthetic Riot-style roles, exact 16-field records, all `last-seen`, a plainly synthetic 2000 generatedAt date, and `example.com` placeholders.
- `snapshot-validation.mjs` is the shared JS validator used by the app loader and sync CLI. `snapshot.mjs` prefers Vite-globbed `src/data/public-opportunities.json` and falls back to the sample only when the generated file is absent. Invalid synced data fails closed. The UI clearly displays **“Sample data - not a real scan”** for fallback data.
- `npm run data:sync -- --from <path|https-url>` validates local or HTTPS input before atomically writing the gitignored `src/data/public-opportunities.json`. Default source is `discovery-state/public/public-opportunities.json`. Read/parse/schema failures leave the destination unchanged. Unit tests use local files only.
- Only `.github/workflows/discover-studios.yml` was changed among workflow files. The live job includes the public projection in the existing handoff artifact; the persistence job checks out `main` read-only for `validate_public_projection`, then commits the validated projection to `discovery-state/public/public-opportunities.json` alongside the monitor state.
- Studio cards remain. The explorer filters by studio/family/title/seniority/country/contract/freshness, presents option counts and a target-family preset, and shows snapshot date/last-seen uncertainty. No career sites or role data are fetched at runtime.
- Fit/skill-gap explanations and manual leads are deferred to Phase 5b until a candidate profile and active browser-vault session exist.

## Review and checks

PR [#4](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4) is open and **must not be merged by this task**. Corrected PR checks all passed:
- Frontend CI: [40580220890](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220890)
- Discovery fixture tests: [40580220881](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220881)
- Browser acceptance: [40580220935](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220935)

The first browser attempt failed only because the acceptance assertion omitted “that” from the required disclaimer wording. The corrected rerun passed. No live discovery workflow was dispatched; the workflow remains manual `workflow_dispatch` only with no schedule. After merge, the owner will run live discovery once, then use `npm run data:sync` for local builds.

## Safety boundaries

No merge, live scan/dispatch, schedule, publication/Pages deployment, visibility or permissions/secrets change, dependency addition, force-push, history rewrite or branch deletion. Generated public data belongs on `discovery-state`, not `main`.
