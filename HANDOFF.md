# Project Handoff

**Last updated:** 2026-10-24  
**Project stage:** Documentation and repository foundations  
**Default branch:** main  
**Scaffolding branch:** docs/project-foundation

## Purpose

Build a personal tool to discover game studios/opportunities worldwide, verify official application routes, build evidence-backed studio profiles, assess fit with the candidate's transferable technical skills, analyze a CV, prepare reviewed studio-specific outreach drafts, and track outcomes.

## Repository baseline

- Repository: https://github.com/hhaitam95/game-industry-outreach-tracker
- Private GitHub repository.
- Initial main-branch commit: d35a47e1332275ab4ddf51c2a1d37f0b97ed8fc9 (initial README).
- Initial documentation/scaffolding has been prepared as a candidate tree for docs/project-foundation. Always inspect the current branch and commit history before resuming; do not assume the candidate tree has been committed or pushed.

## Decisions currently in force

- Single-user application.
- Proposed stack: Python, Streamlit, SQLite, tests with pytest, lint with Ruff.
- Initial useful release must work without a paid AI API.
- Human reviews and sends all emails/applications; no automated sending.
- Global role/studio discovery with transferable-skill matching, not exact title matching only.
- Salary research is optional and never filters or ranks opportunities against a personal salary minimum.
- Studio ownership and game credits must distinguish developer/co-developer/publisher/porting/support relationships.
- Material claims need source evidence and claim-level verification metadata.
- Plan for private authenticated remote access early; provider remains undecided and local fallback should remain available.
- Requirements are living documents.
- Explicit approval is required before every commit.

## Current implementation state

- The initial README exists on main.
- Application code is not implemented.
- Automated tests have not been created or run.
- Hosting provider and discovery data sources have not been selected.
- No salary data source has been selected.
- No private candidate profile, CV, application data, or secrets belong in the repository.
- Documentation/config scaffolding is intended to be committed as a separate reviewable change; verify the live repository to know whether this has happened.

## Known risks and open decisions

- Free private hosting may not provide persistent storage, backups, or suitable access controls.
- SQLite may not be appropriate for every remote hosting/write pattern.
- Discovery source coverage, access terms, rate limits, and freshness must be tested.
- Salary data may be sparse and non-comparable across markets.
- Credit and ownership sources can conflict or change.
- ChatGPT Free access is not equivalent to programmatic API access.

## Next task

1. Verify the committed scaffolding branch state and approve/complete the initial docs commit.
2. After scaffolding is merged or otherwise designated as the baseline, implement Phase 1: a minimal Python project structure, configuration validation, database bootstrap, a basic Streamlit shell, and tests.
3. Do not add web crawling, paid AI APIs, email sending, or real private data in that first coding task.

## Handoff rules

The next chat/agent must read README.md, PROJECT_SPECS.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, DECISIONS.md, AGENTS.md, and this file, then inspect the live repository before making changes. Verify whether noted branches and commits exist. Treat source code and GitHub state as authoritative for implementation, not this note alone.
