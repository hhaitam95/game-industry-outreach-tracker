# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31 09:25 UTC  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The public directory contains **244 studio records** and the profile dataset contains **244 matching profiles**.
- **241 routes are active** and **3 are paused**. Paused records are retained for audit/history but are not shown as currently open routes.
- Records currently cover **40 identified countries**; unknown country values remain explicitly undisclosed.
- Each active/paused record retains official studio, application and evidence URLs plus a verification date.
- Directory scope remains strict: a studio is published only when an official studio-controlled page or linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications.

## Discovery pipeline

- The latest completed discovery run is [`41187451865`](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41187451865), completed successfully on 2026-10-31.
  - Offline discovery tests, public-data validation, static build, state persistence and deployment completed successfully.
  - The resulting public-data update was committed as [`49e6402`](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/49e6402b5db89e2c154218a5484454c3d06d3e3b).
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

## Automation reliability work in progress

- PR [#57](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/57) adds saturation-aware maintenance: after three complete source cycles produce no new verified routes, scheduled runs reduce Wikidata scanning from 8 pages/hour to 1 page/hour while retaining candidate checks and route rechecks.
- A cycle that verifies a new route clears saturation and restores the faster scan cadence.
- The PR expands the sanitized Actions summary with run work counts, candidate-status totals, source cursors and saturation state, without exposing candidate names or route evidence.
- PR #57 remains open and unmerged, so its lower-cost maintenance cadence and expanded workflow summary are not yet active on `main`.

## Product readiness

- Directory search, country/work-model filters, sorting, official links and save-to-tracker are implemented.
- The browser-local tracker supports Saved, In Progress, Applied, Interview, Offer and Archived states, plus search, status changes and removal confirmations.
- Browser-driven end-to-end acceptance coverage is being added for saving, reload persistence, every tracker status, confirmation dialogs, filters, links, empty states and mobile layout.
- UI redesign remains deliberately deferred until the data and automation base is dependable.
