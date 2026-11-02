# ADR-081: add IGDB Companies API as a recurring discovery feed

**Status:** Proposed in PR #100 (CI passed; not yet merged)  
**Date:** 2026-11-02  
**Scope:** Automated global studio candidate discovery.

## Context

The recurring discovery pipeline already uses the public GameDevMap catalogue and four Wikidata feeds. Its coverage needs another structured, developer-credit source, but the project should not expand to multiple new providers before the current sources have been exhausted. The repository already uses Twitch application credentials for IGDB cover metadata enrichment, stored as GitHub Actions secrets.

IGDB's Company endpoint exposes a `developed` array of game IDs and official company websites. Company Website records now reference a Website Type; the older `category` enum is deprecated. The API's official guidance documents app-token authentication, a four-request-per-second limit and non-commercial access. Its FAQ says local caching and serving API data to end users is allowed. The UI already has visible IGDB attribution.

## Decision

Add IGDB as the sixth recurring candidate feed, preserving all existing sources and qualification rules.

- Query companies with at least one developed-game credit and an official Company Website type. Resolve the type ID dynamically from `/v4/website_types`; never hard-code the deprecated category enum.
- Request the company name, slug, developer credits, official website URL and website type. Store the company name, canonical official URL and IGDB provenance only; do not copy broad company descriptions or developer-credit arrays into the public directory.
- Use a numeric company-ID cursor and raw response-row counts so pagination advances even when a row cannot become a safe candidate.
- Mint an app access token at runtime through the client-credentials grant. Read only `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` from repository Actions secrets. Never print or persist secret values or access tokens.
- Pace IGDB API requests at 0.27 seconds, below the documented four-per-second ceiling. If either secret is absent, skip IGDB without recording an empty pass or blocking other sources.
- Keep IGDB results as leads only. The existing employer-site/linked-ATS check must still confirm direct development evidence and an explicit speculative/open/general application route before public publication.
- Do not integrate Tavily, Companies House or other new services until the existing automated source set plus IGDB has been assessed for candidate yield and coverage.

## Consequences

The runtime feed inventory increases to six sources: four Wikidata feeds, recurring GameDevMap and IGDB. The existing 20-page hourly budget and per-feed saturation logic apply independently. IGDB is not part of the initial GameDevMap bulk mode; it runs in the recurring hourly phase.

The public directory remains an evidence-backed application-route catalogue, not a dump of IGDB's company dataset. No candidate becomes a public record solely because IGDB labels it as a developer.

The integration is intended for the project's non-commercial use. Retain visible IGDB attribution and review the current agreement before any monetized use or material change in data reuse.

## Validation and rollout

- Adapter/parser/query, credential-presence, numeric-cursor and API pacing regression tests added.
- The complete PR CI suite passed on final head `fd4ef9da5a68f1f01c24d3a6390caf4ae9abc720` in [run 41413993904](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41413993904), including the final rate-limit regression test and documentation updates.
- PR #100 remains open; this decision is implemented and tested on the feature branch but is not live on GitHub Pages until the PR is merged and deployment completes.

## References

- IGDB API documentation: https://api-docs.igdb.com/
- Twitch Developer Agreement: https://legal.twitch.com/en/legal/developer-agreement/
- Twitch OAuth client-credentials flow: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/
