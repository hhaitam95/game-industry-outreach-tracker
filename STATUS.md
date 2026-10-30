# StudioScout status

**Date:** 2026-10-30 18:41 UTC  
**Product scope:** Simple two-page studio directory and personal application tracker.

## Website

- Studio directory and personal application tracker are implemented.
- Personal tracker data remains in browser localStorage; it is not committed or synced.
- Public directory contains **98 verified studio records**.
- The 98 records cover **26 identified countries**; 10 records use the explicit country value "Not stated" rather than an inferred location.
- Each public record has an official studio URL, application URL, evidence URL and verification date. The production directory validation passed.
- No UI redesign or additional product features are planned before global discovery is complete.

## Discovery automation

- The automated discovery and hourly maintenance workflow is merged and enabled.
- Candidate sources are GameDevMap plus three Wikidata feeds (video-game developers, organisations credited as game developers, and video-game companies).
- The separate `discovery-state` branch stores private candidate/source progress; candidate data is not exposed in the public directory.
- Last confirmed persisted snapshot: **403 candidates** at 2026-10-30 18:33:52 UTC. Statuses: 269 no route, 111 retry, 9 published by discovery, 6 duplicates, 5 needs review and 3 excluded.
- At that snapshot, the GameDevMap offset was 101; two Wikidata feeds were still incomplete.
- The live GameDevMap page at offset 101 explicitly reports results 101–200 of 10,500. The initial worldwide backfill is therefore far from exhausted at offset 101.
- A discovery runner processed one further batch but its state push was rejected after the discovery-state branch changed during the run. Treat that batch as unpersisted; the last confirmed saved cursor remains 101. Do not treat a runner-reported completion flag as final until the saved cursor reaches the end of the source pagination.
- A scheduled recovery run is still in progress. Discovery runs share a repository-wide concurrency group, so the queued retry must wait for the scheduled run rather than competing for the same state branch.
- Candidate directories are leads only. Publication remains strict: only explicit speculative/open application routes verified on official studio-controlled pages are included. Timeouts, blocks and ambiguous evidence do not close routes.

## Scraper correctness

- Removed duplicate legacy definitions that had overridden the thread-safe per-host request throttle and robots-policy cache.
- Merged PR #31 with a regression test proving same-host requests are serialized while checks across different studio domains remain concurrent.
- PR CI passed: 40 Python discovery tests, 14 frontend/data tests, studio-directory validation, route-review checks and the production build.

## Next

1. Confirm that the in-progress recovery run persists the next GameDevMap cursor and completion state.
2. Continue the two incomplete Wikidata feeds and process the candidate verification queue in resumable batches.
3. Review newly verified records and improve geographic coverage without weakening official-route evidence requirements.
4. Keep hourly route maintenance running after the initial worldwide candidate backlog is processed.
