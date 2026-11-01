# Game Industry Outreach Tracker

Game Industry Outreach Tracker is a worldwide directory of legitimate video-game development organisations that explicitly accept speculative applications, paired with a personal application tracker.

The website intentionally has two pages: the studio directory and My applications. Saved studios move into a browser-local tracker with application statuses, submission dates and private notes; no personal application data is sent to a server.

**Discovery rules and handover source of truth:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md). Read it before changing discovery sources, qualification, exclusions, application verification or coverage cadence.

## Studio directory

Search studios by name, country and studio type; filter by country and work model; open the official studio website or application route; and save studios to the tracker.

### Game cover artwork

The directory resolves game artwork in this order: verified Steam portrait art, verified IGDB cover art, a curated official-studio image, then a Steam landscape header. The gallery preserves each source's portrait, square or landscape layout. Cover metadata is stored in `src/data/studio-profiles.json`; the deployed site loads static image URLs and never sends Twitch credentials or makes IGDB API requests from a visitor's browser. Game cards link directly to a verified Steam app page, an official game page or an IGDB page. When no direct destination is verified, the card is deliberately not a link rather than sending visitors to a generic Steam search.

To enrich missing cover metadata, create a Twitch developer application and set `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in your local environment. Then run:

```sh
node scripts/enrich-igdb-covers.mjs
node scripts/enrich-igdb-covers.mjs --write
npm run check:studio-directory
npm test
npm run build
```

The first command is a dry run. The write mode stores only a single exact normalized-title match with a cover image ID. Ambiguous titles, missing records and games without cover art remain unresolved for manual review. Duplicate game titles share one verified match. Never commit the Twitch client secret or an access token.

To discover missing Steam destinations and Steam-hosted cover artwork, run:

```sh
node scripts/enrich-steam-games.mjs
node scripts/enrich-steam-games.mjs --write
npm run check:studio-directory
npm test
npm run build
```

The Steam enrichment uses the public Store search and app-details responses. It adds an app ID only when the result has one exact normalized game-title match and the app-details record confirms the matching studio as a developer. Ambiguous titles, non-game products, title variants and developer mismatches are left unchanged. The `Enrich missing Steam game links and artwork` workflow can be run manually from GitHub Actions; after merging the workflow, profile-data changes also trigger a run that opens a separate data-only pull request.

When the enrichment implementation is merged into `main`, GitHub Actions automatically checks that both repository secrets are available (without printing their values), queries all remaining unique game titles, writes only exact unambiguous matches with covers, validates the resulting data, runs the tests and build, and opens a separate pull request containing only the profile-data changes. No manual workflow dispatch is required. The generated data pull request is not auto-merged; ambiguous, missing and coverless matches remain untouched. Merging that data-only pull request does not trigger another enrichment run.

IGDB API access uses Twitch application credentials and does not support browser API requests because doing so would expose the access token. The API is documented as free for non-commercial use under the Twitch Developer Service Agreement; commercial integrations require a partnership. The UI includes a visible IGDB attribution link. Review the [IGDB API documentation](https://api-docs.igdb.com/) and the current Twitch Developer Services Agreement before changing the usage model.

An organisation appears in the public directory only when both conditions are met:

1. It is a legitimate video-game developer or performs direct game-development work.
2. Its official website or a directly linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications beyond a specific advertised vacancy.

A normal careers page, an advertised vacancy, a generic contact form or a third-party directory claim is not enough. Headquarters do not establish hiring location or remote eligibility.

## Global discovery

The goal is broad, continuing global coverage of legitimate game-development studios, from indie to AAA. Do not prioritize employers by geography, size, platform, discipline, work model or the user's current career interests. There is no arbitrary maximum number of directory entries.

Candidate sources are leads only; every company and application route is verified independently against official evidence.

### Currently integrated candidate feeds

- GameDevMap public paginated worldwide directory. The existing adapter reads its public results interface; rows can represent multiple offices or non-studio organisations, so classification and deduplication are required.
- Wikidata feeds for video-game developers, organisations credited as video-game developers, and video-game companies.

### Additional candidate sources under evaluation

These are not yet integrated discovery adapters. Their terms, access method, coverage and reuse conditions must be reviewed before automation.

- [IGDB API](https://api-docs.igdb.com/) — structured company and game-credit source. The Company endpoint exposes developer/publisher relationships and official websites; Twitch app credentials and current API/attribution terms must be reviewed before integration. No adapter or credentials are configured yet. This remains unintegrated for studio discovery; the separate artwork lookup above uses IGDB only for game-cover metadata.
- [GameCompanies.com](https://gamecompanies.com/) — global directory of studios, publishers, hubs, organisations and service companies; its Terms restrict automated use beyond the provided interface without written permission, so use as a manual source unless permission is obtained.
- [Games Jobs Index studio directory](https://gamesjobsindex.com/studios.html) — manual lead source with a visible “Speculative only” filter. The header showed 2,573 studios while the regional roll-up showed 2,415 on 2026-10-31; the count is unreconciled. Filter labels are not employer evidence, and automated access permission was not established.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large paginated creator directory; includes publishers and entities beyond unique development studios.
- [MobyGames API](https://www.mobygames.com/info/api/) — potential game-credit/company discovery source. Requires authorized API access; do not scrape MobyGames pages or bypass its current API/terms restrictions. Review [MobyGames terms](https://www.mobygames.com/info/terms/) before integration.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary seed and cross-check only; review licence, provenance, coverage and exclusions before reuse.
- Regional/national game-industry associations, government creative-industry registries, public funding recipients, cluster directories, event exhibitor lists and other official developer-credit sources.

The full source notes, observed catalogue sizes, caveats, coverage policy and future roadmap are maintained in the Global Discovery Implementation Model. The manual-only source/access register is [config/manual-discovery-sources.json](config/manual-discovery-sources.json); it is intentionally not loaded by the automated discovery runtime. Source catalogue counts are dynamic and must not be interpreted as unique studio totals without validation.

### Initial global-discovery baseline

The Phase A closeout proposal establishes an initial baseline of **327 verified studio routes with 327 matching profiles** (322 active, 5 paused across 51 country/location labels). The existing hourly discovery workflow continues as maintenance using GameDevMap and Wikidata feeds. The separate 22-entry manual source register remains research-only and is not automated ingestion. This is a practical verified baseline, not a claim that every game studio worldwide has been found. See the [Phase A closeout record](docs/operations/phase-a-global-discovery-closeout.md) and the [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

## Verification process

For each candidate, the discovery pipeline:

1. Deduplicates by verified official identity/domain. Same-name candidates on different domains are retained until their identity is confirmed.
2. Confirms that the organisation materially develops video games or performs direct game-development work.
3. Checks official pages and directly linked employer-controlled application platforms for explicit non-vacancy application invitations.
4. Gives explicit rejection language priority and keeps conflicting or ambiguous evidence out of the public directory.
5. Applies the company-level adult/vice exclusion policy; uncertain cases go to manual review. Mature themes in an individual mainstream game are not an automatic exclusion.
6. Publishes only verified routes, with evidence and application URLs. Unknown studio facts remain unknown rather than guessed.

A timeout, blocked request, robots denial, HTTP 403/429, parsing problem or ambiguous page never proves that a route does not exist and never closes a route by itself.

The detailed candidate pool and progress are stored on the separate discovery-state branch. They are not exposed in the public directory.

## Discovery cadence and known coverage gap

GitHub Actions runs the discovery workflow hourly. The current pipeline has resumable GameDevMap and Wikidata work, but the additional sources above are still evaluation leads, not integrated feeds.

Regional association directories and curated national catalogues are currently manual research inputs only. IGDB is blocked pending written permission for public-directory redistribution; Steam remains manual-only with no scripted collection. See the source register for access restrictions before using any new index.

The integrated discovery pipeline uses **source-specific saturation**, not a global stop. Each active feed has its own cursor, cycle, verified-addition count and saturation state; three complete empty passes throttle only that feed. Incomplete or failed passes do not count as exhaustion, and one source's saturation does not suppress work on others. Additional candidate sources listed above remain evaluation leads until their adapters are implemented and tested.

Every run adds a sanitized GitHub Actions summary with work counts, candidate-status totals, source cursors and saturation state.

## Exclusion policy

Exclude organisations materially focused on pornography/adult sexual entertainment, iGaming/gambling/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Apply exclusions to the organisation's actual business, not an isolated keyword or the themes of one legitimate mainstream game. Keep uncertain cases for manual review.

## Personal application tracker

Save studios and track them through Saved, In Progress, Applied, Interview, Offer and Archived. Status changes and removals are stored in this browser only. There is no login, server sync or automatic application submission.

## Development checks

Use Node.js 24 and Python 3.10 or newer:

```sh
npm ci
npm run dev
```

Run the checks:

```sh
python3 -m unittest discover -s tests -p 'test_studio_discovery*.py' -v
npm test
npm run check:studio-directory
npm run build
```

## Key files

- `src/data/speculative-route-directory.json`: verified public application-route directory.
- `src/data/studio-profiles.json`: basic researched studio fields.
- `scripts/discover_speculative_studios.py`: candidate collection, official-site verification and route maintenance.
- `.github/workflows/discover-studios.yml`: resumable discovery and hourly maintenance.
- `discovery-state/state/studio-discovery-state.json`: candidate and cursor state on the separate branch.
- `docs/architecture/global-discovery-implementation-model.md`: authoritative global discovery strategy, policies and roadmap.

Never put personal application records, secrets or private candidate notes in the public source datasets.
