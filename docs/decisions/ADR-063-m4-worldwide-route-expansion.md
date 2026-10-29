# ADR-063 — M4 first worldwide speculative-route expansion

- Date: 2026-10-29
- Status: Accepted for implementation
- Depends on: M2 route schema and M3 speculative directory/private application tracker.

## Goal

Expand the directory with a curated batch of up to 30 currently evidenced official speculative/open-application routes across multiple regions. Improve geographic breadth without expanding product scope.

## Inclusion and data rules

- Add only official studio pages or studio-controlled applicant-tracking routes that explicitly invite applications without a matching advertised vacancy.
- Re-open each destination during research. A generic careers page, aggregator-only claim, or specific vacancy is not enough.
- Record a short original evidence paraphrase and the official route/evidence URL. For this batch, `contentHash` fingerprints the reviewed evidence-summary text; it is not represented as a raw page-body hash, and no scraped page body is stored. Keep unknown country eligibility and working arrangements as unknown/not-stated instead of inferring global eligibility from a remote label.
- Make material conditions visible in the evidence summary, including work-authorisation/language requirements, project-based profit share without guaranteed upfront pay, or adult-content work.
- Correct an existing route if its saved URL no longer works and an official replacement route is evidenced; preserve the same route identity.
- Do not store scraped page bodies, candidate personal information, or private tracker data in the public repository.

## Boundaries and failure handling

- This is a data/research change only. No new crawler, dependency, workflow permission, schedule, automatic submission, new tracker, or deployment/publication.
- If the route cannot be confirmed as open, do not label it verified; exclude it or leave it for a later review.
- The UI and existing encrypted local tracker remain unchanged.

## Definition of done and rollback

- The public route contract validates; all route URLs are HTTPS; IDs and studio references are unique and valid.
- Run route-directory/discovery unit tests, frontend CI, and browser-vault acceptance on the final PR head.
- Update the current status and user-facing directory-count documentation.
- Roll back by reverting only this route-data/documentation batch; keep the merged M3 UI and tracker intact.
