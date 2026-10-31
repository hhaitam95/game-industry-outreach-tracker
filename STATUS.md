# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Worldwide game-studio speculative-application directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in the visitor's browser localStorage; no personal application data is committed to the repository.
- Current main contains **287 studio records**, **287 matching profiles**, **284 active** and **3 paused** routes across **48 country/location labels**. The fourth manual research batch proposes **3 additional employers** (Kokku, Raini Studios and Side) and refreshes Havoc Games; the proposal branch contains **287 records / 287 profiles**, **284 active** and **3 paused** routes.
- The third manual research batch is merged in [PR #65](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/65): it added **6 studios** and refreshed **3 existing studio records** (Bananagun, Larian Studios and Garena). The fourth batch is merged in [PR #66](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/66): Kokku, Raini Studios and Side, plus an updated Havoc Games route.
- New records extend coverage to Iraq, the Philippines and Brazil. Existing entries for South Korea and other countries are not duplicated.
- Every record retains official studio, application and evidence URLs plus a verification date. Explicit work-location, experience, language, country eligibility and compensation constraints are preserved.
- Some directory entries are publishers, co-development/service studios, game-content providers or entertainment groups rather than traditional original-IP studios; their profile classification makes this visible. All non-paid or volunteer collaboration caveats are disclosed.

## Phase 1 — Global discovery

- The latest completed successful scheduled discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed on 2026-10-31 after processing 7 source pages and adding 304 candidates.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. Retry and review queues are kept separate from confirmed negative outcomes.
- The post-merge scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints; the last successful private discovery state remains intact.
- The four existing source feeds remain GameDevMap and three Wikidata queries. The one-time GameDevMap backfill is complete. Scheduled source refresh and candidate verification remain active.
- Timeouts, HTTP rate limits, access blocks and robots denials do not close application routes or count as no-route evidence.

## Phase 2 — Data quality

- The validator checks required route fields, HTTPS official/application/evidence URLs, route enums, review dates, one matching profile per route, profile source links and duplicate names.
- Main at the start of this batch validated **278 routes / 278 profiles**. The merged dataset contains **284 / 284**; PR #65's exact-head CI passed Python discovery tests, route/profile validation, frontend tests, route review, production build, privacy boundary, Pages artifact and browser acceptance. The merged dataset contains **287 / 287** and PR #66 passed its exact-head CI suite, including browser acceptance.
- Six new records were merged: D4N Games, Monstronauts, Nikity Games Studio, Tropical Games, TAKEONE and SmashByte.
- Kokku (remote co-development talent pools), Side (regional player-support and co-development pools) and Raini Studios were added in PR #66; Havoc Games' existing application details were refreshed rather than duplicated.
- PR #67 proposes further precision updates to Aska Studios, Obsidian Entertainment, SOFTGAMES, Lost Boys Interactive and Rustling Leaves Games, without creating duplicate records.
- Existing entries were refreshed rather than duplicated: Bananagun (wildcard email route), Larian Studios (multiple discipline-specific open applications, including DevOps) and Garena (Singapore, Jakarta and Vietnam talent pools).

## Next research focus

- Continue broadening the directory in Latin America, Africa, South and Southeast Asia and Eastern Europe.
- Prioritise fully remote or regionally remote talent pools and game-operations, technical support, QA, community, production, DevOps and platform-support pathways.
- Recheck held leads only when the official employer route becomes reachable and explicit; never infer open hiring from a generic contact page, a vacancy-only listing or an HTTP error.
