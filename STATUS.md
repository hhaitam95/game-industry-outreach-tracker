# StudioScout status

**Date:** 2026-10-30 19:47 UTC  
**Product scope:** Simple two-page studio directory and personal application tracker.

## Website

- Studio directory and personal application tracker are implemented.
- Personal tracker data remains in browser localStorage; it is not committed or synced.
- Public directory contains **136 studio records across 31 identified countries**. 15 records use the explicit country value "Not stated" rather than an inferred location.
- All 136 records have an official studio URL, application URL, evidence URL and verification date; production directory validation is run on every data update.
- Latest data additions:
  - Oddshot Games (Ghent, Belgium): verified official open-application route; remote application restricted to applicants living in Flanders.
  - Couch Heroes: verified unsolicited-application form; remote-first team; conflicting official location descriptions are recorded as unresolved rather than guessing its HQ.
  - Stranded Beast (Vienna, Austria): verified initiative application by email; full-time remote work limited to Austria, with relevant work-authorization requirements recorded.
  - Kuuasema: corrected the open application submission method to email, and recorded Helsinki hybrid attendance and Finland work-right requirements.
- Crystal Dynamics and PlayQ were also added in PR #40; a worldwide expansion added 19 more officially verified routes.
- No UI redesign or additional product features are planned before discovery and data quality are stable.

## Discovery automation

- The automated discovery and hourly maintenance workflow is merged and enabled.
- Candidate sources are GameDevMap plus three Wikidata feeds (video-game developers, organisations credited as game developers, and video-game companies).
- The separate `discovery-state` branch stores candidates and source progress; candidate data is not exposed in the public directory.
- The first complete GameDevMap backfill has now finished and its state is saved:
  - 105 pages processed at 100 rows/page (10,500 source rows).
  - 7,939 candidate rows collected from GameDevMap.
  - Combined candidate pool: **8,342**.
  - Saved GameDevMap cursor: **10,601**; GameDevMap is marked complete.
- The successful discovery run **41113219915** checked 1,000 candidates, found 19 additional official application routes, merged the verified output into the latest public dataset, deployed the website and persisted its progress to `discovery-state`.
- Persisted candidate status snapshot at 2026-10-30 19:32:16 UTC:
  - 28 published/verified by discovery.
  - 1,108 with no official speculative route.
  - 8 excluded by the studio/content suitability screen.
  - 13 held for manual review.
  - 16 duplicate candidates.
  - 6,939 queued and 230 retry candidates (7,169 remaining).
- Two Wikidata feeds remain incomplete; the initial GameDevMap source completion does not mean global candidate discovery is finished.
- The new concurrency group from PR #38 is merged as `studio-discovery-v2`, preventing a stale runner in the previous group from blocking subsequent batches.
- New queue processing has started in run **41116464331**. A further run was queued after the latest public-data update. Each run remains bounded and resumable.
- Candidate directories are leads only. Publication remains strict: only explicit speculative/open/unsolicited/spontaneous/general routes verified on official studio-controlled pages are included. Timeouts, blocks and ambiguous evidence do not close routes.

## Scraper correctness and validation

- Removed duplicate legacy definitions that overrode thread-safe per-host request pacing and the robots-policy cache; PR #31 added a same-host serialization regression test.
- PR #35 adds deterministic merging of discovery output with concurrent manual changes and retry-safe public publishing.
- PR #38 moved discovery to a versioned concurrency group; merged after the successful full backfill run.
- PR #45 passed CI and added Couch Heroes and Stranded Beast while correcting Kuuasema's application method and location constraints.
- PR #46 enriched the 19 initial GameDevMap discoveries with official company descriptions, games, locations and route details. It corrected Agate's broken route and recorded its discipline-specific application pools; set AstroBeam's US-only remote eligibility; clarified Axolot's Stockholm application and BetaDwarf's internship-only route; paused A4VR while its jobs URL serves a reserved-domain placeholder; and corrected the names Binary Impact GmbH and Box Dragon.
- The profile pass distinguishes serious-games/XR consultancies from conventional game studios and preserves unknown HQ, ownership, team size and applicant eligibility rather than guessing.
- PR #46 CI passed: 44 Python discovery tests, 14 frontend/data tests, 136 complete profile records, route-review checks and the production build.
- Same-host requests remain serialized, while checks across different studio domains can run concurrently.

## Next

1. Continue processing the 7,169 remaining queued/retry candidates in resumable batches.
2. Finish the two incomplete Wikidata feeds and then process their candidate pools.
3. Review new route matches and identity/suitability conflicts before publication; do not trade evidence quality for volume.
4. Keep the hourly route maintenance after the initial candidate backlog is processed.
