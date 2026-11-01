# Candidate profile, matching and application workspace

**Status:** Candidate Profile C1 merged/deployed in PR #95; matching C2 foundation implemented on the current feature branch; Application Queue, deeper requirements intelligence and workspace remain unimplemented  
**Last updated:** 2026-11-01  
**Scope:** Candidate-owned profile, transparent studio/opportunity assessment, personal application queue and preparation workspace.  
**Explicitly deferred:** Browser-extension automation, external portal autofill, automated form interaction and application submission.

This document extends the existing global studio-discovery product. It does not replace or personalize the discovery engine.

## 1. Product direction

The product has three connected but separately responsible layers:

1. **Studio Discovery** maintains the broad, worldwide directory of legitimate game-development organisations with verified speculative, unsolicited, spontaneous, open or general application routes.
2. **Candidate Profile & Matching** compares that public directory against a user's structured professional background and preferences, then explains relevance and application readiness.
3. **Application Workspace** holds the user's selected studios, requirements summaries, preparation materials and application progress.

The directory remains a complete global catalogue. Candidate preferences must never remove, rewrite, suppress or change the discovery qualification of a studio. Personal matching is a private overlay.

The product objective is to reduce repetitive research and application preparation so the user can pursue a large number of relevant opportunities without fabricating qualifications or spending unnecessary time tailoring every application.

## 2. Product principles

- **One truthful professional source of truth.** Maintain a structured candidate profile and approved master application materials. Do not create a separate tailored resume for every studio by default.
- **Evidence over keyword matching.** A skill is not claimed merely because an employer mentions it. Distinguish demonstrated experience, transferable experience, learning/exposure and not evidenced.
- **Filter obvious mismatches, preserve possibility.** Hard-exclude only clearly incompatible disciplines or explicit blockers. Uncertainty and transferable relevance should remain visible for human judgment.
- **Separate relevance, accessibility and preference.** A strong professional match may be geographically low priority; an attractive location does not make a role professionally relevant.
- **Explain every assessment.** Show the requirements, evidence, gaps, unknowns, source URLs and review date behind the classification.
- **Batch the repetitive work, review exceptions.** The default is one master resume and one master motivation statement. Suggest document updates only when a real requirement makes them useful; never silently modify approved materials.
- **User remains in control.** Selection, approval and confirmation of an application are user actions. No applications or emails are sent in this scope.
- **Private by default.** Candidate data, documents, preferences, queue state and application history must never enter public datasets, GitHub commits, Pages assets, workflow logs or public PR descriptions.

## 3. Candidate Profile

Add a dedicated **My Profile** area. It is a structured candidate record, not merely a file upload.

### 3.1 Profile sections

- **Personal and contact details:** name, email, phone, current location, professional links and optional portfolio. Collect only fields needed for applications.
- **Professional summary:** user-approved description of background, target contribution and motivation for entering/working in the game industry.
- **Experience:** employer, title, location (optional), start/end dates, description, responsibilities, achievements and associated skills. Preserve exact dates and titles.
- **Education:** qualification, institution, dates and relevant details.
- **Projects and training:** personal projects, bootcamps, coursework, certifications and portfolio links, clearly distinguished from employment.
- **Skills and technologies:** normalized skill names, categories, proficiency/experience descriptions, last-used context and supporting evidence references.
- **Application materials:** approved master resume file and/or text, master motivation letter/message, optional portfolio or supporting files.
- **Preferences:** role families, studio types, preferred work arrangements, geographical priority tiers and other user-defined considerations.
- **Eligibility information:** optional, explicitly user-entered work-authorisation/relocation facts. Never infer legal eligibility from nationality, residence, headquarters or a location preference.

### 3.2 Skill evidence model

Each skill should have a relationship to evidence, not just a label. Suggested evidence states:

- **Demonstrated:** directly supported by professional work, education or a completed project.
- **Transferable:** related experience supports the underlying capability, but not necessarily the exact tool/domain requested.
- **Learning / exposure:** currently studying or limited hands-on exposure.
- **Not evidenced:** no supporting profile evidence found.
- **User-confirmed gap:** the user explicitly says they do not have this skill.

Keep evidence references to experience, projects, training or a user-confirmed note. Do not invent proficiency scores or years of experience. A skill's absence from the profile means “not evidenced”, not necessarily “does not know”.

