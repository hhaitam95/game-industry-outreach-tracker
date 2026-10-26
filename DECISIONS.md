# Architecture and Product Decisions

This is a living decision record. Accepted decisions may be amended or superseded when evidence or requirements justify a change. Record the date, status, context, decision, consequences, and superseding decision when applicable.

## ADR-001 — Single-user personal application

- **Date:** 2026-10-24
- **Status:** Accepted baseline
- **Context:** The tool is initially intended for one candidate's personal job search and contains private profile and application data.
- **Decision:** Optimize the first version for one authorized user; do not build multi-user accounts or public access by default.
- **Consequences:** Simpler product model, but authentication and privacy remain essential if remotely hosted.

## ADR-002 — Original Python/Streamlit/SQLite proposal

- **Date:** 2026-10-24
- **Status:** Superseded for the deployed UI by ADR-013
- **Context:** The initial plan assumed a Python-backed dashboard. The user later selected GitHub Pages, which only serves static frontend assets.
- **Decision:** Use a static TypeScript/Vite frontend for the hosted UI and Python for the scheduled discovery runner. Browser-local encrypted data replaces server-side SQLite in the first release.
- **Consequences:** A static UI has no private server-side persistence or automatic cross-device sync. Revisit a backend/database only if that becomes a requirement.

## ADR-003 — No paid AI API as a first-release dependency

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The candidate wants to keep the project at zero additional cost initially.
- **Decision:** The first usable release must work without a paid language-model API. Use structured research, rules, templates, and manual AI-assisted drafting where helpful.
- **Consequences:** Some drafting/research may require the user to open an assistant separately. Future model integration must be optional, replaceable, and cost-approved.

## ADR-004 — Human approval for all outbound communication

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Outreach must be personalized and professional, not bulk spam. The user wants to send all emails personally.
- **Decision:** The application may research and prepare drafts but must not send emails or submit applications automatically. A submission is recorded only after user confirmation.
- **Consequences:** Human review remains in the workflow and provides a final factual/privacy check.

## ADR-005 — Evidence-backed discovery and claim-level freshness

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Career pages, ownership, locations and credits change, and search results may be stale or incomplete.
- **Decision:** Store sources and verification/collection timestamps for material claims; distinguish verified, potential, stale, conflicting, and unknown states.
- **Consequences:** Slightly more data-model complexity, but better trustworthiness and easier refresh/merging.

## ADR-006 — Separate studios, opportunities, routes, and company credits

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** A studio can have multiple roles, a company can publish a game it did not develop, and multiple studios may contribute to one title.
- **Decision:** Model studios independently from advertised opportunities, speculative routes, games, and company-credit relationships.
- **Consequences:** Avoids incorrect game attribution and supports multiple vacancies/application routes per studio.

## ADR-007 — No personal salary floor in discovery

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The candidate will discuss compensation directly with prospective employers and does not want salary to constrain the search.
- **Decision:** Do not implement a personal minimum salary filter or use estimated salary to exclude/demote opportunities. Salary research is optional and must be source-backed and uncertain where evidence is weak.
- **Consequences:** Estimates may inform later decisions but do not determine discovery eligibility or default fit ranking.

## ADR-008 — Location-specific salary benchmarks and transparent conversions

- **Date:** 2026-10-24
- **Status:** Accepted for optional future feature
- **Context:** A single global average is misleading across different hiring markets.
- **Decision:** Prefer market-local estimates when location is known; display USD/EUR equivalents where useful and clearly document source, date, pay basis, method, and conversion date. When location is unknown, show distinct market ranges or no estimate rather than a universal average.
- **Consequences:** Requires reliable salary sources and currency-rate data; feature remains optional until evidence quality is sufficient.

## ADR-009 — Global and flexible role discovery

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Exact support titles are rare in game studios, and transferable/adjacent roles may be viable.
- **Decision:** Search globally and consider technical support, developer support, tooling, build/release, QA, live operations, platform/DevOps, integration and other plausible roles. Explain fit and gaps instead of using exact title matching alone.
- **Consequences:** Broader search space needs transparent relevance explanations and visible eligibility unknowns.

## ADR-010 — Original private-remote-access goal

- **Date:** 2026-10-24
- **Status:** Superseded for the first release by ADR-013 and ADR-014
- **Context:** The original direction favored a privately hosted dashboard. The selected GitHub Pages plan cannot provide private server-side storage.
- **Decision:** The first release uses public static hosting for public data only and browser-local encrypted personal records. True private cloud sync requires a separately approved backend.
- **Consequences:** Manual encrypted export/import is required for cross-device transfer; a public Pages site must not be described as a private dashboard.

