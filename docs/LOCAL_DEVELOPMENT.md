# Local development

Game Industry Outreach Tracker is a static React/Vite site with a Python discovery script. No backend, database, resume tools or third-party API credentials are required.

## Requirements

- Node.js 24 and npm 11
- Python 3.10 or newer

## Setup

```sh
npm ci
npm run dev
```

## Checks

```sh
python3 -m unittest discover -s tests -p 'test_studio_discovery*.py' -v
npm test
npm run check:studio-directory
npm run routes:review
npm run build
```

## Core files

- `src/data/speculative-route-directory.json`: public directory of verified active speculative routes.
- `src/data/studio-profiles.json`: source-labelled studio location and basic profile data.
- `scripts/discover_speculative_studios.py`: candidate collection, official-site verification and route maintenance.
- `.github/workflows/discover-studios.yml`: resumable bulk discovery and hourly maintenance.
- `discovery-state/state/studio-discovery-state.json`: private candidate progress and cursors on the separate state branch.

Personal application records stay in this browser's local storage. Do not add personal tracker data, secrets or unverified candidate records to the public source datasets.
