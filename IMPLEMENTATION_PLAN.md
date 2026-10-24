# Implementation Plan

**Status:** Initial roadmap; subject to revision  
**Last updated:** 2026-10-24

## Delivery strategy

Build an end-to-end useful workflow in small testable milestones. Do not spend months optimizing global crawling before the application can store a profile, evaluate a lead, create a draft, and track an outcome.

Each milestone must include:
- Scope and acceptance criteria.
- Relevant automated/manual tests.
- Documentation updates.
- Known limitations.
- A concise handoff note.

## Phase 0 — Project documentation and repository foundations

### Scope
- Maintain project specifications, architecture, implementation plan, decisions, AI-agent instructions, changelog, and handoff notes.
- Add safe repository hygiene (.gitignore, configuration example, test/lint configuration).
- Establish branch/commit approval workflow and a privacy-first repository policy.
- Keep the private remote-hosting choice open until requirements are assessed against real provider capabilities.

### Exit criteria
- Core requirements and acceptance criteria are documented.
- Proposed architecture, data concepts, and privacy boundaries are documented.
- New AI chats can understand current progress from repository documents.
- No personal CV, application history, secrets, or database files are committed.

## Phase 1 — Local application skeleton, profile, and tracker foundation

### Scope
- Create Python project structure and local run instructions.
- Add Streamlit shell and basic navigation.
- Create SQLite schema and a safe schema evolution/migration strategy.
- Implement profile storage/editing with disclosure separation.
- Implement manual studio/opportunity/contact/route entry.
- Implement application and interaction statuses.
- Add CSV/JSON export and initial backup/restore path.
- Add basic tests and development commands.

### Exit criteria
- Application runs locally.
- Profile can be created and edited.
- User can add, inspect, filter, update and export studio/application records.
- Core data operations have automated tests.
- Local data files are excluded from version control.

## Phase 2 — Evidence-backed studio and opportunity model

### Scope
- Implement source evidence records and field-level verification metadata.
- Add studio pages: identity, aliases, locations, business type, ownership, career routes, known games and credit relationships.
- Distinguish developer, co-developer, publisher, porting, support, and other credit types.
- Add statuses for verified/potential/stale/conflicting/rejected information.
- Add duplicate detection and safe merging workflows.

### Exit criteria
- Records can represent a studio with multiple locations, ownership levels, and distinct credits.
- Important claims include provenance and verification timestamps.
- Conflicting or unknown information is visible rather than silently resolved.
- Manual entry remains possible for any field/source.

## Phase 3 — Controlled discovery MVP

### Scope
- Implement a modular source-adapter interface.
- Start with a small set of reliable, public and permitted discovery sources.
- Capture advertised vacancy versus speculative route versus potential lead.
- Add timeouts, rate limits, caching/retry policy, structured errors and source-run history.
- Extract official career/application routes and relevant profile evidence.
- Recheck selected results and mark stale records.
- Evaluate discovery quality using a small manually verified reference set.

### Exit criteria
- Discovery returns source-backed candidates and avoids duplicate records.
- Official speculative routes are not confused with ordinary careers pages.
- Source errors and uncertain findings are visible.
- Coverage limitations and last checked dates are reported.

## Phase 4 — Matching and employment feasibility

### Scope
- Build a candidate profile model and role-family taxonomy that can evolve.
- Identify relevant responsibilities and skill signals from job descriptions.
- Produce explanatory fit summaries, gaps, stretch opportunities and unknowns.
- Track location, hiring eligibility, remote policy, language, sponsorship and relocation evidence.
- Keep compensation estimates out of fit eligibility and default ranking.

### Exit criteria
- Every match provides evidence-based reasons and uncertainty.
- Unknown eligibility/salary data is not automatically treated as rejection.
- User can adjust preferences without code changes.

## Phase 5 — CV analysis and personalized outreach

### Scope
- Support CV text extraction from appropriate user-supplied files, preserving originals.
- Implement a baseline CV review and opportunity-specific analysis.
- Build draft templates and a provider-neutral/manual AI-assisted drafting workflow.
- Generate drafts using approved profile facts and verified studio context.
- Add pre-send checks for personalization, factual support, generic tone, privacy, and application instructions.
- Preserve draft history and link each draft to profile/CV versions and evidence.

### Exit criteria
- User can prepare, review, edit and save a studio-specific email/application.
- Unsupported claims are flagged.
- CV original is never overwritten.
- No sending occurs automatically and submission status requires user confirmation.

## Phase 6 — End-to-end tracking and reporting

### Scope
- Connect discovery, review, drafting, sending confirmation and response logging.
- Add follow-up dates and next actions.
- Add dashboard views for discovered leads, ready-to-review drafts, sent applications, responses and interviews.
- Add basic metrics with low-sample caveats.
- Improve deduplication, error recovery and export/backup UX.

### Exit criteria
- User can complete the principal workflow without editing the database manually.
- Interaction history and application state remain consistent.
- Reporting avoids implying causation or strong trends from small samples.

## Phase 7 — Private remote deployment

Plan for this early, but implement against a verified hosting choice rather than a guessed free tier.

### Scope
- Compare deployment options for private authentication, persistence, secure configuration, backups, restore and cost.
- Decide whether SQLite is suitable for the provider or whether managed persistent storage is needed.
- Add authentication/access controls and production configuration validation.
- Configure secrets outside source control.
- Test restart/redeploy persistence, backup/restore, access control and exports.
- Keep local mode available.

### Exit criteria
- Only the authorized user can access the dashboard and data.
- Data persists across restarts/deployments.
- Backup and recovery have been tested.
- Deployment has no committed secrets and no unintended public data access.
- Costs and free-tier limitations are documented.

## Phase 8 — Optional salary estimates and advanced research

### Scope
- Implement market-specific salary estimates only if there are defensible sources.
- Support role family, seniority, geography, pay basis, sample size, confidence, source dates, and currency conversion metadata.
- Display local market currency when location is known, with USD/EUR equivalents.
- Add optional ownership-history and advanced reporting improvements.
- Expand discovery source coverage and measure source precision/freshness.

### Exit criteria
- Salary estimates are labelled, sourced, date-stamped, and uncertainty-aware.
- Salary never filters or ranks opportunities based on a personal minimum.
- Weak data produces a clear unavailable/low-confidence result rather than invented precision.

## Cross-cutting work

- Keep dependencies minimal and documented.
- Use tests for important business logic and data migrations.
- Keep external source adapters replaceable.
- Respect website access restrictions and use modest request rates.
- Keep private data outside Git.
- Update documentation and HANDOFF.md at the end of each material milestone.
- Ask for explicit approval before committing; summarize diff and test results first.

## Immediate next task after scaffolding

Implement Phase 1's smallest slice: Python project skeleton, configuration validation, database bootstrap, and a minimal Streamlit dashboard, with tests. Do not add web crawling, paid AI APIs, email sending, or deployment secrets in that first coding task.