### 3.3 Master application materials

- Support a structured/text representation for convenient reuse and an approved PDF/DOCX attachment where applicable.
- Keep the original uploaded document unchanged.
- Store one default master resume and one default master motivation letter/message.
- Allow the user to approve a revised master version when they intentionally update it.
- The matching engine may recommend a factual clarification or targeted improvement, with the exact reason and supporting employer requirement. It must not automatically edit the master material or create a misleading tailored version.
- Employer-specific answers may be prepared later in the application workspace, but must be grounded in the profile and marked for user review.

### 3.4 Preferences and geography

Use editable priority tiers or weights rather than a rigid allowlist. Example tiers may include preferred, acceptable and low-priority regions. These are examples, not hard-coded defaults.

Preferences affect ordering and prioritization, not professional compatibility and not directory membership. A low-priority country remains discoverable and can still be selected. Explicit legal/work-authorisation blockers are separate from personal preference and require reliable evidence.

## 4. Matching and assessment engine

Evaluate each directory record against the candidate profile as a private, explainable assessment. Keep these dimensions independent.

### 4.1 Professional relevance

Assess:
- discipline/role-family alignment;
- responsibilities and work context;
- required and preferred skills/technologies;
- direct evidence and transferable evidence;
- explicit discipline exclusions or requirements;
- unknowns and material gaps.

Use qualitative categories, not a fabricated hiring probability:

- **Strong match:** the application scope clearly aligns with demonstrated or credibly transferable experience.
- **Potential match:** there is relevant transferable capability or insufficient information to decide.
- **Weak match:** significant discipline/experience mismatch, but not necessarily an absolute blocker.
- **Not applicable:** explicit, reliable evidence establishes a fundamental mismatch (for example, an art-only route when the candidate is pursuing technical roles).

Do not over-penalize an open/general route that lists no technical requirements. In that case report that requirements are unspecified and assess only what is known.

### 4.2 Application accessibility/readiness

Assess whether a legitimate route is usable and what the employer asks the applicant to do. Suggested states:

- **Ready to apply:** route is active and accessible; standard materials appear sufficient; no unresolved mandatory requirement is known.
- **Requires attention:** additional questions, a specific department/discipline, language, format, eligibility or other instructions need review.
- **Not applicable / blocked:** employer explicitly does not accept speculative applications, the route is closed, or a confirmed mandatory condition cannot be met.
- **Unknown / needs verification:** evidence is incomplete, stale, inaccessible or ambiguous.

“Ready” means the requirements appear understood and the standard package is usable; it is not a guarantee of eligibility or successful submission.

### 4.3 Personal priority

Rank using user preferences such as:
- geographic priority and realistic relocation considerations;
- preferred role families and work arrangements;
- interest in the studio, its games and development environment;
- user-defined priority or manual pinning.

Do not collapse this into the professional match score. Make the factors visible and allow manual priority overrides.

### 4.4 Assessment confidence and provenance

Every assessment should record:
- source URL(s) and the exact employer-controlled application route;
- extracted requirement statements or concise paraphrases;
- whether each statement is explicit, inferred or unknown;
- last checked/reviewed timestamp;
- extraction/assessment confidence and reasons for uncertainty;
- profile version or assessment input revision.

If evidence is not available, show “unknown” rather than guessing. Search snippets alone are not sufficient proof of a requirement. Do not infer hiring eligibility, visa sponsorship, global remote work or work location from studio headquarters.

### 4.5 Skills/requirements summary

For each selected studio, show a concise list of actual employer-stated disciplines, requirements and keywords, grouped where possible into:
- required;
- preferred;
- responsibilities/context;
- application instructions;
- eligibility/location/language;
- not specified.

Map each item to candidate evidence as demonstrated, transferable, learning/exposure, not evidenced, user-confirmed gap or unknown. Do not present a keyword overlap percentage as a hiring probability.

### 4.6 Matching foundation — current implementation

The first C2 implementation calculates matches in the browser from the saved Candidate Profile and the active public studio records. It is a private presentation layer; profile data, documents and assessments are not sent to a backend or added to public data files.

