# ADR-072 — Global discovery expansion: four verified records and company-level review

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071.
- Scope: Four additional verified records, one company-level manual exclusion, and four review/no-add decisions from the same global research pass.

## Decision

Add four organisations to the public speculative-route dataset because each is a legitimate video-game development organisation and its official website explicitly invites applications beyond a specific advertised vacancy.

The inclusion decision is independent of employer size, country, discipline, work model and the user's current career interests. Paid employment is not a requirement for inclusion, but volunteer-only opportunities must be marked clearly as unpaid participation.

## Four new route records

### 1. AnkleBreaker Studio — France

- Official studio: https://anklebreaker-studio.com/
- Official application/evidence page: https://anklebreaker-studio.com/careers
- Route: open application by email to `hello@anklebreaker-studio.com`.
- Evidence: the Careers page explicitly tells candidates who do not see their role to contact the studio. It invites a portfolio, project or letter for exceptional skills not listed.
- Studio gate: the official page identifies an independent French indie game studio near Paris, currently developing Mithrall. It reports ten senior team members.
- Conditions: near Paris; in-person work is the default, while remote may be considered for the right person/role. The studio describes profit sharing from shipped titles; do not invent additional compensation guarantees.
- Qualification: the invitation applies to skills outside the eight currently advertised Mithrall roles. It is not an assertion that current vacancies are generic roles.

### 2. Alice in Games — Germany

- Official studio: https://aliceingames.com/
- Official application/evidence page: https://aliceingames.com/career/
- Supporting identity/location evidence: https://aliceingames.com/about/ and https://aliceingames.com/contact/
- Route: open application by email to `info@aliceingames.com`.
- Evidence: the Career page explicitly labels an Open Application and invites artists, developers, designers and other creatives even when no specific role fits, asking for a resume, portfolio or short introduction.
- Studio gate: its official About page describes a small independent game studio making emotionally driven narrative games; the Contact page lists a Berlin office.
- Conditions/unknowns: the homepage says its first game is in development, but no title, platform, release date, public game credit or team size is disclosed. Remote and applicant-country eligibility are not stated.
- Qualification: include as an early-stage/pre-release studio with the lack of a named released game stated prominently; do not invent a title.

### 3. No Roof Games — Finland

- Official studio: https://noroofgames.com/
- Official application page: https://noroofgames.com/open-application/
- Supporting profile page: https://noroofgames.com/about/
- Additional developer-credit cross-check: https://play.google.com/store/apps/details?id=com.NoRoofGames.HeroesFriendsGO
- Route: open application by email to `contact@noroofgames.com`.
- Evidence: the dedicated Open Application page invites applications for casual real-time multiplayer game development and asks for an application letter and CV, with portfolio links where available.
- Studio gate: the official homepage identifies a small mobile game studio in Tampere, Finland. The About page reports three industry professionals with more than 20 years of combined experience. Heroes & Friends GO is also listed under the No Roof Games developer name on Google Play.
- Conditions/unknowns: remote-work and applicant-country eligibility for the open application are not stated.

### 4. Skytale — France

- Official studio: https://skytale.fr/en/
- Official application page: https://app.skytale.fr/rejoindre
- Supporting studio evidence: https://skytale.fr/en/qui-sommes-nous
- Route: spontaneous/volunteer application through the official recruitment form; applicants can submit a CV and two or three links.
- Studio gate: official pages describe an independent French non-profit video-game studio founded in 2019, with 80+ active volunteers across three continents. It develops Minecraft-based games, events and its own editor.
- Conditions: the studio states that it has no employees, 100% remote work, no commercial budget and entirely volunteer-produced creations. This is unpaid volunteering, not salaried employment. That distinction is included in both the route notes and studio profile.
- Qualification: include because the discovery scope does not require paid employment; never present this as a paid job or conventional employer vacancy. Projects include The Last Artifact and Z'Wonder Battle.

## Company-level exclusion

