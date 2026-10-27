# Project Status

**Last updated:** 2026-10-27
**Current phase:** Step 1 — Stabilization, before Phase 4 acceptance.
**Working branch:** `stabilize/baseline-fixes`
**Last verified branch HEAD before item 2 CI follow-up:** `a56bff829defade39db149743f043a5879694342`
**Base/main:** `f9a9cf61466d3de0dd9a77b079ceddd57fca5da8`. Phase 1–4 implementation stack is present on main. Do not change main directly; the owner merges the eventual PR.
**Phase status:** Phase 3 is accepted. Phase 4 has been merged but is not accepted. One prior live run completed and persisted state to `discovery-state`; source coverage/closure behavior still need acceptance. No further live run is authorized by this task.

## Working agreement and approval scope

- The owner approves commits and pushes to `stabilize/baseline-fixes` for the listed scope. Do not ask before each in-scope commit. Build and report each item separately.
- Open one PR when Step 1 is complete or any remaining issue is explicitly blocked; then stop and let the owner merge.
- Not approved without asking: direct changes to `main`; live scans or workflow dispatch; enabling schedules; publishing data or deploying Pages; changing repository visibility; force-pushes or history rewrites; deleting branches; dependencies outside scope; or changing secrets/workflow permissions.
- Keep `discovery-state` unchanged. Do not run another live scan, publish data, or enable schedules. Keep scheduled discovery disabled.
- Update this file in every implementation commit and report CI for each commit. Commit after each completed item so progress survives interruptions.
- Repository is public. Do not commit personal data, contact details, resumes, profile details, private drafts/application records, credentials, tokens, or keys.
- The owner accepts the GitHub write tool's default commit author for this repository; no personal data should be added to file contents. Check every commit for sensitive content before pushing.

## Step 1 — Stabilization checklist

- [x] Item 1: Create this status manifest on the phase branch only.
- [ ] Item 2: `src/lib/studios/registry.mjs` validates `config/studio-registry.json`; catalogue career evidence/routes derive URLs from it. Riot's verified route now uses `/en/work-with-us/jobs`; regression tests reject enabled registry sources without matching verified routes. Initial Frontend CI failed formatting/typecheck in `registry.mjs`; follow-up fix is being validated.
- [ ] Item 3: Align schema and encryption workspace-size budgets; add a maximum-size workspace save test.
- [ ] Item 4: Emit source-failure events only when failure state changes; warn when event history is truncated.
- [ ] Item 5: Ensure roles from link-only sources are not projected as `announced` without a verifiable closure path. Choose the smallest truthful public status meaning “last seen [date], not verified closed”; update validator/tests and record the decision in `DECISIONS.md`.
- [ ] Item 6: Split `scripts/discovery/pipeline.py` into fetch, adapters, state, and projection modules; existing tests must pass without changes.
- [ ] Item 7: Fix test-count and browser-report documentation, duplicate ADR-015, stale “main remains unchanged” wording, and the Phase 2 workflow branch trigger. In `DECISIONS.md`, record acceptance of the default commit author, defer Pages hosting to Phase 8, and defer speculative routes.
- [ ] Item 8: Add a proposed branch-cleanup list here, including merged/duplicate branches and `tmp/phase1-closeout-20261025` (reported five commits ahead of main). Propose only; do not delete branches.
- [ ] Step 1 exit: all items complete or explicitly documented as blocked; relevant tests and CI green; no private data/secrets; status current; one PR open; no merge performed.

## Phase 4 acceptance criteria

- [ ] Fixture tests cover new, updated, closed, stale, and blocked cases.
- [ ] A failed fetch never closes a role.
- [ ] The public projection never publishes a role as `announced` without a verifiable closure path.
- [ ] The projection contains only allowlisted public fields.
- [ ] The schedule stays disabled.
- [ ] Owner action after Step 1 is merged: one manual live run on main to check CD PROJEKT RED and Naughty Dog. This is an owner follow-up, not authorized for this work session.

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
- [ ] Fixture tests cover new/updated/closed/stale/blocked behavior.
- [ ] Failed fetches never close roles; link-only roles are not marked announced without a verifiable closure path.
- [ ] Projection uses only approved public fields.
- [ ] Schedule stays disabled pending owner acceptance.
- [ ] Owner runs the agreed single manual verification after merge.

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
- Item 2 first run: discovery fixture tests passed [run 40564524585](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564524585); Frontend CI failed formatting and typecheck [run 40564524803](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40564524803). This follow-up corrects the registry validator's typing and formatting; its CI result is pending.

## Open decisions and constraints

- Canonical career URLs: registry is intended to be the shared source for verified catalogue routes; implement in item 2.
- Storage: align schema/encryption under one explicit serialized-workspace budget in item 3; verify actual safe maximum in tests.
- Link-only public status and closure semantics: decide and record in item 5.
- Pipeline module boundaries: keep refactor behavior-preserving; existing tests must pass unchanged.
- Pages hosting decision is deferred to Phase 8; speculative routes are deferred.
- Branch cleanup is review-only. Do not delete branches.
- After the owner merges Step 1, Phase 4 acceptance requires the single owner-directed manual run described above; schedules remain disabled.

## Next action:

Re-run Frontend CI for item 2; when green, proceed to item 3.
