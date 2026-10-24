# Game Industry Outreach Tracker

A personal, evidence-driven tool for discovering video game studios and opportunities worldwide, assessing transferable technical skills, preparing tailored outreach, and tracking application outcomes.

> **Status:** Architecture/documentation stage. The application and scheduled discovery workflow are not implemented yet. Requirements are living documents.

## Goals

- Discover relevant advertised roles and verified speculative-application routes worldwide.
- Build source-backed studio profiles with ownership, locations, notable games, and explicit development/publishing credit relationships.
- Monitor registered studios with a daily/manual GitHub Actions discovery workflow.
- Explain role relevance, transferable skills, gaps and unknowns.
- Process resumes in the browser, analyze them against an opportunity, and generate reviewed DOCX/PDF versions.
- Maintain sourced resume guidance in the repository.
- Prepare personalized outreach and pre-send checks; the user sends messages manually.
- Track responses, follow-ups and outcomes.
- Start without paid AI API access.

## Hosting and privacy model

GitHub Pages is a public static host, not a private server-side application. The current source repository should remain private. For GitHub Free Pages, the plan is to publish only a static build and an allowlisted public studio/opportunity data feed to a separate public deployment repository.

Private candidate profile data, resume content, personal drafts and application history must not be committed or published. The initial design processes selected resumes locally in the browser and uses encrypted browser-local records/export/import. This is not automatic cloud sync. A private backend would require a future decision.

## Proposed technology direction

- TypeScript + Vite for the static frontend.
- Python scripts under GitHub Actions for scheduled public-source discovery.
- Browser-side resume processing, deterministic checks, and DOCX/PDF downloads.
- Optional manual AI prompt handoff; no direct model API required.
- Tests for source parsing, change detection, data privacy and document workflow.

These are proposed architecture choices documented in ARCHITECTURE.md and DECISIONS.md.

## Documentation

- PROJECT_SPECS.md — product scope, requirements and acceptance criteria.
- ARCHITECTURE.md — static hosting, discovery pipeline, data model, resume processing and privacy.
- IMPLEMENTATION_PLAN.md — phases and exit criteria.
- DECISIONS.md — decisions, rationale and status.
- AGENTS.md — AI-agent operating and security instructions.
- CHANGELOG.md — meaningful project changes.
- HANDOFF.md — current state and next task.
- docs/resume-guidelines/ — source-linked resume standards and role-specific guidance.
- docs/operations/automated-discovery.md — proposed daily workflow and change-detection behavior.

## Repository hygiene

Do not commit CVs, resume exports, personal application history, correspondence, local databases, profile exports, credentials, API keys or deployment tokens. See .gitignore and AGENTS.md.
