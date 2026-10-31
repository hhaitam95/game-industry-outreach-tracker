# ADR-067 — Fifth worldwide speculative-route research batch

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059 and ADR-063 through ADR-066.

## Goal

Broaden the verified application directory across Iraq, the Philippines, Brazil and South Korea, and refresh existing routes where employers have made their open-application channels more specific. Prioritise game operations, technical disciplines, support, QA and future talent pools as well as development roles.

## New records

- D4N Games — Iraq; an open application for any studio discipline. The form or careers email accepts portfolios/reels/playable links; the studio says its short practical hiring task is paid.
- Monstronauts — Philippines; not an active vacancy, but a future Audio/SFX talent pool. Applicants must be based in the Philippines.
- Nikity Games Studio — Brazil; invites resumes for future matching opportunities; its current listed game developer, 3D art and game design roles are remote, while broader cross-border eligibility is not stated.
- Tropical Games — Brazil; no current openings, but maintains a talent pool for games, design, programming, art, QA, XR, audio/narrative and business/operations. It explicitly welcomes professionals from any state in Brazil and describes remote work.
- TAKEONE — South Korea; the official Talent Pool covers game planning, client/server programming, game art, PM/QA, production, marketing/business and business support; Seoul head office, work model unspecified.
- SmashByte — Brazil; careers section says there are no open positions but still invites portfolios by email. The email is also the public business/partnerships contact, not a dedicated recruitment inbox; this caveat is recorded.

## Existing-record refreshes

- Bananagun — refresh the wildcard application to email at jobs@bananagun.games; any discipline; wildcard work location is not stated, although individual roles show hybrid or remote-friendly conditions.
- Larian Studios — replace the vague open-application record with its official Lever DevOps Open Application as the primary route, linking gameplay and graphics programming open applications. The role descriptions are for future matching, list Any / all studios and are marked on-site; the seven studio locations are Gent, Barcelona, Dublin, Guildford, Kuala Lumpur, Quebec and Warsaw.
- Garena — enrich the existing Singapore General Openings entry with current Jakarta Development Program / Product Associate talent pools and the Hanoi / Ho Chi Minh City Future Opportunities pool. These are location-specific rather than globally remote.

## Inclusion, caveats and data handling

- Only official employer pages or employer-managed application systems are recorded.
- Talent pools are distinguished from active vacancies. Discipline-specific and geography-limited pools are explicitly labelled.
- D4N Games' open application is any discipline, but remote-friendly language does not imply international employment eligibility.
- Monstronauts' audio pool is only for applicants based in the Philippines and is not an active vacancy.
- Nikity's listed roles are remote; applicant-country eligibility is unstated.
- Tropical Games explicitly welcomes any state in Brazil, not all countries.
- TAKEONE's official careers site says talent-pool entries are reviewed when hiring demand arises; applicants may submit a single resume/portfolio file; records are retained for two years under its notice.
- SmashByte's portfolio invitation uses a public business/support email and is included with this limitation stated.
- Larian open-application listings are on-site, not global-remote.
- Garena's pools have distinct location, experience and education / language requirements.
- No scraped page bodies, private candidate data or personal application tracker records are stored.

## Deferred leads

- General contact pages, roles that are actually posted vacancies, and companies without an express open/talent-pool route remain excluded. Review blocked or inaccessible destinations later without treating access errors as proof that a route is closed.

## Verification and rollback

- Preserve one route and one profile for every named entity.
- Run route/profile validation, Python discovery tests, frontend tests, route review, production build, privacy boundary, Pages artifact and browser acceptance on the exact PR head.
- Recheck new and refreshed routes within 90 days or sooner if official career content changes.
- Roll back only this batch's public data and documentation commit; do not edit private discovery-state history or the local-only application tracker.
