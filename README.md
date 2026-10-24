# Game Industry Outreach Tracker

A personal, evidence-driven workspace for discovering video game studios and opportunities worldwide, assessing transferable technical skills, preparing tailored outreach, and tracking application outcomes.

> **Current status:** Phase 1 static frontend shell and cloud CI are implemented on `feat/static-frontend-shell`. Check that branch's latest GitHub Actions run for the current validation result. Product functionality is still being built in phases.

## Current frontend shell

- React + TypeScript with Vite for static site development and builds.
- Responsive workspace layout with navigation for overview, studio research, resume review, outreach, applications, and settings.
- Placeholder screens clearly distinguish planned features from implemented functionality; no fake studio or application data is shown.
- ESLint, Prettier, TypeScript checks, Node's built-in test runner, and a local-to-AI feedback report.
- GitHub Actions validates frontend formatting, lint, types, tests, and a production build using a repository subpath.
- No server-side runtime, external analytics, private profile storage, resume processing, or automatic outbound communication is included in this phase.

## Product goals

- Discover relevant advertised roles and verified speculative-application routes worldwide.
- Build source-backed studio profiles with ownership, locations, games, and explicit development/publishing credit relationships.
- Monitor registered studios with a daily/manual GitHub Actions discovery workflow.
- Explain role relevance, transferable skills, gaps, and unknowns.
- Process resumes in the browser, analyze them against an opportunity, and generate reviewed DOCX/PDF versions.
- Maintain sourced resume guidance in the repository.
- Prepare personalized outreach and pre-send checks; the user sends messages manually.
- Track responses, follow-ups, and outcomes.
- Start without paid AI API access.

## Hosting and privacy model

GitHub Pages is a public static host, not a private server-side application. The current source repository remains private. The planned Pages release will publish only a static build and an allowlisted public studio/opportunity feed to a separate public deployment repository.

Private candidate profile data, resume content, personal drafts, and application history must never be committed or published. Later phases will process selected resumes locally in the browser and use encrypted browser-local records/export/import. This is not automatic cloud sync. A private backend would require a future decision.

## Development and testing

GitHub Actions is the default validation environment. Local checks are optional unless you want to preview the interface or investigate a machine-specific problem.

See [Local Development and Feedback Workflow](docs/LOCAL_DEVELOPMENT.md) for the exact macOS/VS Code setup, expected results, and the single-command `npm run feedback-report` workflow. The report omits raw logs and source contents and applies conservative redaction.

## Documentation

- [Project specifications](PROJECT_SPECS.md) — product scope, requirements, and acceptance criteria.
- [Architecture](ARCHITECTURE.md) — static hosting, discovery pipeline, data model, resume processing, and privacy.
- [Implementation plan](IMPLEMENTATION_PLAN.md) — phases and exit criteria.
- [Decisions](DECISIONS.md) — accepted and open decisions.
- [AI-agent instructions](AGENTS.md) — operating rules and security requirements.
- [Changelog](CHANGELOG.md) — meaningful project changes.
- [Handoff](HANDOFF.md) — current state and next task.
- [Resume guidance](docs/resume-guidelines/) — source-linked standards and role-specific guidance.
- [Automated discovery plan](docs/operations/automated-discovery.md) — planned daily workflow and change-detection behavior.

## Repository hygiene

Do not commit CVs, resume exports, personal application history, correspondence, local database files, feedback reports, credentials, API keys, or deployment tokens. See `.gitignore` and `AGENTS.md`.
