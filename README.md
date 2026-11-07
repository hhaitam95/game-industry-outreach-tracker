# StudioScout

*Your personalized gateway into the game industry.*

**Live site:** https://hhaitam95.github.io/studioscout/

StudioScout helps you discover game studios worldwide, identify verified speculative application opportunities, match them against your professional profile, and manage your outreach campaign. It is an end-to-end personal game-industry application workflow built around five connected systems: Studio Discovery, Candidate Profile, Matching Engine, Application Preparation and Application Tracker.

Studio Discovery maintains the worldwide directory of studios with verified speculative/open application routes. Candidate Profile is the private source of truth for professional facts, evidence, preferences and approved materials. Matching compares that profile with discovered studios. Application Preparation now has a manual-assisted first version inside My applications: each selected studio has six readiness checks, a private space for employer requirements/questions and a separate draft-answer/missing-information area. This content is saved in the browser and included in tracker backups. Automatic page analysis, cross-origin ATS inspection, autofill and uploads are not implemented. Application Tracker records user-confirmed submissions and later progress.

The Candidate Profile feeds both Matching and Application Preparation. The existing browser-local My applications item remains the single canonical private record from selection/preparation through confirmed submission and outcomes. Candidate data and application history stay browser-local; matching is calculated on-device. The user reviews all prepared content and performs the final submission on the employer's site.

**Product architecture and workflow:** [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md). Read it before changing system boundaries, data ownership, application preparation or the application lifecycle.

**Detailed private-system specification:** [Candidate Profile, Matching, Application Preparation and Tracking](docs/architecture/candidate-profile-matching-application-workspace.md).

**First application campaign runbook:** [Prepare, submit and track the first application wave](docs/operations/first-application-campaign-runbook.md).

**Discovery rules and handover source of truth:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md). Read it before changing discovery sources, qualification, exclusions, application verification or coverage cadence.

**Application strategy and handover:** [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md) records private targeting, geographic prioritisation, standard application materials, campaign waves, readiness checks and outcome tracking. It does not change global discovery eligibility or authorize automated submission.

## Studio directory

The **Games** tab combines titles already associated with studio profiles. Where a verified Steam app ID exists, it can display Steam's release date, developer, publisher and aggregate review totals. Default popularity sorting uses total Steam reviews as a public signal, not sales or player counts. Missing values are left unknown rather than estimated.


Search studios by name, country and studio type; filter by country and work model; open the official studio website or application route; and save studios to the tracker.

### Game cover artwork

The directory resolves game artwork in this order: verified IGDB cover art, verified Steam artwork (portrait first, then its landscape assets), original developer-hosted artwork, and finally an Apple App Store icon where no earlier source exists. The gallery preserves each source's portrait, square or landscape layout. Studio team-size information is recorded manually or from sources that permit automated access. Do not scrape LinkedIn or another restricted platform without the required permission.

Cover metadata is stored in `src/data/studio-profiles.json`; the deployed site loads static image URLs and never sends Twitch credentials or makes IGDB API requests from a visitor's browser. Game cards link directly to a verified Steam app page, an official game page or an IGDB page. When no direct destination is verified, the card is deliberately not a link rather than sending visitors to a generic Steam search.

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

The Steam enrichment uses the public Store search and app-details responses. It adds an app ID only when the result has one exact normalized game-title match and the app-details record confirms the matching studio as a developer. Ambiguous titles, non-game products, title variants and developer mismatches are left unchanged. For existing Steam app IDs, it also stores the exact Steam `header_image` URL (and the capsule image as a secondary fallback when available), but only when the app-details game title exactly matches the profile title. This avoids guessing CDN paths and allows the renderer to try verified Steam-hosted landscape art when the portrait/library image is unavailable. The `Enrich missing Steam game links and artwork` workflow can be run manually from GitHub Actions; after merging the workflow, profile-data changes also trigger a run that opens a separate data-only pull request.

For automatic data pull requests, enable **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests**. If that repository-level permission is disabled, the workflow still pushes its generated data branch and prints the manual PR URL rather than failing after successful validation.

For mobile games that are not represented on Steam and have no verified IGDB or official-site cover, the optional Apple App Store enrichment can find the official app icon and a direct App Store page:

