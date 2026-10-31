# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31 08:54 UTC  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The public directory contains **242 studio records** and the profile dataset contains **242 matching profiles**.
- **239 routes are active** and **3 are paused**. Paused records are retained in the data for audit/history but are not shown as currently open routes.
- Each active/paused record retains official studio, application and evidence URLs plus a verification date.
- Directory scope remains strict: a studio is published only when an official studio-controlled page or linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications.

## Discovery pipeline

- The latest confirmed successful discovery run was [`41185316827`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41185316827), completed on 2026-10-31 at 08:54 UTC.
  - Discovery batch, offline Python tests, frontend/data tests, validation and static build all succeeded.
  - The updated candidate checkpoint was persisted to the separate `discovery-state` branch.
  - The public directory remained at 242 records; no additional verified route was published in this run.
- The latest saved candidate pool contains **8,746 candidates**. Its checkpoint timestamp is 2026-10-31 08:53:23 UTC:
  - 7,045 no explicit speculative route found
  - 1,392 retry
  - 73 needs manual review
  - 119 published by the discovery pipeline
  - 76 duplicates
  - 41 excluded
  - 0 queued at that checkpoint
- Source progress at that checkpoint:
  - GameDevMap initial catalogue backfill: complete (cursor 10,601)
  - Wikidata video-game company feed: complete (cursor Q8072425)
  - Wikidata developer-credit feed: complete (cursor Q99968931)
  - Wikidata video-game developer entity feed: in progress (cursor Q113587545)
- The candidate pool grew from 8,342 to 8,746 in the latest run. The current cycle remains in progress, with 120 verified additions accumulated in the cycle; the source set is not yet marked saturated.
- The workflow is scheduled hourly, with a 25-minute discovery budget, up to 1,000 candidate checks per run, 8 concurrent checks across distinct official studio domains, and a 40-minute job timeout. Same-host pacing and conservative route-closure rules remain in force.

## Automation reliability work in progress

- PR [#57](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/57) adds saturation-aware maintenance: after three complete source cycles produce no new verified routes, scheduled runs reduce Wikidata scanning from 8 pages/hour to 1 page/hour while retaining candidate checks and route rechecks.
- A cycle that verifies a new route clears saturation and restores the faster scan cadence.
- The PR also expands the sanitized Actions summary with run work counts, candidate-status totals, source cursors and saturation state, without exposing candidate names or route evidence.
- Full PR CI passed on the latest implementation commit: offline discovery tests, `npm test`, directory validation, route review and production build all succeeded.
- PR #57 remains open and unmerged, so the saturation-aware cadence and expanded workflow summary are not yet active on `main`.

## Product readiness

- Directory search, country/work-model filters, sorting, official links and save-to-tracker are implemented.
- The browser-local tracker supports Saved, In Progress, Applied, Interview, Offer and Archived states, plus search, status changes and removal confirmations.
- The remaining pre-UI gate is operational confidence: finish the last Wikidata feed, verify repeatable scheduled checkpointing and deployment, and run end-to-end acceptance checks for directory and tracker behavior.
- UI redesign remains deliberately deferred until the data and automation base is dependable.
