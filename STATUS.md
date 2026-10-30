# StudioScout status

**Date:** 2026-10-30 20:20 UTC  
**Product scope:** Two-page worldwide studio directory and personal browser-local application tracker.

## Website and public data

- The site remains limited to the studio directory and My applications.
- Tracker entries remain in browser localStorage only; no personal application data is committed.
- Current research branch contains **163 studio records and 163 matching profiles**.
- **160 routes are active** and **3 are paused** because current evidence does not establish a usable speculative submission path.
- Records span **30 identified countries**; 11 records use the explicit value "Not stated" rather than an inferred country.
- Every active/paused record retains official studio, application and evidence URLs plus a verification date.
- Removed Capcom Pictures (film-production subsidiary, not a game studio) and Game Boost Sweden (staffing/talent marketplace, not a game studio).
- Corrected Funny Games to Funny Tales, identified its operator as Digital Tales LLC (DBA Funny Tales), and corrected its location to Miami, Florida.
- Corrected Greensky Games' location to Montréal, Canada; "remote" is no longer used as a country.
- Corrected route destinations and constraints for Fool's Theory, Game Tailors and several other recently discovered studios.
- Enriched 13 previously placeholder profiles with studio descriptions, sourced locations, portfolio focus, selected games and application constraints. Unknown company details remain explicitly unknown.
- Normalized England to United Kingdom and Czech Republic to Czechia in country fields.

## Discovery pipeline

- GameDevMap's initial 10,500-row paginated backfill is complete and saved at cursor 10,601.
- The combined saved candidate pool contains **8,342 candidates** from GameDevMap and Wikidata.
- Last confirmed state snapshot on `discovery-state` is 2026-10-30 19:51 UTC:
  - 5,939 queued
  - 372 retry
  - 1,931 no official speculative route
  - 40 published by discovery
  - 24 needs review
  - 23 duplicates
  - 13 excluded by the suitability screen
- Two Wikidata feeds remain incomplete; GameDevMap completion is not the end of global discovery.
- A discovery run had completed its candidate-processing, validation and public-data steps but stalled during GitHub Pages deployment, before persisting its candidate-state checkpoint. The public dataset merge was successful; the last confirmed discovery-state cursor remains the 19:51 snapshot.
- Main now persists discovery state before the Pages deployment step and uses the versioned `studio-discovery-v3` concurrency group.
- The current research branch additionally prevents a long-running discovery job from restoring a studio removed from the latest main snapshot. It preserves legitimate renames when the official domain stays the same.
- Staffing/talent marketplaces are now held for manual review when multiple independent marketplace indicators are found; a single mention of freelancers is not enough.

## Scraper and data-quality validation

- Per-host request pacing remains thread-safe; checks can run concurrently across distinct studio domains while preserving same-host delays.
- Route verification requires explicit positive application evidence on an official studio-controlled page or linked employer-controlled ATS.
- Robots denials, blocks, timeouts and ambiguous pages are not treated as route closures.
- Public data is checked for secure official links, matching profile records and duplicate identities before publication.
- This branch adds tests for concurrent manual deletions, studio renames, and staffing-platform false positives.

## Next

1. Merge the current data-quality and stale-merge protection changes after CI passes.
2. Resume the 5,939 queued candidates and retry eligible candidates from the saved discovery state.
3. Complete the two remaining Wikidata feeds and verify new route candidates on official studio-controlled pages.
4. Continue enriching profiles and route restrictions without relaxing the evidence threshold.
5. Keep the directory and tracker stable; avoid unrelated feature work.