```sh
node scripts/enrich-app-store-games.mjs
node scripts/enrich-app-store-games.mjs --write
npm run check:studio-directory
npm test
npm run build
```

The App Store pass only accepts an exact normalized game-title match where Apple's artist or seller name also matches the studio. It stores Apple's official artwork CDN URL and direct `apps.apple.com` listing URL. Ambiguous listings, developer mismatches, unavailable apps, unreleased projects, generic franchise labels and undisclosed titles remain unchanged. This is an additional source for eligible Apple mobile games, not a claim that every mobile game is available on iOS.

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
- Four recurring Wikidata feeds for video-game developer entities, credited developer organisations, video-game companies and video-game-industry classifications. The broad industry feed is a lead only: candidates must show direct game-development work on their own site before automatic publication.
- IGDB Companies API (merged in PR #100 and live on `main`). It contributes company records with developed-game credits and an officially typed company website. The API lead is not proof of current activity or speculative hiring.
- Scottish Games Industry open JSON directory (CC BY-NC-SA 4.0 data). It contributes active developer and solo-developer category records from a public GitHub repository, retains attribution and source provenance, and does not require an API key. Non-commercial use only; obtain separate permission before commercial use.

### Additional candidate sources under evaluation

These are not yet integrated discovery adapters. Their terms, access method, coverage and reuse conditions must be reviewed before automation.

- [GameCompanies.com](https://gamecompanies.com/) — global directory of studios, publishers, hubs, organisations and service companies; its Terms restrict automated use beyond the provided interface without written permission, so use as a manual source unless permission is obtained.
- [Games Jobs Index studio directory](https://gamesjobsindex.com/studios.html) — manual lead source with a visible “Speculative only” filter. The header showed 2,573 studios while the regional roll-up showed 2,415 on 2026-10-31; the count is unreconciled. Filter labels are not employer evidence, and automated access permission was not established.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large paginated creator directory; automated scraping/redistribution is excluded due to Valve's current terms.
- [MobyGames API](https://www.mobygames.com/info/api/) — potential game-credit/company discovery source. Requires authorized API access; do not scrape MobyGames pages or bypass its current API/terms restrictions. Review [MobyGames terms](https://www.mobygames.com/info/terms/) before integration.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary seed and cross-check only; review licence, provenance, coverage and exclusions before reuse.
- Public regional directories researched for future adapter review: [CESA Japan](https://www.cesa.or.jp/about/member-list/index-en.html), [Neogames Finland](https://neogames.fi/about-the-industry/), [DEV Spain](https://dev.org.es/asociados/), [Swedish Games Industry](https://www.dataspelsbranschen.se/en/members/), [K-GAMES Korea](https://www.kgames.or.kr/partnership/partner-list/), [ABRAGAMES Brazil](https://www.abragames.org/membros.html), [Ukie UK](https://ukie.org.uk/membership-directory/), [Australian Game Developers Directory](https://australiangamedevelopers.com.au/), [GDAP Philippines](https://gdap.org.ph/gdap-members/), [African Games Report](https://africagamesreport.com/african-game-studios/) and [DeVuego LATAM](https://devuego.lat/estudios/). These are research-only until current robots, terms, licence and republication permissions are checked; public rosters also contain non-studio members.
- Government creative-industry registries, public funding recipients, cluster directories, incubator portfolios, event exhibitor lists and other official developer-credit sources.

The full source notes, observed catalogue sizes, caveats, coverage policy and future roadmap are maintained in the Global Discovery Implementation Model. The manual-only source/access register is [config/manual-discovery-sources.json](config/manual-discovery-sources.json); it is intentionally not loaded by the automated discovery runtime. Source catalogue counts are dynamic and must not be interpreted as unique studio totals without validation.

### Initial global-discovery baseline

The Phase A closeout proposal establishes an initial baseline of **327 verified studio routes with 327 matching profiles** (322 active, 5 paused across 51 country/location labels). The hourly discovery workflow now maintains seven recurring candidate feeds: GameDevMap, four Wikidata feeds, IGDB and the Scottish Games Industry dataset. The separate 22-entry manual source register remains research-only and is not automated ingestion. This is a practical verified baseline, not a claim that every game studio worldwide has been found. See the [Phase A closeout record](docs/operations/phase-a-global-discovery-closeout.md) and the [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

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

GitHub Actions runs discovery hourly. The pipeline revisits the full GameDevMap catalogue in recurring paginated passes, uses four recurring Wikidata feeds, the IGDB Companies API and the Scottish Games Industry open JSON dataset. GameDevMap and Scottish feed page completion are based on raw source rows/files, not only rows that pass candidate filters.

The researched regional association directories remain manual/research inputs until source-specific reuse permission and automated access are established. IGDB's server-side adapter uses the existing Twitch application secrets and the documented non-commercial API; the candidate feed queries companies with developed-game credits and an official website type. Its official website type is resolved dynamically through `/v4/website_types`. The Scottish feed uses public GitHub tree/raw JSON endpoints; its data attribution and CC BY-NC-SA 4.0 non-commercial terms are retained. Steam creator-page scraping is explicitly excluded.

The integrated discovery pipeline uses **source-specific saturation**, not a global stop. Each of the seven active feeds has its own cursor, cycle, new-candidate count, verified-route count and saturation state. A pass is empty only when it adds zero new unique candidate entities (and no unresolved candidate work remains); five such completed passes throttle only that feed to four pages per hourly run. A source that finds many real studio candidates but few speculative routes keeps its normal collection budget. The global hourly budget is 20 source pages. Wikidata requests retain 65-second spacing, IGDB requests are spaced at 0.27 seconds, and the pipeline retains its 25-minute runtime ceiling. Source errors now receive per-feed 5–120 minute backoff; failed cursors and empty-pass counters are preserved while other feeds continue. Incomplete or failed passes do not count as exhaustion, and one source's saturation does not suppress work on others. Route publication requires employer-site game-development proof, a career-context speculative invitation and a relevant submission route; ambiguous cases remain private for review.

Every run adds a sanitized GitHub Actions summary with work counts, candidate-status totals, source cursors and saturation state.

## Exclusion policy

Exclude organisations materially focused on pornography/adult sexual entertainment, iGaming/gambling/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Apply exclusions to the organisation's actual business, not an isolated keyword or the themes of one legitimate mainstream game. Keep uncertain cases for manual review.

## Candidate profile

The **My profile** area provides structured contact details, a professional summary, employment history, education, projects/training, skills with evidence, a reusable master resume and motivation message, and application preferences. PDF and DOCX attachments are preserved as uploaded; this version does not extract text from them or rewrite application materials.

The profile is stored in IndexedDB in the current browser and is not uploaded or synced. Browser storage is not automatically encrypted and can be cleared. Use **Export backup** regularly and keep the resulting JSON file somewhere private and secure; an export contains personal information and embedded document contents. **Import backup** replaces the profile currently stored in that browser after confirmation.

## Personal application tracker

Save studios and track them through Saved, In Progress, Applied, Interview, Offer and Archived. Status changes and removals remain in this browser's localStorage tracker. The profile uses a separate IndexedDB store. There is no login, server sync or automatic application submission.

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


### Studio directory discovery tags

The public studio profiles preserve their original research fields and also include normalized display fields for `scale`, `platforms`, `gameFocus`, and `studioRoles`. Run `node scripts/normalize-studio-tags.mjs` to preview the normalized tag counts, or add `--write` to update the profile data. Ambiguous and undisclosed scale values remain unclassified.

Game release years are stored with a source URL when verified. The Steam and IGDB enrichment scripts can add available release years from exact title matches; they never guess from fuzzy matches. IGDB enrichment requires the Twitch/IGDB credentials described above.


A compact, names-free source-health checkpoint is written after each successful hourly run to `state/discovery/studio-source-status.json` on the `discovery-state` branch. It records per-feed pass counts, candidate totals, saturation and whether a source has completed repeated passes without new candidate entities. The daily **Monitor Studio Sources** check uses this checkpoint to distinguish source exhaustion from temporary failures or feeds that find candidate companies without a qualifying speculative-application route. It does not stop or change the hourly GitHub Actions workflow.