- Professional relevance uses saved target role families, discipline scope published in the studio route record and profile evidence. Demonstrated, transferable and learning/exposure evidence remain distinct. Absence of evidence is not treated as a confirmed gap.
- If an open route does not publish a discipline scope, the result remains **Potential match / limited role information** rather than being penalized. Missing profile evidence is **Needs profile details**, not a weak match.
- The current engine does not automatically classify an opportunity as **Not applicable** from a keyword mismatch. A weak assessment is not a claim that the employer would reject an application.
- Route readiness is deliberately conservative: the UI reports an active route on record or a need to verify it. It does not claim a route is ready to submit based only on the existence of a URL.
- Personal priority uses the saved preferred/acceptable/lower-priority regions, studio types and work models. These signals do not alter professional relevance or directory membership.
- Expanded details show source and application URLs, directory check/review dates, published discipline scope, submission method, work model and location/eligibility notes when those fields exist.
- Assessments are currently computed in memory each time the Matches page opens. Persistent assessment snapshots, manual overrides/pins and queue decisions belong to the Application Queue phase.

Known limitation: the current public directory has route-level research fields, not a fully normalized requirements record for every employer. Missing requirements remain unknown; no requirement, language, work-authorization, sponsorship or remote-work condition is inferred from a headquarters address or a search keyword.

## 5. Application Queue

Introduce a personal **Application Queue** (preferred label) as a working set over the global directory.

- The queue references canonical studio IDs; it must not duplicate studio records or create a second public directory.
- Adding/removing a studio from the queue is independent of the global directory.
- Each queued item stores user-specific priority, assessment snapshot/version, review state, application progress, notes and timestamps.
- Allow sorting/filtering by professional relevance, readiness, personal priority, country, route type and application status.
- Keep low-priority and not-applicable assessments inspectable; allow the user to override an automated classification.
- Reassess when the candidate profile, studio route or relevant application evidence changes. Preserve user decisions and submission history when recalculating.

Suggested queue groupings:
- Strong / ready to apply;
- Potential match;
- Requires attention;
- Low priority;
- Not applicable (normally excluded from the active queue but retained in the directory and assessment history).

The queue is not an auto-apply list. Selection means “consider/pursue”, not permission to submit.

## 6. Application Workspace

Opening a queued studio should provide a single focused workspace with:

1. **Studio context:** identity, location facts, official website, relevant games/profile facts and source links.
2. **Application route:** route type, direct application URL, evidence URL, route status, submission channel and verification date.
3. **Requirements summary:** what the employer explicitly asks for, required/optional documents, fields/questions, language, eligibility, location and special instructions.
4. **Skills/compatibility summary:** relevant keywords, evidence mapping, transferable strengths, gaps and unknowns.
5. **Application package:** links to the approved master resume and motivation letter; show any format or content issue requiring attention.
6. **Preparation notes:** user-editable notes and a checklist for the specific application.
7. **Progress tracking:** selected, reviewing, ready, applied, acknowledged, in review, interview, offer, rejected, withdrawn, no response or archived (final status vocabulary to align with existing tracker and avoid duplicate states).

The workspace should make the next action obvious and reduce switching between the directory, profile and external employer page.

## 7. Application requirements research

Requirements research is distinct from compatibility scoring. For each route, collect only what is actually supported by official employer evidence:

- whether speculative/general applications are accepted and the route's purpose;
- submission channel (email, employer ATS, form, talent pool);
- required/optional resume, cover letter, portfolio or other attachments;
- discipline/department options;
- mandatory form fields and questions when visible;
- language requirements;
- location, work model and applicant eligibility;
- explicit work-authorisation/sponsorship statements;
- consent/data-retention notices where relevant;
- file types, size limits and other submission instructions.

Store the source and verification date for each finding. Separate:
- **Explicit:** stated by the employer or application form;
- **Inferred:** a cautious interpretation that must be labelled;
- **Unknown:** not found or not verified.

Do not turn a general speculative invitation into assumed technical requirements. If the route simply asks for a CV and a short explanation of interest, report exactly that.

## 8. Privacy and hosting architecture

The current product is a static React/Vite application on GitHub Pages. It has no private backend or authentication. The first profile/matching/workspace implementation should remain browser-local unless a separately approved hosting decision changes this.

