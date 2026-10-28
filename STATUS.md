# Project Status

**Last updated:** 2026-10-28  
**Current phase:** Phase 6a browser-local Resume Lab foundation under CI repair and acceptance review on a stacked branch; Phase 5a PR #4 remains open and unmerged.  
**Working branch:** `feat/phase6-resume-lab` (stacked on `feat/phase5-studio-research`)  
**Base/main:** `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged). No changes to `main`.

## Engineering standards for remaining work

- Follow the standing rules in [AGENTS.md](AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): design note plus definition of done before each phase/unit; record deviations after implementation.
- This file is the single source for current branch/review state and volatile verification details. Elsewhere, avoid repeating branch state, SHAs, run IDs, or test counts.
- For the current phase review, use the [latest PR check status](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks). Historical run records below describe the commits named in those entries, not later heads.
- **Standards audit:** Phase 5a retains its verified checks below. Phase 6a separates the pure extraction contract, locally bundled document adapters, guidance content and UI. The pinned dependencies are Mammoth 1.13.0 and pdfjs-dist 6.4.299; the private workspace schema is unchanged and extracted text is not persisted. The first exact-head frontend check exposed formatting, lint, type and component-test failures; the lockfile follow-up restored dependency installation. Phase 6a remains unaccepted until current-head frontend/discovery checks and browser acceptance pass. Phase 5a checks remain visible in the [PR #4 check view](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks).

## Phase 6a scope and acceptance

- **Design and definition of done:** [Issue #5 — browser-local resume intake and extraction](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/5).
- **Scope:** bundled guidance; local DOCX/PDF/TXT text extraction; fixed safe warnings; 10 MiB file, 100-page PDF, and 150,000-character output limits; synthetic browser fixtures and privacy-boundary checks.
- **Deferred:** deterministic baseline checks and role comparison (Phase 6b); editable structured content/diff, DOCX/PDF generation, and manual ChatGPT handoff (Phase 6c).
- **Verification:** lockfile follow-up commit [0bbd80a](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/0bbd80adbe586bc53a61ba991805a8c28e8a716c) passed discovery fixture tests ([run 40729266004](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40729266004)) and restored `npm ci`; frontend CI on that prior head failed formatting, lint, type-checking and the Resume Lab component test ([run 40729265741](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40729265741)). The local environment cannot resolve GitHub for cloning or install dependencies. Phase 6a is not accepted until the repair head passes exact-head frontend/discovery CI and browser acceptance.
- **Not performed:** no live discovery dispatch, schedule enablement, publication, Pages deployment, repository visibility/permission change, or merge.

## Phase 5a closeout — verification evidence

- **Verified implementation revision:** `18197aede79481483bd7b70744124f12f07a843b`.
- **Frontend CI:** passed — [run 40594362707](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40594362707).
- **Discovery fixture tests:** passed — [run 40594362666](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40594362666).
- **Browser acceptance:** passed — [run 40594362667](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40594362667). It verified the explorer’s snapshot date, sample fallback wording, no unsupported availability claims, and role-family filtering, alongside browser-vault acceptance.
- **Delivered:** strict shared public snapshot schema and cross-language contract tests; historical public-data golden fixture clearly labelled as historical test data; strict calendar timestamp validation; modular explorer with component test; automated sync/persistence safety; design and engineering standards documented.
- **Not performed:** no live discovery dispatch, no schedule enablement, no publication or Pages deployment, no repository visibility/permission changes, and no merge. Last-seen roles are not proof of availability.
- **Deviations resolved:** initial CI revealed missing helper annotations, an invalid calendar date in an older test loop, a test expectation ordering issue, and imports exposed by the test split. The final listed checks passed after those corrections. For subsequent updates, use the [current PR check view](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks) because documentation-only changes produce a new head.

## Phase 5a scope delivered

- [x] Core pure logic: title parsing with `parsed from listing text` provenance, precision-first role-family matches, freshness labels/banner, filter/facet counts, target-family preset and default sort.
- [x] 15-role sample fallback in `src/data/sample-public-opportunities.json`: exact 16-field record shape; all statuses `last-seen`; obviously synthetic 2000 timestamp and placeholder `example.com` links.
- [x] Shared validator in `snapshot-validation.mjs`, used by the UI loader and sync CLI. Loader prefers Vite-globbed `src/data/public-opportunities.json`, otherwise uses sample; invalid synced data fails closed.
- [x] `npm run data:sync -- --from <path|https-url>` validated with local-file-only unit tests. Default URL is `discovery-state/public/public-opportunities.json`. A failed read/parse/validation writes nothing; generated destination is gitignored.
- [x] Only `.github/workflows/discover-studios.yml` changed among workflows: live scan stages projection in existing handoff artifact; persistence validates exact root/role fields with `validate_public_projection` and writes `public/public-opportunities.json` on `discovery-state`, not `main`.
- [x] README, handoff, changelog, implementation plan, public-data contract and ADR-028 document sample fallback, data flow and dispatch-only boundary.
- [x] One PR opened: [#4](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4). Frontend CI, discovery fixtures and PR-triggered browser acceptance passed on commit `de7160b0`; do not open another PR or merge.

## Phase 5a safety boundary

No runtime fetch of career pages/role data. `last-seen` is not proof a role is open; no hiring eligibility/work authorization is inferred. Discovery remains `workflow_dispatch` only with no schedule. No live workflow dispatch, publication, Pages deployment, visibility/permissions/secrets change, force-push, history rewrite, or branch deletion is authorized.

## Phase 6a safety boundary

The user-selected original and extracted text remain in the active Resume Lab component state only. No CV upload, raw-text vault persistence, logging, OCR, AI API, generated document, merge, discovery-state change, schedule, publication, or deployment is included. The two new dependencies are for local text extraction only. Phase 6a remains unaccepted pending the full current-head verification gate.

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

Run frontend, discovery and browser-acceptance gates against the Phase 6a implementation commit; do not accept the slice until the current tested head is green. Keep PR #4 open and unmerged; the Phase 6 branch is stacked on the Phase 5 branch. Phase 6b/6c remain deferred. No live discovery dispatch, schedule, publication or deployment is part of this slice.
