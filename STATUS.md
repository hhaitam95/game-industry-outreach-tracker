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
- Current main contains **287 studio/employer records**, **287 matching profiles**, **284 active** and **3 paused** routes across **48 country/location labels**.
- PR #65 is merged: six additional employers and updates to Bananagun, Larian Studios and Garena.
- PR #66 is merged: Kokku, Raini Studios and Side, plus a refreshed Havoc Games route.
- PR #67 is merged: precision updates to Aska Studios, Obsidian Entertainment, SOFTGAMES, Lost Boys Interactive and Rustling Leaves Games.
- PR #68 is open: proposes **288 records / 288 profiles**, with **285 active** and **3 paused** routes. It adds Sudden Forest and refreshes Chimera Entertainment and Supermassive Games.
- PR #68's exact-head GitHub Actions run [41202230500](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41202230500) completed successfully, including discovery tests, frontend tests, directory validation, route review, production build, privacy checks, Pages artifact check and browser acceptance.
- PR #68's branch has diverged from main (one commit ahead and one behind at last inspection). Synchronize it with current main and rerun exact-head CI before merge. Do not count its proposed studio in main until merged and deployed.

## Discovery pipeline checkpoint

- Currently integrated candidate feeds: GameDevMap public paginated results and three Wikidata feeds (video-game developer entities, credited developer organisations and video-game company entities).
- The latest known successful saved discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed on 2026-10-31 after processing seven source pages and adding 304 candidates.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. These are candidate-pipeline counters, not the same as the 287 manually researched/current published directory records.
- Later scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints.
- Temporary failures, blocked access, robots denials and incomplete parsing do not count as confirmed no-route evidence and do not close existing routes.

## Additional candidate sources identified — not yet integrated

The following are leads for source evaluation and potential adapters, not proof of eligibility or acceptance:

- [GameCompanies.com](https://gamecompanies.com/) — its public site describes 4,300+ studios, publishers, hubs, organisations and service companies across 195 countries.
- [Games Jobs Index studio directory](https://gamesjobsindex.com/studios.html) — supplementary studio directory and cross-check; job listings do not prove speculative application acceptance.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large paginated creator directory mixing developers, publishers and other entities; not a unique-studio count.
- [MobyGames API documentation](https://www.mobygames.com/info/api/) — potential game-credit/company discovery source. API-key and terms review required; do not scrape site pages or automate outside authorized API usage. [Terms](https://www.mobygames.com/info/terms/).
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary seed/cross-check only; verify licence, provenance, update cadence and coverage before reuse.
- Regional/national industry associations, game clusters, government registries and funding recipient lists, event/exhibitor directories and other official developer-credit sources.

Consult the Global Discovery Implementation Model for observed source details and the source-evaluation checklist. None of the supplementary sources above should be described as integrated until its adapter and tests are in the repository.

## Known implementation gaps / next engineering work

1. Synchronize, revalidate and merge PR #68; then confirm the deployed public dataset.
2. Audit current discovery source adapters, source cursors and saturation logic against the global model.
3. Introduce a source manifest/coverage ledger recording provenance, terms/access restrictions, coverage, harvest checkpoints, failures and source-specific completion.
4. Make saturation source-specific. A completed source pass must not stop global discovery; adding or expanding a source must reopen work. Failed or incomplete passes cannot count as exhaustion.
5. Evaluate and, where access permits, integrate the additional sources without violating terms, API limits or robots policies.
6. Strengthen company-level industry classification and exclusions. Existing script patterns are an initial heuristic, not a complete exclusion classifier; keyword-only false positives must be avoided.
7. Improve identity resolution for subsidiaries, same-name studios, publisher-only entities and co-development/service providers.
8. Continue verifying official speculative routes with evidence and precise eligibility caveats. Keep unclear records in manual review.

## Release / acceptance

Keep the current two-page product scope. Do not reintroduce job monitoring, resume editing, outreach generation, analytics, accounts, remote tracker sync or automatic applications. Manual real-site acceptance and stabilization remain separate release work; see [issue #11](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/11).

New research and implementation findings must be recorded in the Global Discovery Implementation Model and reflected in HANDOFF.md / STATUS.md so another chat or contributor can continue without relying on conversation history.
