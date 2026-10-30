# Architecture

- React and Vite serve a static website on GitHub Pages.
- `src/data/speculative-route-directory.json` contains the studios with verified official speculative/open application routes.
- `src/data/studio-profiles.json` contains enriched studio descriptions, headquarters, branches, ownership, type, selected games, indicative scale, team size, application geography and sources.
- `StudioDirectory` renders the dark searchable/filterable table and expandable company profiles.
- Studio marks are loaded from website favicons with initials as a fallback. Game artwork is loaded from Steam CDN for titles with verified Steam app IDs; other titles show a neutral placeholder.
- `App.tsx` stores the small application tracker in browser `localStorage`. The records are not sent to any backend and are not encrypted.
- There is no backend, login, remote sync, crawler or scheduled scanner.

HQ and application geography are separate fields. HQ is only a fallback reference when the route does not state a hiring location. Do not claim an HQ location is where the job is based.

External profile facts should carry official or otherwise reliable source links. Employee counts and company size ranges need a date/reference period. Missing data remains visibly unknown.
