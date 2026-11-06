# Handoff

Game Industry Outreach Tracker is a five-system workflow for discovering suitable studios, matching them against a private candidate profile, preparing applications and tracking confirmed submissions.

## Read first

- **Overall product architecture and five-system workflow:** [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md).
- **Steps for the first application campaign:** [First application campaign runbook](docs/operations/first-application-campaign-runbook.md).
- **Detailed Candidate Profile, Matching, Application Preparation and Tracker requirements:** [Private-system architecture](docs/architecture/candidate-profile-matching-application-workspace.md).
- **Campaign goals, target tiers, standard documents, readiness checks, waves and outcome metrics:** [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md).
- **Global discovery qualification, evidence, source/access rules and coverage cadence:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).
- Current project decisions and implementation state: [ARCHITECTURE.md](ARCHITECTURE.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [DECISIONS.md](DECISIONS.md), [STATUS.md](STATUS.md).

## The five systems

1. **Studio Discovery:** worldwide, non-personalized automation and directory for studios with verified speculative/open/general application routes.
2. **Candidate Profile:** private structured source of truth for candidate facts, skills/evidence, preferences and approved application materials.
3. **Matching Engine:** private assessment using both directory data and the candidate profile; professional relevance, route accessibility/readiness and personal priority remain separate.
4. **Application Preparation:** analyze the selected studio's actual official application route/form, identify requirements and questions, map candidate facts, and prepare editable answers/material checklists for review.
5. **Application Tracker:** one private record for a selected/preparing target, user-confirmed submission and manually updated progress/outcomes.

The Candidate Profile is configured independently and feeds both Matching and Application Preparation. The existing My applications item is the single canonical application record: it can exist as Saved/Preparing before submission and moves to Applied only when the user confirms submission. Do not create a second queue or duplicate history.

## Current implementation position

- **Studio Discovery V1:** scheduled discovery workflow, verification, public directory and source-health monitoring are operational. Treat V1 as maintenance-led; continue routine source checks and fix real reliability/data-quality defects. It is not an exhaustive census of all studios worldwide.
- **Candidate Profile:** structured profile, skill evidence, master materials, preferences, browser-local IndexedDB and backup/restore foundations are implemented. Persistence hardening is in place; continue the backend correctness audit.
- **Matching Engine:** on-device qualitative matching and quality improvements are implemented, including separate relevance/readiness/priority dimensions and explanations. Continue deterministic edge-case and false-positive validation.
- **Application Tracker:** basic browser-local My applications tracking, match handoff, route-context snapshots, statuses, notes and backup/restore/recovery are implemented. Continue data-integrity audit and refine the selected → preparing → applied lifecycle.
- **Application Preparation:** a manual-assisted first version is included in My applications: six readiness checks, private employer requirement/question notes and draft-answer/missing-information notes. It persists locally and is included in tracker backups. Automatic page analysis, ATS integration, autofill and uploads remain unimplemented.

Implementation status and merged/deployed claims must be checked against the current repository and Actions runs before being repeated.

## Immediate development sequence

1. Complete backend correctness across Candidate Profile, Matching and My applications: storage validation, asynchronous import/save races, backup/restore, migrations, duplicate handling, match evidence and status transitions. Preserve user data on invalid or interrupted operations.
2. Design Application Preparation in depth before coding: application-page analysis method and fallback, requirements/field data model, candidate mapping, answer-draft behavior, material versioning, review UX and privacy constraints.
3. Implement a non-invasive Application Preparation V1 with sourced requirements, editable candidate-grounded answers, missing-information warnings, document checklist, copyable values and direct employer links. The candidate completes and submits externally.
4. Integrate preparation with the existing canonical My applications record; only the user's explicit confirmation makes it Applied.
5. Test against varied official forms and ATS platforms, including dynamic/authenticated/inaccessible pages and unusual requirements.
6. Consider browser-extension/autofill assistance only as a later, separate architecture decision and only after explicit approval. Never automate final submission.

Do not spend additional time restructuring a stable discovery engine without a demonstrated defect. Do not rush into portal automation before the existing data lifecycle is reliable.

## Privacy and automation boundaries

- GitHub Pages is public static hosting, not a private authenticated backend.
- Candidate profile, CVs, motivation drafts, preferences, match assessments, preparation drafts, queue state, application history and notes remain browser-local.
- Browser storage is not automatically encrypted and can be cleared; user-controlled backup/restore is required.
- The discovery-state branch is publicly visible and may contain public employer leads and aggregate operational metadata only.
- Never publish candidate data in repository files, Pages assets, Actions logs/artifacts, issues or PR descriptions.
- Any private backend, cloud sync or external AI processing requires a separate explicit privacy decision and user approval.
- The static site cannot reliably inspect arbitrary third-party cross-origin or authenticated ATS forms. Provide a user-assisted fallback and respect site controls/terms.
- No browser extension, portal autofill, automatic uploads, email sending or automatic Submit interaction is authorized by the current scope.
- Human review and final employer-site submission remain mandatory.

## Existing foundation and key paths

- Public directory: src/data/speculative-route-directory.json.
- Studio profiles and game metadata: src/data/studio-profiles.json.
- Candidate Profile and matching: browser-local/on-device.
- Existing application tracker: browser-local My applications.
- Discovery implementation: scripts/discover_speculative_studios.py.
- Discovery workflow: .github/workflows/discover-studios.yml.
- Discovery cursors and aggregate operational state: public discovery-state branch; never store applicant personal data or secrets there.

## Handover rules

At the start of a new session, inspect the current default branch, open PRs, relevant schemas/tests, discovery-state checkpoint and latest successful workflows. Read the five-system blueprint and detailed specifications. Distinguish proposed, implemented, tested, merged and deployed work. Update HANDOFF.md and STATUS.md after milestones, CHANGELOG.md for meaningful changes, and the relevant architecture/decision documents when scope changes. Never place candidate-specific information in public repository content.
