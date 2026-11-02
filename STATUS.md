# Game Industry Outreach Tracker status

**Last verified:** 2026-11-02  
**Product scope:** Global directory of legitimate video-game development organisations with verified speculative-application routes, plus a private browser-local Candidate Profile and application tracker.  
**Authoritative discovery rules:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

## Application campaign strategy — 2026-11-02

**Documented and agreed; strategy only, not implemented as a new workflow.** Added [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md) as the durable handover for the intended application approach.

- Keep discovery broad, worldwide and non-personalized; do not cap the directory or use candidate preferences to suppress studios.
- Keep the existing strict public-directory gates: verified direct game-development activity plus an explicit employer-backed speculative/general application route.
- Use private matching to assess professional relevance, application accessibility/readiness and personal priority separately. Do not add a fabricated composite score or hiring probability.
- Default to one approved master resume/CV and one approved core motivation letter/message. Flag genuine employer-specific exceptions for manual review rather than tailoring every application.
- Prefer a first campaign wave in Europe and nearby European markets, then English-language international markets (including the UK, Canada and US), then broader global options. These are private priority tiers; work location, language, applicant eligibility, work authorization and relocation must be verified independently.
- Aim for a substantial, coordinated batch (potentially 200+ where targets are genuinely ready), without treating that number as a quota or promising a response. Track submitted applications and outcomes, not just discovered studios.
- A positive reply is not a reason to abandon the rest of the pipeline. Keep other applications active until a written offer and the material transition requirements are confirmed.
- No portal automation, autofill, automated uploads, email sending or automatic submission is authorized. Final application review and submission remain user-controlled.

