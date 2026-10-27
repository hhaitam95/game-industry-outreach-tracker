# Project Status

**Last updated:** 2026-10-27  
**Current phase:** Phase 5a sample-fallback and snapshot-sync implementation in progress on `feat/phase5-studio-research`.  
**Base/main:** `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged). Do not modify `main`.

## Current Phase 5a status

- [x] Core title parsing, precision-oriented role-family classification, freshness, filters/counts, explorer UI and studio coverage messaging.
- [x] Sample fallback design: 15 synthetic Riot-style titles in `src/data/sample-public-opportunities.json`, exact 16-field records, all `last-seen`, conspicuously synthetic date and placeholder posting URLs.
- [in progress] Shared snapshot validator, Vite glob selection (synced file first; sample fallback only when absent), and local-file-only tested `data:sync` script. The generated `src/data/public-opportunities.json` is gitignored; generated public data belongs on `discovery-state`, not `main`.
- [in progress] Approved edit to `.github/workflows/discover-studios.yml` only: stage the public projection in the handoff artifact, validate it in the isolated persistence job, and write `public/public-opportunities.json` onto `discovery-state`.
- [ ] Docs and decisions must explain sample fallback, sync process and manual-dispatch-only limitation; then run CI, open one PR and stop. Do not merge or dispatch.

## Safety boundaries

- Do not run or dispatch a live scan. The owner will run the workflow once after merge.
- Do not add schedules, change permissions/secrets, publish/deploy Pages, change visibility, add dependencies, force-push, rewrite history or delete branches.
- The app performs no runtime fetch of careers pages or role data. The sync CLI may fetch the configured raw GitHub URL when explicitly run by the owner.
- `last-seen` is an observation, not proof a role remains open. Never infer work authorization or eligibility.
- Phase 5b fit/skill-gap explanations and manual leads remain deferred until a candidate profile exists.

## CI per commit

- Prior core/UI/docs baseline [d2573b78](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/d2573b7839760ba5f3e56d591abe7d0793bcef4b): Frontend CI [40577176942](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176942) and discovery fixtures [40577176882](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176882) passed.
- Docs baseline [c8ac0baa](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/c8ac0baa57293a34eb343e9fca0d2aa9927d52ba): Frontend CI [40577623431](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577623431) and discovery fixtures [40577623744](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577623744) passed.
- Sync/sample commit [7e83d3e7](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/7e83d3e718b88b7de805984fc2a1631ad0a31b1c): discovery fixtures passed [40578412921](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578412921). Frontend CI [40578412973](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578412973) exposed type references to the old snapshot module, three stale 8-role assertions, and formatting differences. This follow-up fixes those and previews exact formatter output; CI pending.

## Next action

Complete the workflow persistence and docs, verify all checks, open one Phase 5a PR without merging it.

- Commit [4e95f14b](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/4e95f14b57bf84ea6d370b276677695f13d6d497): discovery passed [40579095852](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579095852); typecheck and tests passed but formatting failed on four files [40579095832](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579095832). Applying exact formatter output and removing temporary preview helper now.
