# Project Status

**Last updated:** 2026-10-27  
**Current phase:** Phase 5a sample fallback, validated sync CLI, explorer and discovery-state persistence flow implemented; PR #4 is open and unmerged.  
**Working branch:** `feat/phase5-studio-research`  
**Base/main:** `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged). No changes to `main`.

## Engineering standards for remaining work

- Follow the standing rules in [AGENTS.md](AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): design note plus definition of done before each phase/unit; record deviations after implementation.
- This file is the single source for current branch/review state and volatile verification details. Elsewhere, avoid repeating branch state, SHAs, run IDs, or test counts.
- For the current phase review, use the [latest PR check status](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks). Historical run records below describe the commits named in those entries, not later heads.
- **Standards audit:** JavaScript and Python consume the shared JSON Schema and share public/invalid fixtures. The explorer is split into orchestration, filter controls, and role-card components, with an SSR trust-boundary test. The first validation cycle found missing annotations, an impossible historical test date, and formatting errors; the corrected Phase 5a head passed frontend, discovery, and browser acceptance checks. Discovery tests are split by parser, state-transition, and boundary/workflow responsibility. The first refactor validation identified four missing imports in the split tests; this correction wires the shared NOW fixture and public-projection validator. Use the current PR check panel for exact-head results. Current check evidence is in the [PR checks view](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks).

## Phase 5a scope delivered

- [x] Core pure logic: title parsing with `parsed from listing text` provenance, precision-first role-family matches, freshness labels/banner, filter/facet counts, target-family preset and default sort.
- [x] 15-role sample fallback in `src/data/sample-public-opportunities.json`: exact 16-field record shape; all statuses `last-seen`; obviously synthetic 2000 timestamp and placeholder `example.com` links.
- [x] Shared validator in `snapshot-validation.mjs`, used by the UI loader and sync CLI. Loader prefers Vite-globbed `src/data/public-opportunities.json`, otherwise uses sample; invalid synced data fails closed.
- [x] `npm run data:sync -- --from <path|https-url>` validated with local-file-only unit tests. Default URL is `discovery-state/public/public-opportunities.json`. A failed read/parse/validation writes nothing; generated destination is gitignored.
- [x] Only `.github/workflows/discover-studios.yml` changed among workflows: live scan stages projection in existing handoff artifact; persistence validates exact root/role fields with `validate_public_projection` and writes `public/public-opportunities.json` on `discovery-state`, not `main`.
- [x] README, handoff, changelog, implementation plan, public-data contract and ADR-028 document sample fallback, data flow and dispatch-only boundary.
- [x] One PR opened: [#4](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4). Frontend CI, discovery fixtures and PR-triggered browser acceptance passed on commit `de7160b0`; do not open another PR or merge.

## Safety boundary

No runtime fetch of career pages/role data. `last-seen` is not proof a role is open; no hiring eligibility/work authorization is inferred. Discovery remains `workflow_dispatch` only with no schedule. No workflow dispatch/live scan, publication, Pages deployment, visibility/permissions/secrets change, new dependency, force-push, history rewrite, or branch deletion is approved. Fit/skill-gap explanations and manual leads are deferred to Phase 5b until a candidate profile and active vault session exist.

## CI per implementation commit

- `7e83d3e7` sample/sync initial commit: discovery fixtures passed [40578412921](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578412921); Frontend CI failed on type references, stale 8-role assertions and formatting [40578412973](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578412973).
- `b5e61d31` follow-up: discovery fixtures passed [40578764459](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578764459); Frontend CI still found a record type, sorting expectation and formatting issues [40578764261](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40578764261).
- `4e95f14b` type/test fix: discovery fixtures passed [40579095852](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579095852); typecheck and unit tests passed, with Frontend CI failing only formatting [40579095832](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579095832).
- `3c85a962` exact formatting and temporary-helper removal: Frontend CI passed [40579250442](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250442); discovery fixtures passed [40579250434](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579250434).
- `78d2fd8e` discovery-state workflow update: Frontend CI passed [40579393533](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393533); discovery fixtures passed [40579393531](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579393531).
- `1b2ab464` contract/docs/decision updates: Frontend CI passed [40579640563](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579640563); discovery fixtures passed [40579640520](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579640520).
- `eb15a5e4` final pre-PR code/docs commit: Frontend CI passed [40579829107](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579829107); discovery fixtures passed [40579829169](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579829169).
- `de7160b0` browser assertion wording fix: push Frontend CI passed [40580210104](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580210104); push discovery fixtures passed [40580210184](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580210184); PR Frontend CI passed [40580220890](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220890); PR discovery fixtures passed [40580220881](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220881); PR browser acceptance passed [40580220935](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220935). The initial browser failure [40579925245](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40579925245) was an assertion mismatch on the disclaimer wording and is fixed.

## Next action

PR [#4](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4) is open and unmerged. Its corrected PR checks are green: Frontend CI [40580220890](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220890), discovery fixtures [40580220881](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220881), and browser acceptance [40580220935](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40580220935). No live workflow was dispatched. Stop here without merging.