## ADR-011 — Living requirements and repository-backed continuity

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Requirements may change, and work may continue in another chat when model limits are reached.
- **Decision:** Keep requirements, architecture, implementation progress, decisions, changelog, and handoff in the repository. Update them after material changes. Inspect repository state before resuming work in a new chat.
- **Consequences:** Documentation maintenance is part of each meaningful milestone.

## ADR-012 — Explicit approval before commits

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The user wants a clear explanation and confirmation before a commit is created.
- **Decision:** Before committing changes, explain the files and behavior affected, summarize tests/results and limitations, and ask for explicit approval. Prefer a feature branch for material work; do not commit directly to main without explicit permission.
- **Consequences:** Remote APIs that auto-create commits require a separate approval gate; never claim they support uncommitted staging if they do not.

## Open decisions

- Which private remote host (if any) meets privacy, persistence, backup and cost requirements?
- Which first discovery sources are legally/permissibly and technically practical?
- Which file formats should the initial CV analyzer support?
- Whether a remote database is needed or SQLite with persistent storage is sufficient.
- Which salary data sources, if any, provide defensible coverage.
- Exact candidate-profile schema and disclosure permissions.


## ADR-013 — GitHub Pages for static public UI and sanitized data

- **Date:** 2026-10-24
- **Status:** Accepted direction; deployment repository still to be created
- **Context:** The user wants zero-cost, simple hosting and has selected GitHub Pages, while the current specification repository is private and contains personal project context.
- **Decision:** Keep the source/specification repository private. Use a separate public Pages deployment repository for static frontend assets and a sanitized public studio/opportunity dataset. GitHub Pages is not a private backend, and the public site must contain no candidate CV, profile, private drafts, application history, or secrets.
- **Consequences:** The current repository cannot be published directly on GitHub Free Pages because a Pages source repository must be public on that plan. A publishing workflow will need a narrowly scoped cross-repository credential stored as an Actions secret. If this arrangement proves too complex, revisit the choice before changing repository visibility.

## ADR-014 — Browser-local private data for the first release

- **Date:** 2026-10-24
- **Status:** Accepted direction; exact storage/encryption format to be tested
- **Context:** GitHub Pages cannot execute server-side code, and the first release should avoid paid services.
- **Decision:** Process selected resume files client-side and keep profile/draft/application data in encrypted browser-local storage and user-controlled encrypted export/import. Do not upload the source resume by default. Do not store raw original resume files in GitHub.
- **Consequences:** Data is per browser/device and requires manual export/import for transfer. Browser-side encryption cannot protect data from malicious frontend code executing while unlocked. A private backend is required for seamless remote multi-device synchronization.

## ADR-015 — Deterministic CV baseline with manual AI handoff

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The user wants tailored resumes in DOCX/PDF, built-in resume standards and no recurring AI API cost initially.
- **Decision:** Use client-side extraction, deterministic checks, structured resume generation and local document downloads. Provide an optional user-initiated prompt/copy/paste workflow to ChatGPT Free. Do not call model APIs from browser code or embed credentials in static assets.
- **Consequences:** Rules-based checks are explainable but cannot match all semantic reasoning or polished rewriting from a language model. Any content copied to ChatGPT is a separate user-approved disclosure to that service. Direct API use requires a later backend, cost and privacy decision.

## ADR-016 — Resume guidance is versioned source material

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Resume advice must be applied consistently and grounded in current, role-appropriate sources.
- **Decision:** Maintain synthesized guidance in docs/resume-guidelines/ with source URLs, last-reviewed dates, context, and caveats. Bundle relevant guidance at build time. Do not copy whole source articles or encode universal rules where guidance varies by country/role.
- **Consequences:** Guidance will need periodic review. Employer instructions and role-specific context override general defaults.

## ADR-017 — Daily GitHub Actions polling and conservative change detection

- **Date:** 2026-10-24
- **Status:** Accepted direction; workflow implementation deferred until source registry/runner exist
- **Context:** The user wants a daily check of known studios and visible changes to jobs and application routes.
- **Decision:** Use GitHub Actions schedule plus manual dispatch; consider triggering on registry changes. Keep schedule away from the top of the hour. Compare normalized successful observations using stable IDs/URLs and hashes. Persist scan state on a dedicated discovery-state branch, separate from main. Distinguish job closure from site unavailability and require strong evidence before marking closed. Publish only sanitized public data, and only when its normalized projection changes.
- **Consequences:** Polling is best-effort, not real-time, and only monitors known studios. Broad discovery of new studios is a separate process. Blocked/inconsistent pages require manual review; do not bypass protections.

