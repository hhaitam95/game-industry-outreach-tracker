# Project Status

**Last updated:** 2026-10-29  
**Current phase:** Phase 6 Part 2 hygiene. Phase 6a+6b Part 1 verification is green on current head; PR #4 (Phase 5a) and PR #6 (Phase 6a+6b) remain owner-controlled and unmerged.  
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
- **Acceptance result:** Phase 6a+6b Part 1 is green on exact head `154bc0979a3d54c682d96d940a5c517af762f63f`. Frontend CI passed [PR run 40842791525](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791525), browser acceptance passed all steps [PR run 40842791518](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791518), and discovery fixtures passed [PR run 40842791533](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791533). Both branch-push Frontend CI and discovery fixture jobs also passed on this exact head.
- **Prior repair diagnostics:** `a8c74f96` fixed the uninvoked analysis-state evaluator; `154bc097` fixed Settings navigation in the browser smoke. The failures were test-harness issues, not product runtime defects; the subsequent exact-head runs linked above pass.
- **Acceptance decision:** Phase 6a+6b Part 1 meets its current CI gate on `154bc097`. Do not label Phase 6 complete overall; Part 2 hygiene and Phase 6c are still outstanding.
- **Links:** [Phase 6a+6b draft PR #6](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/6); current PR-head checks: [Frontend CI](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791525), [browser acceptance](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791518), [discovery fixtures](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791533).

## Phase 6b implementation boundary

- **Design and definition of done:** ADR-038 in DECISIONS.md.
- The role snapshot contains titles and metadata, not full job requirements. In the absence of user-pasted role text, matching is limited to the selected title. Synthetic sample roles and last-seen status must not be presented as confirmed vacancies.
- Resume text, pasted role description, private profile projection and analysis remain in browser memory. Do not persist them, log them, upload them, or add them to the public snapshot.
- Phase 6c remains outstanding: editable structured resume proposal/diff, download generation and optional manual AI handoff are not included in Phase 6b.
- No live discovery dispatch, schedule enablement, publishing, Pages deployment, repo visibility/permissions change, or merge is performed.

## Phase 6b implementation status

- **Scope implemented:** deterministic baseline counts; common section-heading detection; count-only email/phone/URL indicators; exact profile-skill mentions; target-role phrase comparison; representative terms from selected role title and optional manually pasted role text.
- **Privacy:** Resume text, role description, analysis result, and the current profile projection stay in browser memory. No raw resume excerpts or contact values are displayed in analysis findings; no AI API, backend, external fetch, or vault schema change is introduced.
- **Known limitation:** No Phase 6a+6b Part 1 CI blocker remains on exact head `154bc097`. Phase 6b’s product boundaries remain unchanged: browser-memory-only analysis, no upload/API, no persistence of resume text.

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

## Phase 6a+6b Part 1 CI evidence

- Lockfile hygiene commit `8f24c9ea`: registry-origin check passed and 7 new allowlist tests passed; all 74 unit tests, lint, typecheck, dependency audit and build passed. The first Frontend CI cycle failed only `format:check` on wrapping in `tests/lockfile-registry.test.mjs`, with exact correction logged by CI ([6b run 40843400195](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40843400195), [6a run 40843404954](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40843404954)). Discovery fixtures passed on both branches ([40843400252](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40843400252), [40843405035](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40843405035)). Exact Prettier wrapping has been corrected in the follow-up; second and final cycle is pending.

- Final exact-head commit `154bc097`: Frontend CI passed on 6a [40842783624](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842783624), 6b [40842778716](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842778716), and PR #6 [40842791525](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791525). Discovery tests passed on 6a [40842783616](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842783616), 6b [40842778973](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842778973), and PR #6 [40842791533](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791533); browser acceptance passed [40842791518](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842791518).
- Repair commit `d8b1cb34b1bbcdf5e5c71b64320721ecd6e4bb80`: Frontend CI push [run 40786353689](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786353689) and PR [run 40786376220](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786376220) found Prettier differences in `src/components/ResumeLab.tsx`, `src/lib/resume/analysis.mjs`, and `scripts/browser-vault-smoke.mjs`. The formatter-diagnostic step succeeded and logged the exact diff. Lint, typecheck, all 67 unit tests, dependency audit, and production build passed; privacy-boundary and preview checks were skipped because formatting failed. Discovery fixture tests passed on push [run 40786353516](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786353516) and PR [run 40786376222](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786376222).
- Follow-up commit `21e42e2be207a78f6f0c686c74b05c0adb12b18b`: Frontend CI push [run 40786545465](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786545465) and PR [run 40786552535](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786552535) found only the analysis-section opening-tag indentation in `ResumeLab.tsx`. The formatter-diagnostic step logged the exact correction. Discovery fixtures passed on push [run 40786545557](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786545557) and PR [run 40786552517](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40786552517). Lint, typecheck, unit tests and dependency audit passed; production build and downstream checks were still running when this note was prepared.
- Repair commit `a8c74f96`: Frontend CI passed on the 6a/6b push runs [40842339640](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842339640) and [40842333544](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842333544), PR Frontend CI [40842348231](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842348231), and all six branch/PR discovery checks. Browser acceptance passed analysis/private-profile checking but failed “Add synthetic application” because the page remained on Resume Lab [run 40842348276](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40842348276). The navigation correction is pending exact-head verification.

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

The npm registry hygiene unit is on CI cycle 2 after applying the exact formatter diff from cycle 1. If the second cycle exposes another blocker, stop and record the safest disposition rather than starting a third cycle. Next units are parser timeouts/security hardening, a behavior-preserving ResumeLab split, then CSP review. Do not create Phase 6c until the owner merges PR #6; keep PR #4/#6 unmerged here.
