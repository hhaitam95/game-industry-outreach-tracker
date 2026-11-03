# Studio targeting and application campaign strategy

**Status:** Strategy agreed on 2026-11-02; future workflow/design guidance, not a claim of implementation  
**Scope:** Private studio prioritisation, application-readiness review, coordinated application campaigns and outcome tracking  
**Depends on:** [Global Discovery Implementation Model](global-discovery-implementation-model.md) and [Candidate Profile, Matching and Application Workspace](candidate-profile-matching-application-workspace.md)

This document preserves the application strategy when work continues in another chat or by another contributor. It complements the global discovery rules; it does not change them.

## 1. Objective

Build a sufficiently broad, evidence-backed pool of game-industry employers so that the candidate can pursue a substantial coordinated application campaign rather than depending on a small number of companies or researching each employer from scratch.

The campaign may ultimately contain 200+ applications, but that is an aspiration for scale, not a quota, guaranteed result or reason to submit irrelevant applications. A discovered studio is not automatically an actionable application, and an application route is not proof that a suitable vacancy exists or that the employer is likely to respond.

The intended operating model is:

1. Discover broadly across the world.
2. Verify and preserve reliable studio and application-route data.
3. Privately assess each studio against the candidate's profile and preferences.
4. Review and prepare a large, prioritized application batch.
5. Submit through the employer's approved route with the candidate in control.
6. Track outcomes and use the evidence to refine later batches.

The system should remove repetitive research and administration, not remove human judgment from application decisions.

## 2. Keep the five systems separate

The overall workflow is defined in the [Five-System Product Blueprint](five-system-product-blueprint.md). Campaign strategy operates across the private systems without changing the public discovery rules.

### 2.1 Studio Discovery

The public directory remains worldwide, coverage-led and non-personalized. It must not rank, hide, suppress or exclude a studio because of the candidate's location preferences, language preferences, career interests or perceived likelihood of hiring.

The current public directory has a deliberately narrower publication rule than a general census of every game company: an organisation must demonstrate direct game-development activity and an explicit employer-backed speculative, unsolicited, spontaneous, open or general application route. Candidate indexes are leads only. Keep these two qualification gates and all source licensing, terms, provenance and first-party verification rules.

There is no arbitrary discovery ceiling. Continue expanding and refreshing coverage when reliable sources and new candidates are available. A global discovery baseline is a practical checkpoint, not proof that every studio worldwide has been found.

### 2.2 Private matching and prioritisation

The matching layer may order the user's own work queue, but it must not alter public discovery records. Assess these dimensions independently:

- **Professional relevance:** how the employer's stated work or application scope relates to demonstrated, transferable and developing candidate skills.
- **Application accessibility/readiness:** whether the official route is current and what documents, questions, language, location, contract or eligibility requirements need attention.
- **Personal priority:** the candidate's preferred geography, language/work environment, studio type, role family and manually expressed interest.
- **Confidence and unknowns:** source quality, last verification date and facts that have not been established.

Use explainable qualitative assessments and visible reasons. Do not introduce a single weighted score, fabricated precision or a predicted chance of being hired without a separately agreed, evidence-based design. In particular, do not treat an unknown sponsorship, eligibility, language or remote-work policy as a confirmed negative.

The current matching architecture already separates professional relevance, route status/accessibility and personal priority. Preserve that model rather than replacing it with one composite score.

### 2.3 Application Preparation

Application Preparation is the dedicated stage after a candidate selects a promising match and before the user submits on the employer's site. It should identify actual route/form requirements, documents, questions and constraints where permitted information is accessible; map them to the Candidate Profile; and prepare editable, truthful, user-reviewed answers and checklists. Unknowns remain visible and are never guessed. The current static website cannot inspect every cross-origin, dynamic or authenticated ATS form, so a user-assisted fallback is required. Portal autofill, automatic uploads, email access/sending and automated submission remain separate decisions requiring explicit approval.

### 2.4 Application Tracker

The existing My applications item remains the single canonical private record from selected/preparing target through user-confirmed submission and later outcomes. Preparation must not create a second history. Only user-confirmed submissions count as applications in campaign outcome metrics. The candidate manually updates later statuses as employer communication arrives; email remains external in the initial scope.

### 2.5 Application opportunity types

Keep these concepts distinct in data and UI:

- **Studio/organisation:** the canonical employer or development organisation.
- **Office/location:** a known studio office or work location. Headquarters alone do not establish the location of a particular job.
- **Speculative/general application route:** an employer-backed route for future or general consideration, which is the current public directory's focus.
- **Specific vacancy:** an advertised role with its own title, requirements, location, status and closing date. A vacancy is not the same thing as an open speculative route.
- **Application instance:** one candidate's private record of applying to a particular employer route or vacancy, with the material version and outcome tracked.

Do not present a general application route as an active vacancy, or imply that a studio without a currently advertised role is hiring for a particular discipline. A future vacancy-discovery feature should be separately modelled and linked to canonical studio records.

## 3. Default targeting priorities

