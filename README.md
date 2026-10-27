# Game Industry Outreach Tracker

A personal, evidence-driven workspace for discovering video game studios and opportunities worldwide, assessing transferable technical skills, preparing tailored outreach, and tracking application outcomes.

> **Current status:** The Phase 1–4 implementation stack is present on `main` at `f9a9cf6`. Phase 3 is accepted; Phase 4 is merged but still awaiting acceptance. Stabilization is in progress on `stabilize/baseline-fixes`. The latest discovery fixture suite passed 36 tests; the frontend suite reports 31 passing tests, but overall Frontend CI remains blocked by a Prettier check in `src/lib/studios/catalog.mjs` (tracked in `STATUS.md`). One earlier live scan has already occurred; do not rerun it as part of stabilization. Scheduling and publishing remain disabled. This repository is public, so private records, resumes, contact details, and credentials must never be committed.

## Current frontend shell

- React + TypeScript with Vite for static site development and builds.
- Responsive workspace layout with navigation for overview, studio research, resume review, outreach, applications, and settings.
- The Studios & roles screen displays four manually sourced studio profiles, separate site/ownership/game-credit relationships, official career routes, and expandable source evidence.
- The Phase 3 starter catalogue does not claim to list current vacancies; vacancy observations are added only by the separate Phase 4 discovery pipeline.
- Manual studio data is kept separate from encrypted private candidate/application records. The Phase 4 feature branch adds a fixture-tested, manually triggered runner; daily scheduling and publication are still disabled.
- ESLint, Prettier, TypeScript checks, Node's built-in test runner, an automated Chrome/Chromium vault smoke test, and privacy-conscious Markdown feedback reports.
- GitHub Actions validates formatting, lint, types, unit tests, dependency audit, privacy boundaries, the production build, and browser-level vault create/save/reload/lock/export/restore behavior.
- Settings supports a passphrase-protected local vault, profile fields, basic application records, encrypted backup export/import, locking, and local deletion.
- No server-side runtime, remote sync, raw CV storage, resume processing, or automatic outbound communication is included.

## Product goals

- Discover relevant advertised roles and verified speculative-application routes worldwide.
- Build source-backed studio profiles with ownership, locations, games, and explicit development/publishing credit relationships.
- Monitor registered studios with a manual GitHub Actions discovery workflow; scheduling remains disabled pending owner acceptance.
- Explain role relevance, transferable skills, gaps, and unknowns.
- Process resumes in the browser, analyze them against an opportunity, and generate reviewed DOCX/PDF versions.
- Maintain sourced resume guidance in the repository.
- Prepare personalized outreach and pre-send checks; the user sends messages manually.
- Track responses, follow-ups, and outcomes.
- Start without paid AI API access.

## Hosting and privacy model

GitHub Pages is a public static host, not a private server-side application. This repository is public. Any future Pages host, deployment target, or publishing workflow is deferred to Phase 8 and requires a separate privacy review and owner approval. No deployment or publication is approved in the current phase.

Private candidate profile data, resume content, personal drafts, and application history must never be committed or published. Profile and tracker records use encrypted browser-local records with user-controlled encrypted export/import. Original CVs and extracted resume text are not stored, and this is not automatic cloud sync. A private backend would require a future decision.

## Development and testing

GitHub Actions is the default validation environment. Local checks are optional unless you want to preview the interface or investigate a machine-specific problem.

See [Local Development and Feedback Workflow](docs/LOCAL_DEVELOPMENT.md) for the exact macOS/VS Code setup, expected results, and the single-command `npm run feedback-report` workflow. The report omits branch names, filenames, raw logs, source contents, diffs, and free-form diagnostic lines. It reports only check outcomes and fixed diagnostic categories.

## Documentation

- [Project specifications](PROJECT_SPECS.md) — product scope, requirements, and acceptance criteria.
- [Architecture](ARCHITECTURE.md) — static hosting, discovery pipeline, data model, resume processing, and privacy.
- [Implementation plan](IMPLEMENTATION_PLAN.md) — phases and exit criteria.
- [Decisions](DECISIONS.md) — accepted and open decisions.
- [AI-agent instructions](AGENTS.md) — operating rules and security requirements.
- [Changelog](CHANGELOG.md) — meaningful project changes.
- [Handoff](HANDOFF.md) — current state and next task.
- [Resume guidance](docs/resume-guidelines/) — source-linked standards and role-specific guidance.
- [Studio catalogue guide](docs/studio-catalog.md) — Phase 3 data semantics, evidence rules, and manual maintenance procedure.
- [Automated discovery plan](docs/operations/automated-discovery.md) — discovery design and conservative change-detection requirements.
- [Phase 4 runner guide](docs/operations/phase4-discovery-runner.md) — initial runner usage, fixtures, safety rules, and remaining acceptance gates.

## Repository hygiene

Do not commit CVs, resume exports, personal application history, correspondence, local database files, feedback reports, credentials, API keys, or deployment tokens. See `.gitignore` and `AGENTS.md`.
