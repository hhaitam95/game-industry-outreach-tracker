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
- Current main contains **288 studio/employer records**, **288 matching profiles**, **285 active** and **3 paused** routes across **48 country/location labels**.
- PR #65 is merged: six additional employers and updates to Bananagun, Larian Studios and Garena.
- PR #66 is merged: Kokku, Raini Studios and Side, plus a refreshed Havoc Games route.
- PR #67 is merged: precision updates to Aska Studios, Obsidian Entertainment, SOFTGAMES, Lost Boys Interactive and Rustling Leaves Games.
- PR #68 is merged: adds Sudden Forest and refreshes Chimera Entertainment and Supermassive Games. The resulting directory contains 288 routes / 288 matching profiles, 285 active and 3 paused.

## Discovery pipeline checkpoint

- Currently integrated candidate feeds: GameDevMap public paginated results and three Wikidata feeds (video-game developer entities, credited developer organisations and video-game company entities).
- The latest known successful saved discovery checkpoint is [run 41191375366](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41191375366), completed on 2026-10-31 after processing seven source pages and adding 304 candidates.
- At that checkpoint, the pipeline had seen **10,370 candidates**, cumulatively verified **126 routes**, recorded **56 suitability exclusions**, **7,883 no-route outcomes** and **79 manual-review cases**. These are candidate-pipeline counters, not the same as the 288 manually researched/current published directory records.
- Later scheduled runs [41200057779](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200057779) and [41200817331](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41200817331) stopped safely on upstream Wikidata request timeouts. They did not advance or publish partial source checkpoints.
- Temporary failures, blocked access, robots denials and incomplete parsing do not count as confirmed no-route evidence and do not close existing routes.

## Additional candidate sources identified — not yet integrated

The following are leads for source evaluation and potential adapters, not proof of eligibility or acceptance:

- [IGDB API](https://api-docs.igdb.com/) — promising structured company/game-credit source. Requires Twitch application credentials; evaluate the Company endpoint, developer links, rate limits, current agreement and attribution rules before integration. No adapter or credentials are currently configured.
- [GameCompanies.com](https://gamecompanies.com/) — its public site describes 4,300+ studios, publishers, hubs, organisations and service companies across 195 countries. Its Terms restrict use to the provided interface unless written permission is obtained; do not automate harvesting without permission.
- [Games Jobs Index studio directory](https://gamesjobsindex.com/studios.html) — supplementary studio directory with a visible “Speculative only” filter. It displayed 2,573 studios while its regional roll-up displayed 2,415; reconcile the discrepancy before citing aggregate counts. Use as a manual lead generator only until automated access/terms are established. Its labels are not employer evidence.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large creator directory mixing developers, publishers and other entities; not a unique-studio count. Review terms and access policy before automated use.
- [MobyGames API documentation](https://www.mobygames.com/info/api/) — potential game-credit/company discovery source. API-key and terms review required; do not scrape site pages or automate outside authorized API usage. [Terms](https://www.mobygames.com/info/terms/).
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary seed/cross-check only; no licence was located at the repository root during review. Do not import/reuse its data until a reuse licence and provenance are confirmed.
- Regional/national industry associations, game clusters, government registries and funding recipient lists, event/exhibitor directories and other official developer-credit sources.

## Recent candidate-review decisions

- **3MenStudio** — held out for manual industry review. Its official Careers page invites applications when no role fits, but its Game Development Services page also offers casino-game development. Do not publish until the business-level gambling exclusion assessment is resolved.
- **2Awesome Studio** — not a speculative route: the inspected posting asks candidates to apply even if they do not meet every requirement for that specific advertised role.
- **Abstraction Games** — the employer-branded Breezy page says it accepts open applications, but the current official Careers page did not establish a direct link to that ATS route. Keep out pending employer-route linkage.
- **Abylight** — official Careers page says submitted profiles are reviewed for future selection, but the page did not expose a directly usable general submission method. Keep in manual review.
- **Primal Game Studio** — official Careers page links a speculative JazzHR application, but the linked destination returned HTTP 403 during review. Retry later; do not publish a guessed or inaccessible route.
- **PRELOADED** — the inspected official Studio page exposes a general enquiry form, not a clearly labelled speculative application route. A search snippet alone is insufficient.
- **24 Bit Games** — confirmed legitimate game-development services provider, but no explicit speculative application route was established; do not include on that basis alone.

## Next engineering and research work

1. Preserve the global discovery model and update it with every material new source, route-verification, exclusion or access-policy finding.
2. Add a machine-readable source manifest/coverage ledger and make source saturation source-specific, not global.
3. Evaluate and, where permitted, integrate additional indexes such as IGDB. Keep Games Jobs Index and other non-API directories as manual research inputs unless their access terms are verified.
4. Continue company-level exclusion review and protect mainstream developers from keyword false positives.
5. Continue official-route verification and add only records that pass both gates with accurate work-location, eligibility and compensation caveats.

Manual real-site acceptance and stabilization remain separate release work; see [issue #11](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/11).
