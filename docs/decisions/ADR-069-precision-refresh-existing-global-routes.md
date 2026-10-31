# ADR-069 — Precision refresh of existing global application routes

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059 and ADR-063 through ADR-068.

## Goal

Improve the accuracy and usefulness of five existing directory entries using current employer-controlled pages. No new studios are introduced; this batch corrects hiring location, application method, role scope and compensation information.

## Existing records refreshed

- Aska Studios — point the route to the official careers page containing the General Application, classify submission as email, and list its explicit remote-first approach and disciplines.
- Obsidian Entertainment — classify the ApplyToJob destination as an employer-managed ATS, set submission method to ATS, and state the advertised full-time remote General Application's disciplines and missing country-eligibility detail.
- SOFTGAMES — record the English CV/cover-letter requirement, requested discipline/area of interest, salary expectations and earliest start date; add discipline examples, ATS source type and remote-first employer statement.
- Lost Boys Interactive — point to the exact General Application rather than the generic ATS landing page. The application states applicants must reside and work from the United States and that visa sponsorship is unavailable; this replaces the earlier broader US/Canada note.
- Rustling Leaves Games — specify disciplines and state prominently that the studio uses revenue sharing and is not a conventional salaried opportunity.

## Inclusion and evidence requirements

- All changes are supported by the official studio site or an employer-managed application platform.
- Do not infer global work eligibility from remote labels.
- Preserve the lack of country-eligibility statement where employers do not publish it.
- Lost Boys' current General Application explicitly limits applicants to the United States and has no visa sponsorship.
- Rustling Leaves Games is revenue-share based. This must remain visible and must not be described as a salaried vacancy or guaranteed paid role.
- No private applicant data, CVs, contact records or scraped page bodies are stored.

## Validation and rollback

- The public directory remains 287 route records with 287 matching studio profiles; active/paused counts remain unchanged.
- Run route/profile validation, Python discovery tests, frontend tests, route review, production build, privacy boundary, Pages artifact and browser acceptance on the exact PR head.
- Roll back only this batch's route/profile and documentation updates if a validation failure cannot be corrected.
