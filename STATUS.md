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
- Current main contains **287 studio/employer records**, **287 matching profiles**, **284 active** and **3 paused** routes across **48 country/location labels**.
- The open PR #70 proposal branch currently contains **308 route records / 308 matching profiles**, with **304 active** and **4 paused** routes across **51 country/location labels**. These are proposed data, not yet merged into main or deployed.
- This batch-6 branch consolidates PR #68's fifth expansion and subsequent manual global research. PR #68 is superseded; do not merge it separately.
- The proposal includes the prior batch's additions/updates: Sudden Forest, 22cans, Absolutely Games, AB Games, Favo Games, DON’T NOD Montréal and Ubisoft Saguenay; updates to Chimera Entertainment, Supermassive Games, Bossa Studios, Brave At Night and Ember Crows; plus the earlier batch-6 work.
- Four additional routes added in this continuation are **AnkleBreaker Studio**, **Alice in Games**, **No Roof Games** and **Skytale**. Their route and profile records are one-to-one.
- Skytale is a French non-profit/volunteer-run game studio with no employees; the entry is explicitly labelled as unpaid volunteering, not employment.
- The manual exclusion config now includes **Chouic** (material sexual-entertainment/intimate-couple and alcohol/party-game portfolio) and **3Sigma Games** (its own Careers page explicitly labels the business an Adult Game Studio). Reasons and sources are recorded in `config/manual-studio-exclusions.json`.
- Three further routes added in batch 8 are **Rapidfire Games** (Cyprus), **Sleeprunner Studios** (Germany) and **Cluetivity** (Germany). Cluetivity is explicitly classified as a location-based/mobile/GPS/AR game developer and platform provider, not a conventional PC/console studio.
- Three additional route/profile pairs added in batch 9 are **Tarokai** (Switzerland), **Procedural Games** (Spain) and **Thought Pennies** (country not stated). The existing **Playtouch** record was refreshed to distinguish its Mauritius production studio from French headquarters and to list the six current talent-pool tracks.
- **Fawkes Games** has been added in batch 10 as a Bulgarian developer/publisher/live-service operator after new first-party evidence confirmed game-client modernization, gameplay development/maintenance and active Unity/game-art/game-design hiring alongside its spontaneous-application invitation.
- The existing **Next Level Games** route was refreshed: hybrid Vancouver, at least three studio days per week, Canada work authorization and current British Columbia residence are now recorded.
- Additional rechecks confirmed that Raw Power Games, Futureplay Games and Shiro Games are already in the directory; they were not duplicated. Studio Countdown and welevel were not added because the official videogame-developer/official-route gates were not sufficiently established.
- Do not count any proposed route in main until PR #70 is reviewed, merged and deployed.

## Discovery pipeline checkpoint

- Currently integrated candidate feeds: GameDevMap public paginated results and three Wikidata feeds (video-game developer entities, credited developer organisations and video-game company entities).
- The latest known successful saved discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed on 2026-10-31 after processing seven source pages and adding 304 candidates.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. These are automated candidate-pipeline counters, not the manually researched/current public directory totals.
- Later scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints.
- Temporary failures, blocked access, robots denials and incomplete parsing do not count as confirmed no-route evidence and do not close existing routes.
- The additional discovery indexes documented below are not yet integrated adapters; manual research does not mean automated ingestion.

## Additional candidate sources identified — not yet integrated

- [IGDB API](https://api-docs.igdb.com/) — structured company and game-credit source; requires Twitch app credentials and current access/attribution review.
- [GameCompanies.com](https://gamecompanies.com/) — global index of studios, publishers, hubs and service companies; terms restrict automated use without permission.
- [Games Jobs Index](https://gamesjobsindex.com/studios.html) — manual lead source with a visible “Speculative only” filter. Its page showed 2,573 studios in the header but 2,415 in the regional roll-up on 2026-10-31; reconcile before using aggregate figures. Its labels are never employer evidence, and automated access remains unapproved.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large creator index containing developers, publishers and other entities; not a unique-studio count.
- [MobyGames API](https://www.mobygames.com/info/api/) — possible game-credit source; do not scrape pages or automate until access and terms are verified.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary manual cross-check only until a reusable licence is found.
- Regional/national game-industry associations, government registries, funding recipients, game clusters and official game-credit sources.

## Candidate-review decisions

- **Chouic — excluded:** company-level mobile portfolio includes Sex Game For Couple – PleaseMe, intimate couple games and an alcohol/party title. The manual exclusion and evidence are recorded in the config.
- **Duhndal — manual review, not published:** real Danish game developer with an unsolicited-application section and Denmark-only hiring policy, but its three-game portfolio includes Drug Lord Tycoon. Review whether the drug-focused title changes the company-level policy disposition before inclusion.
- **Manc Games — manual review, not published:** legitimate Istanbul mobile developer; its separate Rummikub Social microsite advertises a general application, but the main employer Careers page did not link to that route. Confirm the employer-controlled route relationship.
- **Fawkes Games — resolved and included in batch 10:** its official Terms identify a Bulgarian company; its Careers page invites spontaneous applications and advertises Unity/game-art/game-design roles; official materials document game-client modernization, gameplay overhauls and content development. It is classified as a developer/publisher/live-service operator, not an original-IP-only studio.
- **AMIGO Spiele — out of scope:** official source describes board/card game development and distribution, not video-game development.
- **3Sigma Games — excluded:** its own hiring page explicitly identifies it as an Adult Game Studio. It is in the manual exclusion config, not the public directory.
- Several new research results were already represented in the directory and were not duplicated, including Reply Game Studios, Ocellus, Old Skull Games, VestGames, Yabu Games, Funday Games, Octocube Games, Abyssal Interactive, Aethra Studios, Katal Games, Sencorp Games and Studios DRAMA.
- Older review outcomes remain in ADR-071 and the model: 3MenStudio, 2Awesome Studio, Abstraction Games, Abylight, Primal Game Studio, PRELOADED, 24 Bit Games, Techtive Games GmbH, Duhndal, Manc Games and other held candidates.

## Next engineering and research work

1. Synchronize the proposal branch with current main if it diverges, rerun the full validation suite on the exact PR head, and review PR #70. Do not merge without user approval.
2. Continue global candidate discovery from additional regional and international indexes; do not prioritize by country, studio size, genre, discipline or personal career fit. Resolve DreamCentury's paid-credits/prize model and retry President Studio's official TSP application link before adding either.
3. Add a source manifest/coverage ledger and make saturation source-specific, not global.
4. Evaluate IGDB and other candidate sources against access terms, coverage, provenance and attribution. Keep Games Jobs Index as a manual lead source until automated access is authorized.
5. Continue identity resolution, company-level industry exclusions and official speculative-route verification.
6. Record every material source, route, exclusion and manual-review finding in the Global Discovery Implementation Model, ADRs, CHANGELOG and STATUS.

Manual real-site acceptance and stabilization remain separate release work; see [issue #11](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/11).
