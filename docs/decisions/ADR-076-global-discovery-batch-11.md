# ADR-076 — Global discovery batch 11: FakeFish, Winning Streak and ByteRockers; source verification correction

- Date: 2026-10-31
- Status: Proposed on PR #70; not merged to main
- Depends on: Global Discovery Implementation Model; ADR-071 through ADR-075.

## Decision

Add three further studios after both the developer-identity gate and explicit speculative-application gate were verified on official employer pages. Update two existing records to reflect the current official hiring information. Pause a previously published route where the first-party link to its external ATS could not be established, and manually exclude a company whose own product pages explicitly describe online casino/slot-game development.

## New verified routes

### 1. FakeFish Games — Finland

- Official website: https://www.fakefishgames.com/
- Official Careers page: https://www.fakefishgames.com/jobs
- Dedicated Open Application page: https://www.fakefishgames.com/jobs/open-application
- Evidence: official Careers page states that when no advertised role fits, candidates should fill out the Open Application. The dedicated page says candidates who do not see their job listed can submit their information so the studio can keep them in mind for future opportunities.
- Developer identity: independent PC/console game developer focused on its own IP, moddability and open development; its flagship is Barotrauma (developed with Undertow Games) and it is working on an undisclosed second game.
- Company identity: FakeFish Oy, registered at Kauppiaskatu 10 C 40, 20100 Turku, Finland.
- Location: HQ in central Turku, smaller office in central Helsinki. Official pages describe flexible working arrangements and the route says “Turku, Finland & beyond”; no fixed remote or applicant-country eligibility is stated.
- Team size: its current homepage says about 20 people; the dedicated Open Application page reports about 25 (as of early 2023). The profile preserves the discrepancy rather than presenting the older number as current.
- Route: official website form.

### 2. Winning Streak Games — Germany

- Official website and application/evidence page: https://winningstreakgames.de/
- Official Impressum: https://winningstreakgames.de/impressum.html
- Evidence: the company homepage has a dedicated “Initiativbewerbung” section and explicitly invites candidates to write even when no listed role fits. The official Impressum publishes `gkoehler@winningstreak.de` as the company contact.
- Developer identity: Cologne-based developer of PC simulations. The official site lists WE ARE FOOTBALL 2027, WE ARE FOOTBALL 2024 and Taktikfuchs: Eishockey (funded project in development). It documents the founding of Winning Streak Games in Cologne on 7 June 2018 and its publishing agreement with THQ Nordic.
- Legal identity: Winning Streak Games GmbH, Eupener Str. 165, 50933 Köln, Amtsgericht Köln HRB 94987.
- Work model: all advertised jobs are full-time in Cologne; home office is offered only in exceptional cases. Do not imply remote or international eligibility for the spontaneous application.
- Route: spontaneous application by email.

### 3. ByteRockers' Games — Germany

- Official website: https://www.byterockers.games/
- Official Jobs/application page: https://www.byterockers.games/de/jobs
- Official About page: https://www.byterockers.games/de/%C3%BCber-uns
- Official Impressum: https://www.byterockers.games/de/impressum
- Evidence: the official Jobs page says candidates who do not see a fitting position, or when the company is not actively hiring, should send an “Initiativbewerbung” to `jobs@byterockers.games`. It explicitly addresses people passionate about developing video games.
- Developer identity: the official About page says the company creates new games; it began publishing other creative teams' projects in 2024. Official developer credits include Insurmountable, Beat Slayer and Gelly Break Deluxe. The homepage promotes further titles including The Regreening.
- Legal identity: ByteRockers' Games GmbH & Co. KG, Schloßstraße 110, 12163 Berlin, Amtsgericht Berlin-Charlottenburg HRA 40774 B.
- Work model: the spontaneous application route does not state work model or applicant-country eligibility; the directory uses the Berlin registered address as a reference, not an inferred role location.
- Route: unsolicited application by email.

## Existing route/profile corrections

### Redly Games — Finland

- The official homepage https://www.redlygames.com/ has a “Join Us” link to the employer-managed Ashby General Interest / Open Application:
  https://jobs.ashbyhq.com/redlygames/3c2a1d1e-5e80-4b4e-895d-f43d0efe4d3b
- The Ashby page explicitly invites candidates aligned with the studio's mission even when no current role matches, for future consideration.
- It is a remote contract application. EU and Canada are preferred; exceptional candidates elsewhere may be considered depending on role.
- The public directory's `websiteUrl` now points to the official Redly homepage, `applicationUrl` to the exact Ashby open application, and `sourceType` to `employer_managed_career_platform`. The current game is an unnamed mobile 3D adventure built in Unreal Engine 5.

### HypeHype — Finland

- The official Jobs page https://hypehype.com/jobs currently describes the company as an AI-native game studio based in Helsinki, backed by Supercell and Benchmark.
- It lists a dedicated Open Application for AI-native people who want to shape the future of games and game creation, alongside a Game Designer - AI Native Games role.
- The route remains an existing record; its notes now reflect the AI-native studio positioning. The open-application work model and applicant-country eligibility are not stated, so the directory no longer infers on-site work solely from the Helsinki studio location.

## Route paused: Plummy Games — Moldova

- Existing Teamtailor Open Application: https://plummygames.teamtailor.com/jobs/6670751-open-application/applications/new
- The Teamtailor page carries Plummy Games branding and links back to plummygames.com, but the current official plummygames.com homepage could not be inspected for a forward link to that recruitment portal.
- Under the direct employer-linkage standard, the relationship has not been independently established from the official company domain in this pass.
- Decision: preserve the record but set `routeStatus: paused`, note the missing first-party linkage, and set a short review date. This is not evidence that the application has closed. Restore to active only after a link from the official site/careers page or direct company confirmation.

## Manual exclusion: Xatronic Software GmbH — Austria

- Official homepage: https://xatronic.at/
- Official Products page: https://xatronic.at/produkte/
- Official careers page: https://karriere.xatronic.at/
- The Careers page does mention spontaneous applications for IT and game-software roles, but the official Products and homepage describe the company as a supplier of online casinos and online gaming platforms, specialising in slot/reel games. Its product description includes three-, four- and five-reel slot games, bonus mechanics and features designed to maximise players' chances of winning.
- Decision: add `xatronic.at` to `config/manual-studio-exclusions.json` and exclude under the explicit iGaming/online-casino/slot-game policy. Do not include just because the company uses general “game development” language.

## Other checks

- **HypeHype** and **Redly Games** were already in the directory and are refreshed rather than duplicated.
- **Plummy Games** remains one record but is now paused pending official route linkage.
- **Xatronic** is excluded, not merely held, because the company's own product pages directly identify online-casino and slot-machine development.

## Data / validation

- Historical proposal snapshot after this pass: **311 route records / 311 matching profiles** before final identity reconciliation.
- Status: **306 active / 5 paused**.
- Country/location labels: **51**.
- Three candidate route/profile pairs were prepared: FakeFish (now consolidated with the existing Fakefish record by ADR-078), Winning Streak Games and ByteRockers' Games.
- Existing route/profile updates: Redly Games, HypeHype and Plummy Games.
- Manual exclusion added: Xatronic Software GmbH.
- Run Python discovery tests, frontend tests, lockfile registry, directory validator, route review, production build, privacy boundary, Pages artifact validation and browser acceptance on the exact PR head.
- PR #70 was subsequently merged after exact-head CI success. The duplicate FakeFish record was consolidated in ADR-078.
