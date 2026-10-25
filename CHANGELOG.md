# Changelog

Meaningful changes are recorded here. This file starts with the initial documentation/scaffolding baseline; entries should describe committed changes and must not claim work is complete before it is verified.

## Unreleased

- Hardened the Phase 2 browser smoke test to verify exact encrypted-envelope metadata and binary lengths, and to test that an incorrect passphrase is rejected by the Settings UI without exposing private records.

- Added a dependency-free Chrome/Chromium browser acceptance test for Phase 2 vault creation, persistence, lock/unlock, encrypted backup export, restore, and plaintext-canary checks. GitHub Actions stores a sanitized Markdown report artifact; the local feedback report now includes privacy-boundary and browser checks.

- Upgraded ESLint to supported v10.13.0, aligned `@eslint/js` to v10.0.1, and set the ESLint-10-compatible `typescript-eslint` range; isolated upgrade validation and standard CI on the feature-branch commit passed.

- Follow-up hardens feedback reports by omitting branch names and filenames and replacing free-form diagnostic excerpts with fixed, non-sensitive categories.
- CI checks now continue independently after dependency installation, so a formatting failure cannot hide lint, type, test, build, or production-dependency audit results.
- Aligned Prettier settings with the existing double-quote style and documented that CSS syntax is checked by the production build rather than Prettier.
- Pinned install-script approval to the locked esbuild 0.25.2 package and refreshed the dependency lockfile within declared semver ranges. The candidate's full npm audit returned zero vulnerabilities, and standard CI on the ESLint-upgrade commit passed.


- Added the Phase 1 React/TypeScript/Vite static workspace shell with responsive section navigation and honest feature placeholders.
- Added a locked Node toolchain, formatting/lint/type/test/build scripts, and GitHub Actions CI for branch pushes and pull requests.
- Added the optional `npm run feedback-report` script and exact macOS/VS Code instructions for local troubleshooting; report output omits raw logs and file contents.
- Added a GitHub Actions preview smoke test that serves the shell and generated JavaScript/CSS assets under `/game-industry-outreach-tracker/`; the new check passed in closeout-candidate validation and is included in standard CI for the feature-branch closeout commit. No visual browser review or public deployment has been performed.

- Revised architecture direction to GitHub Pages static hosting plus browser-local private data, with a separate public deployment target planned.
- Specified daily/manual GitHub Actions monitoring, conservative change detection, and public-data allowlisting.
- Added browser-first resume analysis and DOCX/PDF generation design, optional manual ChatGPT handoff, and source-linked resume guidance.
- Studio-discovery automation, resume-processing code, and deployment are not implemented; the Phase 1 frontend shell is implemented as noted above.

- Approved baseline requirements and implementation direction documented.
- Added architecture proposal for evidence-backed discovery, role matching, human-reviewed outreach, application tracking, optional salary estimates, and private remote access.
- Added AI-agent operating rules and repository safety/approval requirements.
- Application code and automated tests have not yet been implemented.

## 2026-10-25 — Phase 2 private-data foundation

- Added strict versioned schemas for private profile, resume metadata, outreach drafts, and application records; raw CV content is not persisted.
- Added a passphrase-derived AES-256-GCM vault, encrypted IndexedDB persistence, encrypted backup export/import, lock/delete actions, and a Settings workflow.
- Added cryptographic/schema tests and a post-build privacy-boundary check in frontend CI. Standard cloud CI passed in run 40144691400; the documented dummy-data browser smoke test remains pending.
