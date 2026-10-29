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
- **Status:** Deferred to Phase 8; no deployment plan approved
- **Context:** GitHub Pages is public static hosting. An earlier plan proposed a separate deployment repository because the source repository was assumed to be private; the repository is now public.
- **Decision:** Defer the choice of Pages source, deployment target, and publishing architecture to Phase 8. This repository must continue to contain no private candidate records, resumes, drafts, application history, contact details, or secrets. No deployment, publishing, or visibility change is approved during stabilization.
- **Consequences:** No publishing workflow or credential is to be created in this phase. Revisit source/target choice, allowlisted public fields, permissions, and artifacts during the Phase 8 privacy review.

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
- **Status:** Deferred to Phase 8
- **Context:** A separate public deployment repository was previously proposed while the source repository was intended to be private. The repository is currently public, so that prior design is not a finalized hosting decision.
- **Decision:** Do not create a separate deployment repository, publishing token, or publication workflow in this phase. At Phase 8, compare the available hosting options and obtain explicit owner approval before implementing one.
- **Consequences:** Current work is limited to local/static implementation and validation; no public deployment or visibility change is approved.

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
- **Decision:** Store only versioned AES-256-GCM encrypted envelopes in IndexedDB. Derive a non-extractable key from the user passphrase with PBKDF2-HMAC-SHA-256 at 600,000 iterations. Use a fresh random IV for each encryption. Serialized workspaces are capped at 32 MiB UTF-8 and encrypted envelopes/exports at 48 MiB; the limits are shared across schema and encryption validation. Strict schemas reject unknown fields and do not model raw resume contents. The user must confirm before import replaces local records.
- **Consequences:** A lost passphrase cannot be recovered; exports need separate safe backup handling. The vault is browser/device local and is not protection from malicious scripts while unlocked. The combined dummy-data browser acceptance passed in run [40340000974](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40340000974); this demonstrates tested behavior, not a security audit, before real personal data is used.


## ADR-023 — Phase 3 starts with a small manual public studio catalogue

- **Date:** 2026-10-25
- **Status:** Accepted
- **Context:** Realistic studio records are needed to exercise the UI and data model, but automated research is premature before relationships, source evidence, and schema validation are reliable. Personal applications already live in the encrypted browser-local workspace.
- **Decision:** Start with four manually curated studio records (CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games). Store studios, sites, ownership relationships, games, credit roles, opportunities, application routes, source evidence, and change events as distinct entities with stable IDs and validation. Every seeded studio and verified career route must link to direct official source evidence. Keep opportunities and change events empty until observed, and keep the public registry separate from private candidate/application records.
- **Consequences:** The UI can display sourced details without pretending to discover live openings. Manual source refresh is required; the catalogue is neither comprehensive nor continuously monitored. Any future integration between public studios and private application records must be designed and approved separately.


## ADR-024 — Link-only opportunity status is last-seen

- **Date:** 2026-10-27
- **Status:** Accepted
- **Context:** A link-only adapter can extract public job links, but a role disappearing from a link listing is not verifiable evidence that the job was closed. Marking such roles as announced would imply a current-open status that the collector cannot prove; closing them after absence would overstate evidence.
- **Decision:** Publish observed roles from `official-job-links` sources with status `last-seen`, accompanied by the existing `lastSeenAt` timestamp. For these sources, absence from complete or incomplete link listings never increments the closure counter and never closes a role. Only explicit source closure or an expired `validThrough` value can close it. The public projection validator accepts `last-seen`; existing allowlisted fields remain unchanged.
- **Consequences:** Users see when the role was last observed without a claim that it is currently open or verified closed. Link-only records remain visible until explicit closure or expiry evidence appears.


## ADR-025 — Stabilization defaults and deferred scope