### Chouic — excluded

- Official recruitment page: https://chouic.com/recrutement
- App Store developer catalogue: https://apps.apple.com/us/developer/chouic/id824866807
- Google Play developer catalogue: https://play.google.com/store/apps/developer?id=Chouic
- Evidence reviewed: the company's official recruitment page describes a mobile-games studio for couples and friends. The developer catalogue includes Sex Game For Couple – PleaseMe (described as a sensual experience), intimate couple-game products, and an alcohol/party title Chopine.
- Decision: treat this as a material sexual-entertainment/alcohol-game portfolio and add the official domain `chouic.com` to `config/manual-studio-exclusions.json`. This is a company-level portfolio decision, not a keyword-only exclusion. Revisit only if the company establishes a distinct, separately operated non-adult studio/business and hiring route.

## Manual review — not published

### Duhndal — Denmark

- Official Careers: https://www.duhndal.com/careers
- Supporting portfolio: https://www.duhndal.com/contentcreator
- The official Careers page contains an “uopfordret ansøgning” (unsolicited application) section, states that hiring is limited to Denmark, and accepts a CV, motivated application and portfolio. The studio says work is fully remote.
- Its portfolio includes One-Armed Cook, One-Armed Robber and Drug Lord Tycoon. The latter is explicitly drug-themed.
- Decision: do not publish yet. Review whether the drug-focused premise of one of three titles is material under the user's drug-content exclusion, rather than automatically treating a single game as proof that the company's overall business is drug-focused. Keep out of the public directory until that boundary is resolved.

### Manc Games — Türkiye

- Company/About: https://www.mancgames.com/about
- Main careers page: https://www.mancgames.com/career
- Separate microsite with a General Application: https://www.rummikubsocial.com/careers
- The company is a legitimate Istanbul-based mobile-game developer. Its main Careers page currently lists role categories; a separate Rummikub Social microsite has a General Application page.
- Decision: hold. The reviewed main Manc careers page did not link to the separate microsite's application. Confirm the official company relationship or obtain a direct link before publishing the route.

### Fawkes Games — reconsidered, still not published

- Official About: https://fawkesgames.com/
- Official Careers: https://fawkesgames.com/careers
- The current Careers page lists Unity Game Engineer, artist, designer and producer roles and invites spontaneous applications. The About page still describes Fawkes as a European publisher/operator focused on reviving classic online worlds, operating five titles and providing publishing/live-operations services to other developers.
- Decision: keep out pending evidence that Fawkes itself performs in-house game development. The current job titles are a reason to investigate, but the company's own stated operating model remains publisher/operator.

### AMIGO Spiele — out of video-game scope

- Official careers page: https://blog.amigo-spiele.de/ueber-amigo/karriere-2/
- It invites initiative applications, but the reviewed official company page describes board/card game development and distribution, not video-game development.
- Decision: do not include. A speculative route in tabletop games does not satisfy the video-game developer gate.

## Duplicate checks

The research pass also rediscovered several qualifying employers already in the directory. No duplicates were added for Reply Game Studios, Ocellus, Old Skull Games, VestGames, Yabu Games, Funday Games, Octocube Games, Abyssal Interactive, Aethra Studios, Katal Games, Sencorp Games, Studios DRAMA or other already-recorded names.

## Dataset and validation

- Proposal branch after this addition: **301 route records / 301 matching profiles**.
- Route status counts: **297 active / 4 paused**.
- Country/location labels: **49**.
- Main remains unchanged at **287 / 287**, with 284 active and 3 paused, until the replacement proposal PR is reviewed and merged.
- Added four new studio profile records and four route records.
- Added Chouic to the manual exclusion configuration; no personal application data, CVs or private user records are included.
- Run Python discovery tests, frontend tests, directory validation, route review, production build, lockfile registry check, privacy check, Pages artifact check and browser acceptance on the exact PR head.
- Do not merge or deploy without exact-head validation and normal PR review.
