# Game Industry Outreach Tracker

A personal, evidence-driven workspace for discovering video game studios and opportunities worldwide, assessing transferable technical skills, preparing tailored outreach, and tracking application outcomes.

> **Project status and verification evidence:** [STATUS.md](STATUS.md) is the single source of truth for the current phase, review state, checks, and next action. This public repository must never contain private candidate records, resumes, contact details, credentials, or secrets.

## Current frontend shell

- React + TypeScript with Vite for static site development and builds.
- Responsive workspace layout with navigation for overview, studio research, resume review, outreach, applications, and settings.
- The Studios & roles screen displays four manually sourced studio profiles, separate site/ownership/game-credit relationships, official career routes, and expandable source evidence. The catalogue and role snapshot are a limited starting point, not global studio/job coverage.
- Studios & roles combines the manually sourced studio profile cards with a build-time bundled, allowlisted public-opportunity snapshot. Role records are observed links from configured sources, not proof a vacancy is open; provenance and freshness are shown, and profile comparison is available only while the local vault is unlocked. The sample fallback is clearly labelled and its placeholder links are not real vacancies.
- Manual studio data is separate from encrypted private candidate/application records. Discovery remains manually triggered; a successful scan does not imply full listing coverage. The latest scan persisted 189 observed links (185 from Riot Games), all marked `last-seen`; the other configured sources need review. Pages publication is manual and restricted to a validated static build.
- ESLint, Prettier, TypeScript checks, Node's built-in test runner, an automated Chrome/Chromium vault smoke test, and privacy-conscious Markdown feedback reports.
- GitHub Actions validates formatting, lint, types, unit tests, dependency audit, privacy boundaries, the production build, and browser-level vault create/save/reload/lock/export/restore behavior.
- The encrypted workspace supports a versioned schema with v1 migration, editable and versioned outreach drafts, heuristic pre-send checks, and application/activity/follow-up tracking. Submissions require explicit user confirmation; the app never sends outreach, invokes an AI API, or uploads private records.
- Settings supports a passphrase-protected local vault, profile fields, basic application records, encrypted backup export/import, locking, and local deletion.
- Phase 6 adds browser-local DOCX/PDF/TXT extraction, deterministic review, editable structured blocks with provenance and before/after diff, locally generated DOCX, browser print/Save as PDF, and an optional explicitly disclosed/redacted manual AI handoff. Original files and edits stay in page memory unless the user requests an export; no resume text is uploaded or stored in the vault by this workflow. There is no server-side runtime, remote sync, raw CV storage, or automatic outbound communication.

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

GitHub Pages is a public static host, not a private server-side application. The existing source repository is already public and remains the single repository for source, tests, documentation, and the website deployment workflow. Phase 8 uploads only the validated Vite `dist/` artifact to GitHub Pages using this repository's Actions workflow; it does not publish the rest of the repository tree as website content. Publication is manual-only: `validate-only` is the default and `publish` is an explicit choice restricted to `main`. No separate output repository or personal access token is needed. Private profile facts, CV contents, drafts, application history, contact notes, credentials, and secrets are forbidden from the public artifact. The owner must set Settings → Pages → Source to GitHub Actions before the first deployment. Browser vault data remains local to the user's browser and is not cross-device cloud sync.

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
- [Public opportunity data contract](docs/public-data-contract.md) — exact snapshot fields, sample fallback, sync procedure, discovery-state ownership and manual-dispatch limits.
- [Feedback and stability process](docs/operations/feedback-and-stability.md) — how to report public-site bugs and enhancement ideas, run feedback cycles, and decide when the stable release is ready.

**Test feedback:** Use [GitHub Issue Forms](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/new/choose). Issues are public; do not include resumes, CV text, personal profile/application details, recruiter correspondence, vault exports, credentials, or screenshots containing private information.

## Repository hygiene

Do not commit CVs, resume exports, personal application history, correspondence, local database files, feedback reports, credentials, API keys, or deployment tokens. See `.gitignore` and `AGENTS.md`.
