# StudioScout status

**Date:** 2026-10-30  
**Product scope:** Simple two-page studio directory and personal application tracker.

## Website

- Studio directory and personal application tracker are implemented.
- Personal tracker data remains in browser localStorage.
- Public directory currently contains 93 verified studio records across 26 countries.
- No UI redesign or additional product features are planned.

## Discovery

- The live discovery workflow has successfully published new records, deployed the website and persisted its state.
- A manual hourly run has also proved that candidate cursors resume from the saved state.
- The current saved discovery state contains 326 Wikidata candidates from the initial pass.
- The bulk-discovery feature branch adds a paginated GameDevMap candidate backfill, cross-source deduplication, person filtering and resumable bulk processing. It has not yet been merged or run against the live source.
- Public publication remains strict: only explicit speculative/open application routes verified on official studio-controlled pages are included.

## Next

1. Validate and merge the bulk-discovery change.
2. Run the resumable worldwide backfill and let it process the candidate queue.
3. Keep hourly maintenance running after the initial backlog is processed.
