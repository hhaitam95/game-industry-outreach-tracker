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


## Application campaign strategy — 2 November 2026

- Keep worldwide discovery broad, non-personalized and without an arbitrary maximum. Candidate preferences must not affect which studios are discovered or published.
- Retain the existing public-directory gates: direct game-development evidence plus an explicit official speculative/general application route. Do not confuse this route with an advertised vacancy.
- Apply candidate preferences only in the private matching and application queue. The current default order is Europe/nearby European markets, then English-language international markets such as the UK, Canada and the US, then wider global exploratory targets. These are priority tiers, not hard exclusions or work-authorization conclusions.
- Reuse one approved master resume/CV and one approved core motivation letter/message by default. Employer-specific requirements are flagged for human review; no automatic per-studio tailoring or factual embellishment.
- Keep professional relevance, application accessibility/readiness and personal priority separate. Do not introduce an ungrounded weighted composite score or hiring-probability estimate.
- Support coordinated application waves and a potentially 200+ application campaign only when the targets are genuinely relevant and application-ready. The number is an aspiration, not a quota or response guarantee.
- Track outcomes from submitted applications, not discovered studios. Do not stop the wider pipeline after one positive reply; continue until a written offer and material transition conditions are confirmed.
- Human review and final submission remain mandatory. Portal automation, autofill, file uploads, email sending and automated submission remain deferred and require separate approval.
- The strategy is documented in [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md). These decisions do not change public discovery eligibility or implementation status.

## Global discovery source choices — 2 November 2026

- Keep the existing automated source set: the four Wikidata feeds and recurring GameDevMap catalogue.
- Add IGDB Companies API as the sixth recurring candidate feed. It is limited to companies with developed-game credits and an official company website, and each candidate remains subject to the existing first-party studio/application verification.
- Reuse the existing repository Actions secrets `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET`; never expose their values in source, logs, summaries or public assets.
- Do not add other source services or APIs yet. Assess the coverage and verified yield of the existing feeds plus IGDB first; only revisit new sources after those options have been exhausted.
- Implementation is recorded in [ADR-081](docs/decisions/ADR-081-igdb-company-discovery-feed.md) and PR #100. The PR merged and GitHub Pages deployment succeeded on 2026-11-02. No additional source service is approved until the existing six feeds have been assessed.
