# Architecture

- React and Vite serve the static website on GitHub Pages.
- `src/data/speculative-route-directory.json` is the public directory of studios with verified speculative/open application routes.
- `src/data/studio-profiles.json` contains the basic researched studio classification and headquarters fields used by the directory. Unavailable facts remain explicitly unknown.
- `StudioDirectory` renders the compact studio table with search, country/work-model filters, sorting and official links.
- `ApplicationTracker` renders the simple application-status table.
- `App.tsx` connects both pages and stores tracker entries in browser `localStorage`. Tracker records are local to the browser and are never committed or synced to a server.
- The directory dataset is public static JSON generated/updated by repository workflows; the tracker is personal browser-local data.

## Discovery automation

The target automation discovers game studios and verifies whether their official websites or studio-controlled application systems accept speculative/open applications. This is different from a job-posting crawler, which scans advertised vacancies.

The discovery process should work in bounded, resumable batches, deduplicate candidate studios, verify official application evidence, validate additions/updates, and preserve the previous dataset when a source fails. A route should only be marked closed after reliable confirmation from the studio-controlled source; transient errors are not closure evidence.

The scheduled GitHub Actions workflow and studio-route discovery engine are planned but are not yet enabled on the default branch. An older job-posting discovery prototype on a separate branch is not the studio-route discovery implementation.

## Product boundaries

- Two website pages only: studio directory and application tracker.
- No login, user accounts, remote tracker sync, resume tools, outreach drafting, analytics or automatic applications.
- Keep headquarters distinct from stated hiring location and remote eligibility.
- Do not infer company facts, application eligibility or closure from missing data.