The candidate's current preference is to start with Europe and nearby European markets, then consider major English-language markets, and broaden further internationally if needed. Treat these as editable private campaign tiers, not fixed global rules.

A practical initial ordering is:

1. **First wave — Europe and nearby European markets.** Prioritise studios whose actual application location, language and work arrangements appear compatible with the candidate's preferences. Geographic proximity is a prioritisation factor, not proof of work authorisation or relocation feasibility.
2. **Second wave — English-language international markets.** Consider the United Kingdom, Canada and the United States where the working language and application route are suitable. Treat immigration, work authorisation, sponsorship and relocation requirements as separate facts to verify; English-language work does not imply employment eligibility.
3. **Third wave — broader worldwide opportunities.** Keep other regions available, including smaller and indie studios and markets that may be less straightforward. Prioritise them when the employer explicitly supports international applicants, remote work across the candidate's country, relocation or a viable contract arrangement.

Do not automatically discard a country because it is far away, unfamiliar or not in the first wave. Do not infer working language from the country, a translated website or the language of a game's release. Record language as explicit, evidenced-but-not-explicit, or unknown.

Before applying, distinguish:
- employer headquarters;
- actual role/work location;
- remote or hybrid arrangement;
- countries from which remote work is permitted;
- applicant-country and work-authorisation conditions;
- relocation or sponsorship support.

Unknown remains unknown. Do not infer legal eligibility from nationality, residence, an existing permit, headquarters or an advertised remote label.

## 4. Standard application package

The default campaign package is deliberately standardized:

- **One approved master resume/CV.**
- **One approved core motivation letter/message.**

The system should make these easy to reuse and should not create a new tailored resume or motivation letter for every studio by default. The master documents must remain truthful, internally consistent and grounded in the candidate profile. Do not invent experience, tools, achievements, portfolio work, language ability or eligibility to fit a target.

The core positioning should focus on the role families supported by the current candidate profile. Relevant adjacent families can include technical support, developer support, game/technical support, technical operations, online-services support and support-to-DevOps/build/release work where the employer's scope aligns. Do not broaden the same package indiscriminately to unrelated art-only, player-support-only or highly specialised engineering roles without reviewing the actual requirements.

A target may require an exception when the employer explicitly asks for a different document, role-specific response, local-language material, portfolio/showreel, mandatory questionnaire or a distinct job-family application. Flag the exception for manual review. Do not silently generate a tailored variant or force the application through merely to preserve the bulk workflow.

Preserve the original approved documents. Any change to the master resume or motivation letter requires the candidate's review and approval. Store private application-material versions and application history locally; never put personal documents or private application data in the public repository.

## 5. Campaign preparation and execution

### 5.1 Application-readiness review

Before a target enters a launch batch, show a concise review card containing:

- canonical studio identity and official website;
- direct employer-backed application route and evidence page;
- route type and last-verified date;
- relevant studio/role scope and why it matches the profile;
- actual work location and work model, when stated;
- working-language evidence;
- applicant eligibility, work-authorisation, sponsorship and relocation statements, including explicit unknowns;
- required and optional documents, fields, questions and portfolio requirements;
- any exception that prevents use of the standard package.

Refresh or recheck the route before submission when its verification date is stale or the employer's process may have changed. A route listed as active is not a guarantee that the form still works, that a particular role is open, or that the candidate meets every condition.

A target should be classified as one of:
- **Ready for candidate review:** core evidence is present; final human review remains.
- **Needs information:** an important route, role, language, location or eligibility detail is unknown or stale.
- **Exception required:** the employer requests additional or materially different materials/answers.
- **Do not pursue now:** a confirmed blocker or a clear mismatch exists. Keep the studio in the global directory.

Do not turn uncertainty into an automatic rejection. Keep an explicit review path for unknowns and potentially transferable matches.

### 5.2 Coordinated batches

The candidate prefers to reduce repetitive work by reviewing and sending a large set of applications in a dedicated session or weekend. The workflow should support a queue that can be reviewed sequentially with minimal context switching: open studio, check the concise assessment, open the official route, submit the approved package and record the result.

The first batch should prioritize the strongest relevant targets within the preferred geographic/language tiers. Later waves can broaden geography, studio size, role adjacency and contract flexibility. The exact batch sizes should be determined from the number of genuinely application-ready targets and the amount of manual work required by external forms, not from a fixed quota.

A large campaign can be coordinated closely in time, but not every employer has a one-click application process. External ATS forms may require separate accounts, questionnaires, consent choices, portfolio links or role selection. The product should expose these exceptions instead of pretending that every application can be submitted identically.

**The candidate must review and perform the final submission.** The current project does not authorize automatic portal interaction, autofill, file uploads, email sending or Submit-button automation. Any such automation requires a separate design and explicit approval.

### 5.3 Three campaign waves

