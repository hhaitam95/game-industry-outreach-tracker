# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Global directory of legitimate video-game development organisations with verified speculative-application routes, plus a personal browser-local application tracker.  
**Authoritative discovery rules:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

## Current direction

The discovery mission is global coverage and accuracy. Do not prioritize by the user's career interests, role discipline, geography, work model, studio size, prestige, platform or likelihood of hiring the user. Indie through AAA are in scope. There is no arbitrary maximum directory size.

Every public record must pass both gates:
1. The organisation materially develops video games or performs direct game-development work.
2. It explicitly invites speculative, unsolicited, spontaneous, open or general applications beyond a specific advertised vacancy, with official evidence and a usable application route.

Paid employment is not required for inclusion, but volunteer-only and unpaid participation must be explicitly labelled and must never be represented as a job.

Exclude organisations materially focused on pornography/adult sexual entertainment, iGaming/gambling/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Do not reject mainstream developers based on an isolated keyword or one mature-themed game; uncertain cases require manual review.

## Website and public data

- The live site remains limited to Studio Directory and My applications.
- Personal tracker entries remain in the visitor's browser localStorage. No application records or CVs are committed to the public repository.
- Current main contains **322 unique studio/employer records**, **322 matching profiles**, **317 active** and **5 paused** routes across **51 country/location labels**. The final Phase A closeout proposal contains **327 matching route/profile records** (322 active, 5 paused; 51 labels).
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
