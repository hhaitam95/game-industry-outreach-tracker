# StudioScout

StudioScout is a small worldwide directory of game studios that explicitly accept speculative applications, paired with a personal application tracker.

The website intentionally has only two pages: the studio directory and My applications. Tracker data stays in this browser's local storage.

## Studio directory

Search studios by name, country and studio type; filter by country and work model; open the official studio website or application route; and save studios to the tracker.

A studio appears in the public directory only when its own website or a studio-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open or general applications. A normal careers page or an advertised vacancy is not enough. Headquarters do not establish hiring location or remote eligibility.

## Discovery

The automated discovery pipeline collects a large candidate pool, then visits official studio websites to verify application routes.

Current candidate sources:

- GameDevMap public worldwide directory. It reports 10,500 results and exposes a paginated public results table with studio/company website links and locations. It includes multiple offices and some non-studio organisations, so records are filtered and deduplicated before website checks.
- Wikidata feeds for video-game developers, organisations credited as game developers, and video-game companies.

GameDevMap is accessed through its public paginated results interface (100 rows per page). The scraper does not download its raw data files. It respects robots.txt and the existing per-host request delay. Source directories are leads only; no source's claim is treated as proof of speculative hiring.

For each candidate, StudioScout:

1. Deduplicates by normalized studio name and official website domain.
2. Fetches the official HTTPS site and relevant careers, jobs, application or contact links.
3. Checks official pages and directly linked employer-controlled ATS platforms for explicit speculative-application wording.
4. Gives explicit rejection language priority and keeps conflicting or ambiguous evidence out of the public directory.
5. Excludes the project-defined adult/vice sectors and leaves uncertain cases for review.
6. Publishes only verified routes, with evidence and application URLs. Unknown studio facts remain unknown rather than guessed.

The detailed candidate pool and progress are stored on the separate discovery-state branch. It is not exposed in the public directory.

## Bulk discovery and hourly maintenance

The scheduled workflow automatically uses bulk mode while the GameDevMap backfill or candidate verification queue remains unfinished. Bulk runs are resumable: the source offset, Wikidata cursors and candidate statuses are saved after each successful run. When the initial queue is processed, the workflow returns to hourly maintenance.

You can also open Actions → Studio speculative-route discovery → Run workflow → bulk to resume the initial backfill manually, or select hourly to run a smaller maintenance batch.

The bulk run is bounded by a 25-minute discovery budget. If it reaches that limit, it saves its progress and continues on a later run. It does not weaken route verification to increase the number of published records.

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
