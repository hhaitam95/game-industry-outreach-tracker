# Public opportunity snapshot contract

## Purpose and trust boundary

The tracked sample at `src/data/sample-public-opportunities.json` is a test/fallback dataset, not scan results. It contains 15 synthetic Riot-style titles, all `last-seen`, a plainly synthetic `generatedAt` date, and `example.com` placeholder posting links. The explorer must show **“Sample data - not a real scan”** when using it.

The generated `src/data/public-opportunities.json` is gitignored. It is a local, build-time input produced by `npm run data:sync`; it must not be committed. The authoritative generated public projection is stored on the `discovery-state` branch at `public/public-opportunities.json`, not on `main`. Never put candidate profiles, CV data, personal notes, contacts, application history, credentials or secrets in the public projection.

The frontend does not fetch career sites or role data at runtime. The sync CLI can read a local file or HTTPS URL when explicitly run. A `last-seen` role was observed by a configured source at a recorded time; that does not prove the role remains open. Incomplete listings and absence are not closure evidence.

## Snapshot envelope

The normative schema is `schemas/public-opportunity-snapshot.schema.json` (JSON Schema Draft 2020-12). JavaScript and Python load this file directly; neither consumer maintains a second field or status allowlist. Contract tests in both languages use the same valid and invalid fixtures, alongside the synthetic app fallback.

The JSON root contains exactly these fields:

- `schemaVersion`: integer `1`.
- `generatedAt`: parseable date/time for snapshot generation.
- `opportunities`: array of public role-link records.

## Exact 16-field role allowlist

Each role object contains exactly these fields, defined by `$defs.publicOpportunity.properties` in the shared JSON Schema.

| Field | Contract |
| --- | --- |
| `id` | Non-empty unique public role identifier within the snapshot. |
| `studioId` | Stable studio identifier from the public catalogue. |
| `studioName` | Public display name of the studio. |
| `title` | Raw title/listing text; preserve it and do not overwrite it with parsed values. |
| `url` | HTTPS posting/link URL without embedded credentials. |
| `locations` | Source-projection array; an empty array means unknown/not listed. |
| `employmentType` | Source-projection array; an empty array means unknown/not listed. |
| `datePosted` | Source-provided date or `null`; do not infer it from other timestamps. |
| `validThrough` | Explicit validity date or `null`; do not infer closure from absence. |
| `status` | One of `announced`, `last-seen`, `stale`, `needs-review`, `unavailable`. |
| `sourceUrl` | HTTPS source URL without embedded credentials. |
| `firstSeenAt` | Original observation timestamp. |
| `lastSeenAt` | Most recent recorded observation timestamp; not an open-status guarantee. |
| `lastChangedAt` | Timestamp of the most recent recorded change. |
| `observedAt` | Timestamp of the observation represented by this record. |
| `contentHash` | Public content fingerprint produced by the projection pipeline. |

Both validators interpret the shared schema, including exact fields, status enum, collection shapes, RFC 3339 timestamps, ISO dates, HTTPS URLs without credentials, and unique role IDs (`x-uniqueBy`). The sync script uses the JavaScript validator and validates before touching the destination. The persistence job uses the same schema in Python before writing to `discovery-state`.

A historical five-record public-data fixture under `tests/fixtures/public-opportunities/` was captured from a reviewed public scan on 2026-10-27 and reduced to representative records. It exists only as offline contract test data; it is not a complete snapshot and must never be presented as current job availability. An invalid-status fixture is shared between the JavaScript and Python tests.

## Title-derived clues and provenance

The snapshot's source-provided fields include the raw title, not structured seniority, parsed city/country, contract or relocation flags. Phase 5a derives only explicit title clues:

- a trailing `City, Country` or supported city-state pattern,
- seniority keywords,
- literal `(Contract)`,
- literal `Relocation`,
- role family from precise, unambiguous phrases.

All derived values are labelled **“parsed from listing text”**. The raw title is preserved; unknown locations display “Not listed in source”. No work authorization or hiring eligibility is inferred. Family classifications expose the matched phrase; unmatched roles are “Unclassified”. These are search hints, not fit scores.

## Automated data flow

1. The discovery workflow remains manually triggered by `workflow_dispatch` with fixture/live mode. It has **no schedule**. After this PR merges, the owner will run the live workflow once; do not dispatch it during this phase.
2. The live-scan job generates `outputs/discovery/public-opportunities.json` and stages it as `state-artifact/public/public-opportunities.json` in the existing `discovery-state-handoff` artifact.
3. The isolated persistence job downloads that artifact, checks out `main` only for the public projection validator with checkout credentials disabled, validates the private monitor-state schema and the exact public projection root/role keys, then writes `public/public-opportunities.json` to the `discovery-state` worktree.
4. The persistence job commits the validated public projection on `discovery-state` along with monitoring-state changes. No generated role snapshot is written to `main`.
5. To use the latest generated projection in a local app build, run `npm run data:sync`. The default source is `https://raw.githubusercontent.com/hhaitam95/game-industry-outreach-tracker/discovery-state/public/public-opportunities.json`.
6. For an explicit local fixture or alternate HTTPS URL, run `npm run data:sync -- --from <path-or-https-url>`. Unit tests exercise only local source files and do not use the network.
7. If the source cannot be read, JSON cannot be parsed, or validation fails, the script exits non-zero and does not create/overwrite the destination. The generated file remains gitignored. The app prefers it when present; if absent, the app falls back to the tracked sample and displays the sample banner. If a synced file exists but fails validation, the UI fails closed rather than silently substituting sample data.

## Manual refresh and approval limit

Only an explicit owner-triggered live run refreshes the authoritative `discovery-state` projection. There is no scheduled workflow and no automatic poll. Keep schedules, publication and Pages deployment disabled unless separately approved. The app does not fetch career pages or remote role data at runtime.

Never commit the generated `src/data/public-opportunities.json`; commit changes only to the sample, validator, sync tool, tests, documentation, reviewed app code and `STATUS.md`.
