# Architecture

## Website

- React and Vite publish the static site on GitHub Pages.
- The site has two pages: a searchable/filterable studio directory and a local application tracker.
- src/data/speculative-route-directory.json contains only studios with verified, active speculative application routes.
- src/data/studio-profiles.json contains basic researched studio fields. Unknown facts are not guessed.
- The tracker uses browser localStorage; personal application records are not committed or synced.

## Candidate collection and route verification

- scripts/discover_speculative_studios.py collects candidates from GameDevMap and three Wikidata feeds.
- GameDevMap is read through its public paginated results interface (100 rows per page), not from its raw data files. Its rows include company name, official website, type and location. Non-studio categories and duplicate offices are filtered/deduplicated.
- The Wikidata feeds cover game developer entities, organisations credited as game developers, and game-industry companies. The developer-credit query excludes personal entities.
- Candidate sources are leads only. A candidate is published only when an explicit speculative/open application invitation is found on its official site or a directly linked employer-controlled ATS. Same-name candidates on different official domains are retained for separate verification and held for review if both qualify.
- The verifier checks up to eight different studio domains concurrently, while preserving per-host pacing, robots.txt, HTTPS/public-host checks, page-count limits and response-size limits. GameDevMap locations are labelled as listed locations, not assumed headquarters.
- Positive and negative wording is checked together. Explicit refusal takes priority; conflicting or ambiguous pages are held back.
- Network failures, blocks and robots denials never count as route closures. Two consecutive authoritative negative/missing checks are required before closing a route.

## Resumable workflow

- .github/workflows/discover-studios.yml runs the resumable bulk backfill while GameDevMap pages or due candidate checks remain. It automatically returns to hourly maintenance after the initial candidate queue is processed.
- Bulk mode reads up to 110 pages per run, checks as many candidates as possible within a 25-minute discovery budget, and persists its offset and candidate statuses. Interrupted runs resume from the saved cursor.
- Hourly mode checks a smaller rotating source batch, processes due candidates and rechecks existing routes.
- The public datasets are committed and deployed only after discovery tests, frontend/data tests and the production build pass.
- Discovery state and cursors are stored on discovery-state, separate from the public dataset. Personal tracker data never enters the repository.

## Product boundaries

- Two website pages only: studio directory and personal application tracker.
- No login, remote tracker sync, resume tools, outreach drafting, analytics or automatic applications.
- Keep headquarters distinct from hiring location and confirmed remote eligibility.