## ADR-018 — Separate private development repository from public Pages deployment output

- **Date:** 2026-10-24
- **Status:** Accepted direction; operational details to be validated
- **Context:** GitHub Free Pages requires a public source repository, but the current source repository should remain private.
- **Decision:** Publish only built static files and the explicit public data contract to a separate public deployment repository. Use a narrowly scoped token stored in the private source repository's Actions secrets, never in frontend code, public data or logs. Include only verified public company/job facts in that output.
- **Consequences:** Requires cross-repository deployment setup and a security review. If user prefers one repository, request explicit approval and a complete history/privacy review before changing visibility.

## ADR-019 — No secrets or private resume content in static artifacts

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** Static site source and bundled assets are inspectable by anyone who can access the public site.
- **Decision:** Never embed AI API keys, deploy credentials or other secrets in browser code or public outputs. Resume processing remains client-side by default; no file upload to Actions or GitHub Pages. Secrets used by workflows remain in GitHub Actions secret storage with least privilege.
- **Consequences:** Automatic AI calls require a separate authenticated backend. Manual AI handoff remains optional and must show what the user will share.


## ADR-020 — React + TypeScript + Vite for the static frontend shell

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The application will grow into several interactive research, resume, outreach, and tracking workflows, but the first implementation must remain a simple static site.
- **Decision:** Use React + TypeScript + Vite. Start with lightweight client-side section navigation and avoid adding a routing library until URL-based routes are needed. Keep the application build static and do not add a backend or private cloud storage in this phase.
- **Consequences:** The component model supports incremental growth and type checking. The initial navigation is not yet deep-linkable; that can be revisited when real workflows are implemented.

## ADR-021 — Cloud-first CI with a privacy-conscious optional local report

- **Date:** 2026-10-24
- **Status:** Accepted
- **Context:** The user prefers results to be available directly from GitHub Actions and wants local testing minimized while retaining a simple way to share environment-specific failures.
- **Decision:** Run formatting, lint, type checking, unit tests, and a static subpath build in GitHub Actions on branch pushes and pull requests. Provide documented optional macOS/VS Code setup and a single-command local report. The report records versions, changed path names, check results, and selected sanitized diagnostics; it does not include raw logs, source contents, or diffs.
- **Consequences:** Cloud CI is authoritative for committed revisions. Local reports are a diagnostic aid only; pattern-based redaction cannot guarantee that every possible sensitive detail is recognized, so the report warns users to review it before sharing.


## ADR-022 — Encrypted browser-local vault and backup envelope

- **Date:** 2026-10-25
- **Status:** Accepted implementation; automated browser acceptance passed
- **Context:** Phase 2 needs private records without a server, paid service, or automatic cloud sync.
- **Decision:** Store only versioned AES-256-GCM encrypted envelopes in IndexedDB. Derive a non-extractable key from the user passphrase with PBKDF2-HMAC-SHA-256 at 600,000 iterations. Use a fresh random IV for each encryption. Encrypted JSON export/import is bounded to 5 MiB. Strict schemas reject unknown fields and do not model raw resume contents. The user must confirm before import replaces local records.
- **Consequences:** A lost passphrase cannot be recovered; exports need separate safe backup handling. The vault is browser/device local and is not protection from malicious scripts while unlocked. The combined dummy-data browser acceptance passed in run [40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974); this demonstrates tested behavior, not a security audit, before real personal data is used.


## ADR-015 — Phase 3 starts with a small manual public studio catalogue

- **Date:** 2026-10-25
- **Status:** Accepted
- **Context:** Realistic studio records are needed to exercise the UI and data model, but automated research is premature before relationships, source evidence, and schema validation are reliable. Personal applications already live in the encrypted browser-local workspace.
- **Decision:** Start with four manually curated studio records (CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games). Store studios, sites, ownership relationships, games, credit roles, opportunities, application routes, source evidence, and change events as distinct entities with stable IDs and validation. Every seeded studio and verified career route must link to direct official source evidence. Keep opportunities and change events empty until observed, and keep the public registry separate from private candidate/application records.
- **Consequences:** The UI can display sourced details without pretending to discover live openings. Manual source refresh is required; the catalogue is neither comprehensive nor continuously monitored. Any future integration between public studios and private application records must be designed and approved separately.
