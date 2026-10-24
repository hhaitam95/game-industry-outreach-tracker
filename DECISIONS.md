# Architecture and Product Decisions

This is a living decision record. Accepted decisions may be amended or superseded when evidence or requirements justify a change. Record the date, status, context, decision, consequences, and superseding decision when applicable.

## ADR-001 — Single-user personal application

- **Date:** 2026-10-24
- **Status:** Accepted baseline
- **Context:** The tool is initially intended for one candidate's personal job search and contains private profile and application data.
- **Decision:** Optimize the first version for one authorized user; do not build multi-user accounts or public access by default.
- **Consequences:** Simpler product model, but authentication and privacy remain essential if remotely hosted.

## ADR-002 — Python, Streamlit, and SQLite as the proposed baseline

- **Date:** 2026-10-24
- **Status:** Proposed baseline; validate during implementation
- **Context:** The product needs a practical research dashboard and local data store with minimal cost and complexity.
- **Decision:** Start with Python, Streamlit, and SQLite unless implementation or hosting tests show a material limitation.
- **Consequences:** Fast initial development and local operation. Reassess SQLite concurrency/persistence and provider compatibility before remote deployment.

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

## ADR-010 — Plan for private remote access early

- **Date:** 2026-10-24
- **Status:** Accepted direction; provider TBD
- **Context:** The user wants a dashboard accessible remotely/private-hosted, but personal data must remain protected and project costs low.
- **Decision:** Design for private authenticated access, durable storage, secret isolation, backup/restore, and cost awareness. Do not select a provider until its capabilities are verified. Retain local development/fallback mode.
- **Consequences:** Hosting needs may affect database selection. Free hosting is not assumed to be safe or persistent.

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
