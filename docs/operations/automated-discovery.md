# Automated Studio Discovery Design

**Status:** Design plus first implementation increment; live-source behavior and scheduled operation are not yet accepted  
**Last reviewed:** 2026-10-24

**Implementation note (2026-10-26):** `scripts/discover_studios.py`, `scripts/discovery/pipeline.py`, `config/studio-registry.json`, fixture tests, and manual-only workflows now exist on `feat/phase4-discovery-pipeline`. The 29-test offline suite passes. No live scan has been reviewed; the link-only adapters deliberately do not infer closure from absence; the Santa Monica Studio adapter remains manual-review only. No schedule or publishing step is enabled.

## Purpose

Monitor a curated registry of studios and official career/application sources for changes to vacancies and speculative application routes. This workflow monitors known studios; broad worldwide discovery and adding new studios is a separate task.

## Workflow location and triggers

Planned workflow: .github/workflows/discover-studios.yml in the private source repository.

Triggers:
- Daily schedule at a non-top-of-hour time, initially proposed as 04:23 Europe/Budapest.
- workflow_dispatch for manual testing and reruns.
- Optional push trigger for changes to the curated source registry.

GitHub scheduled workflows execute from the default branch, may be delayed or dropped under high load, and require the workflow file to exist on the default branch. In public repositories, scheduled workflows may be disabled after 60 days of no repository activity. Do not promise exact execution time; include manual recovery.

Official references:
- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
- https://docs.github.com/en/actions/how-tos/troubleshoot-workflows
- https://docs.github.com/en/actions/security-guides/automatic-token-authentication

## Pipeline

1. Load and validate the curated studio registry.
2. Load last known normalized state from the private discovery-state branch.
3. For each enabled source, request the official public source within configured per-domain rate limits.
4. Use a supported official public board API/feed/structured data when available; otherwise use a source-specific parser for the official careers page.
5. Normalize the observation, derive a stable studio/role/route ID, calculate changed fields and source hashes, and attach evidence.
6. Apply conservative state transitions.
7. Commit the updated private monitoring state to a dedicated discovery-state branch so last-seen timestamps, repeated-absence counters and source failure history survive. Do not write routine scan state to main.
8. Build a public-data projection from an allowlist.
9. Validate the projection against a schema and privacy tests.
10. If the normalized public projection changed, publish the static build and public dataset to the separate public Pages repository using a narrowly scoped GitHub Actions secret. If the public projection is unchanged, do not write a public commit.
11. Emit a concise summary of checked, updated, new, closed, stale, blocked and failed records. Never log full CV content, application history, secrets or personal draft text.

## Registry proposal

Each registry entry should include:
- stable internal studio ID;
- canonical studio name and official domain;
- careers/application URL;
- source adapter type and any public board identifier;
- enabled/disabled flag;
- optional location/context notes;
- last reviewed date and researcher note.

Do not store API keys or private contacts in the public registry. If a source API needs a credential, keep it as an Actions secret with minimum scope and do not expose it to the frontend.

## Normalized observations

For a vacancy, store when available:
- stable provider ID or canonical URL-derived ID;
- studio ID, title, normalized locations, department/team, workplace type;
- official description or selected relevant text plus content hash;
- official application URL;
- first seen and last seen;
- last meaningful change, status, source and verification metadata.

For a speculative route, store:
- stable route ID, route type, official URL;
- application instructions and accepted disciplines when explicitly stated;
- public generic recruitment contact where useful;
- last verified date, source evidence and route status.

Avoid storing entire HTML pages. Store the normalized fields needed for comparison, evidence URL, small factual excerpt where appropriate, and content hashes.

## Change detection

Normalize HTML-derived text, whitespace, relative/canonical URLs, dates and location values before comparing. Compare stable IDs and normalized fields; keep prior values/history when a field changes.

Suggested events:
- new opportunity/route;
- material update and fields changed;
- application URL or contact-route change;
- explicitly closed or confirmed missing;
- stale data;
- source unavailable/blocked;
- parse failure/needs review.

Use source IDs when available. When not, use canonicalized URLs plus studio identity. Avoid making a changing tracking query parameter create duplicate records.

## Conservative close/stale rules

- An explicit closure in an official source is strong evidence.
- A job missing from a successful full listing may be considered a closure candidate; require repeated successful absence or direct confirmation before marking it closed.
- A timeout, HTTP 403, CAPTCHA, challenge page, parse exception, empty error page, or intermittent 404 is not proof that the job closed.
- When a source fails, preserve the last known job/route and set the source or record to stale/unavailable/needs-review.
- If the official application URL changes, retain history and add a route_changed event rather than silently replacing the old value.
- Do not issue aggressive retries. Use bounded retries, request timeouts, per-domain delay and conditional requests when available.

## Inconsistent and blocked sources

Preferred handling order:
1. Official job-board endpoints or documented public APIs, if access is permitted.
2. Public ATS pages, JobPosting structured metadata, sitemaps, RSS/feeds or official public listings.
3. Source-specific extraction from official career pages.
4. Manual-review task with the last working URL and error category.

Do not bypass authentication, CAPTCHA, anti-bot controls, or access rules. If content requires client-side execution or is unreliable, mark it as requiring manual review instead of attempting circumvention.

## Publishing boundary

The public deployment repository may contain:
- company/studio facts intended for public display;
- publicly advertised job metadata and official URLs;
- verified public speculative application routes;
- public source/verification dates and change summaries.

It must not contain:
- candidate profile, resume text/files or generated resume files;
- private drafts, application statuses linked to the candidate, emails, interview notes or outcomes;
- private personal contact notes;
- action tokens, API keys, or other credentials.

Use an explicit allowlist projection from internal records; do not publish the entire private state file.

## Commit/update policy

- Keep a last-known snapshot/state sufficient for comparisons.
- Write private scan state to a dedicated discovery-state branch; this branch may receive one update commit per run so freshness and repeated-absence counters are durable, while keeping main focused on source code and configuration.
- Public update commits should occur only when the normalized public data projection materially changes.
- Do not publish a per-run timestamp that causes the public site repository to commit daily without a data change. Display last data publication time on the site; use GitHub Actions run history/summary for latest scan time.
- Keep the latest workflow run summary in Action logs/summary; do not include sensitive record details.
- Validate the data schema and public allowlist before publishing.

## Permissions and secret handling

- Restrict workflow permissions. Use contents: write only for the job that updates its own repository's data/state.
- The default GITHUB_TOKEN should not be assumed to write to another repository. Cross-repo publication needs a separate token or GitHub App credentials stored as Actions secrets.
- Scope the token to the deployment repository and only the required write permission; use expiry/rotation.
- Do not echo secrets, pass them to client builds, include them in source maps, or include them in uploaded artifacts.
- Pin third-party actions by full reviewed SHA when practical.
- Avoid running publishing jobs on untrusted pull-request code.

## Testing before enabling daily schedule

- Parser tests using saved synthetic fixtures.
- Change tests for new, unchanged, updated, closed-after-confirmation, blocked, timeout, parse failure, changed application URL, and duplicates.
- Tests proving failures never trigger a closed status.
- Tests proving only allowlisted public fields reach the deployment dataset.
- Manual dispatch on a small, verified studio registry.
- Confirm workflow permissions, publish token scope, public artifact contents, and Pages build before enabling the daily schedule.
