# ADR-074 — Global discovery batch 9: Tarokai, Procedural Games and Thought Pennies

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071 through ADR-073.

## Decision

Add three organisations to the public speculative-application proposal because each passes the two eligibility gates: a legitimate video-game development business and an explicit employer-backed non-vacancy application route. Refresh the existing Playtouch record using its current official career information. Reconsider Thought Pennies' earlier hold after finding an explicit first-party link from the official website to its careers platform.

## New verified records

### 1. Tarokai — Switzerland

- Official homepage: https://www.tarokai.com/
- Official legal notice: https://www.tarokai.com/legal
- Evidence: the official homepage contains a Careers section that explicitly says candidates who do not see their role may send a spontaneous application to `careers@tarokai.com`.
- Developer identity: the legal notice identifies Tarokai SA, a Swiss société anonyme registered in the Swiss Commercial Register. It does not state a registered city/address; the record deliberately leaves that location unknown.
- Games: Peach Farmer, a free-to-play collectible card game for iOS and Android that connects in-game card collection with real-world experiences, events and trips. The company homepage reports 250K+ downloads and a 4.8/5 average rating.
- Work model: the listed full-time openings are labelled full remote. This does not by itself specify which countries the company can employ or contract in.
- Route: spontaneous application by email, linked and described by the official company site.

### 2. Procedural Games — Spain

- Official homepage: https://proceduralgames.com/
- Official Careers portal: https://careers.proceduralgames.com/en/jobs/candidatura-espontanea
- Evidence and relationship: the official Procedural Games homepage directly links the Careers subdomain from its navigation. The employer-controlled portal lists an “Always open” Open application and tells candidates who do not see a suitable role to submit their CV for future consideration.
- It is not a firm job offer. The employer says CVs are kept for up to 12 months, only with applicant permission, and can be deleted by the applicant.
- Developer identity: independent mobile-game studio based in Valencia, founded in 2023 by Carlos Recourt. The official homepage says game design, Unity development, live operations, monetization and user acquisition are handled in-house. It identifies Tech Startup Idle Tycoon and Legendary Differences as its games.
- Work model/location: the open application is listed as hybrid at Lanzadera/Marina de Empresas in Valencia, with arrangement depending on the role. The company encourages international applications and remote collaboration, but the application itself is labelled hybrid/Valencia.
- Legal identity: the official homepage footer identifies Procedural Games, S.L.U., NIF B70777016. The careers privacy page records the application consent and 12-month retention details.
- Route: employer-managed open-application platform.

### 3. Thought Pennies — country not stated

- Official homepage: https://www.thoughtpennies.com/
- Officially linked careers site: https://thought-pennies.careers-page.com/
- Direct open-application route: https://thought-pennies.careers-page.com/open-application
- Evidence and relationship: the official homepage's “Join Us” link goes directly to the careers-page.com domain. The linked careers page contains a dedicated Open application section and explicitly invites resumes even when candidates do not see a suitable position.
- This direct official link resolves the employer-route concern that previously caused the candidate to be held.
- Developer identity: Thought Pennies describes itself as a fully remote story-first RPG studio focused on emotional storytelling and technically ambitious role-playing games. The official website's copyright notice identifies Thought Pennies, Inc., but no incorporation country or headquarters city is given; the directory uses “Not stated” instead of inferring a US location from “Inc.”
- Work model/eligibility: fully remote per the official homepage; applicant-country and contracting eligibility are not stated.
- Route: employer-linked careers platform open application.

## Existing record update: Playtouch — Mauritius / France

- Official Careers page: https://playtouch.net/career
- Official About page: https://playtouch.net/about
- The current Careers page explicitly keeps spontaneous applications open year-round even while the team is complete. It provides six talent tracks: AI/automation, HTML5 game/web engineering, 2D art/motion/Creative AI, game design/narrative/audio, QA/release operations, and product/AdTech/B2B. CVs or portfolio links go directly to the Grand Baie studio leads; the page publishes `contact@playtouch.net`.
- The record now distinguishes Playtouch's production studio in Grand Baie, Mauritius, Mauritius administration in Port Louis, and French headquarters in Roquefort-les-Pins. Current advertised jobs are all on-site in Grand Baie. The spontaneous talent pool does not explicitly state applicant-country eligibility or remote hiring.
- Playtouch remains one existing route; no duplicate was added.

## Other candidate reviewed; no addition

### Thought Pennies — earlier manual hold resolved

The official homepage now supplies the required first-party Join Us link to the careers page. The route is therefore included above. Its country and applicant eligibility remain unknown.

Other rediscovered employers in this pass, including Playtouch and existing directory names, were checked for duplicates rather than added again.

## Dataset / validation

- Proposal branch after this pass: **307 route records / 307 matching profiles**.
- Status: **303 active / 4 paused**.
- Country/location labels: **50**; Thought Pennies uses “Not stated”, an existing label.
- Three new route/profile pairs added: Tarokai, Procedural Games and Thought Pennies.
- Existing Playtouch route/profile updated; no additional Playtouch record.
- No personal applications, CVs or private user data were added to the public dataset.
- Run Python discovery tests, frontend tests, lockfile registry, directory validator, route review, production build, privacy boundary, Pages artifact validation and browser acceptance on the exact PR head.
- Do not merge or deploy without normal review and exact-head CI success.
