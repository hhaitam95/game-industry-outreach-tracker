# Project Status

**Last updated:** 2026-10-27  
**Current phase:** Phase 5a sample fallback, validated sync CLI, explorer and discovery-state persistence flow implemented; final PR browser acceptance is the remaining review gate.  
**Working branch:** `feat/phase5-studio-research`  
**Base/main:** `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged). No changes to `main`.

## Phase 5a scope delivered

- [x] Core pure logic: title parsing with `parsed from listing text` provenance, precision-first role-family matches, freshness labels/banner, filter/facet counts, target-family preset and default sort.
- [x] 15-role sample fallback in `src/data/sample-public-opportunities.json`: exact 16-field record shape; all statuses `last-seen`; obviously synthetic 2000 timestamp and placeholder `example.com` links.
- [x] Shared validator in `snapshot-validation.mjs`, used by the UI loader and sync CLI. Loader prefers Vite-globbed `src/data/public-opportunities.json`, otherwise uses sample; invalid synced data fails closed.
- [x] `npm run data:sync -- --from <path|https-url>` validated with local-file-only unit tests. Default URL is `discovery-state/public/public-opportunities.json`. A failed read/parse/validation writes nothing; generated destination is gitignored.
- [x] Only `.github/workflows/discover-studios.yml` changed among workflows: live scan stages projection in existing handoff artifact; persistence validates exact root/role fields with `validate_public_projection` and writes `public/public-opportunities.json` on `discovery-state`, not `main`.
- [x] README, handoff, changelog, implementation plan, public-data contract and ADR-028 document sample fallback, data flow and dispatch-only boundary.
- [ ] Open one PR, verify PR-triggered browser acceptance (explorer/filter/snapshot date/wording), and stop without merging.

## Safety boundary

No runtime fetch of career pages/role data. `last-seen` is not proof a role is open; no hiring eligibility/work authorization is inferred. Discovery remains `workflow_dispatch` only with no schedule. No workflow dispatch/live scan, publication, Pages deployment, visibility/permissions/secrets change, new dependency, force-push, history rewrite, or branch deletion is approved. Fit/skill-gap explanations and manual leads are deferred to Phase 5b until a candidate profile and active vault session exist.

## CI per implementation commit

- Core UI/docs baseline [d2573b78](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/d2573b7839760ba5f3e56d591abe7d0793bcef4b): Frontend CI [40577176942](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176942) and discovery fixtures [40577176882](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176882) passed.
- Docs baseline [c8ac0baa](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/c8ac0baa57293a34eb343e9fca0d2aa9927d52ba): Frontend CI [40577623431](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577623431) and discovery fixtures [40577623744](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577623744) passed.
- Sample/sync implementation [3c85a962](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/3c85a96280a415e4074ffc17d1257eb57c7bb2e5): Frontend CI [40579250442](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250442) and discovery fixtures [40579250434](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250434) passed.
- Discovery-state workflow change [78d2fd8e](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/78d2fd8e5f08b2efd3446579cae6e765bc7c3a06): Frontend CI [40579393533](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393533) and discovery fixtures [40579393531](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393531) passed.

## Next action

Create the single Phase 5a PR, verify its checks/browser acceptance, and stop without merging.
