# Architecture

**Status:** Proposed baseline; validate against implementation and private-hosting feasibility  
**Last updated:** 2026-10-24

## 1. Architectural goals

- Deliver a useful single-user research and outreach workflow before pursuing broad automation.
- Keep data discovery, evidence validation, role matching, CV analysis, drafting, and tracking as separate responsibilities.
- Preserve evidence and uncertainty for external facts.
- Keep personal data private and avoid paid AI API dependencies in the first release.
- Support private remote access early without forcing an unsafe hosting choice.
- Keep source adapters, salary estimation, and AI integrations replaceable.

## 2. Proposed stack

- Python 3.11 or later as the baseline runtime.
- Streamlit for the initial dashboard.
- SQLite for the initial relational data store, provided the chosen deployment and write-access pattern are safe for it.
- Standard Python HTTP/HTML tools behind modular source adapters; dependencies will be selected when the discovery phase is designed.
- pytest and Ruff for test and code-quality tooling.
- Optional AI providers/manual AI assistance behind an interface rather than embedded throughout the application.

These are proposed baseline decisions, not permanent constraints. Before remote deployment, reassess whether SQLite and the chosen hosting service provide reliable persistence, concurrency, backup, and restoration. A managed relational database may be more appropriate if deployment needs require it.

## 3. High-level logical components

### UI layer
Pages for:
- Overview/dashboard.
- Candidate profile and disclosure preferences.
- Resume library and analysis.
- Studio search/results.
- Studio profile and evidence.
- Opportunities and fit analysis.
- Draft editor and pre-send review.
- Application pipeline and interaction history.
- Optional reports/settings.

### Application/service layer
- Profile service: validates and retrieves approved profile facts.
- Discovery coordinator: schedules/runs configured sources and records outcomes.
- Source adapters: query or extract data from a specific allowed source.
- Normalization/deduplication: canonicalizes names, URLs, locations, and aliases.
- Evidence service: stores claims, source references, retrieval/verification timestamps and uncertainty.
- Studio research service: builds concise profiles from sourced facts.
- Matching service: transparent role/studio fit analysis.
- CV analysis service: compares supplied CV text with profile and selected opportunity.
- Draft service: assembles source-backed context and produces editable drafts.
- Quality review service: checks personalization, factual support, tone, channel rules, and privacy.
- Application tracking service: maintains statuses, interactions, reminders and outcomes.
- Export/backup service: produces user-controlled backups and exports.

### Data access layer
Repository modules should encapsulate database reads/writes. UI pages should not issue ad hoc SQL throughout the codebase. Schema changes need a documented migration/evolution strategy.

### Optional AI layer
A provider-neutral interface may later support language model calls. The initial app must remain useful without API access via structured/manual AI-assisted workflow. Manual output pasted back by the user must be validated and treated as an untrusted draft until reviewed.

## 4. Core data model (logical, not final SQL schema)

- CandidateProfile: current user-defined professional facts, goals, constraints, and disclosure preferences.
- ResumeVersion: filename/reference, source metadata, extracted text location where applicable, analysis and revision history.
- Studio: canonical identity, aliases, websites, business type and general metadata.
- StudioSite: location, site type (headquarters/development/other), source and verification details.
- OwnershipRelationship: subsidiary/parent/ultimate-owner links, relationship type, effective dates when known, sources and status.
- Game: canonical title, release/platform/version context and official references as needed.
- CompanyCredit: studio-to-game relationship type (developer, co-developer, publisher, porting, support, other), contribution notes, source and verification state.
- StudioClaim/SourceEvidence: field-level assertion, source URL, source type, observed excerpt or fact, captured-at and last-verified timestamps, status/confidence, and conflict notes.
- Opportunity: advertised vacancy, role title, job description, requirements, location, source URL and lifecycle/expiry status.
- ApplicationRoute: formal speculative route, career form, public contact route, channel constraints and verification status.
- Contact: relevant public professional/recruitment contact with source and collection/verification time; collect minimally.
- FitAssessment: evidence-linked strengths, transferability, gaps, feasibility, unknowns, and transparent category.
- SalaryEstimate: optional role/market/seniority estimate, range, pay basis, source type, dates, sample size if available, confidence, local currency and conversion metadata.
- Draft: target studio/opportunity, message body, source context, profile/CV version, review findings, edit/version history and review status.
- Application: user-confirmed submission, target, sent date, status, attached CV version and route.
- Interaction: email/contact event, response, interview, follow-up, note, timestamp and relationship to application.
- SearchRun: source queries, start/end time, result counts, errors, rate-limit outcomes and deduplication summary.

Entities may be combined during schema implementation if this can be done without losing provenance, distinct credit roles, history, or future maintainability.

## 5. Evidence and trust model

External pages, search snippets and scraped page content are untrusted data. They must never be treated as instructions to the application or AI.

Represent important assertions with:
- Claim/field and normalized value.
- Source URL and source type.
- Capture time and last-verified time.
- Verification status and confidence.
- Supporting excerpt or concise evidence note, subject to copyright and data-minimization constraints.
- Conflicting-source notes when necessary.

