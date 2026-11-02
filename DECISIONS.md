# Product decisions

**Last updated:** 2 November 2026

## Product direction

Game Industry Outreach Tracker has three connected layers:

1. Global directory of game-development organisations with verified speculative/open application routes.
2. Private candidate profile and matching system.
3. Private application queue and workspace for requirements, preparation and progress.

The discovery catalogue remains worldwide and impartial. Candidate preferences are a private ranking/assessment overlay and must never remove or suppress studios from the global directory.

## Candidate profile

- Maintain structured experience, education, projects/training, skills and supporting evidence.
- Distinguish demonstrated, transferable, learning/exposure, not evidenced and user-confirmed gap skill states.
- Reuse one approved master resume and one master motivation letter/message by default.
- Never invent, overstate or silently modify candidate facts or approved documents.
- Preferences include role families, work arrangements and geographical priority tiers. Preferences affect personal priority, not professional compatibility or directory inclusion.

## Matching

- Assess professional relevance, application accessibility/readiness and personal priority separately.
- Use explainable qualitative classifications; do not claim to predict hiring probability.
- Show employer requirements, candidate evidence, gaps, unknowns, source URLs and verification dates.
- Distinguish explicit employer statements, cautious inference and unknown information.
- Keep uncertain/transferable opportunities visible for user judgment; hard-exclude only clear incompatibilities or confirmed blockers.
- Allow user review and manual overrides.

## Application Queue and workspace

- The Application Queue is a private working set that references canonical studio records; it is not a duplicate directory.
- Each queued item stores user-specific priority, assessment state, progress, notes and timestamps.
- Workspace details include studio context, application route, requirements, skill mapping, approved materials, preparation checklist and progress.
- Align with the existing My applications tracker and avoid duplicate status models or records.
- Selecting an opportunity is not authorization to submit an application.

## Privacy and hosting

- Current hosting is static GitHub Pages with no private backend/authentication.
- Candidate profile, documents, preferences, assessments, queue state and application history remain browser-local.
- Prefer IndexedDB for structured/private records and files; preserve/migrate existing localStorage tracker data.
- Provide user-controlled export/import and clearly explain that browser storage is not automatically encrypted and can be cleared.
- Never publish private candidate data in repository files, Pages assets, Actions logs/artifacts, issues or PRs.
- Any future external AI processing or private backend requires a separate explicit decision and user approval.

## Application automation boundary

- Current roadmap includes profile, matching, queue, requirements intelligence and application preparation only.
- Browser extension, desktop companion, portal recognition, ATS adapters, autofill, automated uploads, email sending and automated Submit interaction are deferred.
- Future automation requires a separate design and explicit approval. Human review and final submission control remain mandatory.

## Existing directory and tracker

- Keep the verified global directory and its official route/evidence standards.
- Existing tracker remains browser-local. Reconcile its statuses with the new workspace rather than creating competing records.
- Preserve the distinction between studio headquarters, actual hiring location, remote eligibility and work-authorisation rules.


## Global discovery source choices — 2 November 2026

- Keep the existing automated source set: the four Wikidata feeds and recurring GameDevMap catalogue.
- Add IGDB Companies API as the sixth recurring candidate feed. It is limited to companies with developed-game credits and an official company website, and each candidate remains subject to the existing first-party studio/application verification.
- Reuse the existing repository Actions secrets `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`; never expose their values in source, logs, summaries or public assets.
- Do not add other source services or APIs yet. Assess the coverage and verified yield of the existing feeds plus IGDB first; only revisit new sources after those options have been exhausted.
- Implementation is recorded in ADR-081 and PR #100. The latest pre-documentation CI run passed; PR #100 remains open and is not deployed.
