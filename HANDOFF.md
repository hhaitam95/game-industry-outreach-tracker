# Project Handoff

**Last updated:** 2026-10-24  
**Project stage:** Architecture revision prepared; review/commit pending  
**Default branch:** main  
**Baseline branch:** docs/project-foundation  
**Proposed architecture branch:** architecture/pages-actions-cv

## Purpose

Build a personal tool to discover game studios/opportunities worldwide, verify official application routes, build evidence-backed studio profiles, assess role fit with transferable technical skills, analyze a CV, prepare reviewed studio-specific outreach drafts, and track outcomes.

## Repository baseline

- Repository: https://github.com/hhaitam95/game-industry-outreach-tracker
- Current source/specification repository is private.
- Initial documentation foundation commit: 064d9487ad9b43d0b3a46d886b07d96b6371a09c on docs/project-foundation.
- This architecture revision is staged as an uncommitted tree proposal on architecture/pages-actions-cv; verify live refs before resuming and do not assume it was committed.

## Current architecture direction

- GitHub Pages is the public static frontend; it cannot run server-side Python and is not private cloud storage.
- Keep this repository private. GitHub Free Pages needs a public source repository, so the plan is a separate public deployment repo with only static assets and allowlisted public studio/opportunity data.
- Browser-side processing for uploaded CVs; no upload to server by default.
- Encrypted browser-local profile/draft/application data with user-controlled encrypted export/import; no automatic cloud sync in first release.
- Daily GitHub Actions schedule plus manual dispatch monitors the known registry; does not discover every studio worldwide.
- Use conservative change detection; failures/blocking are not closure evidence.
- Static rules-based CV analysis and DOCX/PDF generation; optional manual ChatGPT handoff; no API key/direct model API call in frontend.
- Resume guidance belongs under docs/resume-guidelines/ and must retain sources/review dates.
- Personal salary floor does not filter or rank opportunities; salary estimates are optional and evidence-backed.
- Human reviews and sends all emails/applications.
- Explicit approval is required before every commit.

## Current implementation state

- Application code is not implemented.
- Scheduled discovery workflow is specified but not implemented.
- Resume extraction/generation is specified but not implemented.
- docs/resume-guidelines/ and docs/operations/ are proposed in the architecture revision.
- Tests have not been created/run.
- Public Pages deployment repository has not been created.
- Cross-repository publish credential and exact deployment process remain undecided.
- No private candidate profile, CV, personal application data or secrets belong in source control.

## Next steps

1. Review/approve the proposed architecture/documentation change and its commit.
2. After this documentation baseline is committed, implement a minimal TypeScript/Vite static frontend shell and tests on a feature branch.
3. Then implement browser-local encrypted storage/export and establish the public data contract.
4. Build the discovery runner and scheduled workflow only after the studio registry, normalizer and tests exist.
5. Do not deploy public data until the public-data allowlist and privacy checks are tested.

## Known trade-offs

- Static Pages is public; private user data must not be published.
- Browser-local data is per browser/device and can be lost. Encrypted manual export/import is not seamless sync.
- A separate public deployment repository preserves this repo's privacy but adds a deployment token and workflow complexity.
- API-based AI analysis requires a separate backend and cost/privacy decision.
- Daily source monitoring is best effort and cannot guarantee global completeness.

## Handoff rules

Read README.md, PROJECT_SPECS.md, ARCHITECTURE.md, IMPLEMENTATION_PLAN.md, DECISIONS.md, AGENTS.md, and this file. Inspect the actual repository refs, files and tests before acting. Treat source code and GitHub state as authoritative, not prior chat context alone.
