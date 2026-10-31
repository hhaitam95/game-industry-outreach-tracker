# Game Industry Outreach Tracker

Game Industry Outreach Tracker is a worldwide directory of legitimate video-game development organisations that explicitly accept speculative applications, paired with a personal application tracker.

The website intentionally has two pages: the studio directory and My applications. Tracker data stays in this browser's local storage.

**Discovery rules and handover source of truth:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md). Read it before changing discovery sources, qualification, exclusions, application verification or coverage cadence.

## Studio directory

Search studios by name, country and studio type; filter by country and work model; open the official studio website or application route; and save studios to the tracker.

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

- [GameCompanies.com](https://gamecompanies.com/) — global directory of studios, publishers, hubs, organisations and service companies.
- [Games Jobs Index studio directory](https://gamesjobsindex.com/studios.html) — supplementary studio directory and cross-check; job listings do not prove speculative applications.
- [Steam Developer & Publisher Homepages](https://store.steampowered.com/dev/?l=english) — large paginated creator directory; includes publishers and entities beyond unique development studios.
- [MobyGames API](https://www.mobygames.com/info/api/) — potential game-credit/company discovery source. Requires authorized API access; do not scrape MobyGames pages or bypass its current API/terms restrictions. Review [MobyGames terms](https://www.mobygames.com/info/terms/) before integration.
- [Community Game Studios & Publishers Database](https://github.com/EddieWing/gamedev-studios-db) — secondary seed and cross-check only; review licence, provenance, coverage and exclusions before reuse.
- Regional/national game-industry associations, government creative-industry registries, public funding recipients, cluster directories, event exhibitor lists and other official developer-credit sources.

The full source notes, observed catalogue sizes, caveats, coverage policy and future roadmap are maintained in the Global Discovery Implementation Model. Source catalogue counts are dynamic and must not be interpreted as unique studio totals without validation.

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
