# Handoff

Game Industry Outreach Tracker is a global speculative-application discovery directory with a private candidate profile, matching overlay and application workspace roadmap.

## Read first

- **Candidate profile, matching, queue, application workspace and privacy/automation boundaries:** [Candidate Profile, Matching and Application Workspace](docs/architecture/candidate-profile-matching-application-workspace.md).
- **Global discovery qualification, evidence and source rules:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).
- Current product and implementation decisions: [ARCHITECTURE.md](ARCHITECTURE.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [DECISIONS.md](DECISIONS.md), [STATUS.md](STATUS.md).

## Current product direction

The product has three layers:

1. **Studio Discovery:** worldwide, non-personalized directory of legitimate game-development organisations with verified speculative/open application routes.
2. **Candidate Profile & Matching:** structured, private profile and explainable assessments of professional relevance, application readiness/accessibility and personal priority.
3. **Application Workspace:** private Application Queue, employer requirements summaries, candidate-skill evidence mapping, approved application materials, preparation checklist and progress tracking.

The discovery directory must remain complete and unaffected by the candidate's role, skills, geography or personal preferences. Matching is a private overlay over canonical studio records.

## Immediate roadmap

1. **Candidate Profile foundation — implemented on PR #95 branch, not yet merged/deployed.** Includes structured personal/professional records, skill evidence, master materials, preferences, separate browser-local IndexedDB storage and JSON backup/restore. PDF/DOCX originals are preserved; attachment text extraction is not included.

2. Matching engine — transparent qualitative assessment; explicit/inferred/unknown employer requirements; evidence, gaps and manual overrides.
3. Application Queue — private user-selected records referencing canonical studio IDs.
4. Requirements intelligence — source-linked route instructions, document/form requirements, discipline, language, location and eligibility caveats.
5. Application Workspace — studio context, route, requirements, skill mapping, approved materials, checklist, notes and progress.
6. User evaluation and refinement before considering any further automation.

## Automation boundary

Portal automation is explicitly deferred. Do not implement a browser extension, desktop companion, external-tab control, ATS adapters, portal autofill, automatic uploads, email sending or automated Submit interaction as part of the current profile/matching/workspace roadmap. Any future automation requires a separate design and explicit approval. Human review and final submission control remain mandatory.

## Privacy boundaries

- GitHub Pages is public static hosting, not a private authenticated backend.
- Candidate profile, CV files/text, motivation drafts, preferences, private assessments, queue state, application history and notes remain browser-local.
- Prefer IndexedDB for private structured records/files, preserve existing localStorage tracker data, and provide user-controlled export/import.
- Browser storage is not automatically encrypted and can be cleared; communicate this clearly.
- Never commit or publish candidate data in repository files, Pages assets, Actions logs/artifacts, issues or PR descriptions.
- Any private backend, cloud sync or external AI processing requires a separate explicit privacy/architecture decision and user approval.

## Existing foundation

- React/Vite static site on GitHub Pages.
- Public directory data: `src/data/speculative-route-directory.json`.
- Researched studio profiles: `src/data/studio-profiles.json`.
- Existing personal application tracker uses browser localStorage.
- Discovery implementation: `scripts/discover_speculative_studios.py`.
- Discovery workflow: `.github/workflows/discover-studios.yml`.
- Discovery cursors/state are maintained on the separate `discovery-state` branch.

## Handover rules

At the start of a new implementation session, inspect the current default branch, open PRs, relevant UI/data schemas and tests. Do not assume prior status text is current without checking the repository. Distinguish proposed, implemented, tested, merged and deployed work accurately.

At each milestone, update HANDOFF.md and STATUS.md. Update CHANGELOG.md for meaningful changes and the relevant architecture/decision documents when scope changes. Never put personal application records, CVs, recruiter correspondence, secrets or private profile data in public repository source datasets, issues or PR descriptions.
