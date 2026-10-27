# Public opportunity snapshot contract

## Purpose and trust boundary

`src/data/public-opportunities.json` is a public, build-time input to the Phase 5a opportunity explorer. It is a reviewed projection, not a feed the browser refreshes. The frontend must not fetch career pages or job-role data at runtime. Do not put candidate profiles, CV data, personal notes, contacts, application history, credentials or secrets in this file.

`last-seen` means the configured source returned a role link at an observed time. It does not prove that the role remains open. Source listings can be incomplete; absence is not proof of closure. The UI must preserve this caveat.

## Snapshot envelope

The JSON root contains exactly these fields:

- `schemaVersion`: integer `1`.
- `generatedAt`: parseable date/time for the snapshot generation.
- `opportunities`: array of public role-link records.

## Exact opportunity-field allowlist

Each role object contains exactly these 16 fields, matching the discovery projection validator in `scripts/discovery/projection.py`:

| Field | Contract |
| --- | --- |
| `id` | Non-empty unique public role identifier within the snapshot. |
| `studioId` | Stable studio identifier from the public catalogue. |
| `studioName` | Public display name of the studio. |
| `title` | Raw title/listing text; preserve exactly and do not overwrite with parsed values. |
| `url` | HTTPS posting/link URL without embedded credentials. |
| `locations` | Source-projection array; an empty array is not a known location. |
| `employmentType` | Source-projection array; an empty array is unknown/not listed. |
| `datePosted` | Source-provided date or `null`; do not infer from other timestamps. |
| `validThrough` | Explicit validity date or `null`; do not infer closure from absence. |
| `status` | One of `announced`, `last-seen`, `stale`, `needs-review`, `unavailable`. |
| `sourceUrl` | HTTPS official source URL without embedded credentials. |
| `firstSeenAt` | Original observation timestamp. |
| `lastSeenAt` | Most recent recorded observation timestamp; not an open-status guarantee. |
| `lastChangedAt` | Timestamp of the most recent recorded change. |
| `observedAt` | Timestamp of the current observation represented by this record. |
| `contentHash` | Public content fingerprint produced by the projection pipeline. |

Unknown structured facts must remain unknown: empty `locations`/`employmentType` and null `datePosted`/`validThrough` render as “Not listed in source”. Do not add eligibility or candidate-related fields.

## Title-derived clues and provenance

The source provides the raw `title`, not a structured seniority, parsed city/country, contract flag, or relocation flag. Phase 5a derives those clues from the raw title only:

- location (only an unambiguous trailing `City, Country` or supported city-state pattern),
- seniority keywords,
- a literal `(Contract)` mention,
- a literal `Relocation` mention,
- role family based on precise title phrases.

The UI must label these values “parsed from listing text”, preserve the raw title, and display unknown locations as “Not listed in source”. These clues never establish work authorization or hiring eligibility. Family classifications expose the exact matched phrase; unmatched titles are “Unclassified”. This is precision-oriented search assistance, not a fit score.

## Refreshing the snapshot

1. Open the completed owner-reviewed discovery workflow run [40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573) and download `public-opportunities.json` from its `discovery-scan-report` artifact. Do not run a new scan or dispatch a workflow as part of this procedure without separate authorization.
2. Inspect the artifact; it contains public role-link data only. Keep private candidate/application data out of it.
3. Replace `src/data/public-opportunities.json` with that JSON without changing fields or status semantics. Remove the synthetic fixture marker in `src/lib/opportunities/snapshot.mjs` only when the reviewed real file is committed.
4. Validate it. The test suite checks the committed snapshot and rejects unsupported/missing fields, status values, duplicate IDs and unsafe URLs. Run `npm test`, `npm run format:check`, `npm run lint`, `npm run typecheck`, and `npm run build` in the approved CI path; inspect all failures before committing.
5. Review the title-derived golden cases against real snapshot titles, keeping the negative examples (“Recruiter”, “Revenue Accounting Manager”, and “Senior Finance Partner”) unclassified.
6. Commit the new snapshot together with updated tests and `STATUS.md`. Keep it on the Phase 5a branch for review; do not publish or deploy it during this phase.

The current checked-in snapshot is explicitly synthetic and uses placeholder URLs. It is for implementation/testing only and must not be treated as real job data.
