# ADR-079: manual global source register and verified route expansion — batch 13

**Status:** Proposed in PR #73; no new automated source adapter is enabled  
**Date:** 2026-10-31  
**Scope:** Candidate-source provenance, lawful access, global manual research and verified speculative routes.

## Context

The integrated candidate feeds remain three Wikidata query types and one GameDevMap backfill. The latest discovery run (41212913766) completed every stage, passed tests, persisted the checkpoint and deployed successfully, but added zero public directory records. Further breadth requires widening candidate indexes and continuing direct official-site verification.

Potential sources have materially different data rights and quality. Association pages may include publishers, suppliers, service companies and educators. Storefront directories include publisher-only entities and parent companies. API access does not necessarily permit redistribution of derived datasets.

## Decision

- Keep config/discovery-sources.json as the allow-list of integrated, tested runtime feeds.
- Add config/manual-discovery-sources.json for documented manual-only source leads and access restrictions. The discovery script does not load this file.
- IGDB stays blocked pending written Twitch permission that explicitly covers public-directory redistribution, attribution and caching.
- Steam developer/publisher pages remain manual-only; no scripted or bot collection is enabled.
- Commercial directories, MobyGames and the community dataset remain gated by their current API, terms and licence reviews.
- Every candidate still requires independent employer identity, direct game-development and explicit non-vacancy application-route verification. Association membership, catalogue entries, game credits and search snippets are leads only.
- Add seven new active route/profile pairs: Big Moxi Games, Cyberborz Interactive, Frozenbyte, Iceflake Studios, Mainstay Games, Rogue Snail and Tanglewood Games. Refresh existing Awe Interactive data without duplication.
- Preserve unknown geography, applicant eligibility and work arrangements rather than inferring them from a distributed team or company HQ.

## Result on PR #73

- 319 route/profile pairs.
- 314 active routes and 5 paused routes.
- 51 country/location labels.
- One duplicate ByteRockers identity from the prior snapshot is consolidated into the canonical employer spelling, with merged profile-source provenance.
- Main remains at 313 rows until this proposal is merged.
- No new automated source adapter is enabled.
