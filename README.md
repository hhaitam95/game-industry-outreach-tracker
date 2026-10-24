# Game Industry Outreach Tracker

A personal, evidence-driven tool for discovering video game studios and opportunities worldwide, assessing how a candidate's existing technical experience could transfer into game development, preparing tailored outreach, and tracking application outcomes.

> **Status:** Documentation and foundation setup. The application itself has not been implemented yet. Requirements are a living document and may change as the project develops.

## Project goals

- Discover studios with relevant advertised roles or verified speculative/open-application routes.
- Build concise studio profiles with evidence for ownership, locations, business type, games, credits, and application channels.
- Explain how the candidate's skills might fit a role or studio, including gaps and unknowns.
- Analyze CVs and prepare studio-specific outreach drafts.
- Keep the candidate in control: messages are reviewed and sent manually.
- Track research, applications, responses, follow-ups, and outcomes.
- Start without paid AI APIs, while keeping optional integrations replaceable.
- Plan for private remote access early without exposing private candidate data.

## Current scope

The initial user is a single candidate with a technical software-support background seeking a route into the video game industry. The search is worldwide and intentionally open to adjacent or stretch roles. Salary estimates are optional and must not filter or rank opportunities.

See the project specifications for complete requirements, priorities, and acceptance criteria.

## Proposed technology direction

The initial direction is Python, Streamlit, and SQLite, with modular discovery adapters and tests. These are documented as proposed baseline choices and may be revised if implementation or remote-hosting requirements justify a change.

The first release must work without a paid model API. ChatGPT Free access is not assumed to provide programmatic API access; manual AI-assisted drafting is the fallback.

## Documentation

- PROJECT_SPECS.md — goals, user stories, requirements, constraints, and acceptance criteria.
- ARCHITECTURE.md — modules, data model, evidence provenance, privacy, hosting, and system flow.
- IMPLEMENTATION_PLAN.md — phased roadmap and exit criteria.
- DECISIONS.md — decisions, rationale, and status.
- AGENTS.md — instructions for AI coding agents and repository safety.
- CHANGELOG.md — meaningful project changes.
- HANDOFF.md — current state, known limitations, and next task.

## Current status

No application functionality is implemented yet. The current stage is project documentation and repository scaffolding. See HANDOFF.md before continuing work.

## Privacy reminder

Do not commit personal CVs, application history, recruiter correspondence, database files, uploaded documents, credentials, API keys, or deployment secrets. Keep private data outside source control and use the approved private-storage design.
