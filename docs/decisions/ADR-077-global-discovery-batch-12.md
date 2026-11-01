# ADR-077 — Global discovery batch 12: Square Enix, Iteration One and Cenrellia Studios

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071 through ADR-076.

## Decision

Add three further organisations to the speculative-application directory after verifying both their game-development identity and an employer-backed route that invites future/non-vacancy applications. Refresh existing Stormind Games and GAME FREAK entries using current official career and company information.

The batch also clarifies that an owner-operated one-person video-game studio can qualify, even where it has no advertised vacancies and the unsolicited invitation concerns project pitches, collaboration or commissioned work rather than a salaried position. Such a record must state the solo-business nature and any unknown commercial terms prominently; do not imply paid employment.

## New verified routes

### 1. SQUARE ENIX — Japan

- Official mid-career recruitment: https://www.jp.square-enix.com/recruit/career/
- Career Registration evidence: https://www.jp.square-enix.com/recruit/career/careerlink/index.html
- Employer-managed application: https://hrmos.co/pages/square-enix/jobs/00001/apply?_ga=2.56325035.1257445894.1654503188-1642193798.1609815115
- Official company data: https://www.jp.square-enix.com/recruit/career/data/index.html
- Evidence: the company's mid-career site explicitly offers Career Registration to people who do not want to specify one job type or whose target role is not currently open. HR reviews registrations across divisions and may introduce a matching role, including positions not publicly listed.
- The profile can be considered across the SQUARE ENIX Group. Registration is valid for three years but does not guarantee an interview, job or contact.
- Relevant fields include Digital Entertainment/game development, production and operations, CG, sound, localization, R&D, publishing, media, marketing, IT, QA and support.
- Official data lists 3,235 employees in the standalone company as of 2026-03-31, with headquarters in Shinjuku, Tokyo and offices in Shibuya and Osaka. Square Enix is wholly owned by Square Enix Holdings Co., Ltd.
- Eligibility: the career-registration page does not state the work model or overseas applicant eligibility. Do not infer either from the group size or office footprint.
- Classification: developer/publisher group with a substantial in-house Digital Entertainment business; this is a company career-registration pool, not a job vacancy.

### 2. Iteration One — Germany

- Official homepage: https://www.iterationone.com/
- Official Careers link: https://join.com/companies/iterationonecom
- Direct Spontaneous Application: https://join.com/companies/iterationonecom/spontaneous-application
- Evidence: the official homepage links directly to the employer's JOIN careers profile. The JOIN page explicitly offers a Spontaneous Application and states that although there may be no suitable role now, candidates may fit a future opening; applicants upload a CV and cover letter.
- Developer identity: self-funded independent gaming studio and publisher based in Karlsruhe, creating free-to-play mobile idle/tycoon games. Its live title is Nightclub Tycoon.
- Team size: 1–10 employees according to the employer profile on JOIN.
- Work model/applicant eligibility: the spontaneous route does not state these; the Karlsruhe location is an employer/studio reference, not an inferred applicant restriction.
- Classification: developer and publisher; not a publisher-only entity.

### 3. Cenrellia Studios — country not stated

- Official Careers page: https://cenrelliastudios.com/de/careers
- Official Contact form: https://cenrelliastudios.com/de/contact
- Official About: https://cenrelliastudios.com/de/about
- Official Games: https://cenrelliastudios.com/de/games
- Evidence: the official Careers page says no positions are currently advertised, but explicitly invites unsolicited applications/pitches for Art, Music, commissioned development, QA and Community. Applicants are directed to the first-party contact form with “Careers” as the subject.
- Developer identity: the official About page identifies Cenrellia as an independent game studio; its Games page lists Stellar Hustler, available for Steam/PC (Linux-first), Android and iOS. The studio describes the game as a one-time purchase with no in-app purchases, subscriptions or advertising.
- Business structure: the Careers page describes it as an owner-operated one-person business/sole proprietorship. Country and registered location are not stated on the reviewed official pages.
- Qualification: include because it demonstrably develops a digital video game and explicitly invites unsolicited work/collaboration pitches.
- Important distinction: the company says no jobs are currently open and does not state compensation or engagement terms. Do not present the route as a salaried vacancy; it may lead to a project, commission or collaboration. The profile clearly marks the solo-developer context and unknown commercial terms.

## Existing route/profile refreshes

### Stormind Games — Italy

- Official Careers page: https://stormindgames.com/careers/
- Official Company page: https://stormindgames.com/company/
- Official Games page: https://stormindgames.com/games/
- Its Careers page explicitly offers a spontaneous-application form where candidates attach a CV/resume if no role matches.
- The form gathers location, contact details, site/LinkedIn, a message and CV.
- The current Company page describes Stormind as independent, founded in 2016, with 100+ internal resources plus external collaborators. Its HQ is Catania/Acireale and its registered office is Milan.
- The refreshed profile records Remothered: Red Nun's Legacy (released 2026-10-27), upcoming remasters, A Quiet Place: The Road Ahead, Batora: Lost Haven and a co-development contribution on Mafia: The Old Country.
- The spontaneous route does not state work model or applicant-country eligibility.

### GAME FREAK — Japan

- Official recruitment site: https://www.gamefreak.co.jp/recruit/
- Official FAQ: https://www.gamefreak.co.jp/recruit/faq/
- Employer-managed Career Registration: https://hrmos.co/pages/gamefreak/jobs/10-4
- The HRMOS Career Registration listing invites regular-employee candidates to register their experience even when no current target position exists; HR may contact them if a suitable job or hiring event arises. It is not a specific job vacancy and does not guarantee a match.
- The registration retains a candidate profile for up to two years.
- The official FAQ says applications from overseas are accepted, but business-level Japanese is required for all positions and approximately JLPT N1 is specified for development work.
- The record now uses `workModel: not_stated`; Tokyo is a company HQ reference, not an assumption that the career-registration role is hybrid or office-based. Applicant requirements and the matched role's eventual location/work model must be confirmed on contact.
- This is an update to the existing GAME FREAK record, not a duplicate.

## Dataset / validation

- Proposal dataset after this pass: **314 route records / 314 matching profiles**.
- Route status: **309 active / 5 paused**.
- Country/location labels: **51**.
- Three new route/profile pairs: SQUARE ENIX, Iteration One and Cenrellia Studios.
- Existing routes refreshed: Stormind Games and GAME FREAK.
- Cenrellia Studios' application is a speculative project/collaboration invitation from a one-person business, not an advertised salaried job; keep this caveat in the public record.
- No personal application records, CVs or private user data were added.
- Run Python discovery tests, frontend tests, lockfile registry, studio-directory validator, route review, production build, privacy boundary, Pages artifact validation and browser acceptance on the exact PR head.
- Do not merge or deploy without normal review and exact-head CI success.
