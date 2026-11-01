# ADR-068 — Sixth worldwide game-industry application research batch

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059 and ADR-063 through ADR-067.

## Goal

Expand the directory with game-development services and remote talent pools that create practical entry routes into player support, QA, production, engineering and creative disciplines. Do not duplicate a studio for each discipline or country-specific pool; record the employer once and document the regional routes.

## New records

- Kokku — Brazil; official Factorial General/Open Application and remote talent pools for QA, backend/game programming, rendering, UI/UX and production. The general form requests a CV and offers an optional talent-pool consent.
- Raini Studios — Australia; official Careers page says it is not hiring for a specific vacancy but invites CVs/applications for future opportunities. Remote work, with AEST/AEDT overlap preferred; technical art, UI/UX and game design are listed talent interests.
- Side — global game services/co-development company; a Workable Player Support / Email Support talent pool for remote Philippines project work is the primary route, with related pools for LATAM co-development programming/animation, APAC on-site animation and selected Europe LQA roles. Record Side once, not once per pool.

## Existing record refresh

- Havoc Games — update the existing general-application route to reflect current careers listings marked Remote (India), the request for CV/portfolio and the current discipline breadth. Cross-border eligibility remains unstated.

## Inclusion and eligibility rules

- Talent-pool routes can be included when the employer explicitly states that applications are retained for future matching or invites candidates even when no current vacancy is suitable.
- A talent pool is not described as an immediate job opening. Side pools are future project-based opportunities and can be contract or location-specific.
- Kokku's open form includes a separate optional consent for future talent-pool contact; do not state that applicants are automatically added without that consent.
- Raini describes itself as not actively hiring for a particular role; its Careers page invites applicants to submit material for future fit.
- Side is a global services employer, not a conventional single game-development studio; its profile classifies it as co-development, game services, QA and player-support services.
- A remote role does not establish worldwide work authorisation. Kokku and Side role eligibility is region-, discipline- and contract-specific; Raini prefers AEST/AEDT overlap; Havoc's currently stated remote geography is India.
- Do not invent Raini's obfuscated email address. Use the official Careers page as the application destination.
- No scraped page bodies, private applicant records or browser-local application tracker data are stored.

## Validation and rollback

- Preserve one route and one profile per named employer.
- Validate 287 proposed route/profile pairs, duplicate names, required fields, HTTPS destinations and review dates.
- Run Python discovery tests, frontend tests, directory validation, route review, production build, privacy boundary, Pages artifact and browser acceptance on the exact PR head.
- Recheck newly added/updated routes within 90 days or sooner if the official page changes.
- Revert only the batch data/documentation commit if necessary; do not alter private discovery state or the personal application tracker.