The campaign strategy does not change the public discovery schema, source permissions, studio qualification gates or current implementation status. Matching is already implemented and merged in PR [#96](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/96); the Application Queue, deeper requirements intelligence, campaign views and funnel reporting remain future work unless separately verified as merged.

## Matching quality validation — PR #104 (merged and deployed)

**Merged and deployed on 2026-11-02.** PR [#104](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/104) merged as `a183c8f030552333693fe5c44a87bc7cc9fa34bb`.

The follow-up improves the matching foundation already merged in PR #96:

- Direct and related/adjacent role-family mappings are distinct. Related disciplines can support Potential, but do not independently justify Strong.
- Strong requires a direct role-to-discipline alignment and demonstrated skill evidence mapped to that same discipline.
- Normalized phrase-boundary matching removes substring false positives such as “Go” inside “Google Workspace” and “Art” inside “Cartography”; a positive control confirms standalone Go still maps to Programming.
- Work-history matching considers job title, responsibilities and achievements; work-history evidence remains transferable.
- Geographic preference uses the studio directory's recorded country, not a conflicting headquarters country. The Playtouch route remains associated with Mauritius rather than its separate French headquarters; Mauritius is now mapped to Africa for region/continent matching.
- Mixed work arrangements are treated as uncertain, with no automatic preference penalty.
- Default Matches sorting is campaign priority, with preferred geography first, then acceptable, unassigned/unknown and lower-priority geography. Overall personal priority and professional relevance break ties. The expanded assessment displays the geographic tier.

**Validation:** PR-head CI [run 41463495519](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41463495519) passed, including Python tests, Node unit tests, TypeScript/Vite build, directory/route validation, privacy checks, Pages-artifact checks and browser acceptance. The merged-main build [run 41464012676](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41464012676) also passed, and website publishing [run 41464012718](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41464012718) completed successfully.

**Remaining limitations:** Working language, country-specific remote eligibility, relocation and visa/work-authorisation sponsorship are not yet structured consistently enough for reliable automated prioritisation. They remain unknown until separately verified and recorded. The user's saved Candidate Profile remains browser-local; repository CI used deterministic fixtures and did not inspect the user's personal profile or documents.


## Global studio discovery source expansion — PR #100

**Merged and deployed.** PR [#100](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/100) merged on 2026-11-02 as commit `b3183f5fae5f3f3793dcefc3241f957267a56a79`. GitHub Pages deployment [run 41416182699](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182699) completed successfully. The merged-main build and browser acceptance [run 41416182698](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182698) also passed. The first post-merge hourly discovery run [41416182708](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182708) has started; its first source-health checkpoint is pending completion of that batch.

PR #100 adds IGDB as the sixth recurring candidate feed. It queries companies with developed-game credits and a dynamically resolved official company website type, stores a resumable numeric company-ID cursor, and reads the existing Twitch application credentials from repository Actions secrets. Missing credentials safely skip IGDB without counting an empty source pass.

- IGDB company data remains candidate evidence only. The public directory's strict rule is unchanged: the employer's own site or directly linked employer-controlled ATS must explicitly invite speculative/open/general applications.
- The other five feeds remain GameDevMap and four Wikidata queries. No Tavily, Companies House or other service has been introduced.
- The 20-page hourly source budget, independent five-empty-pass/four-page saturation rule, 65-second Wikidata spacing and 25-minute runtime ceiling remain. IGDB requests are separately paced at 0.27 seconds.
- The exact PR-head CI and browser acceptance passed in [run 41415897521](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41415897521).

## Candidate Profile implementation — PR #95

**Phase C1 is merged and deployed.** PR #95 merged on 2026-11-01 as commit `2475c4665febf849dd489f7b56f3487a90967577`; the GitHub Pages publish workflow completed its deployment step and reported the live site environment URL. The My profile area includes structured contact and professional records, skill evidence, master application materials, preferences, browser-local IndexedDB persistence and versioned JSON backup/restore. PDF/DOCX original bytes are preserved; text extraction is not included.

- Existing My applications data remains in its current localStorage key and is not migrated or rewritten by the profile feature.
- Candidate profile records use a separate IndexedDB database/store and are not included in public studio JSON or build-time data.
- The browser UI explains that local browser storage is not encrypted by default and can be cleared. Backups contain personal information and must be kept private.
- The complete pre-merge CI suite passed, including profile persistence, navigation retention and backup restore.

## Phase C2 — private matching foundation (merged in PR #96)

- Added a Matches page that reads the saved Candidate Profile from browser-local IndexedDB and compares it against active public studio route records on-device.
- Professional relevance, application-route status/freshness and personal priority remain separate qualitative dimensions. No combined score or hiring probability is presented.
- Strong / Potential / Weak / Needs profile details classifications explain the basis, show matched profile evidence and identify information not evidenced. Routes without a published discipline scope remain potential/unknown rather than being treated as mismatches.
- Personal region, work-model and studio-type preferences affect priority only. They never remove or change a studio in the global directory.
- Each expanded assessment shows recorded discipline scope, submission channel, work model, eligibility/location notes, directory check date and official application/evidence links.
- Active directory status is not a ready-to-submit guarantee. Applicants must still check the employer's current instructions and their own eligibility.
- Assessments are recalculated locally and are not yet persisted as queue items. Manual overrides, queue history and deeper requirements intelligence remain later phases.
- Deterministic engine tests and browser acceptance coverage are included in the feature branch; final CI results are pending PR checks.

## Current product direction — 2026-11-01

The global studio directory remains a worldwide, evidence-backed catalogue and is not filtered or ranked by the candidate's personal profile. The next product layer adds a private candidate profile, explainable matching, an Application Queue and an application preparation workspace.

- **Candidate Profile:** structured experience, education, projects/training, skills with evidence, approved master resume, master motivation letter/message and user preferences.
- **Matching:** assess professional relevance, application accessibility/readiness and personal priority separately. Show employer requirements, evidence, gaps, unknowns, source URLs and review dates. Do not claim to predict hiring probability.
- **Application Queue:** a private working set referencing canonical studio records; user selection and priority never alter the global directory.
- **Application Workspace:** studio and route details, requirements summary, skills/evidence mapping, approved materials, preparation checklist, notes and progress.
- **Privacy:** candidate data and documents remain browser-local. GitHub Pages is public static hosting, not a private backend. Prefer IndexedDB for structured private data/files, with export/import and clear disclosure that browser storage is not automatically encrypted and can be cleared.
- **Automation boundary:** browser extension, ATS/portal recognition, autofill, automated uploads, email sending and automatic submission are deferred. No application is submitted by this roadmap.

The detailed approved direction and acceptance criteria are in [Candidate Profile, Matching and Application Workspace](docs/architecture/candidate-profile-matching-application-workspace.md). This product direction supersedes older scope notes below that list personal matching, resume tools or application preparation as out of scope. The global discovery rules remain unchanged.

## Phase B — artwork and application workflow UI

- PR #78 is merged into `main`: studio rows use compact game-cover thumbnails and expanded profiles use a poster gallery. Steam remains first choice; IGDB is the fallback when verified metadata is present.
- IGDB enrichment run [41295984736](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41295984736) queried 454 unique titles: 280 exact, unambiguous matches with cover art; 43 ambiguous, 125 not found and 6 without cover remain unresolved.
- The 280 matched games were copied to 287 studio-game profile entries across 133 studios. Data-only PR [#79](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/79) merged at 2026-11-01 10:22 UTC; the cover metadata is now in `main` and was included in the succeeding Pages deployment.
- The workflow verified both IGDB Actions secrets without revealing values. Dataset validation, all 20 tests and the production build passed. The workflow token cannot create pull requests in this repository, so the successful data branch was published and PR #79 was opened through the GitHub connection.
- UI PR [#80](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/80) adds private editable tracker notes, notes search, a visible applied date, and direct studio/application links. Unit/data/build/privacy checks passed; the first browser acceptance attempt exposed a test-order issue and is being corrected. The tracker remains browser-local.
- The latest discovery retry [41295984769](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41295984769) completed successfully: 8 source pages and 8 route rechecks, no new candidates and no verified additions. Checkpoint persistence succeeded; hourly discovery continues.

## Website and public data

- The live site remains limited to Studio Directory and My applications. Phase A is closed at 327 verified routes / 327 matching profiles (322 active, 5 paused; 51 country/location labels).
- Personal tracker entries remain in the visitor's browser localStorage. No application records or CVs are committed to the public repository.
- Current main contains **327 unique studio/employer records / 327 matching profiles**, **322 active** and **5 paused** routes across **51 country/location labels**. PR #75 is merged and the Phase A closeout is complete.
- PRs #70–#74 are merged into main: #70 consolidated global route expansion, #71 implemented source-specific discovery saturation, #72 reconciled the FakeFish duplicate, #73 added seven verified routes and the manual-only source register, and #74 added CAPCOM, Cygames Group and Small Giant Games while refreshing Fawkes Games and Stunlock Studios. PR #70's 314 raw rows included two entries for the same FakeFish studio and identical official application route; ADR-078 records their consolidation into one canonical FakeFish record.
- This batch-6 branch consolidates PR #68's fifth expansion and subsequent manual global research. PR #68 is superseded; do not merge it separately.
- The proposal includes the prior batch's additions/updates: Sudden Forest, 22cans, Absolutely Games, AB Games, Favo Games, DON’T NOD Montréal and Ubisoft Saguenay; updates to Chimera Entertainment, Supermassive Games, Bossa Studios, Brave At Night and Ember Crows; plus the earlier batch-6 work.
- Four additional routes added in this continuation are **AnkleBreaker Studio**, **Alice in Games**, **No Roof Games** and **Skytale**. Their route and profile records are one-to-one.
- Skytale is a French non-profit/volunteer-run game studio with no employees; the entry is explicitly labelled as unpaid volunteering, not employment.
- The manual exclusion config now includes **Chouic** (material sexual-entertainment/intimate-couple and alcohol/party-game portfolio), **3Sigma Games** (its own Careers page explicitly labels the business an Adult Game Studio) and **Xatronic Software GmbH** (official Products page describes online casinos/slot-machine software). Reasons and sources are recorded in `config/manual-studio-exclusions.json`.
- Three further routes added in batch 8 are **Rapidfire Games** (Cyprus), **Sleeprunner Studios** (Germany) and **Cluetivity** (Germany). Cluetivity is explicitly classified as a location-based/mobile/GPS/AR game developer and platform provider, not a conventional PC/console studio.
- Three additional route/profile pairs added in batch 9 are **Tarokai** (Switzerland), **Procedural Games** (Spain) and **Thought Pennies** (country not stated). The existing **Playtouch** record was refreshed to distinguish its Mauritius production studio from French headquarters and to list the six current talent-pool tracks.
- **Fawkes Games** has been added in batch 10 as a Bulgarian developer/publisher/live-service operator after new first-party evidence confirmed game-client modernization, gameplay development/maintenance and active Unity/game-art/game-design hiring alongside its spontaneous-application invitation.
- The existing **Next Level Games** route was refreshed: hybrid Vancouver, at least three studio days per week, Canada work authorization and current British Columbia residence are now recorded.
- Additional rechecks confirmed that Raw Power Games, Futureplay Games and Shiro Games are already in the directory; they were not duplicated. Studio Countdown and welevel were not added because the official videogame-developer/official-route gates were not sufficiently established.
- Existing Redly Games and HypeHype records were refreshed to match current official pages. **Plummy Games** was moved to paused because its Teamtailor Open Application could not be linked forward from the official company site.
- The 322-record dataset (317 active, 5 paused) was deployed to GitHub Pages after PR #74 from merge commit 02645bf679f866f98e077fea73b320b1eeb2c979; [Pages publication run 41224727091](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41224727091) completed successfully. The production build also passed in [run 41224727035](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41224727035).
- The first post-merge discovery run [41212342190](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41212342190) completed successfully and persisted the v2 private discovery-state checkpoint. The follow-up run [41212913766](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41212913766) also completed successfully: all discovery, offline-test, frontend-test, build, merge, checkpoint, Pages-artifact, deployment and summary steps passed. It added zero routes; the merged dataset remained at 313 and the private checkpoint advanced to bc3a302e4f7da0095c2c5c3be407ec6a56f12699 on discovery-state.


## Global discovery batch 13 — merged in PR #73

- PR #73 added seven verified route/profile pairs: Tanglewood Games, Iceflake Studios, Frozenbyte, Mainstay Games, Big Moxi Games, Rogue Snail and Cyberborz Interactive. It also refreshed existing Awe Interactive information. The merged `main` snapshot contains 319 route/profile pairs (314 active, 5 paused; 51 labels).
- The pre-PR #73 main snapshot included a duplicate ByteRockers identity: ByteRockers' Games and Byterockers’ Games shared one official website and exact application/evidence URL. PR #73 retained one canonical ByteRockers' Games profile and consolidated its provenance.
- New employer routes are not inferred from indexes. Tanglewood's two applications are UK-only remote; Iceflake's programmer route expects Tampere office attendance; Frozenbyte prefers Helsinki relocation but allows hybrid/remote for the right fit; Mainstay asks for country of residence but publishes no eligibility list; Big Moxi's remote hiring is role-dependent; Rogue Snail is fully remote without a country list; Cyberborz does not state a country/city.
- Awe Interactive's profile refresh removes the previous unsupported 120+ headcount; its press kit lists five named team members but does not state total workforce.
- The separate manual source registry adds regional lead directories for the UK, Sweden, Japan, South Korea, Brazil, France, Australia, Finland and Africa. It is intentionally disconnected from runtime ingestion.
- IGDB remains blocked pending written permission from Twitch for public redistribution; Steam remains manual-only; GameCompanies, Games Jobs Index, MobyGames and the community database remain gated by their respective access/licence reviews.


## Global discovery batch 14 — merged in PR #74

- PR #74 added three verified route/profile pairs: **CAPCOM** (Japan), **Cygames Group** (Japan) and **Small Giant Games** (Finland). Each has an employer-owned non-vacancy application route and matching researched profile.
- CAPCOM's Japanese mid-career page offers Career Registration for candidates who do not wish to select a job type or cannot find a suitable position. The official CTA opens an external Alumy registration portal. The register is not a vacancy or a guaranteed interview; overseas eligibility is not stated.
- Cygames Group's HRMOS Career Registration accepts candidates without a specific vacancy and may suggest matching group roles. The listing says it does not guarantee employment and retains registration data for two years; overseas eligibility and remote work are not stated.
- Small Giant Games' Greenhouse Open Application explicitly accepts speculative applications with a CV and covering letter. Its current careers page describes hybrid work with team-specific office days; overseas employment eligibility is not stated.
- Existing **Fawkes Games** evidence is refreshed: the official Careers page invites spontaneous applications by email and says work can be remote worldwide, while listed freelance roles prefer Europe-friendly time zones. Its linked ATS currently exposes a Senior Unreal Engineer contractor listing; the role list and ATS board are not fully aligned, so applicants must check the specific opening.
- Existing **Stunlock Studios** is corrected to its employer-managed Teamtailor Open Application. It requires an online submission (not email), is listed in Skövde as “Temporarily Remote”, and does not state worldwide remote eligibility.
- The manual-only registry grows from 17 to **22 sources** with five additional Poland, Germany and India leads: BAZA POLSKI GAMEDEV, game (German Games Industry Association), GDAI's teams/network page, IGDA India and USK member companies. These remain manual leads, not proof of developer status or speculative application acceptance.
- `config/discovery-sources.json` is unchanged. No new adapter, scrape, schedule, secret, permission or automated source has been enabled.
- Main totals after PR #74: **322 routes / 322 matching profiles**, **317 active**, **5 paused**, across **51 country/location labels**. PR #74 exact-head CI [run 41224097341](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41224097341) passed the complete build, data, privacy and browser-acceptance suite.

## Phase A — initial global discovery closeout proposal

- Branch: research/final-global-discovery-closeout-20261031. It adds five employer-verified route/profile pairs: **Laki Studios** (Poland), **Makemake Creative Studio** (Türkiye), **PixelAnt Games** (Poland), **Played With Fire** (Poland) and **Rebel Wolves** (Poland).
- The final sweep also rechecked **Codebox Games** (Nigeria) and **G7 Studio** (Saudi Arabia); both were already present and were not duplicated. Kuuasema, GOALS, Futureplay Games, Katal Games, Playa Games, CipSoft, Havoc Games, Old Skull Games and Sencorp Games were also already represented.
- The proposal contains **327 route/profile pairs**, **322 active**, **5 paused**, across **51 country/location labels**. The route/profile one-to-one invariant is preserved.
- The manual-only candidate-source register remains at **22**. No new runtime feed, scraper, credential, secret, permission or schedule was added. IGDB, Steam, GameCompanies, Games Jobs Index, MobyGames and the community dataset retain their documented access/licence gates.
- **Phase A exit decision:** after this final batch is merged and deployed, initial global discovery is considered complete as a documented baseline, not as an exhaustive census of every game studio worldwide. The existing hourly workflow remains an ongoing maintenance process; new studios and route changes no longer keep global discovery as the primary development focus.
- Manual-review and source-coverage limitations remain documented. They do not block Phase B UI/UX work; uncertain candidates remain private/manual-review items and must not be forced into the public directory.

## Discovery pipeline checkpoint

- Currently integrated candidate feeds: GameDevMap public paginated results and three Wikidata feeds (video-game developer entities, credited developer organisations and video-game company entities).
- The pre-migration checkpoint was [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366). The first successful post-merge run 41212342190 saved the additive schema-v2 migration and per-feed state; future summaries should be used for the live per-source counters.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. These are automated candidate-pipeline counters, not the manually researched/current public directory totals.
- Later scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints.
- Temporary failures, blocked access, robots denials and incomplete parsing do not count as confirmed no-route evidence and do not close existing routes.
- Per-feed saturation is now implemented via `config/discovery-sources.json`: the three Wikidata feeds own independent cursors/cycles and only a source with three complete empty passes is throttled. GameDevMap remains a one-time backfill. Failed/incomplete passes do not count as exhaustion.
- The additional discovery indexes documented below are not yet integrated adapters; manual research does not mean automated ingestion.

## Additional candidate sources identified — not yet integrated

- [IGDB API](https://api-docs.igdb.com/) — structured company and game-credit source; requires Twitch app credentials and current access/attribution review.
- [GameCompanies.com](https://gamecompanies.com/) — global index of studios, publishers, hubs and service companies; terms restrict automated use without permission.
- [Games Jobs Index](https://gamesjobsindex.com/studios.html) — manual lead source with a visible “Speculative only” filter. Its page showed 2,573 studios in the header but 2,415 in the regional roll-up on 2026-10-31; reconcile before using aggregate figures. Its labels are never employer evidence, and automated access remains unapproved.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large creator index containing developers, publishers and other entities; not a unique-studio count.
- [MobyGames API](https://www.mobygames.com/info/api/) — possible game-credit source; do not scrape pages or automate until access and terms are verified.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary manual cross-check only until a reusable licence is found.
- Regional/national game-industry associations, government registries, funding recipients, game clusters and official game-credit sources. The dated manual lead register is maintained separately in config/manual-discovery-sources.json; it is not an automated feed.

## Candidate-review decisions

- **Chouic — excluded:** company-level mobile portfolio includes Sex Game For Couple – PleaseMe, intimate couple games and an alcohol/party title. The manual exclusion and evidence are recorded in the config.
- **Duhndal — manual review, not published:** real Danish game developer with an unsolicited-application section and Denmark-only hiring policy, but its three-game portfolio includes Drug Lord Tycoon. Review whether the drug-focused title changes the company-level policy disposition before inclusion.
- **Manc Games — manual review, not published:** legitimate Istanbul mobile developer; its separate Rummikub Social microsite advertises a general application, but the main employer Careers page did not link to that route. Confirm the employer-controlled route relationship.
- **Fawkes Games — resolved and included in batch 10:** its official Terms identify a Bulgarian company; its Careers page invites spontaneous applications and advertises Unity/game-art/game-design roles; official materials document game-client modernization, gameplay overhauls and content development. It is classified as a developer/publisher/live-service operator, not an original-IP-only studio.
- **AMIGO Spiele — out of scope:** official source describes board/card game development and distribution, not video-game development.
- **Xatronic Software GmbH — excluded:** its official Products page says it develops online casinos and slot/reel games for customers. The company is listed in manual exclusions.
- **3Sigma Games — excluded:** its own hiring page explicitly identifies it as an Adult Game Studio. It is in the manual exclusion config, not the public directory.
- Several new research results were already represented in the directory and were not duplicated, including Reply Game Studios, Ocellus, Old Skull Games, VestGames, Yabu Games, Funday Games, Octocube Games, Abyssal Interactive, Aethra Studios, Katal Games, Sencorp Games and Studios DRAMA.
- Older review outcomes remain in ADR-071 and the model: 3MenStudio, 2Awesome Studio, Abstraction Games, Abylight, Primal Game Studio, PRELOADED, 24 Bit Games, Techtive Games GmbH, Duhndal, Manc Games and other held candidates.

## Next engineering and research work

1. **Phase A closeout:** complete review and merge of the final 327-record proposal; verify exact-head CI, merge commit and Pages deployment.
2. **Ongoing discovery maintenance:** keep the existing hourly workflow running; review per-source summaries and route rechecks. New routes are routine maintenance, not a reason to keep initial global discovery open.
3. **Manual-review backlog:** resolve candidates when new first-party evidence becomes available. Keep uncertain identity, adult/vice, route-link and applicant-eligibility cases out of the public dataset until resolved.
4. **Source policy:** keep the 22-entry manual registry separate from automated runtime ingestion. Do not integrate IGDB, Steam, GameCompanies, Games Jobs Index, MobyGames or the community dataset without their documented access/licence review and a tested adapter.
5. **Phase B:** after the closeout PR is merged and deployed, shift primary engineering effort to UI/UX and the existing Directory and My applications workflows.
Manual real-site acceptance and stabilization remain separate release work; see [issue #11](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/11).

- The daily **Monitor Studio Sources** automation is enabled in Europe/Budapest time. It checks source-level candidate yield and workflow health, and reports new exhaustion, persistent blocks or recoveries without changing the hourly GitHub Actions schedule.