- **Date:** 2026-10-27
- **Status:** Accepted
- **Context:** Step 1 is being developed on a public repository. The owner approved in-scope commits and explicitly accepted the GitHub write tool's default commit-author metadata for this repository, including the existing Gmail author metadata in commit history.
- **Decision:** Use the default GitHub write-tool author for this repository; do not embed email addresses or personal contact details in tracked files. Defer Pages hosting/source-target selection and any deployment or publishing setup to Phase 8. Defer speculative-application routes until a later, explicitly scoped and source-backed phase; do not add inferred or unsupported routes. Schedules, live scans, publishing, deployment, and visibility changes remain outside the current approval.
- **Consequences:** Stabilization may continue with synthetic fixtures and verified public source links, without expanding the public-data surface or making irreversible repository changes.


## ADR-026 — Accept Phase 4 for manual-only monitoring with explicit coverage limits

- **Date:** 2026-10-27
- **Status:** Accepted
- **Context:** The Phase 4 pipeline passed its fixture suite and a single owner-directed live run on merged `main` commit `d052b51` ([run #40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573)). The run produced useful Riot Games role links, but the careers listing did not prove completeness. CD PROJEKT RED and Naughty Dog returned no matching configured role links, and Santa Monica Studio still requires a permitted adapter.
- **Decision:** Accept Phase 4 for manual-only best-effort monitoring. Keep link-only roles at `last-seen`; never close roles due to an incomplete or failed source; retain exact public-field allowlisting; and keep schedules, publication, and deployment disabled. Treat unsuccessful/unparseable sources as `needs-review`, not empty listings. Phase 5 consumes a reviewed, allowlisted projection bundled at build time and does not fetch career sources at runtime.
- **Consequences:** The current scan is not a comprehensive four-studio result and does not prove that any projected role is currently open. Source-specific adapter review remains needed. The public projection exists as a short-lived Actions artifact only; the separate deployment/publication decision remains deferred to Phase 8.


## ADR-027 — Split Phase 5 into research UI and profile-dependent matching

- **Date:** 2026-10-27
- **Status:** Accepted
- **Context:** Public role links and source freshness can be researched without a candidate profile, but fit scores, skill-gap explanations and a durable manual-lead workflow need user-owned profile context and an active browser vault session. Titles sometimes contain location or contract/seniority clues, but these are not structured source data and cannot establish hiring eligibility.
- **Decision:** Deliver Phase 5a as a static, build-time explorer over the strict public snapshot with filters, freshness indicators, precise keyword family classification and clearly labelled title parsing. Preserve the raw title and mark derived location, seniority, contract and relocation as `parsed from listing text`. Never infer work authorization or hiring eligibility. Defer fit scoring, skill-gap explanations and the manual leads workflow to Phase 5b after the candidate profile exists and the browser vault session is available.
- **Consequences:** Phase 5a must explain uncertainty and not claim that a last-seen role is open. Derived clues can support search only; they are not source-provided facts. Phase 5b requires a separate scope review around candidate-profile/vault access and must not expose private profile data in the public snapshot.


## ADR-028 — Store generated public opportunity data on discovery-state

- **Date:** 2026-10-27
- **Status:** Accepted
- **Context:** The public opportunity projection is generated from owner-triggered discovery runs. Committing the generated snapshot to `main` would mix generated observations with reviewed application source and force generated data into ordinary code review. The frontend is static and must not fetch role data from career websites at runtime.
- **Decision:** Keep `src/data/public-opportunities.json` as a gitignored local build input. The tracked `src/data/sample-public-opportunities.json` is the deterministic fallback for tests and for builds without a synced projection. The `data:sync` command fetches the validated projection from `discovery-state/public/public-opportunities.json` (or accepts a local file/HTTPS URL), validates before writing, and does not commit it. The manual discovery workflow writes the validated generated projection to `public/public-opportunities.json` on `discovery-state`, alongside operational monitoring state. Keep the discovery workflow on `workflow_dispatch` only; do not add a schedule.
- **Consequences:** `main` tracks code and the explicit sample only, not generated role observations. The UI says “Sample data - not a real scan” when the synced file is absent. Fresh data becomes available to a local build after the owner runs `npm run data:sync`; the app itself performs no remote data fetch. Future scheduling requires separate approval.


## ADR-029 — Standing engineering standards for remaining phases

- **Date:** 2026-10-27
- **Status:** Accepted
- **Goal:** Make implementation quality predictable across every remaining phase, starting with the in-flight Phase 5a review.
- **Boundaries:** Apply the standards to engineering process and implementation; do not implicitly expand product scope, merge PRs, run live discovery, enable schedules, publish, deploy, or alter permissions.
- **Contracts and architecture:** One versioned schema per boundary, shared by consumers and tested in every consuming language; pure domain logic, then I/O adapters, then UI.
- **Failure handling:** Strict validation fails closed; operations are idempotent; failed or uncertain input preserves the last known good state and raises a visible review signal.
- **Test plan:** Deterministic success/negative/failure tests, public-data golden fixtures, synthetic fixtures, component tests for meaningful UI logic, and CI checks tied to the final commit.
- **Delivery:** Design note and definition of done before each phase/unit; cohesive PRs, self-reviewed diff, same-commit behaviour docs, and a single STATUS.md source for volatile verification state.
- **CI rule:** Read configuration before editing; do not use CI as a formatter/linter REPL. Fix all logged failures in one planned change and allow at most two CI cycles per unit.
- **Rollback:** Revert the cohesive change while preserving existing source data, discovery state, branches, and open review decisions.
- **Closeout:** Record deviations and reasons; report verified evidence and limitations without claiming unobserved success.


## ADR-030 — Shared JSON Schema for public opportunity snapshots

- **Date:** 2026-10-27
- **Status:** Accepted
- **Goal:** Eliminate duplicated public opportunity field/status definitions across the frontend/sync CLI and discovery runner.
- **Boundaries:** Standardize validation of the versioned public snapshot envelope and records; do not change the product field allowlist, source collection behavior, or job-status semantics.
- **Data contract:** `schemas/public-opportunity-snapshot.schema.json` is authoritative for the root, exact 16-field record shape, types, status enum, dates, timestamps, HTTPS URL patterns, and unique record IDs.
- **Consumers:** JavaScript and Python load the same schema. Their small validators implement only the schema vocabulary used by this contract; they do not declare a second copy of the field/status rules.
- **Failure modes:** Invalid shape, unsupported status, unsafe URL, duplicate ID, invalid type, or malformed date/time fails closed; sync and persistence preserve last-known-good output on failure.
- **Test plan:** Both languages validate the same historical public-data golden fixture and reject the same invalid-status fixture, with additional type/date/URL and failure-path cases.
- **Rollback:** Revert the schema and its consumers/tests/docs together; do not modify or erase discovery-state.
- **Closeout:** Keep fixtures offline; document that historical public links are schema evidence only, not current availability.


## ADR-031 — Keep the opportunity explorer modular and component-tested

- **Date:** 2026-10-27
- **Status:** Accepted
- **Goal:** Keep the explorer comprehensible and verify its rendered user-facing trust boundary below the existing browser workflow.
- **Boundaries:** Preserve filtering, sorting, pagination, labels and snapshot-loading behavior; no product feature or data contract changes.
- **Architecture:** The explorer owns state and orchestration; filter controls and opportunity cards are focused components; parsing/classification/filtering remain pure domain modules.
- **Failure modes:** Invalid snapshots still fail closed; sample data remains visibly synthetic; parsed clues remain labelled and never imply current availability.
- **Test plan:** Add a component-render test using Vite SSR and React DOM; retain offline unit tests and browser acceptance for interactive filtering.
- **Rollback:** Revert the component extraction and test, preserving schema and discovery state.
- **Closeout:** Review file sizes and report deviations in STATUS.md; acceptance depends on current CI for the final head.


## ADR-034 — Separate discovery tests by responsibility and remove unused test configuration

- **Date:** 2026-10-27
- **Status:** Accepted
- **Goal:** Keep the discovery test suite navigable and enforceable without changing its assertions or production behavior.
- **Boundaries:** Test code organization and obsolete Python tool configuration only; no discovery source, data contract, workflow permissions, or operational state changes.
- **Structure:** Shared helpers live in `tests/discovery_test_support.py`; parsing/adapters, state transitions, and boundary/workflow tests are separate unittest modules.
- **Runner:** CI continues to use `python -m unittest discover -s tests -p 'test_*.py'`; pytest settings were removed because pytest is not run in CI.
- **Failure modes:** Test discovery must include every moved class exactly once, and fixtures remain offline.
- **Test plan:** Existing discovery tests are moved without changing method bodies; the discovery workflow and frontend/browser checks gate the refactor.
- **Rollback:** Revert the test-module moves and configuration cleanup; no production code or discovery-state is changed.
- **Closeout:** New test/support modules must remain below the approximate 300-line limit; record any deviation in STATUS.md.


## ADR-037 — Phase 6a browser-local resume intake and extraction

- **Date:** 2026-10-28
- **Status:** Implementation delivered; acceptance pending exact-head CI. This does not approve the remainder of Phase 6.
- **Goal:** Replace the Resume Lab placeholder with local document intake and text extraction, and expose repository-managed resume guidance in the bundled app.
- **Boundaries:** DOCX raw text, text-based PDF text layers, and UTF-8 TXT only. No OCR, fit analysis, role comparison, editing, file generation, AI API, or automatic external handoff in this slice.
- **Contracts:** One pure extraction module owns accepted file kinds, extension/MIME checks, a 10 MiB input cap, 100-page PDF cap, 150,000-character output cap, normalized text, safe error codes, and warning categories.
- **Dependencies:** Pin Mammoth 1.13.0 for raw DOCX text and pdfjs-dist 6.4.299 for PDF text. Bundle both packages and the PDF worker locally; never render DOCX-derived HTML.
- **Privacy:** Original files and extracted text stay in the Resume Lab component state only. Do not write them to the private workspace schema, IndexedDB, logs, reports, URLs, or repository as user data.
- **Failure modes:** Unsupported/damaged/encrypted files fail with safe messages; scanned PDFs without selectable text yield an explicit OCR limitation; failures preserve the previous successful extraction.
- **Test plan:** Pure unit tests, component-render test, synthetic DOCX/PDF/TXT browser acceptance, privacy-boundary checks, and all frontend/discovery CI.
- **Rollback:** Revert the Phase 6a component/service/dependency/docs/test set together; preserve Phase 5a and discovery-state.
- **Definition of done:** Phase 6a exit criteria in IMPLEMENTATION_PLAN.md pass on the exact tested commit. Phase 6b/6c remain separately gated.

## ADR-038 — Phase 6b deterministic resume checks and evidence-aware comparison

- **Date:** 2026-10-28
- **Status:** Approved for implementation
- **Goal:** Add a transparent, deterministic baseline review and comparison against the candidate's saved profile and one selected public role or manually supplied role requirements.
- **Boundaries:** Use only browser-local extracted resume text, the active encrypted-vault profile, the selected opportunity's public fields, and role text the user chooses to paste. Do not add AI APIs, network fetches, scoring/ranking, eligibility inference, automatic applications, or persistence of resume text/analysis/role descriptions.
- **Data contract:** Put pure analysis in src/lib/resume/analysis.mjs. Inputs are explicit value objects; outputs are bounded finding codes, labels, evidence terms, and counts. Never put raw resume lines, names, email addresses, phone numbers, or pasted role descriptions into diagnostic logs or durable records.
- **Role limits:** The public opportunity snapshot has role titles and metadata, not complete job requirements. When there is no user-pasted description, compare only against the selected role title and label that limitation. A synthetic snapshot must remain visibly synthetic; last-seen is not proof of current availability. The user-pasted description remains in component memory only.
- **Profile access:** While the encrypted vault is unlocked, make the projected profile available to Resume Lab in app memory. Keep the workspace schema unchanged. Explicit lock/delete clears the shared profile projection; page reload/close clears all app memory. Unsaved profile edits may be used only as visibly in-memory context and are not written unless the user saves them.
- **Comparison semantics:** Exact normalized phrase/token presence only. “Not found” means no matching text was detected, not that the candidate lacks the skill. Never infer missing competence, authorization, sponsorship, salary, or role eligibility. Do not show fit percentages or a single match score.
- **Baseline checks:** Provide word/character/line counts, bounded section-heading detection, link/contact-pattern counts without echoing matched values, and explicit informational/review labels. These checks guide human review; they do not declare a resume valid or invalid.
- **Failure modes:** Empty input, unavailable/locked profile, invalid role selection, excessively long input, and an empty or malformed pasted description must yield deterministic, safe UI states. Analysis must preserve the successful extraction; no raw diagnostics or excerpts are logged or persisted.
- **Test plan:** Pure unit tests for normal/empty/long input, case/Unicode normalization, token boundaries, matches and non-matches, limitations, and no unsupported conclusions; component-render tests for privacy/source caveats and review language; browser acceptance with synthetic profile/resume/role inputs; all exact-head frontend, privacy, browser, and discovery CI.
- **Definition of done:** The Resume Lab presents understandable baseline findings and explicit profile/role evidence; the current snapshot's synthetic/last-seen caveats remain visible; the user can clear the extracted text and role text; no resume content or report is persisted, logged, uploaded, or placed in public files; all acceptance checks pass on the final Phase 6b commit.
- **Rollback:** Revert the Phase 6b analysis module, UI/context integration, tests, and docs together; do not alter the encrypted workspace schema, existing vault data, public snapshot, or discovery-state.


## Implementation note — Phase 6 CI repair (2026-10-29)

- After two exact-head CI repair passes, the formatter-diagnostic step isolated the remaining format failure to the JSX opening-tag indentation in `src/components/ResumeLab.tsx`.
- Apply the exact logged Prettier diff directly. The diagnostic step is observability only; it does not commit formatter output or modify the checked-out branch.
- Treat the automatically triggered checks after this exact correction as the final acceptance gate for Part 1, not as another exploratory formatting iteration. If a non-formatting blocker remains, stop guessing and record the simplest safe disposition here before changing more code.

## ADR-039 — Phase 6 browser acceptance evaluates resume-analysis state

- **Date:** 2026-10-29
- **Status:** Approved for implementation
- **Goal:** Make the browser smoke test read the result of the baseline-analysis assertion rather than a function object.
- **Finding:** The prior PR browser run failed in the baseline/private-profile comparison step; source inspection found an uninvoked arrow-function expression.
- **Boundary:** Change the browser test harness and verification notes only; no production UI, vault schema, or stored data changes.
- **Privacy contract:** Use synthetic resume, profile and role text only; do not print or persist browser values, passphrases, raw logs, or page content.
- **Failure mode:** Missing assertion results or failed privacy checks still fail the smoke test; do not weaken assertions.
- **Test plan:** Exact-head Frontend CI, browser acceptance, and discovery fixture workflows. The browser path must complete all steps with no observed outbound requests.
- **Definition of done:** All three workflows pass on the current PR head; Phase 6a+6b is not accepted until then.
- **Rollback:** Revert the single browser-test repair and associated evidence notes; preserve the product code and prior phase branches.

## ADR-040 — Browser acceptance navigates to the application view

- **Date:** 2026-10-29
- **Status:** Approved for implementation
- **Goal:** Make the browser acceptance test verify the newly created application in the UI that actually displays the application list.
- **Finding:** After the new Resume Lab step, the test remained on Resume Lab; the Settings component stayed mounted but hidden, so its form could be filled without its saved application being visible in the document.
- **Boundary:** Test harness only; preserve application storage and encryption behavior.
- **Privacy contract:** The application record remains synthetic and local to the browser vault; no real candidate or application data is used.
- **Failure mode:** Fail if Settings navigation or the expected visible confirmation is missing; do not skip the application assertion.
- **Test plan:** Current PR browser acceptance plus frontend CI and discovery fixture checks on the same commit.
- **Definition of done:** All browser acceptance steps pass and the application record is visible after navigation to Settings.
- **Rollback:** Revert only the smoke-harness navigation and this note if evidence disproves the finding.

## ADR-041 — Lockfile tarballs must use the canonical npm registry

- **Date:** 2026-10-29
- **Status:** Approved for implementation
- **Goal:** Prevent registry-mirror URLs from entering the public dependency lockfile.
- **Boundary:** Preserve package versions and integrity hashes; change the one mirror URL and add a standard-library validator, tests, and CI check.
- **Contract:** A resolved tarball must use HTTPS with the exact origin `https://registry.npmjs.org`; reject malformed URLs, credentials, HTTP and lookalike hosts.
- **Failure mode:** The check exits nonzero and reports only the lockfile package path and a fixed reason, never the full URL.
- **Test plan:** Deterministic offline tests for allowed URLs, mirror/lookalike hosts, HTTP, credentials, malformed values and malformed lockfile shape; execute in Frontend CI.
- **Definition of done:** All 194 current resolved URLs validate against the canonical origin, unchanged integrity hashes, test suite and CI step pass.
- **Rollback:** Revert the registry validator/test/CI/package changes and URL substitution as one commit; retain the previous lockfile integrity hashes.

### ADR-041 implementation note — first CI cycle

- Registry validation, the registry check script, and all seven new allowlist tests passed; all 74 unit tests, lint, type check, audit, and build also passed.
- `format:check` failed only because Prettier compacted three nested assertion calls in `tests/lockfile-registry.test.mjs`; CI printed the exact formatting-only diff.
- The test file was adjusted to match that diff. This is the second and final CI cycle for this unit; no dependencies, workflow triggers, or permissions were changed.


### ADR-041 outcome

- **Verified commit:** 906ca9388a3665e51b0fef1a7ad4870b4a2f9365.
- The registry validator, seven dedicated tests, full unit suite, format/lint/typecheck/audit/build, browser acceptance, and discovery fixtures passed on the final PR head. The one formatter-only failure was corrected using the diagnostic diff on CI cycle 2.
- All 194 resolved package URLs use https://registry.npmjs.org; the replaced package integrity hash is unchanged.

## ADR-042 — Bound resume parsing and terminate timed-out workers

- **Date:** 2026-10-29
- **Status:** Approved for implementation
- **Goal:** Bound DOCX and PDF parsing to 30 seconds while retaining the current safe error vocabulary.
- **DOCX design:** Run Mammoth in a dedicated module worker; terminate the worker on completion, failure, or timeout. Transfer only the selected file bytes; return extracted text and an allowlisted warning flag, never raw diagnostics.
- **PDF design:** Set PDF.js isEvalSupported to false and enableXfa to false; bound the document-load and text-extraction operation; call loadingTask.destroy() from finally for success, parser error, page/output limits, and timeout.
- **Error contract:** Map timeout and unknown parser failures to existing parser-failed; preserve existing too-many-pages and output-too-large. No new public error category or raw library message.
- **Test plan:** Deterministically stall injected DOCX and PDF parser promises with a short test-only timeout and assert the existing safe category/message; browser acceptance continues to extract synthetic DOCX and PDF samples.
- **Privacy boundary:** In-memory only; no OCR, storage, network API, or real resume data.
- **Definition of done:** Unit, formatter, lint, typecheck, build, browser acceptance and discovery fixtures pass on the same PR head.
- **Known limit:** The test seam can shorten but never extend the production timeout. DOCX termination relies on the dedicated worker so a parser that does not yield cannot block the UI past its deadline.
- **Rollback:** Revert the timeout module, worker, parser wiring/tests and documentation as one unit.


### ADR-042 implementation note — first CI cycle

- The first parser-hardening CI cycle reported 75 passing unit tests, passing lint, and 0 high-severity audit findings; Frontend CI failed on one Prettier wrap and two type-check issues.
- The DOCX worker callback now has an explicit result type; the timeout test uses the exact Prettier line wrapping.
- The pinned dependency is pdfjs-dist 6.4.299. Its v6.4.299 `src/display/api.js` no longer defines or consumes `isEvalSupported` as a document initialization option. The option is omitted rather than added through a cast that would imply a security setting with no supported effect. `enableXfa: false` is retained, PDF loading-task cleanup remains in `finally`, and the timeout/error mapping is unchanged.
- This is the second and final CI cycle for this unit. If further problems appear, stop after the exact formatter/type corrections and document any deferral instead of starting a third cycle.


## ADR-043 — Behavior-preserving ResumeLab component split

- **Date:** 2026-10-29
- **Status:** Implemented; exact-head CI results are tracked in `STATUS.md`.
- **Context:** `src/components/ResumeLab.tsx` combines local file intake, deterministic role/resume comparison, and the bundled guidance display in one 484-line component.
- **Decision:** Extract the deterministic analysis presentation into `ResumeAnalysisPanel.tsx` and the guidance presentation into `ResumeGuidancePanel.tsx`. Keep file extraction, state ownership, and state transitions in `ResumeLab.tsx`; add a small shared type module only if needed to keep props typed without runtime coupling.
- **No-behavior-change contract:** Preserve user-visible copy, render order, IDs, data-testid values, CSS classes, accessibility attributes, parsing and analysis calls, event semantics, clear behavior, and the in-memory privacy boundary. This is a JSX/component-boundary refactor only.
- **Out of scope:** No feature changes, new hooks, data-model changes, dependency changes, workflow changes, style changes, or edits to unrelated files.
- **Definition of done:** Each component stays around 300 lines or fewer; all existing unit/component tests, format check, lint, typecheck, audit, build, privacy-boundary check, repository-subpath preview, discovery fixtures, and browser acceptance pass on the same exact PR head. Use existing CI formatter diagnostics rather than speculative formatting commits; allow at most two CI cycles for this unit.
- **Rollback:** Revert the component extraction and its status entry as one implementation commit.


### ADR-042 outcome

- **Verified exact head:** d4ef4c82fde4b80ffd1cb26792719602c0d25afd.
- Frontend CI, browser acceptance, and discovery fixtures passed on the PR head; the two corresponding branch-push CI jobs also passed. See the exact run links in `STATUS.md`.
- The second and final CI cycle resolved the formatter/type issues. No third cycle or unsupported `isEvalSupported` compatibility cast was added.


### ADR-043 implementation note

- Extracted analysis rendering to `ResumeAnalysisPanel.tsx` and guidance rendering to `ResumeGuidancePanel.tsx`; `ResumeLab.tsx` retains state, file intake, and state-transition handlers. Shared inferred types are in `resume-lab.types.ts`.
- No intended changes to visible copy, DOM identifiers, styles, interaction semantics, or data/privacy behavior. Exact-head CI verification is pending and will be recorded in `STATUS.md`.


### ADR-043 formatter diagnostic — first CI cycle

- The component split passed lint, typecheck, all unit tests, dependency audit, and production build on the first implementation commit. Frontend CI failed only `format:check` because the two extracted TSX files had excess JSX indentation and their opening tags differed from Prettier's configured layout.
- Applied the exact two-file diff printed by the CI diagnostic step; no unrelated files changed. Discovery fixtures passed. The second CI cycle is the final verification attempt for this refactor.


## ADR-044 — Static Content-Security-Policy meta policy

- **Date:** 2026-10-29
- **Status:** Approved for implementation
- **Context:** This project is a static browser application, so the HTML entry point can apply an explicit CSP without introducing a server or hosting configuration change.
- **Policy:** Add a CSP meta tag to `index.html` with `default-src 'self'; script-src 'self'; worker-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; style-src 'self' 'unsafe-inline'`. Inline styles remain allowed for React/browser compatibility; no inline script allowance is added.
- **Verification:** Extend the existing browser acceptance smoke test to assert the required directives after the app loads. Existing local DOCX/PDF extraction and the production preview exercise same-origin scripts/assets and the allowed worker sources.
- **Definition of done:** Frontend formatting, lint, typecheck, unit tests, audit, build, privacy check, repository-subpath preview, browser acceptance and discovery fixtures pass on an exact head; the CSP meta content has all listed directives; no workflow triggers/permissions, dependency, runtime API, or network behavior change.
- **Failure policy:** At most two CI cycles. If policy compatibility cannot be verified after two attempts, remove the CSP meta tag and record the deferral to Phase 8 rather than relaxing the policy speculatively.
- **Rollback:** Remove the meta tag and its browser assertion as one small commit; retain this decision and document the Phase 8 deferral.


### ADR-044 implementation outcome

- **Code commit:** [b3b196da](https://github.com/hhaitam95/game-industry-outreach-tracker/commit/b3b196da6a2aeb03511efefea3a517fe4ade518d).
- **Push CI:** Frontend CI passed [40849588956](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849588956) and [40849594611](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849594611); discovery fixtures passed [40849588962](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849588962) and [40849594640](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849594640).
- **PR CI:** Frontend CI passed [40849604007](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849604007), discovery fixtures passed [40849604001](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849604001), and browser acceptance passed on run [40849603965, attempt 2](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40849603965). The first browser attempt failed before app interaction with `browser-debug-port-unavailable`; no code changed before the successful retry.
- The browser assertion checked every policy directive after the page rendered; the existing full browser suite then passed. No CSP rollback or Phase 8 deferral is needed.


## ADR-054 — Phase 8 public Pages output and privacy gate

- **Date:** 2026-10-29
- **Status:** Approved for implementation; target provisioning and first publication remain pending.
- **Goal:** Publish the browser application without exposing private candidate records or source-repository history as Pages content.
- **Decision:** Use `hhaitam95/game-industry-outreach-tracker-site` as a separate output-only public Pages repository. It receives only generated `dist/` static assets built from this source repository and a public opportunity snapshot validated against `schemas/public-opportunity-snapshot.schema.json`.
- **Trigger boundary:** The publication workflow is `workflow_dispatch` only. The default mode is validation/build-only; publication requires an explicit `publish` choice. No push, schedule, live discovery dispatch, or discovery-completion trigger is added.
- **Data boundary:** Publication mode validates the existing `discovery-state` snapshot using the existing shared validator before bundling it. Read/parse/schema failures fail closed. Private profile/CV/draft/application records, user uploads, contact notes, tokens, and credentials are never inputs to the build.
- **Permissions:** Use source `GITHUB_TOKEN` with `contents: read`. A fine-grained `PUBLIC_PAGES_TOKEN` may write only to the target repository's contents; never expose it to frontend code, build environment, artifacts, command output, or logs. Pin workflow actions to reviewed commit SHAs.
- **Tests:** Existing frontend CI, browser acceptance, discovery fixtures, strict public snapshot validation, public artifact boundary checks, repository-subpath smoke test, and encrypted local-vault/export/restore checks must pass on the exact reviewed commit.
- **Definition of done:** Target repository and Pages source are configured; publish workflow passes exact-head checks; a manually confirmed publish deploys static files to the target root; public URL/assets and privacy boundary are verified; recovery and rollback are documented. Until target provisioning and a successful run, Phase 8 is not declared deployed/complete.
- **Failure behavior:** Missing target, token, or Pages setup must stop before publication. Invalid snapshot or failed validation must preserve the previous published site and create no release commit.
- **Rollback:** Revert the last publication commit in the target repository or restore the previous known-good static artifact; remove/rotate the target-scoped secret if compromised. Never rewrite history or delete a target branch.
- **Supersedes:** This decision resolves the hosting-source question left open by ADR-013 and ADR-018; it does not authorize scheduled discovery or any visibility change.
