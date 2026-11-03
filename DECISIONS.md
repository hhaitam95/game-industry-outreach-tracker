# Product decisions

**Last updated:** 2 November 2026

## Product direction

Game Industry Outreach Tracker has five connected systems:

1. **Studio Discovery** — global, evidence-backed discovery of studios with verified speculative/open application routes.
2. **Candidate Profile** — private source of truth for candidate facts, skill evidence, preferences and approved materials.
3. **Matching Engine** — private and explainable assessment of studio data against the candidate profile.
4. **Application Preparation** — analysis of the selected employer's actual application route/form and user-reviewed preparation of answers and materials.
5. **Application Tracker** — one private record for selected/preparing targets, user-confirmed submissions and subsequent outcomes.

The Candidate Profile is maintained independently and feeds both Matching and Application Preparation. The current My applications record is the single application lifecycle record: a target may be Saved/Preparing before submission and becomes Applied only after the user confirms that the employer submission is complete.

The discovery catalogue remains worldwide and impartial. Candidate preferences are a private assessment/prioritisation overlay and must never remove, suppress, qualify or reorder studios in the public directory. See the [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md) for the overall workflow and data boundaries.

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


## Five-system workflow and Application Preparation — 3 November 2026

- Adopt Studio Discovery, Candidate Profile, Matching Engine, Application Preparation and Application Tracker as the five distinct product responsibilities.
- Keep discovery public, worldwide and non-personalized; Candidate Profile and all matching/preparation/application state remain private and browser-local under the current static-hosting architecture.
- The profile is a reusable input to both matching and application preparation. Matching results are private assessments, not changes to public studio records.
- Introduce Application Preparation as the dedicated stage between a selected match and an actual submission. It should identify employer form fields/questions, documents, constraints and requirements where permitted information is accessible; map them to candidate facts; and prepare editable, evidence-grounded drafts and checklists.
- Keep one canonical My applications record through selection, preparation, user-confirmed submission and later outcomes. Do not create a second queue/history.
- The initial preparation workflow is assistive and user-reviewed. Copyable values, drafts, checklists and direct employer links are in scope for design; browser-extension/ATS interaction, autofill, automatic uploads, email integration and automatic submission remain separately gated and are not authorized by this decision.
- A static GitHub Pages app cannot reliably inspect every cross-origin, dynamic or authenticated ATS form. The feature must include an honest, user-assisted fallback and must not bypass access restrictions or anti-bot controls.
- Detailed direction is recorded in [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md) and [Candidate Profile, Matching, Application Preparation and Tracking](docs/architecture/candidate-profile-matching-application-workspace.md). This is a product/architecture decision, not a claim that Application Preparation has been implemented.

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
