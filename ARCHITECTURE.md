# Architecture

## Website

- React and Vite serve the static website on GitHub Pages.
- `src/data/speculative-route-directory.json` is the public directory of studios with verified speculative/open application routes.
- `src/data/studio-profiles.json` contains basic researched studio classification and headquarters fields. Unknown facts remain explicitly labelled.
- `StudioDirectory` renders the compact searchable/filterable table with official links and a Save action.
- `ApplicationTracker` renders the simple status-based tracker.
- `App.tsx` connects both pages and stores tracker records in browser `localStorage`. Personal tracker data is not synced to a server and is never committed.

## Studio discovery and route verification

- `scripts/discover_speculative_studios.py` discovers candidate organizations from Wikidata and verifies speculative application routes on official studio sites.
- Candidate feeds are Wikidata video-game developer entities, developer credits on video games, and video-game company entities.
- Public structured data is used to find possible studios only. The publication gate requires explicit positive application wording on the studio website or a hiring platform linked from it.
- The verifier follows only relevant careers/jobs/contact links, respects robots.txt, uses HTTPS, blocks non-public hosts, applies per-host request spacing and limits page/response sizes.
- English and selected European-language speculative-application phrases are recognized. Explicit rejection language and excluded industry-content signals prevent automatic publication.
- Candidate records are deduplicated against both normalized studio names and official website domains.
- New records receive a minimal profile. Missing ownership, scale, team size, notable games and hiring geography are not guessed.

## State and scheduled workflow

- `.github/workflows/discover-studios.yml` runs hourly and supports manual bootstrap/hourly runs.
- The public dataset is updated only after the discovery script, offline tests, directory validation, existing tests and production build all pass.
- Updated static data is deployed to GitHub Pages by the same workflow because commits made with `GITHUB_TOKEN` do not trigger a second workflow run.
- Cursors, candidate status and closure counters are stored in `state/studio-discovery-state.json` on the separate `discovery-state` branch. This avoids creating an hourly state-only commit on the public `main` branch.
- The initial bootstrap is considered saturated after three complete configured-source passes produce no newly verified studios. Scheduled hourly discovery and route maintenance continue afterwards.

## Closure safety

- Network errors, timeouts, HTTP 403/429, robots restrictions, non-HTML responses and ambiguous pages do not change route status.
- Explicit official-site rejection or both evidence/application URLs returning 404/410 must be observed in two consecutive checks before a route is marked closed.
- Closed records remain in the data for historical integrity; the active directory UI filters them out.

## Product boundaries

- Two website pages only: studio directory and application tracker.
- No login, user accounts, remote tracker sync, resume tools, outreach drafting, analytics or automatic applications.
- Keep headquarters distinct from stated hiring location and remote eligibility.
- Never store personal application records in the public studio dataset or discovery state.
