# Candidate Profile, Matching, Application Preparation and Tracking

**Last updated:** 2026-11-03  
**Scope:** Detailed requirements for the private Candidate Profile, Matching Engine, Application Preparation workspace and Application Tracker lifecycle.  
**Product overview:** [Five-System Product Blueprint](five-system-product-blueprint.md).  
**Related strategy:** [Studio Targeting and Application Campaign Strategy](studio-targeting-and-application-campaign.md).

**Implementation status:** Candidate Profile foundation is merged/deployed (PR #95) with persistence hardening in PR #111; Matching foundation and focused quality improvements are merged/deployed (PRs #96 and #104); the basic match-to-tracker handoff and local tracker backup/recovery are implemented (PRs #107 and #110). The Application Preparation system now has a manual-assisted baseline: a per-application checklist plus private requirement/question and draft-answer notes, included in tracker backup/restore. Automated application-page analysis and ATS interaction remain future work. The existing tracker remains the canonical private application record.

## 1. Product direction and system boundaries

The complete product has five connected systems:

1. **Studio Discovery** — the public, global directory of game-development organisations with verified speculative/open application routes.
2. **Candidate Profile** — the private source of truth for candidate facts, skills/evidence, preferences and approved materials.
3. **Matching Engine** — private, explainable assessments using studio data and the current candidate profile.
4. **Application Preparation** — analysis of the selected employer's actual application route/form and preparation of candidate-reviewed answers, materials and a submission checklist.
5. **Application Tracker** — one private record for selected targets, user-confirmed submissions and subsequent progress/outcomes.

This document specifies systems 2–5. It does not replace or personalize Studio Discovery. Global discovery qualification, sources and verification remain defined in the [Global Discovery Implementation Model](global-discovery-implementation-model.md).

The Candidate Profile is maintained independently of discovery and is a reusable input to both Matching and Application Preparation. Matching selects a target; Application Preparation helps the user prepare the real application; the user submits externally; the user then confirms submission in the tracker.

The existing My applications item is the canonical private record across this lifecycle. It can exist before submission as a saved/selected/preparing target. Do not create a separate queue or duplicate application history when preparation is added. Only user-confirmed submissions count as applications in campaign outcome metrics.

The public Studio Directory remains worldwide and non-personalized. Candidate preferences affect only private matching and campaign priority; they never suppress or reclassify public studios.

## 2. Product principles

- **One truthful professional source of truth.** Maintain a structured candidate profile and approved master materials. Do not create a separate tailored resume for every studio by default.
- **Evidence over keyword matching.** A skill is not claimed merely because an employer mentions it. Distinguish demonstrated, transferable, learning/exposure, not evidenced and user-confirmed gap.
- **Filter obvious mismatches, preserve possibility.** Keep uncertainty and transferable relevance visible for human judgment.
- **Separate relevance, accessibility and preference.** A strong professional match may be geographically low priority; a preferred location does not make an opportunity professionally relevant.
- **Explain every assessment.** Show requirements, evidence, gaps, unknowns, source URLs and review dates.
- **Prepare, do not fabricate.** Candidate-specific answers must be grounded in the profile and marked for user review. Missing information is a question or an unresolved item, never an invitation to guess.
- **One application lifecycle.** Selection, preparation, submission and tracking update the same canonical private application record.
- **User remains in control.** The user chooses targets, approves documents/answers and performs final submission.
- **Private by default.** Candidate data, documents, preparation drafts, preferences, queue state and application history never enter public datasets or discovery automation.

## 3. Candidate Profile

The profile is a structured candidate record, not merely a file upload.

### 3.1 Profile sections

- **Personal/contact details:** name, email, phone, current location, professional links and optional portfolio. Collect only fields useful for applications.
- **Professional summary:** user-approved description of background, target contribution and motivation.
- **Experience:** employer, title, optional location, dates, description, responsibilities, achievements and associated skills. Preserve exact dates and titles.
- **Education:** qualification, institution, dates and relevant details.
- **Projects/training:** personal projects, bootcamps, coursework, certifications and portfolio links, distinguished from employment.
- **Skills/technologies:** normalized skill names, categories, context, proficiency description and supporting evidence references.
- **Master materials:** approved master resume/CV and core motivation letter/message, plus portfolio and supporting links/files.
- **Preferences:** role families, studio types, work arrangements, geographical priority tiers and other user-defined considerations.
- **Eligibility facts:** optional user-entered work-authorisation, language or relocation facts. Never infer legal eligibility from nationality, residence, headquarters or a location preference.

### 3.2 Skill evidence model

Each skill must be connected to supporting evidence. Use these states:

- **Demonstrated:** directly supported by professional work, education or a completed project.
- **Transferable:** related experience supports the underlying capability, but not necessarily the exact tool/domain requested.
- **Learning / exposure:** current study or limited hands-on exposure.
- **Not evidenced:** no supporting profile evidence was found.
- **User-confirmed gap:** the user explicitly says they do not have this skill.

Keep evidence references to experience, projects, training or a user-confirmed note. Do not invent proficiency scores or years of experience. A skill's absence from the profile means not evidenced, not necessarily that the candidate does not know it.

### 3.3 Master application materials

- Support structured/text information for convenient reuse and approved PDF/DOCX attachments where appropriate.
- Preserve the original uploaded document unchanged.
- Keep one default master resume/CV and one default core motivation letter/message.
- Allow the user to approve an intentionally revised master version.
- Matching may recommend a factual clarification or improvement, with the exact employer requirement and reason. It must not silently edit master materials or create misleading variants.
- Application Preparation may suggest studio-specific answers or identify a genuine document exception; every change remains a draft until the user approves it.

### 3.4 Preferences and geography

Use editable priority tiers rather than a rigid allowlist. Geography, role family, work model, studio type and personal interest affect private priority only. A low-priority country remains discoverable and selectable.

Explicit eligibility or work-authorisation blockers are separate from personal preferences and require reliable evidence. Headquarters alone does not establish role location, remote eligibility or sponsorship.

## 4. Matching Engine

Evaluate each canonical directory record against the current candidate profile. Matching is a private, explainable assessment and must not alter public studio records.

### 4.1 Professional relevance

Assess:

- discipline/role-family alignment;
- responsibilities and work context;
- required and preferred skills/technologies when published;
- direct and transferable profile evidence;
- explicit discipline exclusions/requirements;
- unknowns and material gaps.

Use qualitative categories rather than a fabricated hiring probability:

- **Strong match:** direct role/discipline alignment with demonstrated evidence relevant to that same discipline.
- **Potential match:** relevant transferable capability or insufficient information to decide.
- **Weak match:** significant professional mismatch, but not necessarily an absolute blocker.
- **Not applicable:** reliable explicit evidence establishes a fundamental mismatch.

Do not over-penalize an open/general application route that publishes no technical requirements. Report the information gap and assess only what is known. Missing profile information should be shown as needs profile details, not silently treated as a confirmed gap.

### 4.2 Application accessibility/readiness

Assess whether the official route is current and what the employer asks the applicant to do. Keep route status separate from professional relevance and personal priority.

Potential states include ready for candidate review, requires attention, blocked/not applicable and unknown/needs verification. A route listed as active is not proof that the live form still works, that a specific vacancy exists or that the applicant meets every condition.

### 4.3 Personal priority

Use preferences such as geographic tier, work arrangement, role family, studio type, interest in the studio/games and user-defined priority. Make these factors visible and permit manual overrides.

Do not collapse professional relevance, route readiness and personal priority into an unexplained weighted score. Do not describe any match category as the probability of being hired.

### 4.4 Provenance and confidence

For employer-derived requirements and route claims, retain:

- source URL(s) and official application route;
- concise evidence statement or faithful paraphrase;
- explicit, inferred or unknown classification;
- last checked/reviewed timestamp;
- extraction/assessment confidence and reason for uncertainty;
- relevant studio/route revision and candidate-profile revision where available.

Search snippets alone are not sufficient proof. Do not infer language, eligibility, visa sponsorship, global remote work or hiring location from headquarters or nationality.

### 4.5 Requirements-to-profile mapping

For each relevant employer requirement, map candidate evidence as demonstrated, transferable, learning/exposure, not evidenced, user-confirmed gap or unknown. Keep requirement type clear, such as required, preferred, responsibility/context, application instruction, eligibility/location/language or not specified.

Do not present keyword overlap as a hiring probability.

### 4.6 Matching foundation — implemented behavior

The first matching implementation calculates assessments in the browser from the saved Candidate Profile and active public studio records. Candidate details and assessments are not sent to a backend or included in public data.

- Professional relevance uses saved target role families, published studio route discipline scope and profile evidence.
- Direct and related/adjacent role-family mappings are distinct. Adjacent evidence may support Potential but cannot independently justify Strong.
- Strong requires direct role-to-discipline alignment and demonstrated skill evidence mapped to that same stated discipline.
- Skill/discipline matching uses normalized phrase boundaries rather than arbitrary substring matches.
- Work-history assessment considers job title, responsibilities and achievements; transferable work evidence is not silently promoted to demonstrated tool/discipline skill evidence.
- If an open route does not publish discipline scope, the result remains Potential/limited role information rather than being penalized for a missing requirement.
- A keyword mismatch alone does not establish that an employer would reject an application.
- Route readiness remains conservative. The existence of a URL is not treated as proof that the route is ready to submit.
- Geographic priority uses the directory's recorded country. A separate headquarters country must not silently override it, and the directory country is not proof of role location or work-authorisation eligibility.
- Mixed work models are ambiguous and receive no automatic penalty against a preferred remote/hybrid/on-site arrangement.
- The current default ordering uses campaign geography tiers first, then overall personal priority and professional relevance as tie-breakers. The separate dimensions remain visible.
- Assessments are recalculated locally. Historical assessment snapshots, manual priority pins and richer queue decisions remain future refinements.

Known limitations: language, country-specific remote eligibility, relocation and visa/work-authorisation/sponsorship are not structured consistently enough for reliable automated prioritisation. Keep these facts unknown until verified and recorded.

## 5. Private application record and tracker lifecycle

### 5.1 One canonical record

The Application Tracker/My applications feature is the private working set for targets selected from Matches. It is also the record that continues after a real submission. Application Preparation must attach its state to this same record.

A saved studio is not automatically an application. A selected target is not automatically submitted. Keep these concepts explicit in the interface and in campaign metrics.

### 5.2 Lifecycle

The exact status vocabulary must remain aligned with the existing tracker and should be designed as one coherent progression. The lifecycle may include:

- **Saved / Selected:** the user chose the studio for consideration.
- **Preparing / Reviewing:** route requirements and application materials are being checked.
- **Ready for user submission:** the user has reviewed the preparation checklist; this is still not a submitted application.
- **Applied:** the user explicitly confirms that the employer submission was completed; record the date.
- **Acknowledged / Assessment / Interview / Offer:** later stages entered manually as communication arrives.
- **Rejected / Withdrawn / No response / Archived:** outcome or inactive states.

Do not create two statuses with slightly different meanings across the queue, workspace and tracker. Map new preparation states into the existing schema deliberately and migrate only with validation.

### 5.3 Tracker capabilities

- Canonical studio reference and saved route-context snapshot.
- Status, applied/submitted date and activity timestamps.
- User-editable private notes and direct official studio/application links.
- Clear actions to open the preparation workspace, confirm submission and update later status.
- Next follow-up date or reminder as a future refinement.
- Versioned, validated local export/restore.
- Duplicate-aware handoff from Matches.
- No dependence on email access or ATS account credentials.

Track campaign outcomes from user-confirmed submissions, not from discovery counts or saved/preparing items.

## 6. Application Preparation workspace

Application Preparation is the distinct system immediately before submission and is not the same as ongoing outcome tracking.

### 6.1 Inputs

- canonical studio ID and current public studio profile;
- official application route and route evidence;
- current Candidate Profile revision;
- approved master resume and motivation-letter versions;
- relevant portfolio links and supporting documents;
- any additional information explicitly supplied by the candidate.

### 6.2 Route and form analysis

Analyze the employer's actual official application route where content is available through a permitted and technically reliable method. Identify the platform when possible, but do not assume ATS identity implies a standard form.

The analysis should identify, when present:

- application purpose and route type (open application, talent pool, email, employer form, etc.);
- mandatory and optional form fields;
- questions, instructions, character limits and formats;
- department/discipline/role choices;
- required and optional files, file formats and size restrictions;
- portfolio, showreel or other URL requirements;
- language, location, work model and applicant eligibility;
- work-authorisation, sponsorship or relocation statements;
- consent, privacy and data-retention notices;
- any step or requirement that needs human confirmation.

Every finding should be explicit, inferred or unknown, with the source and review date. If the page is unavailable, blocked, authenticated or incomplete, state that limitation and use a user-assisted review path. Never treat an inaccessible page as evidence that no requirement exists.

### 6.3 Candidate field mapping

For every field/question, show one of:

- **Mapped from profile:** a matching candidate fact exists and its source section is identifiable.
- **Draft prepared:** a candidate-grounded proposed response is available for review.
- **Needs candidate input:** the profile does not contain the required fact or preference.
- **Needs verification:** the field or employer instruction is ambiguous or unverified.
- **Not applicable:** the question does not apply, with the reason made clear.

A field mapping must not silently equate different facts (for example, headquarters and job location, language of a website and candidate language ability, or a preferred country and work authorization).

### 6.4 Draft answer and material preparation

- Reuse approved master materials by default.
- Prepare a studio-specific answer only when the actual form asks for it or a genuine employer-specific exception exists.
- Ground every suggested answer in profile facts, approved materials and/or explicit employer instructions.
- Keep drafts editable and clearly labelled as drafts until the user approves them.
- Show unsupported claims, missing facts and character/format constraints.
- Do not silently create, overwrite or approve a resume, cover letter or candidate fact.
- Preserve which profile and master-material versions were used for a submitted application.

The drafting method (manual templates, local processing or optional external AI) must be decided separately. External AI processing is not assumed and requires explicit privacy review and user approval.

### 6.5 Current manual-assisted preparation baseline

The first preparation baseline is integrated into each existing My applications record (PR #116, merged and deployed; full validation and deployment evidence are in STATUS.md):

- Six readiness checks: official route rechecked, requirements/questions reviewed, resume selected, motivation letter reviewed, portfolio/materials ready and draft answers reviewed.
- A private text area for employer requirements/application questions.
- A separate private text area for draft answers and missing information.
- Automatic browser-local persistence and inclusion in tracker backup/restore.
- Legacy tracker backups without a preparation object receive a safe empty checklist during validation.

This baseline helps the candidate organize manual review; it does not read the live ATS form, prove that every requirement is complete or submit anything. The candidate must still open and inspect the actual employer page.

### 6.6 Review and handoff

The workspace should provide one reviewable view containing:

- studio and application-route context;
- extracted requirements and provenance;
- profile-to-field mapping;
- editable answer drafts;
- required/optional document checklist;
- missing information and unresolved questions;
- direct employer route;
- a final checklist before leaving the tool.

The candidate then completes and submits on the employer's site. The user confirms submission in the existing tracker. The system must not infer submission merely because the user opened a URL or completed a checklist.

## 7. Technical and automation boundary

The current product is a static React/Vite website on GitHub Pages with no private authenticated backend. It cannot reliably inspect arbitrary cross-origin or authenticated ATS pages from the page itself. Browser-origin restrictions, CORS, dynamic client rendering, login, anti-bot checks and platform-specific behavior all matter.

The initial Application Preparation design must therefore provide a fallback when automatic page analysis is unavailable, such as user-assisted capture or manually confirmed requirements. A backend fetcher, browser extension, desktop companion or other page-inspection integration requires a separate architecture/privacy review and explicit approval.

Current scope may include:
- official-route links and permitted research;
- organizing requirements already present in public directory/profile data;
- user-assisted collection and review of visible form requirements;
- candidate/profile field mapping;
- editable answer drafts, copyable values and document checklists;
- direct navigation to the employer application page.

Not authorized by this specification:
- automatic ATS login or account interaction;
- browser extension or desktop companion;
- cross-tab/page control;
- portal recognition adapters that interact with live accounts;
- automatic field entry/autofill;
- automatic document upload;
- automated email access or sending;
- automatic Apply/Submit clicks or final application submission.

Any future autofill assistant must be opt-in and separately approved, clearly show every value, avoid overwriting user edits and leave final submission to the candidate. Never bypass CAPTCHA, anti-bot controls, login restrictions, robots rules or site terms.

## 8. Privacy and local storage

- GitHub Pages is public static hosting, not a private authenticated backend.
- Candidate profile, CVs, motivation drafts, preferences, assessments, preparation drafts, application records and notes remain browser-local.
- Prefer IndexedDB for structured/private records and binary files. Preserve existing tracker localStorage data and migration behavior.
- Provide validated user-controlled export/import and non-destructive recovery.
- Explain that browser storage is device/browser/origin-specific, can be cleared and is not automatically encrypted.
- Never commit or publish candidate data in source datasets, Pages assets, Actions logs/artifacts, issues or PR descriptions.
- Do not include private data in URLs, console logs or telemetry.
- Any private backend, cloud sync or external AI processing requires a separate architecture/privacy decision and explicit consent.
- Treat external page content, uploaded files, extracted text and drafted answers as untrusted input; validate and sanitize before display.

## 9. Implementation sequence and gates

1. **Existing-system correctness:** finish backend correctness across Candidate Profile, Matching and My applications. Validate storage, import/export, race behavior, schema errors, migration, duplicate handling, status transitions and privacy.
2. **Application Preparation design:** specify requirements extraction, evidence provenance, page-access approach/fallback, form-field model, candidate mapping, draft handling, versioning and review UX.
3. **Application Preparation V1:** build a non-invasive preparation workspace that supports structured requirements, editable drafts, copyable values, document checklist, unknowns and direct employer links. The user fills and submits externally.
4. **Tracker integration:** keep preparation and submission lifecycle on the same canonical application record; Applied requires manual confirmation.
5. **Evaluation:** test diverse studios, direct forms, email routes and common ATS platforms; check multiple languages, inaccessible pages, unusual requirements, privacy and user effort.
6. **Later optional automation:** separately decide whether opt-in field-filling support is worthwhile. Do not implement it as a hidden extension of V1.

Do not begin the next stage until the previous stage's acceptance criteria and data boundaries are agreed. Do not let UI polish obscure storage/data correctness.

## 10. Acceptance criteria

A complete implementation should demonstrate that:

- the global directory remains unchanged by candidate preferences;
- a candidate can create, edit, export and restore a structured profile without transmitting personal data;
- skill claims retain evidence relationships and truthful distinctions;
- approved master materials are reused without silent changes;
- every match explains relevance, route accessibility/readiness and personal priority separately;
- employer statements, inference and unknowns remain distinguishable and source-linked;
- selected targets reference canonical studios and use one application record;
- requirements analysis does not invent inaccessible or unstated requirements;
- form fields map to profile facts or are clearly marked as requiring candidate input;
- draft answers are editable, traceable and never silently approved;
- the final employer-site review and submission remain user-controlled;
- only user-confirmed submissions count as Applied or enter application outcome metrics;
- tracker status, notes and dates survive refreshes and backup/restore;
- profile changes do not silently rewrite past application materials or submission history;
- tests verify privacy boundaries and prove personal data is absent from public build assets, network writes, logs and repository files.

## 11. Open decisions for system-level design

Resolve these before the relevant implementation:

- Which profile fields should be mandatory, optional or conditionally collected?
- What is the final schema/versioning model for application requirements and form-field snapshots?
- How should the static application receive or inspect application-page content when cross-origin access is unavailable?
- Is user-assisted content capture sufficient for V1, and which sources are permitted?
- Which ATS platforms and direct employer forms should be used as representative test cases?
- How are generated answer drafts produced without exposing personal data to an external AI service?
- How are candidate edits, approved material versions and historic submission snapshots preserved?
- What is the single status model for Saved, Preparing, Ready, Applied and later outcomes?
- When, if ever, is a browser extension or private backend justified?

Material changes to privacy, storage migrations or portal interaction require a recorded architecture/product decision and explicit user approval.