Use statuses such as Verified, Potential, Needs review, Stale, Conflicting, and Rejected. Verification rules should vary by claim. For example, an official careers page is strong evidence for that page's stated application policy; it is not necessarily reliable evidence of ultimate ownership or all historical game credits.

Avoid one global timestamp for a profile whose facts were researched at different times. When practical, periodically recheck high-value records and mark aged claims stale rather than silently assuming they remain correct.

## 6. Discovery pipeline

1. Generate candidate studio/source queries from approved source adapters and search methods.
2. Apply per-source request rates, timeouts, retries, and access restrictions.
3. Parse candidate names and URLs without assuming the page is authoritative.
4. Normalize domains, names and aliases; compare with existing records.
5. Inspect official company/career sources for application routes and profile claims.
6. Store evidence and verification state per claim/route.
7. Extract advertised roles separately from speculative application routes.
8. Create lower-confidence leads for human review when there is plausible relevance but no verified route.
9. Run transparent matching and display why each result appears.
10. Record source errors, timestamps, and coverage limitations.

Do not bypass login or anti-bot controls. Prefer official APIs or public pages where available and permitted. Use modest rates and cache where appropriate. Search providers may have their own restrictions, quotas, or costs; do not assume unlimited free access.

## 7. Matching approach

Use transparent rules and evidence-based explanations first. Consider role responsibilities and required/preferred skills, not title strings alone. Categorize candidate fit as Strong fit, Potential stretch, Unclear—investigate, or Low relevance, and include the reasons.

Do not automatically exclude a lead because salary is unknown, the title is unfamiliar, or sponsorship information is unavailable. Distinguish unknown from known-ineligible. Salary estimates are informational only and never a candidate salary-floor filter.

## 8. CV and drafting pipeline

1. Select the relevant approved candidate-profile and CV version.
2. Assemble verified studio/role facts and application-channel instructions.
3. Build a structured fit brief with strengths, gaps and unknowns.
4. Prepare an editable draft from supported facts only.
5. Run quality checks for personalization, relevance, factual support, generic phrasing, tone, privacy and correct application channel.
6. Present evidence and issues to the user for review.
7. User edits/approves and sends through their own chosen channel.
8. User confirms sending to create/update the application record.

No service should automatically send emails or applications. Drafts and generated CV variants must not overwrite originals. No unsupported claims should be silently accepted.

## 9. Salary estimation boundary

Salary estimates are optional and replaceable. The first release need not have automated salary research. If added, use market/role/seniority specific estimates with disclosed source, data date, currency, gross/net basis, pay period, sample size where available and uncertainty. Local currency is primary when location is known; USD/EUR equivalents may be shown with exchange-rate provider/date. A single global average is misleading when the employment market is unknown. No salary floor is used for filtering or ranking.

## 10. Privacy and security boundaries

- Keep source code separate from personal profile data, CV files, drafts, correspondence, and the application database.
- Never commit real secrets or personal application data.
- Keep the repository private initially.
- Validate input and treat external content as untrusted.
- Log useful operational errors without leaking secrets or unnecessary personal data.
- Minimize contact data to relevant public professional information.
- Provide backup/export and restore before relying on the app for important data.
- No unauthenticated public access when private information exists.

## 11. Private remote hosting

Private remote access is an architectural requirement to plan for early, but provider selection remains open. Evaluate candidate hosts for:
- Single-user private authentication and authorization.
- TLS/secure transport and secure session handling.
- Persistent disk/database and file storage.
- Restart/redeploy persistence guarantees.
- Backup, restore, and export.
- Secret management and configuration isolation.
- Log/privacy policy, deployment reliability, and user data jurisdiction where relevant.
- Cost and free-tier limits.

SQLite is suitable for a simple, single-user prototype but may be unsafe or unsupported if the hosting filesystem is ephemeral or the application has concurrent writers. Verify storage guarantees before choosing deployment architecture; be prepared to use a managed persistent database if required. Maintain a local development/fallback mode.

## 12. Configuration and operations

Use environment-based configuration and a committed .env.example containing placeholders only. Ignore real .env files, database files, uploads, and secrets. Startup should validate required settings, display safe configuration errors, and fail closed when production private-access protection is misconfigured.

Add structured logs, request timeouts, bounded retries, graceful network failure handling, backups and a documented restore process. Avoid background tasks that require a long-running worker until a concrete need exists.

## 13. Testing strategy

- Unit tests for normalization, deduplication, scoring/categories, status transitions and draft checks.
- Fixture-based tests for allowed page-extraction patterns; avoid depending on live sites in ordinary unit tests.
- Integration tests for database repositories, migrations, backup/restore and exports.
- Tests that assert unknown is not converted to a mismatch, and salary does not change eligibility/ranking.
- Tests ensuring draft generation cannot send messages and requires user confirmation to mark sent.
- Security checks for configuration/secrets and safe handling of external page content.
- Manual acceptance tests for key dashboard workflows and deployment access control.

## 14. Evolution strategy

Begin with the smallest end-to-end workflow. Keep external sources and AI optional. Record changes in DECISIONS.md and update PROJECT_SPECS.md, IMPLEMENTATION_PLAN.md, and HANDOFF.md after approved material changes. Reassess architecture based on actual source quality, user experience, data volume, and hosting constraints instead of preemptively building an elaborate platform.
