# Game Industry Outreach Tracker

A worldwide, evidence-driven directory of video-game companies that explicitly accept **speculative applications**: applications made without a specific advertised job or deadline. The directory links to official studio websites or their own applicant-tracking pages so each entry can be checked at its source.

A route is not verified merely because a studio has a careers page. It must be reachable and explicitly invite applications without a particular vacancy or closing date. Aggregators may suggest a studio to investigate, but never count as verification evidence. Internship/graduate schemes with deadlines, recruitment agencies, and generic “see our jobs” pages do not qualify.

> **Privacy:** This public repository must never contain private candidate records, resumes, contact details, recruiter correspondence, credentials, or secrets. [STATUS.md](STATUS.md) is the single source of current milestone and verification state.

## Current product direction

- **Worldwide directory:** find game studios with official, evidence-backed speculative-application routes. A smaller verified set is preferable to a larger uncertain one.
- **Evidence and freshness:** preserve the official URL, route type, evidence category, a short original paraphrase, content hash and check dates; distinguish candidates from human-verified routes, routes needing review, and routes that have become stale.
- **Four route types:** dedicated application page, permanent speculative/open/general/unsolicited ATS posting, official email invitation (store only the page URL, never the email address), and talent-community signup shown separately.
- **Strict exclusions:** ordinary job postings, generic careers pages, timed internship/graduate schemes, agencies and aggregator-only claims are not verified speculative routes.
- **Manual applications:** the owner researches, adapts the resume/introduction and submits personally. The application never sends email or submits an application automatically, and never promises a response.
- **Role explorer retained but disabled:** legacy standard-role components, data and tests remain for later reuse. One config module defines `FEATURES.roleExplorer = false`; its UI, Overview counts, and associated copy are hidden by default.
- **Honest current UI:** the existing starter studio profiles are research context, not verified speculative-application routes. A generic careers page is not presented as proof of acceptance. The route schema, curated records and directory filters arrive in later milestones.
- **Supporting tools:** the browser-local encrypted tracker, resume processing, draft preparation and application follow-up remain supporting workflows; private records are never committed or uploaded.
- **Discovery automation:** GitHub Actions remains manual-dispatch-only. No schedule, live scan, or deployment runs automatically as part of these milestones.

## Current technical baseline

- React, TypeScript and Vite for a static GitHub Pages interface.
- Deterministic Node tests, ESLint, Prettier, TypeScript checks, dependency audit, artifact/privacy gates and browser-based encrypted-vault acceptance in GitHub Actions.
- The existing discovery pipeline will be reused for conservative official-route verification. It must respect robots.txt, rate limits and access controls; a blocked or changed source becomes `needs-review`, never silently deleted.
- GitHub Pages publishes only a validated static artifact from this repository. The existing `scripts/check-pages-artifact.mjs` and its tests are retained for M7.

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
- [Refocus decision (ADR-059)](docs/decisions/ADR-059-speculative-application-directory.md) — current product goal and route-evidence policy.
- [M1 design (ADR-060)](docs/decisions/ADR-060-m1-role-explorer-flag-and-reframing.md) — disabled-by-default legacy explorer and product wording.
- [Historical decisions](DECISIONS.md) — earlier architecture and implementation decisions.
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
