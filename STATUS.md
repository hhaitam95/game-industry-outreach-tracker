# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The public directory contains **244 studio records** and the profile dataset contains **244 matching profiles**.
- **241 routes are active** and **3 are paused**. Paused records are retained for audit/history but are not shown as currently open routes.
- Records currently cover **40 identified countries**; unknown country values remain explicitly undisclosed.
- Each active/paused record retains official studio, application and evidence URLs plus a verification date.
- A studio is published only when an official studio-controlled page or linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications.

## Phase 1 — Global discovery

- The latest confirmed successful discovery run is [`41187451865`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41187451865), completed successfully on 2026-10-31.
  - Offline discovery tests, public-data validation, static build, state persistence and deployment completed successfully.
  - Its public-data update was committed as [`49e6402`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/49e6402b5db89e2c154218a5484454c3d06d3e3b).
  - The directory grew from 242 to 244 records, with two additional verified routes published by discovery.
- The latest saved candidate pool contains **9,197 candidates**. Its checkpoint timestamp is 2026-10-31 09:24:38 UTC:
  - 7,349 candidates with no explicit speculative route found
  - 1,531 retries, all scheduled for a future recheck at this checkpoint
  - 76 retained for manual review
  - 121 published by the discovery pipeline
  - 77 duplicates
  - 43 excluded by the suitability screen
  - 0 queued
- Source progress at that checkpoint:
  - GameDevMap initial catalogue backfill: complete (cursor 10,601)
  - Wikidata video-game company feed: complete (cursor Q8072425)
  - Wikidata developer-credit feed: complete (cursor Q99968931)
  - Wikidata video-game developer entity feed: in progress (cursor Q135437500)
- The candidate pool grew from 8,746 to 9,197 in the latest successful run. The current discovery cycle has accumulated **122 verified additions**; the source set is not marked saturated.
- A later discovery attempt, [`41188901161`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41188901161), stopped safely when Wikidata returned HTTP 429 with `Retry-After: 120`. It did not advance or persist a cursor, so the 09:24 checkpoint remains intact and no partial data was published. This was an upstream rate limit, not a data-validation failure.
- The workflow remains scheduled hourly, with a 25-minute discovery budget, up to 1,000 candidate checks per run, 8 concurrent checks across distinct official studio domains, and a 40-minute job timeout. Same-host pacing and conservative route-closure rules remain in force.

## Phase 2 — Data quality and verification

- The public-data validator checks every record for required identity and route fields, HTTPS official/application/evidence URLs, route enums and review dates.
- It also verifies matching studio profiles, required profile fields and source URLs, duplicate studio names, and required exclusion cases.
- The latest CI run validated **244 studios with 244 matching profile records** and secure official links.
- Privacy-boundary checks pass for tracked paths and public/build output; personal tracker records remain browser-local and are not sent to a backend.
- The 1,531 retry cases and 76 manual-review cases remain separate queues. They are not being incorrectly counted as complete.

## Phase 3 — Background automation

- Saturation-aware maintenance is merged to `main` in [commit `8ad8e5b`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/8ad8e5b3d2ccaea626fd750921e7ae2ad63efdb4).
- After three complete Wikidata cycles produce no new verified routes, scheduled discovery reduces source scanning from 8 pages/hour to 1 page/hour.
- Candidate verification and existing-route maintenance continue during saturated mode.
- A completed cycle that verifies a new route clears saturation and restores the faster scan cadence.
- Workflow summaries report run work counts, candidate-status totals, source cursors and saturation state without exposing candidate names or route evidence.
- The first run after the workflow change hit the upstream Wikidata 429 rate limit described above. A subsequent successful scheduled checkpoint is still needed to demonstrate repeated operation under the new workflow.

## Phase 4 — Functional website acceptance

- Phase 4 browser acceptance is merged to `main` in [commit `fdd8f25`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/fdd8f25de24065204425e49b19017c2f47030aae).
- Chromium browser tests pass on the latest **244-studio** directory snapshot. They exercise:
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
