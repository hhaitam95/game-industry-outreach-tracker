# StudioScout status

**Last verified:** 2026-10-31 08:38 UTC  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The public directory contains **242 studio records** and the profile dataset contains **242 matching profiles**.
- **239 routes are active** and **3 are paused**. Paused records remain visible in the data for audit/history but are not shown as currently open routes.
- Each active/paused record retains official studio, application and evidence URLs plus a verification date.
- Directory scope remains strict: a studio is published only when an official studio-controlled page or linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications.

## Discovery pipeline

- The last confirmed successful discovery run was [`41159590407`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41159590407), completed on 2026-10-31 at 02:38 UTC.
  - 939 candidate checks
  - 11 new verified routes
  - 8 existing-route checks
  - 242 public studio records after publication
  - Tests, data validation, build, state persistence and Pages deployment succeeded.
- The latest confirmed saved candidate pool contains **8,342 candidates**. Its last persisted checkpoint is 2026-10-31 02:37:44 UTC:
  - 6,813 no explicit speculative route found
  - 1,224 retry
  - 73 needs manual review
  - 119 published by the discovery pipeline
  - 75 duplicates
  - 38 excluded
  - 0 queued at that checkpoint
- Source progress at that checkpoint:
  - GameDevMap initial catalogue backfill: complete (cursor 10,601)
  - Wikidata video-game company feed: complete
  - Wikidata video-game developer entity feed: in progress (cursor Q106171121)
  - Wikidata developer-credit feed: in progress (cursor Q99297811)
- The workflow is configured for hourly scheduled runs, a 25-minute discovery budget, up to 1,000 candidate checks per run, 8 concurrent checks across distinct official studio domains, and a 40-minute job timeout. Same-host pacing and conservative route-closure rules remain in force.
- Run [`41185316827`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41185316827), triggered by the latest discovery-performance update at 08:36 UTC, is still reported by GitHub as `in_progress`; its last reported update is 08:36:47 UTC. No newer discovery-state checkpoint or run metrics have been confirmed, so the increased batch size has not yet been counted as completed work.

## Automation reliability work in progress

- A saturation-aware cadence is being added: after three complete source cycles produce no new verified routes, scheduled runs should reduce Wikidata scanning from 8 pages/hour to 1 page/hour while retaining candidate checks and route rechecks.
- A verified addition clears saturation and restores the faster scan cadence.
- GitHub Actions summaries are being expanded to report candidate-status totals, source cursors, checks and saturation state without exposing candidate names or private evidence.
- These changes are pending validation and merge; they are not yet active on `main`.

## Product readiness

- The directory search, country/work-model filters, sorting, official links and save-to-tracker action are implemented.
- The browser-local tracker supports Saved, In Progress, Applied, Interview, Offer and Archived states, plus search, status changes and removal confirmations.
- The remaining pre-UI gate is operational confidence: finish the incomplete Wikidata feeds, verify reliable scheduled checkpointing and deployment, and run the end-to-end acceptance checks for directory and tracker behavior.
- UI redesign remains deliberately deferred until the data and automation base is dependable.

