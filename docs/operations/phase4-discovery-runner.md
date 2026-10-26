# Phase 4 discovery runner — initial implementation

**Status:** Manual workflow implemented; scheduled execution and public publication remain gated.

## What is monitored

`config/studio-registry.json` contains a small curated registry of official career URLs for CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games. This is monitoring of known sources, not global studio discovery. The initial adapters read configured official HTML pages and recognize only role-detail links matching registry-owned host/path allowlists. A JSON-LD adapter is also available for sources that provide Schema.org `JobPosting` records and complete `ItemList` evidence. It does not infer a vacancy merely from a career page or generic navigation link.

## Safe execution

- Local/offline command: `python3 scripts/discover_studios.py --mode fixture`
- Live command: `python3 scripts/discover_studios.py --mode live --state-file /path/to/monitor-state.json`
- Workflow: Actions → **Studio discovery pipeline** → Run workflow; use `fixture` first. Choose `live` only for an explicit source check.
- Fixture mode uses only synthetic examples and never writes persistent state, even if a `--state-file` argument is passed.
- Live mode fetches only configured HTTPS URLs, uses a bounded response size and timeout/retries, rejects HTTP downgrades and cross-host redirects before following them, and does not bypass access controls. HTTP 403/429/451 is reported as blocked.
- The `discovery-state` branch holds only the operational scan state. Do not put candidate profile, CV, drafts, or application history there.
- The current workflow is manually triggered only. Do not add a daily schedule until at least one manual live run has been reviewed for parser coverage and error handling.

## Conservative observation rules

- Valid individual `JobPosting` JSON-LD records can be observed; a listing is considered complete only when `ItemList` evidence is present.
- A page without usable structured data becomes `needs-review`; it is not an empty successful listing.
- 403/429/451, timeouts, HTTP errors, invalid redirects, oversize responses, and parser failures never close a role. Previously observed records are preserved and marked stale/needs-review.
- A record absent from one or two complete listings becomes `needs-review`. Absence-based closure requires three consecutive successful complete listings. Any failed or incomplete scan resets the consecutive-absence counter.
- An explicitly closed/cancelled/inactive posting or an expired `validThrough` date is not projected as an open role.
- Public output is an explicit allowlist projection and is validated against exact keys. Candidate/private operational data and description excerpts are excluded.
- `outputs/discovery/` is a generated local artifact; the workflow summary lists counts/status categories, not downloaded pages.

## Current limitations and gates

- The three link-based adapters recognize only source-specific URL patterns on allowlisted official hosts. They intentionally cannot prove a complete listing, so they cannot auto-close roles by absence. Sites that render jobs only with client-side scripts or vendor-specific APIs are reported for review, not scraped with a browser or bypassed.
- Some careers pages may not expose `ItemList` evidence even when jobs are visible. Those runs cannot support absence-based closure, which is deliberate.
- The public projection is generated but not published: the separate public deployment repository and least-privilege publish credential do not yet exist.
- No daily schedule is enabled. The private state branch is written only by an explicitly selected live workflow run.
