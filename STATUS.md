# Project Status

**Last updated:** 2026-10-29  
**Current phase:** Phase 6a+6b CI repair and acceptance. PR #4 (Phase 5a) and PR #6 (combined Phase 6a+6b) remain owner-controlled and unmerged.  
**Working branch:** feat/phase6b-resume-analysis (stacked on feat/phase6-resume-lab, which is stacked on feat/phase5-studio-research)  
**Base/main:** 07d8e15cec544e56a09fbcab44202dc7051753c6 (unchanged; no direct changes to main).

**Merge plan:** The owner merges PR #4 with a regular merge commit, not squash, to preserve the Phase 6 ancestry. After PR #4 merges, retarget PR #6 to `main`. Keep both PRs unmerged by the implementation agent.

## Engineering standards for remaining work

- Follow AGENTS.md and IMPLEMENTATION_PLAN.md: publish a design note and definition of done before code; keep pure domain logic separate from I/O/UI; test success and failure paths; update docs with implementation.
- This file is the single source for volatile branch/review/run details. Other docs should point here instead of duplicating moving SHAs or run IDs.
- Keep each delivery slice in its own branch and draft PR, stacked in order. Do not merge any PR as part of implementation.
- Current source repository visibility is public. Never commit private candidate records, resumes, drafts, applications, contact details, credentials, or secrets.
- Avoid using CI as a formatter/linter REPL. When format checking fails, use the formatter-diff diagnostic step added immediately after it, then make the exact formatted fixes in one commit. At most two CI cycles per unit; after that, take the simplest route and log it in DECISIONS.md.

## Phase 6a acceptance status

- **Scope delivered in code:** bundled guidance and local-only DOCX/PDF/TXT text extraction; safe warnings; 10 MiB input, 100-page PDF and 150,000-character output limits; synthetic parser fixtures.
- **Current repair:** Part 1 corrects the known Prettier-sensitive formatting and the browser smoke-test evaluation syntax. Exact-head CI is pending on this repair commit; do not claim acceptance until frontend, privacy-boundary, static-preview, browser acceptance, and discovery checks all pass.
- **Verified on the latest Phase 6a CI:** lint, type check, 59 frontend unit tests, dependency audit, and production build pass. Discovery fixture tests pass. The browser acceptance workflow reports failure at the combined feedback-suite gate because it includes the same formatting failure; earlier within that suite, the actual synthetic browser-vault/resume smoke test and privacy-boundary check passed.
- **Acceptance decision:** Phase 6a remains unaccepted until formatting, frontend, privacy-boundary, static-preview, browser acceptance, and discovery checks all pass on one exact head. Do not label Phase 6 complete while this remains open.
- **Links:** [Phase 6a draft PR #6](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/6); latest known [frontend CI](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40766780565); [browser acceptance](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40766780580); [discovery fixtures](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40766780595).

## Phase 6b implementation boundary

- **Design and definition of done:** ADR-038 in DECISIONS.md.
- The role snapshot contains titles and metadata, not full job requirements. In the absence of user-pasted role text, matching is limited to the selected title. Synthetic sample roles and last-seen status must not be presented as confirmed vacancies.
- Resume text, pasted role description, private profile projection and analysis remain in browser memory. Do not persist them, log them, upload them, or add them to the public snapshot.
- Phase 6c remains outstanding: editable structured resume proposal/diff, download generation and optional manual AI handoff are not included in Phase 6b.
- No live discovery dispatch, schedule enablement, publishing, Pages deployment, repo visibility/permissions change, or merge is performed.

## Phase 6b implementation status

- **Scope implemented:** deterministic baseline counts; common section-heading detection; count-only email/phone/URL indicators; exact profile-skill mentions; target-role phrase comparison; representative terms from selected role title and optional manually pasted role text.
- **Privacy:** Resume text, role description, analysis result, and the current profile projection stay in browser memory. No raw resume excerpts or contact values are displayed in analysis findings; no AI API, backend, external fetch, or vault schema change is introduced.
- **Known limitation:** The previously recorded formatter blocker is addressed in the Part 1 repair commit; exact-head CI is pending. Phase 6a+6b are not accepted until frontend, privacy, browser acceptance, and discovery checks pass on one exact PR head.

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
