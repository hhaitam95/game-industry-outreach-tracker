# Project notes

Keep Game Industry Outreach Tracker focused on its first useful release: a studio directory and a connected personal application tracker.

## Product scope

- The website has two primary pages only: the studio directory and the application tracker.
- Keep the directory as a compact, searchable, filterable and sortable table of basic studio details and official speculative/open application routes.
- Keep the tracker simple: Saved, In Progress, Applied, Interview, Offer and Archived. Saving a studio from the directory must add it to the tracker.
- Keep tracker records in browser localStorage for the MVP. Never commit personal application records.
- Prefer a straightforward developer/internal-tool interface. Do not add elaborate profiles, analytics, resume tools, outreach generators, user accounts or social features unless explicitly requested.
- Use an established, supported UI library only when it makes the implementation simpler. Do not introduce dependencies for appearance alone.

## Studio data quality

- Include only studios with a directly verified speculative, unsolicited, spontaneous, open or general application route.
- Public studio directories are candidate sources, never proof of an application route.
- Verify the route on the studio's own website or a studio-controlled application system.
- Exclude studios materially focused on pornography, erotica, explicit sexual entertainment, gambling/betting/casinos (including simulated/social casino), recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping or related adult/vice sectors.
- Leave unclear content-suitability cases out pending review. Do not exclude mainstream games solely for incidental fictional references to mature themes.
- Do not publish guessed headquarters, branches, employee counts, ownership or game credits. Use “Not disclosed” or “Not researched”.
- Keep headquarters separate from the location or eligibility stated on an application route. HQ is a reference, not evidence a job is based there.
- Keep official evidence links and verification dates with each route.

## Automation principles

- Automated studio discovery and route maintenance are in scope. Do not confuse this with scanning advertised vacancies: the target is studios that accept speculative/open applications.
- Discover candidates in batches, deduplicate by official domain and studio identity, and verify application routes before publishing records.
- Respect website rate limits and access controls. Do not bypass CAPTCHAs, authentication, robots restrictions or anti-bot controls.
- Temporary network failures, blocked requests and ambiguous pages must never be interpreted as confirmed closure.
- Mark routes inactive only after reliable evidence from the studio-controlled page. Preserve historical records rather than deleting them.
- Keep each run resumable, bounded and observable. Validate all records before writing them to the public dataset.
- Do not commit secrets, private candidate data or personal application records.
- Prefer small direct changes and run the relevant tests/build before merging.
