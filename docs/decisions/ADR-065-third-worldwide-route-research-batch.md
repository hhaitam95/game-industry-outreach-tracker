# ADR-065 — Third worldwide speculative-route research batch

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: ADR-059, ADR-063 and ADR-064.

## Goal

Add a directly researched batch of additional game studios and game-development services companies that accept speculative, unsolicited, spontaneous, open or general applications. Expand meaningful regional coverage and include smaller studios, not only large publishers.

## Research batch

The batch proposes 14 studio/route records, consolidated from PR #62 and this follow-on research PR:

- CipSoft — Germany; experienced and entry-level unsolicited application routes. German-language documents and on-site Regensburg work are stated.
- Codebox Games — Nigeria; portfolios invited across engineering, art/animation, design, production and narrative when a role is not listed.
- DECK13 Interactive — Germany; employer-managed General Application; remote within the EU.
- GAME FREAK — Japan; mid-career registration pool; overseas applicants accepted, business-level Japanese required and Tokyo hybrid attendance stated.
- Loading Studios — Portugal; dedicated spontaneous-application form.
- Minder Games — Vietnam; discipline-specific open application for 2D art, marketing and QA in Hanoi.
- Playa Games — Germany; Teamtailor Initiativbewerbung and Hamburg hybrid.
- Vanara Games — India; open application for candidates whose role is not listed.
- Youniverse Games — Malaysia; explicit open-application route through its careers contact form.
- Blacc Studios — Türkiye; spontaneous application by email.
- Zunisha — India; general/direct application at a global remote-first game-development and immersive-technology services studio.
- Halfbrick Studios — Australia; Expression of Interest form and global remote recruitment statement.
- Bonfire Studios — United States; General Application for Game Development, full-time hybrid in Irvine.
- Flashbulb Games — Denmark; official Jobs page invites unsolicited applications by email and privacy policy confirms email-based applications.

## Inclusion and evidence

- The studio-controlled page or linked employer-managed application platform must explicitly invite candidates without a matching advertised vacancy, or provide a career-registration/general-interest route for future matching.
- A normal careers page, job listing alone, aggregator-only claim or contact page without an explicit application invitation is not sufficient.
- Each record includes the official studio URL, application destination, evidence URL, review date, route classification, submission method, work model and location/discipline caveats.
- Hiring geography is limited to the official wording. A studio being remote-first, saying it works globally, or accepting overseas applications does not by itself establish unrestricted worldwide employment eligibility.
- Discipline-specific routes state the accepted disciplines and must not be presented as a general invitation for every role.
- Unknown hiring locations, language requirements and work-authorisation conditions remain unknown rather than inferred.
- No scraped page bodies, private contact records, email addresses, CVs or candidate data are stored in the public data.

## Earlier PR batch consolidated into this batch

The three additional routes from PR #62 are incorporated into this combined dataset so that merging one PR cannot overwrite the other:

- Halfbrick Studios (Australia) — official Expression of Interest, globally remote according to the studio careers page.
- Bonfire Studios (United States) — Greenhouse General Application for Game Development; hybrid in Irvine, with no remote/international eligibility stated.
- Flashbulb Games (Denmark) — official unsolicited email application route, with cross-border eligibility unstated.

## Explicitly not included in this batch

- Tangelo Games: its official join page linked to a spontaneous-application page that currently returned HTTP 404 during review; keep for recheck, not publication.
- Primal Game Studio: the official careers page linked a speculative form, but the employer-controlled application destination returned HTTP 403 during review; do not infer availability from the blocked form.
- Star Fort Studios: the reviewed careers page listed specific role types but did not establish a general/speculative route.
- Q-Games: the reviewed recruitment page invited inquiries about listed vacancies but did not clearly confirm a general unsolicited application route.

## Boundaries and verification

- Data and status documentation only. No new crawler, dependencies, workflow permissions, schedule, automatic application submission, private storage change or UI redesign.
- Preserve the two-page directory/tracker MVP and the local-only application tracker.
- Validate duplicate studio names, matching profiles, HTTPS URLs, schema enums, route status, dates, and exclusion requirements before merge.
- Recheck all newly published routes within 90 days or earlier if an authoritative page changes.

## Rollback

Revert only this research batch's data and documentation commit. Do not modify the discovery-state branch or remove existing routes.
