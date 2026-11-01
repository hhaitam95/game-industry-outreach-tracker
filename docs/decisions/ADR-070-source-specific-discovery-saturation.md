# ADR-070: source-specific discovery saturation

**Status:** Implemented on branch `ops/source-specific-discovery-saturation-20261031`; pending exact-head CI and review  
**Date:** 2026-10-31  
**Scope:** Automated candidate discovery feeds and their resumable state.

## Context

The previous pipeline used a global `empty_cycles` and `saturated` flag. A verified route from any feed reset saturation for every feed, while one global saturation flag reduced the entire hourly workflow to one page. This coupled unrelated sources and made source expansion and coverage reporting harder to reason about.

The global discovery model requires independent source progress: an incomplete or failed pass must not count as exhaustion, and one source's saturation must not reduce work available to other sources.

## Decision

- Maintain `config/discovery-sources.json` as the inventory of integrated feeds. Record each adapter, candidate coverage, pagination, permitted access method, policy links, refresh behavior and saturation threshold.
- Load the feed inventory from that manifest at runtime, rather than maintaining a second hard-coded feed list.
- Track cycle number, verified additions, complete-empty passes, saturation and last-pass outcome independently for each feed in the private discovery-state branch.
- Keep GameDevMap as a one-time backfill with its terminal offset preserved. The three Wikidata query feeds are independently recurring.
- After three complete empty passes, cap only that saturated feed to one page per hourly run. Unsaturated feeds retain access to the remaining hourly budget.
- A newly verified route resets only its originating feed's empty-pass count and saturation flag.
- A failed source request does not advance its cursor or mark the feed complete. A pass with queued or due verification work does not finalize. Future retries or manual-review candidates may allow a pass to advance, but it is marked incomplete and does not count as an empty pass.
- Preserve aggregate legacy fields as telemetry only; they no longer control source scheduling.

## State migration and safety

The private discovery-state schema advances from v1 to v2 additively. Existing cursors, candidate records, route checks and counters are preserved. New source metrics begin unsaturated. Legacy Wikidata candidates do not contain their originating query-feed ID, so migration keeps them as `legacy_unattributed` rather than inventing provenance.

No live discovery dispatch, schedule change, public data publication or Pages deployment is part of this implementation. The first successful scheduled run after merge will persist the additive state migration.

## Validation

Exact-head GitHub Actions must pass discovery tests, frontend tests, directory validation, route review, production build, privacy/artifact checks and browser acceptance before merge.
