# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The current main-branch public directory contains **252 studio records** and the profile dataset contains **252 matching profiles** (the current main-branch snapshot; two open data PRs propose a combined 14 additional routes and profiles).
- **249 routes are active** and **3 are paused** on main; the combined PR proposal would bring this to **263 active** and **3 paused**. Paused records are retained for audit/history but are not shown as currently open routes.
- Records currently cover **41 country/location labels** on main; the combined PR proposal would cover **44 labels**; unknown country values remain explicitly undisclosed.
- Each active/paused record retains official studio, application and evidence URLs plus a verification date.
- A studio is published only when an official studio-controlled page or linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications.
- One consolidated review batch is open: PR [#63](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/63) proposes **14 additional routes** (including Halfbrick Studios, Bonfire Studios and Flashbulb Games, previously tracked in PR #62). PR #62 is now redundant and will be closed as superseded once the consolidated batch passes CI.

## Phase 1 — Global discovery

- The latest confirmed successful discovery run is [`41191375366`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed successfully on 2026-10-31.
  - It ran in hourly mode, processed **7 source pages** and ingested **304 additional candidates**.
  - The source cycle completed; the run ended with saturation disabled.
  - Cumulative pipeline counters at that checkpoint: **10,370 candidates seen**, **126 routes verified**, **56 suitability exclusions**, **7,883 candidates with no route found**, and **79 retained for manual review**.
  - Offline discovery tests, public-data validation, route review, static build and state persistence completed successfully.
- The private candidate pool is now **10,370 candidates**, up from 9,197 at the previous saved checkpoint. Retry and review outcomes remain separate from confirmed no-route outcomes; they are not being counted as complete.
- The four configured source feeds remain GameDevMap and three Wikidata queries. Their completed cycle means a subsequent pass can continue without resetting the one-time GameDevMap catalogue backfill.
- The workflow remains scheduled hourly, with an up-to-25-minute discovery budget, up to 1,000 candidate checks per run, 8 concurrent checks across distinct official studio domains, and a 40-minute job timeout. Same-host pacing and conservative route-closure rules remain in force.
- A previous run stopped safely on a Wikidata HTTP 429 response. The later successful run above demonstrates that discovery resumed, persisted a checkpoint and completed a full source cycle without publishing partial data.

## Phase 2 — Data quality and verification

- The public-data validator checks every record for required identity and route fields, HTTPS official/application/evidence URLs, route enums and review dates.
- It also verifies matching studio profiles, required profile fields and source URLs, duplicate studio names, and required exclusion cases.
- The latest main-branch CI validation covered **252 studios with 252 matching profile records**. The pre-consolidation PR #63 head passed CI at 263 records. The consolidated 266-record dataset is undergoing a fresh exact-head CI run before merge.
- Privacy-boundary checks pass for tracked paths and public/build output; personal tracker records remain browser-local and are not sent to a backend.
- At the latest saved checkpoint, retry cases and 79 manual-review cases remain separate queues. They are not being incorrectly counted as complete.

## Phase 3 — Background automation

- Saturation-aware maintenance is merged to `main` in [commit `8ad8e5b`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/8ad8e5b3d2ccaea626fd750921e7ae2ad63efdb4).
- After three complete Wikidata cycles produce no new verified routes, scheduled discovery reduces source scanning from 8 pages/hour to 1 page/hour.
- Candidate verification and existing-route maintenance continue during saturated mode.
- A completed cycle that verifies a new route clears saturation and restores the faster scan cadence.
- Workflow summaries report run work counts, candidate-status totals, source cursors and saturation state without exposing candidate names or route evidence.
- The first run after the workflow change hit an upstream Wikidata 429 rate limit. A later successful scheduled run (41191375366) completed the source cycle, persisted state and passed its validation/build stages.

## Phase 4 — Functional website acceptance

- Phase 4 browser acceptance is merged to `main` in [commit `fdd8f25`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/fdd8f25de24065204425e49b19017c2f47030aae).
- Chromium browser tests pass on the latest **252-studio** directory snapshot. They exercise:
  - successful and empty directory searches, country/work-model filters, sorting and HTTPS application links
  - saving a studio, refreshing the page and restoring the record from browser localStorage
  - all six tracker statuses, including confirmation/cancellation for marking an application as submitted and removing a record
  - browser-local data with no network write requests
  - desktop/mobile overflow and internal table scrolling
- Both the push and pull-request CI runs passed the Python discovery suite, frontend tests, lockfile registry check, directory validator, route review, production build, privacy boundary, Pages artifact and browser acceptance.
- The Playwright dependency and Chromium are installed transiently by CI; no permanent application dependency or package-lock update was added.

## Remaining foundation work

1. Finish the remaining Wikidata video-game developer entity feed and process the resulting candidates.
2. Revisit all 1,531 retries when due and manually resolve or explicitly retain the 76 review cases.
3. Confirm a subsequent hourly discovery run completes, persists its checkpoint and safely publishes/deploys any verified data changes after the transient Wikidata rate limit.
4. Keep the directory and tracker stable. Do not begin Phases 5–7 (visual redesign and final polish) until the remaining data and automation acceptance criteria are met.
