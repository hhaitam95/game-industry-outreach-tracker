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

## Discovery pipeline

- The latest completed discovery run is [`41187451865`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41187451865), completed successfully on 2026-10-31.
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
- The candidate pool grew from 8,746 to 9,197 in the latest run. The current discovery cycle has accumulated **122 verified additions**; the source set is not marked saturated.
- The workflow remains scheduled hourly, with a 25-minute discovery budget, up to 1,000 candidate checks per run, 8 concurrent checks across distinct official studio domains, and a 40-minute job timeout. Same-host pacing and conservative route-closure rules remain in force.

## Phase 3 — Background automation

- Saturation-aware maintenance is merged to `main` in [commit `8ad8e5b`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/8ad8e5b3d2ccaea626fd750921e7ae2ad63efdb4).
- After three complete Wikidata cycles produce no new verified routes, scheduled discovery reduces source scanning from 8 pages/hour to 1 page/hour.
- Candidate verification and existing-route maintenance continue during saturated mode.
- A completed cycle that verifies a new route clears saturation and restores the faster scan cadence.
- Workflow summaries report run work counts, candidate-status totals, source cursors and saturation state without exposing candidate names or route evidence.

## Phase 4 — Functional website acceptance

- Directory search, country/work-model filters, sorting, official links and save-to-tracker are implemented.
- The browser-local tracker supports Saved, In Progress, Applied, Interview, Offer and Archived states, plus search, status changes and confirmation-gated removals.
- A Playwright browser-acceptance suite has been added on the `phase-4-browser-acceptance` branch. It covers successful and empty searches, country/work-model filters, sorting, official links, save and reload persistence, all tracker statuses, confirmation/cancellation flows, browser-local storage, and desktop/mobile overflow.
- The browser suite has passed once against the 242-record dataset. It is being rerun against the latest `main` snapshot before merging into `main`.
- CI on the branch also adds lockfile-registry, privacy-boundary and static Pages-artifact checks.

## Remaining foundation work

1. Finish the remaining Wikidata video-game developer entity feed and process the resulting candidates.
2. Keep all 1,531 retries and 76 manual-review cases in their separate queues; do not treat future retries or ambiguous cases as completed.
3. Confirm subsequent hourly discovery runs persist state and publish/deploy safely.
4. Merge Phase 4 browser acceptance after CI passes against the latest `main` data.
5. Keep UI redesign (Phases 5–7) deferred until the data and functional foundation passes acceptance.
