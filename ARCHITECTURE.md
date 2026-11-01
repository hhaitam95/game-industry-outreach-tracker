# Architecture

**Last reviewed:** 2026-11-01

## Product layers

The product has three separate layers:

1. **Studio Discovery** — a global, evidence-backed directory of game-development organisations with verified speculative/open application routes.
2. **Candidate Profile & Matching** — a private, browser-local candidate profile and explainable assessment of each studio against the user's professional background and preferences.
3. **Application Workspace** — a private queue of selected studios, application requirements, preparation materials and progress tracking.

The discovery layer remains global and impartial. Candidate preferences must not alter public discovery, qualification, ordering or publication. Matching is a private overlay over canonical studio records.

Detailed behavior, data concepts, privacy boundaries, acceptance criteria and the deferred automation boundary are specified in [Candidate Profile, Matching and Application Workspace](docs/architecture/candidate-profile-matching-application-workspace.md).

## Website and hosting

- React and Vite publish static assets on GitHub Pages.
- Public data lives in `src/data/speculative-route-directory.json` and `src/data/studio-profiles.json`; publish only verified, public-safe studio facts and route information.
- GitHub Pages has no private server-side runtime or authentication. Candidate data must remain browser-local.
- Use IndexedDB for structured candidate profile data, private assessments, queue records and binary documents where appropriate. Preserve/migrate the existing localStorage tracker rather than silently discarding it.
- Provide user-controlled export/import and explain that browser storage is device/browser/origin-specific, can be cleared and is not automatically encrypted.
- Never commit candidate profile data, CVs, drafts, queue state, application history or private notes.

## Candidate profile and matching

- Keep one structured candidate profile as the source of truth for experience, education, projects, skills and evidence.
- Maintain an approved master resume and master motivation letter/message for reuse. Do not generate per-studio resume variants by default or invent/overstate skills.
- Skill evidence distinguishes demonstrated, transferable, learning/exposure, not evidenced and user-confirmed gaps.
- Assess professional relevance, application accessibility/readiness and personal priority as separate dimensions.
- Explain results with employer evidence, profile evidence, source URLs, review dates and explicit unknowns. A compatibility category is not a probability of being hired.
- Preferences influence personal priority only; they never change the global directory.
- The Application Queue references canonical studio IDs and stores only private user-specific state.

## Application requirements and workspace

- Summarize only employer-supported application instructions: route type, channel, required/optional documents, discipline, form questions, language, location, eligibility and other special requirements.
- Mark each finding as explicit, inferred or unknown, with source and verification date.
- The workspace presents studio context, route, requirements, skill mapping, approved materials, preparation checklist, notes and application progress.
- Align its status model with the existing tracker; do not create competing application records or duplicate status vocabularies.

## Deferred automation boundary

No browser extension, desktop companion, external-tab control, ATS adapter, portal autofill, automatic upload, email sending or Submit-button automation is included in the current roadmap. Application preparation may provide copyable information and direct employer links. Any future portal automation requires a separate design and explicit approval; it must preserve user review and final submission control.

## Discovery implementation

- `scripts/discover_speculative_studios.py` collects candidates from GameDevMap and three Wikidata feeds.
- Candidate sources are leads only. A candidate is published only when direct game-development activity and an explicit employer-backed speculative/open route are verified.
- The verifier uses bounded concurrency, per-host pacing, public-host/HTTPS checks, page/response limits and conservative closure rules.
- Network failures, blocks, robots denials and ambiguous evidence never count as route closures.
- Discovery state and cursors are stored on the separate `discovery-state` branch. Public datasets are validated before deployment.
- Keep discovery maintenance independent from candidate matching and personal application state.
