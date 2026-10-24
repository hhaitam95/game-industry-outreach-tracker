# Changelog

Meaningful changes are recorded here. This file starts with the initial documentation/scaffolding baseline; entries should describe committed changes and must not claim work is complete before it is verified.

## Unreleased

- Upgraded ESLint to supported v10.13.0, aligned `@eslint/js` to v10.0.1, and set the ESLint-10-compatible `typescript-eslint` range; the isolated upgrade validation passed, with standard CI on the feature-branch commit as the final acceptance check.

- Follow-up hardens feedback reports by omitting branch names and filenames and replacing free-form diagnostic excerpts with fixed, non-sensitive categories.
- CI checks now continue independently after dependency installation, so a formatting failure cannot hide lint, type, test, build, or production-dependency audit results.
- Aligned Prettier settings with the existing double-quote style and documented that CSS syntax is checked by the production build rather than Prettier.
- Pinned install-script approval to the locked esbuild 0.25.2 package and refreshed the dependency lockfile within declared semver ranges. The candidate's full npm audit returned zero vulnerabilities; standard CI on the final commit remains the acceptance gate.


- Added the Phase 1 React/TypeScript/Vite static workspace shell with responsive section navigation and honest feature placeholders.
- Added a locked Node toolchain, formatting/lint/type/test/build scripts, and GitHub Actions CI for branch pushes and pull requests.
- Added the optional `npm run feedback-report` script and exact macOS/VS Code instructions for local troubleshooting; report output omits raw logs and file contents.
- Cloud validation should be checked in the latest GitHub Actions run for the Phase 1 branch; no public deployment or discovery/resume workflow is included in this change.

- Revised architecture direction to GitHub Pages static hosting plus browser-local private data, with a separate public deployment target planned.
- Specified daily/manual GitHub Actions monitoring, conservative change detection, and public-data allowlisting.
- Added browser-first resume analysis and DOCX/PDF generation design, optional manual ChatGPT handoff, and source-linked resume guidance.
- No workflow, frontend code, resume processing code, or deployment has been implemented yet.

- Approved baseline requirements and implementation direction documented.
- Added architecture proposal for evidence-backed discovery, role matching, human-reviewed outreach, application tracking, optional salary estimates, and private remote access.
- Added AI-agent operating rules and repository safety/approval requirements.
- Application code and automated tests have not yet been implemented.