- **Wave 1 — strongest matches:** first-priority geography/language tier, credible professional fit, verified route and standard-package compatibility.
- **Wave 2 — broader but still relevant:** additional European and English-language international targets, adjacent role families and smaller/indie studios, after checking location and eligibility conditions.
- **Wave 3 — exploratory international reach:** other regions and more flexible studio/contract arrangements where official evidence supports a viable application.

These are planning waves, not rigid exclusions. A clearly excellent opportunity can be pursued as soon as it is ready; the candidate does not need to wait for a complete worldwide census before applying.

## 6. Outcome tracking and learning

Track the campaign as a funnel. At minimum, distinguish:

- discovered organisations;
- unique canonical studios after deduplication;
- verified speculative routes;
- privately qualified targets;
- targets reviewed by the candidate;
- application-ready targets;
- applications submitted;
- acknowledgements/receipts;
- recruiter or hiring-team responses;
- screening calls and interviews;
- offers;
- rejections, withdrawals and no-response outcomes.

Response and conversion rates must use submitted applications as the denominator, not the number of discovered studios. Where useful, compare results by campaign wave, geography, role family, route type and submission channel. Keep the source evidence and application history available so a later review can distinguish a poor match from an inaccessible route or an employer that simply did not respond.

Do not promise that 200 applications will produce an interview or offer. A larger pool can increase the number of opportunities considered, but outcomes depend on genuine role fit, employer demand, timing, eligibility, application quality and response practices. Use the first completed cohort to measure actual results rather than inventing a probability.

If the first campaign produces few or no responses, diagnose before merely increasing volume:
1. check that submissions actually reached the employer;
2. review the role-family and professional-fit distribution;
3. inspect geographic/eligibility blockers and language assumptions;
4. look for patterns in the application routes and required materials;
5. adjust the candidate profile or campaign tiers only where evidence supports a change;
6. then expand to the next wave.

A first recruiter reply or interview is encouraging, but it is not a secured transition. Do not abandon all other opportunities after one positive response. It is reasonable to slow new submissions to manage interview capacity, but keep the pipeline and other applications active until there is a written offer and the material terms, location, start date and required work-authorisation/relocation steps have been confirmed.

## 7. Data-quality requirements for a large campaign

Scale makes identity and freshness more important, not less. The system should support:

- canonical studio identity and official domain;
- parent company and subsidiary/development-studio relationships where known;
- distinct offices and actual hiring locations where evidenced;
- source URLs and discovery provenance;
- official website and employer-controlled career/application URLs;
- route type, submission method and role/discipline scope;
- route status and last-verified/next-review dates;
- explicit, inferred and unknown values for language, work model, eligibility and relocation;
- duplicate detection that avoids merging unrelated same-name organisations;
- careful handling of acquired, renamed, closed or inactive studios.

A broken request, blocked page or parser failure is not evidence that a route has closed. Preserve the existing conservative verification rules and manual-review path. Never publish private candidate notes, profile data, documents, campaign lists or application outcomes in the public studio datasets, GitHub Pages assets, workflow logs or public repository documentation.

## 8. Suggested next implementation sequence

This sequence is strategic guidance; it does not mark any unimplemented feature as complete.

1. **Preserve broad discovery coverage.** Continue source assessment, deduplication and official verification without candidate-specific filters; Discovery V1 remains maintenance-led.
2. **Complete backend correctness of existing private systems.** Validate Candidate Profile persistence, Matching behavior and the existing My applications record before adding another major feature.
3. **Design Application Preparation.** Decide the requirements model, permitted page-analysis method and fallback, candidate-to-field mapping, draft-answer rules, material versioning and review flow.
4. **Implement a non-invasive preparation workspace.** Support sourced requirements, candidate-grounded editable drafts, missing-information warnings, document checklists and direct employer links. The candidate completes and submits externally.
5. **Integrate the existing tracker lifecycle.** Keep selected/preparing and submitted states on one canonical record; require user confirmation before counting an application as Applied.
6. **Evaluate the first application cohort.** Use actual response data to decide whether to revise the profile, broaden role families or expand geography.
7. **Refine campaign views and metrics.** Add manual priority, waves, reminders and funnel reporting when the core workflow is reliable and actual usage justifies them.

Do not let polishing the discovery system or building sophisticated automation indefinitely postpone a real application campaign. Conversely, do not start submitting an unreviewed list merely to reach a numerical target. The readiness gate should be light but meaningful.

## 9. Handover checklist

When continuing this project in another session:

1. Read this document, then [HANDOFF.md](../../HANDOFF.md) and [STATUS.md](../../STATUS.md).
2. Read the [global discovery rules](global-discovery-implementation-model.md) and [candidate profile/matching architecture](candidate-profile-matching-application-workspace.md).
3. Inspect the current default branch, open PRs, discovery-state checkpoint and latest successful workflows; do not assume status notes are current.
4. Confirm what is merged, what exists only on a feature branch and what remains proposed.
5. Preserve the separation between the public global directory and private candidate matching/application data.
6. Do not add application automation, a private backend or external AI processing without a separate design and explicit approval.
7. Keep all personal profile data, documents, private queue items and campaign outcomes out of public repository content.

