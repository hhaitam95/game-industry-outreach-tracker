# ADR-061 — M2 speculative-route domain contract

- Date: 2026-10-29
- Status: Design completed before implementation; approved for the M2 implementation branch.
- Goal: Introduce the smallest versioned public data contract for official speculative-application routes. This is a separate model from legacy advertised vacancies and generic career links.
- Compatibility: Keep the existing opportunity snapshot contract and studio catalog unchanged. M2 adds a parallel route directory; it does not promote existing career pages into speculative routes.

## Contract v1

- The directory envelope contains schemaVersion, generatedAt, studios, and routes. The JSON Schema is the source of structural truth and is loaded by the JavaScript and Python validators without adding a dependency.
- A minimal studio has a stable lowercase slug, display name, official website URL, and optional home-country code. A route references a known studio ID.
- Every route contains an HTTPS application-route URL and HTTPS evidence URL, route type, lifecycle status, country scope/codes, language, discipline tags, work model, matched-phrase category, a short original paraphrase, SHA-256 content hash, first-seen and last-checked timestamps, and nullable last-verified timestamp.
- Route types are dedicated-page, ATS posting, email-invite, or talent-community. Talent-community routes stay separately labelled and must use the talent-pool phrase category; they must not be represented as direct speculative routes.
- Lifecycle states are candidate, verified, needs-review, and stale. The validator enforces timestamp chronology, route-to-studio references, unique IDs, URL safety, country-scope consistency, and the required verification date for verified/stale records. A candidate cannot claim a previous verification date.
- HTTPS/credential-free URL validation does not prove that a site is official. Verified status remains a human evidence decision: fetch the official studio page or studio-owned ATS page directly, confirm an invitation without a specific vacancy or deadline, and write an original paraphrase rather than copied page text.
- A failed or blocked fetch never establishes closure. Preserve last-known evidence; move the record to needs-review when evidence changes or cannot be checked. Staleness is a status decision, not an inference from a missing route.

## Loading and data boundary

- Keep the curated source at src/data/speculative-route-directory.json. Until a route is curated, the loader uses the separately named synthetic sample dataset and returns origin=sample so a future UI can label it honestly.
- A populated and valid curated dataset returns origin=curated. An invalid curated dataset fails closed with an error; it must never silently fall back to sample data.
- The initial curated dataset is empty. M2 does not seed real studios/routes, perform live fetches, or treat the existing generic careers routes as qualifying evidence.
- Public data is allowlisted. No applicant profile, CV, application history, recruiter email address, personal contact note, secret, or copied official-page content is part of this contract.

## M2 definition of done

1. Add a strict versioned JSON Schema with no undeclared properties, and use it in the JavaScript and Python validators.
2. Enforce the same URL, field, reference, uniqueness, route-type, country-scope, verification-status, and timestamp invariants in both languages.
3. Provide the empty curated dataset, clearly synthetic sample dataset, deterministic loader origin, and fail-closed handling of malformed curated data.
4. Add offline unit tests in JavaScript and Python for valid data and negative/security cases; keep existing vacancy validation unchanged.
5. Keep the workflow manual-only, add no dependency or permission, make no network request to an official site, and trigger no publication.
6. Update PROJECT_SPECS.md, changelog.d, and STATUS.md; require Frontend CI, discovery fixture tests, and browser acceptance to pass on the exact M2 PR head.

## Rollback

Revert the M2 route schema, validators, fixture data, tests, and related documentation together. Do not change the legacy opportunity contract or infer speculative acceptance from it.
