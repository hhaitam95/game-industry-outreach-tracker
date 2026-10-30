# Product specification

StudioScout has two jobs:

1. Help the user discover game studios with official speculative/open/unsolicited/general application routes.
2. Let the user save studios and track applications manually.

## Studio directory

- Include all currently verified studios in `src/data/speculative-route-directory.json`.
- Add researched company information in `src/data/studio-profiles.json`.
- Present a searchable, filterable dark table with studio mark, HQ/location, selected work, indicative scale, ownership, team-size data and a direct official application link.
- Expand each row for description, company role, branches, selected titles/artwork, route conditions, ownership and evidence sources.
- If an application page does not specify a hiring location, show the headquarters as a labelled reference location, not as a confirmed role location.
- If the route explicitly states remote geography or a hiring location, display it separately from HQ.
- If HQ city/country is not verified, say so. Do not infer it from a remote-work policy, legal registration or a branch location.
- Use “Not disclosed” / “Not researched” rather than invented employee counts, ownership or game credits.
- AAA/AA/Indie is an editorial indication only, never a formal rating.

## Application tracker

- Statuses: Saved, In Progress, Applied, Interview, Offer, Archived (displayed as “Not moving forward”).
- Saving a studio from the directory adds it to Saved.
- A separate confirmation action records that the user has actually submitted an application and moves the studio to Applied.
- Status changes and removal are manual.
- Store entries in browser localStorage only. No login, server, account, encryption, cloud sync, email sending or application submission automation.
- Warn in product copy that local browser data can be cleared and does not sync across devices.

## Content and studio suitability

Exclude studios materially focused on adult/vice/age-restricted sectors: pornography, erotica, adult-only sexual games, explicit sexual entertainment, gambling/betting/casinos (including simulated/social casino), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and closely related industries. Apply the rule to the studio's portfolio/core business and to the project or role. Exclude routes that require applicants to confirm comfort with such content. Leave unclear cases out pending review. Do not disqualify mainstream studios solely for incidental fictional references to mature themes.

## Out of scope

No job board, resume editor, outreach generator, AI scoring, automatic crawling, scheduled scans, backend, user accounts, multi-user access, analytics dashboard, email integration or automatic application submission.
