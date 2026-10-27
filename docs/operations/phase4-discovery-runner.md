# Phase 4 discovery runner — initial implementation

**Status:** Accepted for manual-only use with explicit coverage limits. The reviewed live run is [#40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573); scheduled execution and public publication remain gated.

## What is monitored

`config/studio-registry.json` contains a small curated registry of official career URLs for CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games. This is monitoring of known sources, not global studio discovery. The initial adapters read configured official HTML pages and recognize only role-detail links matching registry-owned host/path allowlists. A JSON-LD adapter is also available for sources that provide Schema.org `JobPosting` records and complete `ItemList` evidence. It does not infer a vacancy merely from a career page or generic navigation link.

## Safe execution

- Local/offline command: `python3 scripts/discover_studios.py --mode fixture`
- Live command: `python3 scripts/discover_studios.py --mode live --state-file /path/to/monitor-state.json`
- Workflow: Actions → **Studio discovery pipeline** → Run workflow; use `fixture` first. Choose `live` only for an explicit source check.
- Fixture mode uses only synthetic examples and never writes persistent state, even if a `--state-file` argument is passed.
- Live mode fetches only configured HTTPS URLs, uses a bounded response size and timeout/retries, rejects HTTP downgrades and cross-host redirects before following them, and does not bypass access controls. HTTP 403/429/451 is reported as blocked.
- The `discovery-state` branch holds only public role observations and operational scan metadata. This repository is public, so the branch is not a privacy boundary; never put candidate profiles, CVs, drafts, or application history there.
- The workflow is manually triggered only. The one reviewed live run confirmed safe operational behavior but not full source coverage. Do not add a daily schedule until the incomplete adapters/listings are reviewed and the owner separately approves it.

## Conservative observation rules

- Valid individual `JobPosting` JSON-LD records can be observed; a listing is considered complete only when `ItemList` evidence is present.
- A page without usable structured data becomes `needs-review`; it is not an empty successful listing.
- 403/429/451, timeouts, HTTP errors, invalid redirects, oversize responses, and parser failures never close a role. Previously observed records are preserved and marked stale/needs-review.
- A record absent from one or two complete listings becomes `needs-review`. Absence-based closure requires three consecutive successful complete listings. Any failed or incomplete scan resets the consecutive-absence counter.
- An explicitly closed/cancelled/inactive posting or an expired `validThrough` date is not projected as an open role.
- Public output is an explicit allowlist projection and is validated against exact keys. Candidate/private operational data and description excerpts are excluded.
- `outputs/discovery/` is a generated local artifact; the workflow summary lists counts/status categories, not downloaded pages.

## Reviewed live run (2026-10-27)

Run [#40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573) used `main` commit `d052b51` and completed successfully. This means the workflow executed and persisted validated state; it does not mean all source adapters yielded usable vacancies.

| Source | Result | Observations | Follow-up |
|---|---|---:|---|
| CD PROJEKT RED | `needs-review` / `no-matching-role-links` | 0 | Review official role URL pattern and adapter; do not interpret as empty vacancies |
| Naughty Dog | `needs-review` / `no-matching-role-links` | 0 | Review official role URL pattern and adapter; do not interpret as empty vacancies |
| Santa Monica Studio | `needs-review` / `adapter-required` | 0 | Continue manual review until a permitted, reviewed adapter exists |
| Riot Games | `success`, `listing_complete=false` | 183 | Link extraction works, but listing completeness cannot be inferred |

The generated projection included 185 Riot records: 183 in the current link result plus two earlier observations preserved because absence in a link-only/incomplete listing cannot prove closure. All records are `last-seen`, not claims that a role is currently open. A structural check of ten sample records found no duplicate IDs or missing titles/URLs and confirmed the configured official HTTPS host/path. The projection validates against the exact 16-field allowlist and remained an Actions artifact; it was not committed or published.

## Current limitations and gates

- The three link-based adapters recognize only source-specific URL patterns on allowlisted official hosts. They intentionally cannot prove a complete listing, so they cannot auto-close roles by absence. Sites that render jobs only with client-side scripts or vendor-specific APIs are reported for review, not scraped with a browser or bypassed.
- Some careers pages may not expose `ItemList` evidence even when jobs are visible. Those runs cannot support absence-based closure, which is deliberate.
- The public projection is generated only as a short-lived artifact; it is not committed or published. The separate hosting/publication decision and any least-privilege publishing design remain deferred to Phase 8.
- No daily schedule is enabled. The private state branch is written only by an explicitly selected live workflow run.
