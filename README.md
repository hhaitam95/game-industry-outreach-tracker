# StudioScout

StudioScout is a lightweight directory of game studios that explicitly accept speculative/open applications, paired with a personal application tracker.

The first release intentionally has only two pages and a simple internal-tool style interface.

## The two pages

### Studio directory

- Search studios by name, country and studio type.
- Filter by country and work model.
- Sort by studio name or country.
- See basic studio details and the type of application route.
- Open the official studio website or application route.
- Save a studio to the personal tracker.

The directory contains only studios with a route verified on the studio's own website or a studio-controlled application platform. Headquarters are shown as a reference; they do not establish job location or remote eligibility.

### My applications

Save a studio from the directory and it appears in the tracker. Track it through:

- Saved
- In Progress
- Applied
- Interview
- Offer
- Archived

Status changes and removals are stored in this browser's local storage. The tracker is not connected to a server, account or remote sync. Personal application records are never committed to the repository.

## Automated studio discovery

GitHub Actions runs the discovery and maintenance pipeline hourly.

Candidate sources currently include three Wikidata feeds:

1. Organizations classified as video-game developers.
2. Organizations credited as developers of video games.
3. Organizations classified as video-game companies.

These feeds are candidate lists only. They are not proof that a company accepts applications.

For each new candidate, StudioScout:

1. Deduplicates the studio by name and official website domain.
2. Fetches its HTTPS official website, respecting robots.txt and conservative per-host request spacing.
3. Follows relevant careers/jobs/contact links on the official site, plus hiring platforms linked from that site.
4. Looks for explicit speculative, unsolicited, spontaneous, open or general application language.
5. Checks for explicit rejection language and content categories excluded by the project policy.
6. Adds the studio only when a suitable route is verified on an official or employer-controlled page.
7. Creates a minimal profile with unknown facts left explicitly unresearched.

Candidate discovery uses the public Wikidata Query Service. No third-party search API key is required. Wikidata is incomplete and is used as a source of leads, not as an authoritative directory. The pipeline uses a descriptive User-Agent, bounded queries and a pause between multi-page bootstrap queries to respect the public service's published limits.

### Bootstrap and hourly runs

The scheduled workflow performs a one-time larger bootstrap batch when discovery state does not yet exist. Subsequent scheduled runs process a rotating source page, verify a bounded candidate batch and recheck a small group of existing application routes.

Use **Actions → Studio speculative-route discovery → Run workflow → bootstrap** to request a larger manual batch. The bootstrap is resumable.

When all configured source feeds have completed three consecutive full passes without adding a newly verified studio, the state marks the first discovery pass as saturated. Hourly maintenance continues after saturation, looking for newly added candidates and rechecking existing routes.

Progress and cursors are stored separately on the `discovery-state` branch, not in the public website's personal tracker data.

### Route closure safety

A timeout, blocked request, robots denial, HTTP 403/429, parsing problem or ambiguous page never closes a route.

A route is marked closed only after two consecutive checks find either explicit official-site rejection language or both the official evidence and application URLs missing (404/410). Closed records are retained in the dataset for history and disappear from the active directory view.

## Studio inclusion rules

Public studio directories, Wikidata and other industry sources are candidate sources only. Every application route must be checked against the studio's own website or a studio-controlled application system.

Exclude studios materially focused on pornography, erotica, explicit sexual entertainment, gambling/betting/casinos (including simulated/social casino), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping or related adult/vice sectors. Ambiguous content cases are not auto-published.

Generic careers pages, advertised roles and aggregator claims alone do not qualify. An ordinary application to a specific advertised vacancy is not a speculative application.

## Run locally

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

## Source data

- `src/data/speculative-route-directory.json`: public directory of verified application routes.
- `src/data/studio-profiles.json`: basic studio profile fields for the directory.
- `scripts/discover_speculative_studios.py`: candidate discovery, official-site verification and route maintenance.
- `.github/workflows/discover-studios.yml`: hourly and manual discovery workflow.
- `discovery-state/state/studio-discovery-state.json`: resumable discovery cursors and verification state on the separate state branch.

Do not put personal application records, secrets or private candidate data in the public source datasets.
