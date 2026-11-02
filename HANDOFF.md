# Handoff

Game Industry Outreach Tracker is a global speculative-application discovery directory with a private candidate profile, matching overlay and application workspace roadmap.

## Read first

- **Application campaign goals, target tiers, standard documents, readiness checks, campaign waves and outcome metrics:** [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md).
- **Candidate profile, matching, queue, application workspace and privacy/automation boundaries:** [Candidate Profile, Matching and Application Workspace](docs/architecture/candidate-profile-matching-application-workspace.md).
- **Global discovery qualification, evidence and source rules:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).
- Current product and implementation decisions: [ARCHITECTURE.md](ARCHITECTURE.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md), [DECISIONS.md](DECISIONS.md), [STATUS.md](STATUS.md).

## Current product direction

The product has three layers:

1. **Studio Discovery:** worldwide, non-personalized directory of legitimate game-development organisations with verified speculative/open application routes.
2. **Candidate Profile & Matching:** structured, private profile and explainable assessments of professional relevance, application readiness/accessibility and personal priority.
3. **Application Workspace:** private Application Queue, employer requirements summaries, candidate-skill evidence mapping, approved application materials, preparation checklist and progress tracking.

The discovery directory must remain complete and unaffected by the candidate's role, skills, geography or personal preferences. Matching and campaign prioritisation are private overlays over canonical studio records. The current campaign preference is to build a broad pool, prioritize a first wave in Europe/nearby markets, then consider English-language international markets and wider global options. These are private ordering preferences, not discovery exclusions or assumptions about work authorization.

## Immediate roadmap

1. **Candidate Profile foundation — merged in PR #95 and deployed.** Includes structured personal/professional records, skill evidence, master materials, preferences, separate browser-local IndexedDB storage and JSON backup/restore. PDF/DOCX originals are preserved; attachment text extraction is not included.

2. **Matching foundation — merged in PR #96.** Computes qualitative professional relevance, route freshness/accessibility and personal priority separately in the browser. It maps saved skill evidence to employer-stated discipline scope, leaves unspecified disciplines as unknown/potential, and shows the route source and check date. Assessments are recalculated rather than persisted; the Application Queue, manual overrides and deeper requirements intelligence remain later phases.
   - Matching-quality follow-up merged and deployed in PR #104. It tightens direct-versus-related discipline mapping, same-discipline evidence for Strong results, token boundaries, work-history matching, directory-country precedence, mixed work-model handling and region-first campaign sorting. PR CI, merged-main validation and Pages deployment passed.
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

## Global discovery — PR #100

The discovery expansion was merged in [PR #100](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/100) as commit `b3183f5fae5f3f3793dcefc3241f957267a56a79`. It retains GameDevMap and four Wikidata feeds and adds IGDB as a sixth recurring source. IGDB uses the developer-credit relationship plus the dynamically resolved official website type, with secret-backed server-side authentication, a 0.27-second minimum API request interval and a resumable numeric cursor. Candidate companies still require the existing official speculative-application proof before publication. Exact-head CI/browser acceptance passed in [run 41415897521](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41415897521), and GitHub Pages deployment completed in [run 41416182699](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182699). The first post-merge discovery batch is in [run 41416182708](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182708).

The user has explicitly chosen to exhaust the existing automated sources plus IGDB before considering any additional service/API sources. Do not add Tavily, Companies House or other candidate-source integrations until that source set has been assessed for yield and coverage.

## Handover rules

At the start of a new implementation session, read the Studio Targeting and Application Campaign Strategy alongside the two architecture documents above, then inspect the current default branch, open PRs, relevant UI/data schemas and tests. Do not assume prior status text is current without checking the repository. Distinguish proposed, implemented, tested, merged and deployed work accurately.

At each milestone, update HANDOFF.md and STATUS.md. Update CHANGELOG.md for meaningful changes and the relevant architecture/decision documents when scope changes. Never put personal application records, CVs, recruiter correspondence, secrets or private profile data in public repository source datasets, issues or PR descriptions.

The successful hourly discovery workflow writes the compact, names-free checkpoint `state/discovery/studio-source-status.json` on `discovery-state`. The daily **Monitor Studio Sources** automation uses it to detect a new exhausted feed, persistent operational blocker or recovery. Keep the GitHub Actions hourly workflow enabled; monitoring is read-only.
