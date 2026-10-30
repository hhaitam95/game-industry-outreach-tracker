# ADR-064 — M4 worldwide speculative-route research batch 2

- Date: 2026-10-30
- Status: Accepted for implementation
- Depends on: ADR-059, the M2 route contract, M3 directory/tracker, and ADR-063.

## Goal

Add a second bounded research batch of up to 15 additional official speculative/open-application routes. The project remains a simple worldwide route directory plus the existing private application tracker.

## Inclusion and evidence

- Include only a directly reachable studio-owned page or studio-controlled ATS route that explicitly invites a candidate to apply without a matching advertised vacancy.
- Re-open the official route and its supporting official evidence page during research. Generic career pages without an explicit open/speculative invitation, advertised-vacancy-only listings, and aggregator-only claims do not qualify.
- Keep route and studio identities unique. Store the official destination, official evidence URL, a short original evidence paraphrase, route classification, and reviewed evidence fingerprint. Do not store copied page bodies, email addresses, CVs, candidate data, or recruiter correspondence.
- Use `unknown` for unstated geographic eligibility. A remote label does not mean every country is eligible; surface explicit work-authorisation, language, office-location, compensation, and content caveats in `evidenceSummary`.
- Keep status `verified` only for routes whose directly reviewed official page currently confirms a no-specific-vacancy application path. If a page is blocked, ambiguous, or no longer qualifies, exclude it or mark it for review rather than infer.

## Boundaries and failure handling

- Data and documentation only. No new crawler, dependencies, workflow permission, schedule, automatic contact/application submission, private storage change, or website publication.
- Preserve the existing three-item navigation and encrypted browser-local application tracker. Do not add a parallel application marker or studio catalog.
- If validation finds a schema error or duplicate, fix the batch before opening the PR; do not loosen the shared contract to fit a record.

## Definition of done and rollback

- Add no more than 15 researched route/studio pairs; all route URLs are HTTPS, studio references resolve, IDs are unique, schema enums and timestamps validate, evidence summaries fit the contract, and hashes are reproducible from the reviewed evidence notes.
- Run formatting, lint, typecheck, unit tests, dependency audit, production build, privacy/artifact checks, discovery fixtures, and browser/vault acceptance on the final PR head.
- Update README, STATUS, handoff, and changelog so the current count and next action match the merged state.
- Roll back only this batch's data/documentation changes; leave M0–M3 and the encrypted tracker intact.
