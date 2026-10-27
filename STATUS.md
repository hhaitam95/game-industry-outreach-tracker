# Project Status

**Last updated:** 2026-10-27
**Current phase:** Phase 4 accepted for manual-only use with source-coverage limitations; Phase 5 is next.
**Working branch:** `docs/phase4-closeout-20261027`
**Base/main:** `d052b51db38b8007cecc317e7ab90b1b8dc598d2` (PR #2 merged). The owner reviews and merges this closeout PR; do not change `main` directly.
**Phase status:** Phase 3 remains accepted. Phase 4's owner-directed live run completed on `main` at [run #40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573). The pipeline is accepted for manual-only use, not for scheduled monitoring: Riot returned 183 role links but no complete-listing evidence; CD PROJEKT RED and Naughty Dog need adapter review; Santa Monica Studio remains manual-review-only. Scheduled runs, public publishing, and Pages deployment remain disabled. Frontend CI still has a separate Prettier blocker in `src/lib/studios/catalog.mjs`.

## Working agreement and approval scope

- The stabilization PR was merged; this follow-up contains only evidence-backed closeout documentation. Keep this work on `docs/phase4-closeout-20261027` and let the owner merge the resulting PR.
- One owner-directed live run was explicitly authorized and completed: [run #40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573). Do not run another scan or dispatch another workflow without renewed explicit owner authorization.
- Not approved: direct changes to `main`; enabling schedules; publishing data or deploying Pages; changing repository visibility; force-pushes/history rewrites; deleting branches; dependencies outside scope; or secrets/workflow-permission changes.
- Do not manually alter `discovery-state`. The approved workflow updated it through its isolated persistence job. The repository is public, so this branch must contain only public role observations and operational state—never candidate data.

- Update this file in every implementation commit and report CI for each commit. Commit after each completed item so progress survives interruptions.
- Repository is public. Do not commit personal data, contact details, resumes, profile details, private drafts/application records, credentials, tokens, or keys.
- The owner accepts the GitHub write tool's default commit author for this repository; no personal data should be added to file contents. Check every commit for sensitive content before pushing.

## Step 1 — Stabilization checklist

- [x] Item 1: Create this status manifest on the phase branch only.
- [blocked] Item 2: `src/lib/studios/catalog.mjs` imports and validates `config/studio-registry.json`; career evidence/routes derive from it. Riot uses `/en/work-with-us/jobs` and the regression test covers enabled-source/verified-route matching. Discovery fixtures, frontend unit tests, typecheck, and build pass, but repeated Frontend CI runs still fail only Prettier formatting in `catalog.mjs`; keep this explicit blocker rather than making further speculative formatting edits.
- [x] Item 3: added a shared 32 MiB serialized-workspace cap and 48 MiB encrypted-envelope cap in `src/lib/private-data/limits.mjs`; schema validates serialized UTF-8 size, encryption/storage use the shared envelope limit, and the maximum configured workspace is tested through save/load with synthetic data. Discovery tests passed; Frontend CI failed only the item 2 Prettier check.
- [x] Item 4: repeated identical failure status/category now emits no duplicate event; status or error-category changes emit a new event. Event-log truncation warns with `RuntimeWarning`; fixture tests cover repeat, transition, and truncation.
- [x] Item 5: link-only roles use public status `last-seen` plus existing `lastSeenAt`; absence never closes them, and the projection validator accepts the status. Complete and incomplete listings now converge to `last-seen` without repeating transition events. Explicit closure or expired `validThrough` still removes roles from public projection. Choice recorded in `DECISIONS.md` as ADR-024.
- [x] Item 6: moved implementation into `fetch.py`, `adapters.py`, `state.py`, and `projection.py`; `pipeline.py` now re-exports the prior API as a compatibility facade, and no existing test/import was edited.
- [x] Item 7: `docs/LOCAL_DEVELOPMENT.md` now records 31 npm tests and the actual `test-results/browser-acceptance-report.md` path; the duplicate ADR is renumbered to ADR-023; stale branch-state/visibility claims are corrected; the Phase 2 browser workflow no longer triggers on a Phase 3 branch. `DECISIONS.md` records accepted default Gmail commit metadata, defers Pages hosting to Phase 8, and defers speculative routes.
- [x] Item 8: added the branch-cleanup proposal below using read-only branch comparisons against `main` at `f9a9cf6`. The two temporary branches with unique commits are preserved for review. No branch was deleted or changed.
- [blocked] Step 1 exit: PR [#2](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/2) is merged, but item 2 remains blocked on Prettier formatting in `src/lib/studios/catalog.mjs`. Discovery fixtures, frontend tests, typecheck, and build have passed; overall Frontend CI remains red for that formatting check. Track and fix this before relying on the frontend CI gate for Phase 5.

## Phase 4 acceptance criteria

- [x] Fixture tests cover new, updated, closed, stale, blocked, and link-only `last-seen` behavior; 36 discovery fixture tests passed in the live workflow.
- [x] A failed fetch or missing role link never closes a role; CD PROJEKT RED and Naughty Dog were flagged for review rather than treated as empty listings.
- [x] Link-only roles use `last-seen`, not `announced`; absence from an incomplete listing cannot close them.
- [x] The public projection contains only the exact 17-field allowlist and excludes private candidate/application fields.
- [x] Scheduled execution remains disabled.
- [x] The owner-directed manual live run was completed on `main` at [run #40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573).

**Acceptance boundary:** Phase 4 is accepted for manual-only, best-effort monitoring with explicit source limitations. The workflow run succeeded operationally, but it did not establish complete four-studio coverage. Do not enable a schedule or publish this projection until adapter coverage, freshness semantics, and the required approvals have been reviewed.

## Phase 4 live-run findings (2026-10-27)

- Commit: `d052b51db38b8007cecc317e7ab90b1b8dc598d2`; [workflow run #40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573) completed successfully, including the scan, sanitized-artifact upload, and isolated state-persistence job.
- CD PROJEKT RED: `needs-review`, 0 links, `no-matching-role-links`; no closure inference.
- Naughty Dog: `needs-review`, 0 links, `no-matching-role-links`; no closure inference.
- Santa Monica Studio: `needs-review`, 0 links, `adapter-required`; it remains manual-review-only.
- Riot Games: `success`, 183 links extracted, `listing_complete=false`. The observed records are useful role leads, not proof that the source listing was exhaustive or that roles are currently open.
- The projection contains 185 Riot records: 183 returned in this run plus two previously recorded roles preserved because link-only listing absence cannot establish closure. All 185 have status `last-seen`. A ten-record structural sample check found no duplicate IDs or missing titles/URLs; sampled URLs use the configured HTTPS Riot host/path. This is a structural check, not a claim that every destination was freshly live-verified.
- Projection shape verified: each record contains exactly `id`, `studioId`, `studioName`, `title`, `url`, `locations`, `employmentType`, `datePosted`, `validThrough`, `status`, `sourceUrl`, `firstSeenAt`, `lastSeenAt`, `lastChangedAt`, `observedAt`, and `contentHash`. The generated projection was an Actions artifact only; it was not committed, published, or deployed.

## Phase exit checklist from IMPLEMENTATION_PLAN.md

### Phase 0 — Requirements and architecture
- [x] Architecture and privacy boundaries documented.
- [ ] Owner review of the planned public Pages target/hosting approach is deferred to Phase 8.
- [x] Implementation status and unimplemented claims distinguished in documentation.

### Phase 1 — Static frontend shell
- [x] Static site builds and the Vite Preview smoke test verifies shell HTML and generated assets.
- [x] Page and asset URLs use the repository base path.
- [x] No server runtime, secrets, or personal files are required.

### Phase 2 — Browser-local private data
- [x] Dummy profile/application data can be saved locally, unlocked, exported, and restored.
- [x] Private data is excluded from public fixtures/build artifacts.
- [x] Browser-local and cross-device limitations are documented.

### Phase 3 — Studio and opportunity data model
- [x] UI displays sourced studio details and verified/unverified states.
- [x] Credits and ownership relationships remain distinct; manual entry works without automated discovery.
- [x] Validation rejects invalid IDs, duplicate names, unsupported fields/statuses, unsafe URLs, broken references, and verified routes without matching evidence.

### Phase 4 — GitHub Actions discovery

- [x] Fixture tests cover new/updated/closed/stale/blocked behaviors, link-only `last-seen` semantics, and conservative failure handling.
- [x] Failed sources do not cause role closure; explicit closure/expiry evidence is required for link-only roles.
- [x] The public projection validates exact allowlisted keys and no private application fields.
- [x] One manual live run was reviewed on `main`; see the run findings above.
- [x] Schedule remains disabled.
- [ ] Complete automated coverage for all four studios. CD PROJEKT RED and Naughty Dog currently need role-link adapter review, and Santa Monica Studio needs a permitted adapter; this is an explicit limitation, not a successful all-studio crawl.


### Phase 5 — Studio research and matching UI
- [ ] User can research an opportunity and understand why it may be relevant.
- [ ] Public facts show source and freshness; uncertain facts are visibly marked.

### Phase 6 — Resume guidance and browser-side document workflow
- [ ] Supported sample CV files process locally and export valid DOCX/PDF.
- [ ] No file upload/network transfer occurs by default.
- [ ] Suggestions are explainable and do not invent experience; guidance is traceable to dated sources.

### Phase 7 — Outreach drafting and application tracker
- [ ] The discovery-to-outcome workflow works end to end.
- [ ] No email is sent or submission recorded without user confirmation.
- [ ] Personal drafts and application history stay outside public data/repository.

### Phase 8 — Public Pages deployment and privacy review
- [ ] Deployment contains only static assets and sanitized public JSON.
- [ ] Source/hosting privacy decisions are reviewed before deployment.
- [ ] Deployed artifact and public-data allowlist pass privacy/recovery checks before real private data is introduced.

### Phase 9 — Optional improvements
- [ ] Optional features address measured limitations and do not compromise privacy, factuality, or user control.
- [ ] Every paid service receives explicit approval.

## Last test / CI result

Baseline `f9a9cf61466d3de0dd9a77b079ceddd57fca5da8`:
- Frontend CI passed: [run 40412685519](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40412685519).
- Discovery fixture tests passed: [run 40412685527](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40412685527).
- Phase 2/3 browser acceptance passed for `843d6c38954ed381f3cc30ba53f25c991ecfdf47`: [run 40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974).
- Prior manual discovery run completed and persisted state: [run 40414813461](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40414813461). Coverage was incomplete; do not rerun without explicit owner authorization.
- Item 1 status-only commit `8208b9cf864a64dca3ad79cd8440d3ea17d95ada`: Frontend CI passed [run 40564237677](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564237677).
- Item 2 first run: discovery fixture tests passed [run 40564524585](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564524585); Frontend CI failed formatting and typecheck [run 40564524803](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564524803).
- Latest consolidated item 2 attempt: discovery fixture tests passed [run 40565813915](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565813915); Frontend CI failed formatting and the route-error assertion [run 40565814099](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565814099). The subsequent route-message fix passed the test-only failure but still failed formatting [Frontend CI run 40566046969](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566046969); discovery fixture tests passed [run 40566046878](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566046878).
- Item 3 commit `919171c19cc8e4d2e8160ff23bbf8b2babde6e1c`: discovery fixture tests passed [run 40566577393](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566577393); Frontend CI failed only the known Prettier check in `catalog.mjs`, while typecheck, unit tests, dependency audit and build passed [run 40566577410](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566577410).
- Follow-up runs: discovery fixture tests passed [40564758294](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564758294), [40564917343](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564917343), [40565141597](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565141597), [40565264651](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565264651), and [40565813915](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565813915). Frontend CI reported formatting-only failures on [40564757989](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564757989), [40564917374](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564917374), [40565141698](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565141698), and [40565264728](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565264728).
- Initial consolidated-module run: discovery fixture tests passed [40565813915](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565813915); Frontend CI failed formatting and a route-error assertion [40565814099](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40565814099).
- Item 4 commit `86000a968900355701da181d3d527a9f900a57d6`: discovery fixture tests passed [run 40566826197](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566826197); Frontend CI failed only the known item 2 formatting check [run 40566826143](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40566826143).
- Item 5 first run: discovery fixture tests passed [40567113529](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567113529); Frontend CI failed only the known Prettier check [40567113389](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567113389).
- Item 5 follow-up: discovery fixture tests passed [40567259405](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567259405); Frontend CI failed only the same formatting check [40567259389](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567259389).
- Item 6 commit `55b1c62bc704cd14dc6fff4289b584674ebc83ce`: discovery fixture tests passed all 36 tests [run 40567557083](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567557083); frontend tests passed all 31 tests, typecheck and build passed, but formatting check failed [run 40567557318](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567557318).
- Item 7 commit `0eab2175786e6f808ae904f444e473bc8125712b`: no new CI run was created for the docs/workflow-only changes; last code validation remains item 6 [Frontend CI run 40567557318](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567557318) and [Discovery fixture tests run 40567557083](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40567557083).

## Open decisions and constraints

- Canonical career URLs: registry is the shared source for verified catalogue routes; the functional regression tests pass, with the formatting-only check still blocked under item 2.
- Storage: schema/encryption share a 32 MiB serialized workspace cap and 48 MiB encrypted envelope cap; synthetic maximum-size save/load test passes.
- Link-only public status and closure semantics are recorded in ADR-024; link-only roles use `last-seen` and absence cannot close them.
- Pipeline module boundaries: keep refactor behavior-preserving; existing tests must pass unchanged.
- Pages hosting decision is deferred to Phase 8; speculative routes are deferred.
- Branch cleanup is review-only. Do not delete branches.
- The one owner-directed manual run is complete. Do not repeat it without explicit authorization; schedules, publication, and deployment remain disabled.


## Proposed branch cleanup (review-only; no branches deleted)

The ahead/behind figures below were collected against `main` at `f9a9cf61466d3de0dd9a77b079ceddd57fca5da8`, before PR #2 was merged. They are now stale and must be recomputed before any future cleanup. This remains a review-only proposal; no branch ref or visibility setting has been changed.

### Duplicate or fully merged candidates for owner review

- `feat/phase4-source-adapter-remediation` — identical tip to `main` (`f9a9cf6`; 0 ahead, 0 behind).
- `feat/browser-local-vault` and `feat/static-frontend-shell` — identical tip `a850adae`; both 0 ahead and 30 behind `main`.
- `feat/browser-local-private-data` and `feat/phase3-studio-catalog` — identical tip `cb9f8d3e`; both 0 ahead and 9 behind `main`.
- `architecture/pages-actions-cv` — 0 ahead, 37 behind.
- `docs/project-foundation` — 0 ahead, 38 behind.
- `feat/phase3-manual-studio-catalog` — 0 ahead, 2 behind.
- `feat/phase4-discovery-pipeline` — 0 ahead, 1 behind.
- `tmp/phase1-remediation-20261024` — 0 ahead, 33 behind.

The owner may consider deleting these stale branches after confirming no external work depends on them. Do not delete them as part of this phase.

### Preserve for review or operational reasons

- `tmp/eslint10-upgrade-20261024` — 3 commits ahead and 33 behind; has unique commits.
- `tmp/phase1-closeout-20261025` — 5 commits ahead and 32 behind; has unique commits and should be reviewed rather than deleted.
- `discovery-state` — preserve operational state; do not reset, rewrite, or delete.
- `stabilize/baseline-fixes` — active branch for this stabilization PR; preserve.
- `main` — protected by the owner's merge gate; do not change directly.

## Next action:

Owner review and merge of the Phase 4 closeout PR. Next implementation milestone: Phase 5 build-time integration of a reviewed, allowlisted projection; no runtime career-site fetches.
