# Game Industry Outreach Tracker status

**Last verified:** 2026-10-31  
**Product scope:** Global directory of legitimate video-game development organisations with verified speculative-application routes, plus a personal browser-local application tracker.  
**Authoritative discovery rules:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

## Current direction

The discovery mission is global coverage and accuracy. Do not prioritize by the user's career interests, role discipline, geography, work model, studio size, prestige, platform or likelihood of hiring the user. Indie through AAA are in scope. There is no arbitrary maximum directory size.

Every public record must pass both gates:
1. The organisation materially develops video games or performs direct game-development work.
2. It explicitly invites speculative, unsolicited, spontaneous, open or general applications beyond a specific advertised vacancy, with official evidence and a usable application route.

Exclude organisations materially focused on pornography/adult sexual entertainment, iGaming/gambling/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Do not reject mainstream developers based on an isolated keyword or the mature themes of an individual game. Uncertain cases require manual review.

## Website and public data

- The live site remains limited to Studio Directory and My applications.
- Personal tracker entries remain in the visitor's browser localStorage. No application records or CVs are committed to the public repository.
- Current main contains **287 studio/employer records**, **287 matching profiles**, **284 active** and **3 paused** routes across **48 country/location labels**. The in-progress batch-6 proposal branch contains **293 records / 293 profiles**, with **289 active** and **4 paused** routes across 49 country/location labels; it is not merged or deployed.
- PR #65 is merged: six additional employers and updates to Bananagun, Larian Studios and Garena.
- PR #66 is merged: Kokku, Raini Studios and Side, plus a refreshed Havoc Games route.
- PR #67 is merged: precision updates to Aska Studios, Obsidian Entertainment, SOFTGAMES, Lost Boys Interactive and Rustling Leaves Games.
- PR #68 is still open but cannot be merged cleanly after the global-model documentation merge; its validated data changes have been consolidated into the batch-6 branch. Do not count them in main until the replacement PR is merged and deployed.
- The batch-6 proposal includes PR #68's fifth expansion (Sudden Forest, Chimera Entertainment and Supermassive Games), adds 22cans, Absolutely Games, AB Games, Favo Games, DON’T NOD and Ubisoft Saguenay, and refreshes Bossa Studios, Brave At Night and Ember Crows. Techtive Games GmbH is paused pending official route linkage; Fawkes Games was removed because official evidence supports publisher/live-operations classification, not in-house game development.

## Discovery pipeline checkpoint

- Currently integrated candidate feeds: GameDevMap public paginated results and three Wikidata feeds (video-game developer entities, credited developer organisations and video-game company entities).
- The latest known successful saved discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed on 2026-10-31 after processing seven source pages and adding 304 candidates.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. These are candidate-pipeline counters, not the same as the manually researched/current published directory records.
- Later scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints.
- Temporary failures, blocked access, robots denials and incomplete parsing do not count as confirmed no-route evidence and do not close existing routes.

## Additional candidate sources identified — not yet integrated

- [IGDB API](https://api-docs.igdb.com/) — structured company and game-credit source; requires Twitch app credentials and current access/attribution review. Not integrated.
- [GameCompanies.com](https://gamecompanies.com/) — global index of studios, publishers, hubs and service companies; terms restrict automated use without permission.
- [Games Jobs Index](https://gamesjobsindex.com/studios.html) — manual lead source with a visible “Speculative only” filter. Its page showed 2,573 studios in the header but 2,415 in the regional roll-up on 2026-10-31; reconcile before using aggregate figures. Its labels are never employer evidence.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large creator index containing developers, publishers and other entities; not a unique-studio count.
- [MobyGames API](https://www.mobygames.com/info/api/) — possible game-credit source; do not scrape pages or automate until access and terms are verified.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary manual cross-check only until a reusable licence is found.
- Regional/national game-industry associations, government registries, funding recipients, game clusters and official game-credit sources.

## Candidate-review decisions

- 3MenStudio is held for manual review: it accepts non-vacancy enquiries but also advertises casino-game development as a service; assess its material business against the gambling exclusion.
- 2Awesome Studio's reviewed page is a vacancy with an encouragement to apply despite not meeting every requirement, not a speculative application.
- Abstraction Games' Breezy open-application page has not been linked to from its official careers page; hold until the employer-route relationship is established.
- Abylight says it archives profiles for future selection, but no usable general application channel was identified.
- Primal Game Studio links a speculative JazzHR route, but the ATS destination returned HTTP 403; retry before publication.
- PRELOADED's inspected page provided a general enquiry form, not an explicit speculative application.
- 24 Bit Games is a legitimate development-services studio, but no speculative route was found.
- Techtive Games GmbH's JOIN spontaneous application is paused because the current official company domain redirects to ARDEM and does not link to the JOIN route; the employer-controlled route relationship needs direct confirmation.
- Fawkes Games was removed from the directory after its official About material described a publisher/operator and live-operations business without establishing an in-house development studio.
- DON’T NOD Montréal is recorded as a candidate-bank route, not an active vacancy; its employer posting expressly disclaims a current or future recruitment need and states the remote scope as Québec.
- Ubisoft Saguenay's official French careers page requests CVs and portfolios by email when a desired position is not advertised.
- Favo Games' official form includes an explicit Open application choice; the studio says it works remotely from anywhere, while country-specific legal arrangements remain unspecified.

## Next engineering and research work

1. Add a source manifest/coverage ledger and make saturation source-specific, not global.
2. Evaluate IGDB and other candidate sources against access terms, coverage, provenance and attribution. Keep Games Jobs Index as a manual lead source until automated access is authorized.
3. Continue global candidate discovery, identity resolution and company-level exclusion review.
4. Keep route verification tied to official employer evidence; preserve precise work-location, applicant eligibility, work model and compensation caveats.
5. Record every material source, route and exclusion finding in the Global Discovery Implementation Model and this status/handover trail.

Manual real-site acceptance and stabilization remain separate release work; see [issue #11](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/11).
