# Game Industry Outreach Tracker

Game Industry Outreach Tracker is a worldwide directory of game studios that explicitly accept speculative applications, paired with a personal application tracker.

The website intentionally has only two pages: the studio directory and My applications. Tracker data stays in this browser's local storage.

## Studio directory

Search studios by name, country and studio type; filter by country and work model; open the official studio website or application route; and save studios to the tracker.

A studio appears in the public directory only when its own website or a studio-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications. A normal careers page or an advertised vacancy is not enough. Headquarters do not establish hiring location or remote eligibility.

## Discovery

The automated discovery pipeline collects a large candidate pool, then visits official studio websites to verify application routes.

Current candidate sources:

- GameDevMap public worldwide directory. It exposes about 10,500 paginated result rows with studio/company website links and listed locations. Rows can represent multiple offices or non-studio organisations, so category filtering and official-domain deduplication happen before website checks.
- Wikidata feeds for video-game developers, organisations credited as game developers, and video-game companies.

GameDevMap is accessed through its public paginated results interface (100 rows per page). The scraper does not download its raw data files. It respects robots.txt and the per-host request delay. Website verification checks up to eight different studio domains concurrently; requests to the same host remain paced. Source directories are leads only; no source's claim is treated as proof of speculative hiring.

For each candidate, the discovery pipeline:

1. Deduplicates by official website domain. Same-name candidates on different domains are retained for separate verification rather than silently merged.
2. Fetches the official HTTPS site and relevant careers, jobs, application or contact links.
3. Checks official pages and directly linked employer-controlled ATS platforms for explicit speculative-application wording.
4. Gives explicit rejection language priority and keeps conflicting or ambiguous evidence out of the public directory.
5. Excludes the project-defined adult/vice sectors and leaves uncertain cases for review.
6. Publishes only verified routes, with evidence and application URLs. Unknown studio facts remain unknown rather than guessed. GameDevMap locations are labelled as listed locations, not assumed headquarters.

The detailed candidate pool and progress are stored on the separate discovery-state branch. It is not exposed in the public directory.

## Discovery cadence and background maintenance

GitHub Actions runs the discovery workflow hourly. The initial GameDevMap catalogue backfill and due candidate-verification work use resumable batches; source cursors and candidate statuses are saved to the separate discovery-state branch after a successful run.

After the GameDevMap backfill is complete and there is no queued or due-retry verification work, scheduled runs scan the unfinished Wikidata feeds. The normal exploration cadence checks up to 8 source pages per hourly run, with a 65-second gap between Wikidata requests, up to 1,000 candidate checks, 8 existing-route checks, and a 25-minute discovery runtime ceiling. The workflow itself has a 40-minute timeout.

Once three complete Wikidata cycles finish without finding a new verified speculative route, the saved state marks discovery as saturated. Scheduled maintenance then continues to refresh the feeds at 1 source page per hour instead of 8, while retaining candidate verification and existing-route checks. Any cycle that verifies a new studio clears saturation and restores the faster 8-page cadence for the next cycle. This reduces repeated scanning pressure without stopping discovery or relaxing the evidence threshold.

Every run adds a sanitized GitHub Actions summary with its work counts, candidate-status totals, source cursors and saturation state.

## Route maintenance and safety

A timeout, blocked request, robots denial, HTTP 403/429, parsing problem or ambiguous page never closes a route. Explicit official-site rejection or both evidence/application URLs missing (404/410) must be confirmed on two consecutive checks before a route is marked closed. Closed records are retained for history and disappear from the active directory.

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

- src/data/speculative-route-directory.json: verified public opportunity directory.
- src/data/studio-profiles.json: basic researched studio fields.
- scripts/discover_speculative_studios.py: candidate collection, official-site verification and route maintenance.
- .github/workflows/discover-studios.yml: resumable bulk discovery and hourly maintenance.
- discovery-state/state/studio-discovery-state.json: candidate and cursor state on the separate branch.

Never put personal application records, secrets or private candidate notes in the public source datasets.
