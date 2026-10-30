# StudioScout status

**Date:** 2026-10-30  
**Product scope:** Simple two-page studio directory and personal application tracker.

## Website

- Studio directory: search, country/work-model filters, sorting, basic studio fields, official website/application links and Save action.
- Application tracker: Saved, In Progress, Applied, Interview, Offer and Archived.
- Tracker data is saved in browser localStorage only.
- Directory currently contains 89 researched studio records across 26 countries.
- The UI remains deliberately simple; no visual redesign is planned until the data pipeline is reliable.

## Discovery automation

- Added `scripts/discover_speculative_studios.py` for resumable candidate discovery and official-site speculative-route verification.
- Candidate feeds: Wikidata video-game developer entities, developer credits on video games, and video-game company entities.
- Candidate sources are leads only. A studio is published only after explicit route evidence is found on an official page or a linked employer-controlled ATS.
- Added conservative crawl limits, robots.txt checks, HTTPS/public-host validation, per-host request spacing, duplicate detection and multilingual route phrases.
- Network failures and ambiguous pages do not close routes. Two consecutive authoritative negative/missing checks are required before a route is marked closed.
- Discovery cursors and candidate/closure state are stored on the separate `discovery-state` branch.
- Added an hourly GitHub Actions workflow with a one-time larger bootstrap and automatic deployment when the verified public dataset changes.

## Validation

- Offline discovery tests cover source query generation, candidate-page parsing, official-route evidence, exclusion signals, deduplication, dataset generation and closure safety.
- Main CI runs the discovery tests, existing tests, studio-directory validation and production build.

## Next

1. Merge the discovery pipeline.
2. Let the first bootstrap and hourly batches populate the directory.
3. Inspect the first discovery reports and manually review ambiguous candidates.
4. Keep the two-page UI stable while improving candidate-source coverage and route verification based on real results.
