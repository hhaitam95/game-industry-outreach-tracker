# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- The current main-branch directory contains **266 studio records** and **266 matching profiles**, with **263 active** and **3 paused** routes across **44 country/location labels**.
- This second worldwide research batch proposes **12 additional records** and refreshes Speedway Games' official route; its proposal snapshot has **278 records / 278 profiles**, **275 active** and **3 paused** routes across **45 country/location labels**.
- Each route retains official studio, application and evidence URLs plus a verification date.
- A studio appears only when an official studio-controlled page or linked employer-managed application system explicitly invites speculative, unsolicited, spontaneous, open or general applications.
- Some entries are publishers, co-development/services studios or Minecraft content developers rather than original-IP game studios; their type is explicit in each profile. Volunteer-only and commission/freelance routes carry clear caveats.

## Phase 1 — Global discovery

- The latest completed successful scheduled discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), which completed a source cycle, processed 7 source pages and added 304 candidates to the pool.
- The checkpoint contained **10,370 candidates seen**, **126 cumulative routes verified**, **56 suitability exclusions**, **7,883 candidates with no explicit route found** and **79 cases retained for manual review**. Retry and review queues remain distinct from confirmed negative findings.
- A post-merge run [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) stopped safely when a Wikidata request timed out. It did not advance or publish a partial source checkpoint; the 10,370-candidate state remains the last successful saved checkpoint.
- The four existing source feeds remain GameDevMap and three Wikidata queries. The one-time GameDevMap catalogue backfill is complete; scheduled refresh and candidate verification continue.
- The workflow retains the 25-minute bounded source/verification budget, up to 1,000 candidate checks, 8 concurrent distinct-domain checks, same-host pacing, and conservative route-closure rules. Temporary timeouts, rate limits, blocks or robots denials do not close routes.

## Phase 2 — Data quality and verification

- The public-data validator checks required route fields, HTTPS official/application/evidence URLs, route enums and review dates.
- It verifies one matching profile per route, mandatory profile fields/source URLs, duplicate studio names and excluded records.
- Main at the beginning of this batch validated **266 routes / 266 profiles**. The proposal branch contains **278 / 278**; exact-head CI must pass again before merge.
- The 79 manual-review cases and retry queue remain separate; they are not counted as successful discoveries.

## Phase 3 — Background automation

- Saturation-aware maintenance and the hourly schedule remain in place. A temporary upstream timeout does not reset source cursors or mark candidates as negative.
- The latest merge-triggered website publication and build succeeded; the failed discovery attempt did not affect the deployed 266-record main dataset.

## Next research focus

- Expand beyond the current strongest UK/US/Canada/Sweden/Germany concentration, prioritising additional APAC, Africa, Latin America, Eastern Europe and remote-first studios.
- Recheck held leads only when the official employer route becomes reachable or clearer; do not reinterpret 403/404, generic contact pages or vacancy-only listings as applications.
