# StudioScout status

**Date:** 2026-10-30 19:06 UTC  
**Product scope:** Simple two-page studio directory and personal application tracker.

## Website

- Studio directory and personal application tracker are implemented.
- Personal tracker data remains in browser localStorage; it is not committed or synced.
- Public directory contains **106 verified studio records** across **27 identified countries**; 11 records use the explicit country value "Not stated" rather than an inferred location.
- Every public record has an official studio URL, application URL, evidence URL and verification date. The production directory validation passed.
- Latest manual research additions: AlterEyes (Belgium), The Knights of U (Poland; formerly The Knights of Unity), Rad Games (location undisclosed), Vertigo Games (Netherlands), GOALS (Sweden), Kolibri Games (Germany), Ingame Studios (Czech Republic) and Studios DRAMA (France).
- Existing application-route details were refreshed for Third Kind Games, Raw Power Games, Funday Games and Paintbucket Games; existing studio records were updated rather than duplicated.
- No UI redesign or additional product features are planned before worldwide discovery is stable.

## Discovery automation

- The automated discovery and hourly maintenance workflow is merged and enabled.
- Candidate sources are GameDevMap plus three Wikidata feeds (video-game developers, organisations credited as game developers, and video-game companies).
- The separate `discovery-state` branch stores private candidate/source progress; candidate data is not exposed in the public directory.
- Last confirmed persisted snapshot: **403 candidates** at 2026-10-30 18:33:52 UTC. Statuses: 269 no route, 111 retry, 9 published by discovery, 6 duplicates, 5 needs review and 3 excluded. At that snapshot, the GameDevMap offset was 101 and two Wikidata feeds were incomplete.
- A later bulk run processed 105 GameDevMap pages (10,500 source rows), collected 7,939 source candidate rows, reached a pool of 8,342 candidates, checked 1,000 candidates and found 20 additional verified routes. It reported GameDevMap complete at next offset 10,601, but its attempt to publish to `main` was rejected because manual PR updates had landed during the run. **Those 20 routes and the advanced cursor were not persisted and must not be counted in the public directory or saved state.**
- Merged PR #35 fixes this publishing race. The workflow now merges discovery results into the latest `main` snapshot, preserves newer manual records and profile research, applies route updates only when the verification date is newer, holds conflicting studio identities, retries a non-fast-forward push up to three times, and rebuilds the site after merge.
- The next push-triggered discovery run is queued from the fixed workflow. The saved state has not yet advanced beyond the 403-candidate / offset-101 snapshot; count progress only after the `discovery-state` branch is confirmed updated.
- Candidate directories are leads only. Publication remains strict: only explicit speculative/open application routes verified on official studio-controlled pages are included. Timeouts, blocks and ambiguous evidence do not close routes.

## Scraper correctness and validation

- Removed duplicate legacy definitions that had overridden the thread-safe per-host request throttle and robots-policy cache; PR #31 added a same-host serialization regression test.
- PR #35 adds deterministic merging of discovery output with concurrent manual changes and four merge regression tests.
- Latest directory PR #36 passed CI: 44 Python tests, 14 frontend/data tests, directory validation for 106 complete studio profiles, route-review checks (0 due) and the production build.
- Same-host requests remain serialized; checks across different studio domains can run concurrently.

## Next

1. Confirm that the next discovery run persists the completed GameDevMap backfill cursor and candidate pool.
2. Resume processing the large candidate verification queue in bounded batches.
3. Continue the three Wikidata feeds and review newly verified records for identity, suitability and official route evidence.
4. Keep hourly route maintenance running after the initial worldwide candidate backlog is processed.
