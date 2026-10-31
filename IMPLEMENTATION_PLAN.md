# Game Industry Outreach Tracker MVP plan

## Immediate website scope

The first usable release has two pages:

1. **Studio directory** — a compact table of studios with verified official speculative/open application routes. Support search, country and work-model filters, sorting, official website/application links, and a Save action.
2. **Application tracker** — a simple LinkedIn-style tracker with Saved, In Progress, Applied, Interview, Offer and Archived statuses. Saving a studio from the directory adds it to the tracker. Status changes and removals persist in browser localStorage.

The UI should remain a straightforward developer/internal-tool interface. Do not spend time on detailed profiles, artwork, analytics or visual polish before the core workflow works.

## Discovery automation

Build an automated studio-route discovery pipeline, not an advertised-vacancy crawler.

- Run an initial global discovery/backfill in bounded batches.
- Use public studio directories and search sources to discover candidates only.
- Verify each speculative/open application route through the studio's official website or studio-controlled application system.
- Deduplicate candidates and records using canonical website domains and normalized studio names.
- Save progress/cursors so long discovery runs can resume.
- Stop the initial backfill after several complete passes produce no meaningful new verified studios across the configured sources.
- Add an hourly GitHub Actions maintenance run to discover new studios and recheck known routes in rotating batches.
- Update verified route details and add newly confirmed studios.
- Mark routes inactive only with reliable closure evidence. Temporary network failures or blocked sources must preserve the previous active state.
- Validate records and run tests/build before publishing any dataset change.

## Out of scope until the MVP is stable

Detailed studio profiles, game artwork, elaborate analytics, user accounts, cloud tracker sync, automated applications, resume tooling, outreach generation, notifications and advanced customization.
