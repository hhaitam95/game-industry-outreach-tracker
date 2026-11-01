# ADR-073 — Global discovery batch 8: Rapidfire, Sleeprunner and Cluetivity

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071 and ADR-072.

## Decision

Add three additional organisations to the batch-6 proposal because each is a legitimate developer of digital games and has an explicit speculative/open/initiative application route tied to its official website or employer-controlled application platform.

This pass also clarifies that direct development of mobile, GPS-based, location-based and augmented-reality games can satisfy the video-game developer gate. Such companies must be accurately classified and not silently presented as conventional PC/console studios.

## New verified route records

### Rapidfire Games — Cyprus

- Official website / Careers section: https://rapidfire.games/
- Evidence: the Careers section says no positions are open but explicitly welcomes an open application with a CV or portfolio through the careers contact shown on the page.
- Studio identity: official site describes an independent team of 18 making free-to-play mobile games for iOS and Android. Its live game is Backpack Brawl.
- Legal identity: official terms identify RAPIDFIRE LTD, registration HE460989, with registered office in Geri, Cyprus. The privacy policy renders the name as RAPIDFIRE GAME LTD with the same registration number/address. Keep this document-to-document naming discrepancy visible; do not invent a resolution.
- Work model: team is described as remote and globally distributed. This does not guarantee the company can employ/contract applicants in every country; applicant-country eligibility is not stated.
- Route: open application by email; application link resolves to the official site and its Careers section.
- Relevant source evidence: https://rapidfire.games/privacy-policy/ and https://rapidfire.games/terms-and-conditions/.

### Sleeprunner Studios — Germany

- Official site: https://sleeprunnerstudios.com/
- Official Jobs/application page: https://sleeprunnerstudios.com/jobs/
- Supporting About page: https://sleeprunnerstudios.com/about/
- Supporting press page: https://sleeprunnerstudios.com/press/
- Evidence: the official Jobs page explicitly invites unsolicited applications from designers, programmers, artists, marketers and other people with relevant skills when no current vacancy fits. It requests a CV, portfolio and brief motivation letter by email to `hello@sleeprunnerstudios.com`, in PDF format.
- Studio identity: five-person indie developer in Bayreuth, founded in 2020, specialising in Unreal Engine PC/console games. It also offers co-development, 3D visualisation, technical consulting and plugin-development services.
- Current projects/credits named by the studio: Trail of Toads, Downfall Hearts and Windstorm: Start of a Great Friendship - Remastered.
- Eligibility: employees must reside in Germany or the European Union; freelance collaboration is possible worldwide. Hybrid work and relocation support are described.
- Route: unsolicited application by email.

### Cluetivity — Germany

- Official site: https://www.cluetivity.com/
- Official careers page: https://www.cluetivity.com/careers/
- Employer-controlled Personio Initiative Application: https://cluetivity.jobs.personio.de/job/431574?language=en
- Supporting About page: https://www.cluetivity.com/about/
- Evidence: the official Careers page embeds the company's Personio job system; the listed Initiative Application says candidates should contact the company if their desired job is not listed.
- Studio/developer identity: the official About page says the company began developing GPS-based games in 2006 and describes its team as creating location-based entertainment and mobile games. It develops GPS-based and augmented-reality game experiences and a platform used by businesses to create and customise games.
- Classification: include as a specialised location-based/mobile/AR game developer and platform provider. Do not describe it as a conventional PC/console studio; the public notes and profile retain this distinction.
- Legal identity: the official careers footer identifies Life Action Games GmbH. The official About page says the company was created in Berlin.
- Work arrangement: Personio describes the initiative role as remote or Berlin and full-time/permanent. Applicant-country eligibility is not specified.
- Route: employer-managed Personio ATS, directly embedded from the official Careers page.

## Existing record refresh

### Next Level Games — Canada

- Official General Application: https://nextlevelgames.applytojob.com/apply/YyYQvToJW1/General-Application
- The employer-managed form explicitly invites experienced game developers even when no open spot exists.
- It identifies Next Level Games as a wholly owned Nintendo subsidiary and Vancouver, British Columbia as the location.
- The current form states hybrid work with at least three days per week in the Vancouver studio. Applicants must be legally eligible to work in Canada and currently reside in British Columbia.
- The existing directory record was refreshed to workModel `hybrid` and to preserve the explicit Canadian work-authorisation and BC residence conditions. It remains one existing record, not a new studio.

## Exclusion decision

### 3Sigma Games — excluded

- Official hiring page: https://www.3sigma-games.com/public/hiring
- The company's own hiring page labels the business an **“Adult Game Studio”** and offers a general application for VFX, editing, directing, 2D/3D art, game development, game design, web and related roles. Its application also asks applicants to identify the sector, with adult entertainment given as an example.
- Decision: add `3sigma-games.com` to the manual exclusion configuration. This is explicit company-level adult-business evidence, not an inference from a single mainstream game's mature content.
- The studio must remain out of the public directory under the adult/sexual-entertainment exclusion policy.

## Other search results reviewed; no new record

- **Raw Power Games:** already present in the directory. Its official Teamtailor career site continues to show an Unsolicited Application and describes the Copenhagen studio and the time-zone limits of remote work. No duplicate added.
- **Futureplay Games:** already present. Its official Open Application remains active and explicitly lists remote/global as an option. No duplicate added.
- **Shiro Games:** already present. Its official General Application continues to invite experienced game developers by email. No duplicate added.
- **Next Level Games:** already present; its route details were refreshed as above.
- **Studio Countdown:** not added. The reviewed official Careers page describes the organisation as an animation studio and its spontaneous roles include a comic project; the inspected evidence did not establish a direct video-game development studio/business under the required gate. Reconsider only if direct video-game development is established.
- **welevel München:** not added. The speculative listing surfaced on LinkedIn, but an official company-controlled application route/evidence path was not established during this pass.
- **Axonlab:** not added; the source surfaced an initiative-application portal for a multi-country employer, not a verified video-game development studio.

## Data / validation

- Proposal dataset after this pass: **304 routes / 304 matching profiles**.
- Route status: **300 active / 4 paused**.
- Country/location labels: **50**.
- Three new route/profile pairs: Rapidfire Games, Sleeprunner Studios and Cluetivity.
- One existing record refreshed: Next Level Games.
- One manual exclusion added: 3Sigma Games.
- No personal application records, CVs or private user data were added.
- Run the full exact-head validation suite: Python discovery tests, frontend tests, lockfile registry, studio-directory validator, route review, production build, privacy boundary, Pages artifact validation and browser acceptance.
- Do not merge or deploy without review and exact-head CI success.