- Keep public studio facts and verified routes in the existing public-safe data projection.
- Store structured candidate profile, preferences, uploaded documents, application queue, private assessments, notes and application history in browser-local storage only.
- Prefer IndexedDB for structured/private records and binary files; keep existing tracker localStorage compatibility where appropriate. Define schema versioning and migration.
- Provide user-controlled export/backup and import/restore before the feature is relied upon for important data.
- Explain that browser storage is device/browser/origin-specific, can be cleared, may be unavailable in private browsing and is not automatically encrypted. Do not describe localStorage/IndexedDB as encrypted storage.
- Do not sync to GitHub, public Pages, Actions artifacts/logs, repository JSON, issues, commits or PRs.
- Do not add a server-side AI provider or put API keys in frontend code. Any future external AI processing requires a separate explicit privacy and architecture decision, clear disclosure of what leaves the browser and user approval.
- Treat uploaded files and extracted text as untrusted input. Sanitize rendered content and validate file types/size.
- Avoid putting sensitive profile details into telemetry, browser console logs, error reports or URLs.

## 9. Automation boundary for this roadmap

This roadmap includes candidate profile, matching, queue, requirements summaries and application preparation only.

**Deferred and not authorized by this specification:**
- browser extension or desktop companion;
- controlling external browser tabs;
- automated portal recognition or ATS adapters;
- automatic field entry, autofill or file uploads;
- automatic email composition/sending;
- automated clicking of Submit or any final application submission.

The application workspace may provide copyable values, document links, checklists and direct links to the employer route. Future autofill assistance must be separately designed and approved with strict validation, portal compatibility tiers and user-controlled final submission. CAPTCHA, anti-bot, access-control and login restrictions must never be bypassed.

## 10. Suggested implementation sequence

1. **Profile foundation:** structured profile sections, skill/evidence model, master resume/motivation storage, preferences, validation and local persistence.
2. **Assessment foundation:** schema for private assessments; deterministic initial matching rules; explicit/unknown evidence handling; explainable categories and manual override.
3. **Application Queue:** canonical studio references, priority and readiness filters, assessment refresh, queue persistence and migration.
4. **Requirements intelligence:** structured route instructions and sourced requirements summary, with explicit/inferred/unknown provenance and review dates.
5. **Application Workspace:** studio/application details, skill mapping, approved materials, preparation checklist, notes and progress tracking.
6. **Evaluation and refinement:** test against representative studios from different countries, route types and ATS/contact channels; review false positives/negatives with the user before expanding.

Do not begin browser automation as a hidden subtask of these phases. It remains a separate future decision.

## 11. Acceptance criteria

The first release of these features should demonstrate that:

- The global directory remains complete and unaffected by candidate preferences.
- A user can create/edit/export/import a structured candidate profile without sending personal data to a server.
- Skills can be linked to evidence and accurately distinguish direct, transferable, learning and absent evidence.
- One approved master resume and motivation letter can be reused without per-studio duplication.
- Every assessment explains its professional relevance, accessibility/readiness and personal priority separately.
- Explicit requirements, inference and unknown information are visually and structurally distinct and source-linked.
- Art-only or otherwise clearly incompatible applications can be excluded from the active queue without deleting the studio from the global directory.
- Unspecified requirements are not fabricated and do not automatically cause exclusion.
- Queue records reference canonical studios and persist locally across refreshes.
- Changes to profile or source information can trigger reassessment without erasing manual decisions or application history.
- Application preparation and tracking work without any automated submission or external portal interaction.
- Tests verify browser-local privacy boundaries and prove no candidate data is included in public build assets, network writes, logs or repository files.

## 12. Open decisions to resolve during design

- Exact profile field schema and which fields are optional.
- Whether resume content is entered manually, extracted from a browser-selected PDF/DOCX, or both.
- IndexedDB wrapper/schema and export format.
- Initial role-family taxonomy and whether users can add custom categories.
- Initial preference weighting and whether priority is user-configured or simple tiers.
- Exact compatibility labels, thresholds and manual override behavior.
- How requirements are researched/updated without an AI API or backend.
- How this new Application Queue relates to the existing My applications tracker, including a single canonical application status model.
- Whether a future private hosting/backend model is worth the cost and complexity.

These decisions should be documented before implementation when they materially affect data migration, privacy or user experience.
