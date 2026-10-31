# ADR-070 — Fifth worldwide speculative-route expansion

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059 and ADR-063 through ADR-069.

## Goal

Add one small independent studio with an explicit Unreal Engine 5 speculative route and refine the location/engagement information for two existing studio entries.

## New route

- Sudden Forest — Germany; official Join the Team page lists a "Speculative Application Unreal Engine 5" even though no positions are open. Its current funded Tidewind prototype freelance collaboration is limited to Berlin/Brandenburg residents. The studio explicitly says applicants outside the region may still get in touch about future collaboration. Do not present this as a current salaried or worldwide-remote role.

## Existing record refreshes

- Chimera Entertainment — preserve the official Personio speculative application, classify it as an employer ATS route, and reconcile the listing's Munich location with the company careers page's remote/hybrid and permanent-employment options across Germany, Spain, Portugal, Italy, Finland, Poland and Romania. Mandatory internships remain on-site in Munich for at least five months. Official headcount statements differ (25 vs around 70); the profile reports the discrepancy instead of selecting one figure.
- Supermassive Games — use the current careers-page email invitation as the submission method, retain Guildford as the stated route location, and do not infer remote or worldwide eligibility. The employer-managed careers portal reports 150+ people.

## Excluded / held for recheck

- Capcom — official Japanese mid-career recruitment page explicitly advertises Career Registration for applicants who wish to apply without choosing a job type or where no preferred vacancy exists. However, the linked Capcom-managed registration destination returned HTTP 403 during review. Do not publish it until the actual application form can be verified. Official source page: https://www.capcom.co.jp/recruit/guidelines/career/
- Primo Interactive — official careers page describes a UK web/software/digital-marketing agency (websites, software, client portals and digital marketing) rather than a game studio or game-development services provider in scope; exclude.
- 67 Bits — careers page lists current vacancies but no explicit general, unsolicited or talent-pool invitation; exclude until an open route is published.

## Inclusion and caveats

- Only official studio pages and employer-managed ATS routes count as evidence.
- Speculative applications with no current vacancy, future collaboration pools and current paid roles are distinguished.
- Location restrictions and freelance/contract conditions remain explicit.
- Do not guess hiring geography from remote labels or a studio's office footprint.
- No scraped page bodies, applicant CVs, private personal information or tracker data are stored.

## Validation and rollback

- The proposal contains 288 route records and 288 matching profiles, with 285 active and 3 paused.
- Run Python discovery tests, frontend tests, route/profile validation, route review, production build, privacy boundary, Pages artifact and browser acceptance on the exact PR head.
- Roll back only this batch's route and profile changes if validation cannot be corrected.
