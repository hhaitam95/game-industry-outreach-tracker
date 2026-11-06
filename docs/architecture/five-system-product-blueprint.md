# Five-system product blueprint

**Status:** Product direction agreed on 2026-11-03; this is the product and architecture blueprint, not a claim that every system is implemented.  
**Purpose:** Define the complete workflow, boundaries, shared data ownership and staged implementation direction for Game Industry Outreach Tracker.

This document is the high-level source of truth for the product's five connected systems. The detailed profile, matching and application-preparation rules live in [Candidate Profile, Matching, Application Preparation and Tracking](candidate-profile-matching-application-workspace.md). Global discovery qualification and source policy remain governed by the [Global Discovery Implementation Model](global-discovery-implementation-model.md). Campaign targeting and outcome principles remain in [Studio Targeting and Application Campaign Strategy](studio-targeting-and-application-campaign.md).

## 1. Product objective

Build a reliable personal system that:

1. discovers game-development studios that explicitly accept speculative, unsolicited, spontaneous, open or general applications beyond ordinary advertised vacancies;
2. maintains one structured, private candidate profile as the source of truth for professional information and approved materials;
3. compares discovered studios with that profile and explains which targets deserve attention;
4. helps prepare the actual application by understanding the employer's route, requirements, form fields and questions, then mapping them to truthful candidate information;
5. tracks an application only as it moves through a real user-confirmed submission and subsequent outcomes.

The tool should remove repetitive searching, comparison, preparation and record-keeping. It should not replace candidate judgment, invent facts or submit applications without the candidate.

## 2. The five systems

| # | System | Primary responsibility | Main output |
|---|---|---|---|
| 1 | **Studio Discovery** | Find, verify, enrich and maintain eligible studios globally | Canonical public Studio Directory |
| 2 | **Candidate Profile** | Maintain the candidate's structured professional record, preferences and approved materials | Private candidate profile |
| 3 | **Matching Engine** | Assess studio records against the profile and explain relevance and priority | Private, explainable match assessments |
| 4 | **Application Preparation** | Analyze the selected studio's actual application route and help prepare its requirements, answers and documents | Reviewed application checklist and preparation workspace |
| 5 | **Application Tracker** | Record confirmed submissions and manually maintained progress/outcomes | One private application history and progress view |

These are five distinct responsibilities, not necessarily five separate services, databases or top-level pages. The existing website can present them through a small number of focused areas while preserving these boundaries.

### 2.1 Studio Discovery — find eligible studios

Discovery is the public, global data-acquisition system. Its purpose is not to find every company with a careers page or collect ordinary advertised vacancies.

A studio/employer belongs in the public directory only when both gates are met:

- there is reliable evidence that the organisation performs direct video-game development; and
- its official website or directly linked employer-controlled hiring platform explicitly invites speculative, unsolicited, spontaneous, open, general or future-opportunity applications beyond a specific advertised vacancy.

Candidate-source feeds are leads, not publication proof. The employer's own statement and the official submission route remain decisive.

A published record should preserve canonical studio identity, official links, location facts, relevant games and studio metadata, application-route type and conditions, supporting evidence, source provenance, last-checked/review information and uncertainty. It must distinguish an open application route from a specific vacancy and must not imply that a role is currently open when the evidence only supports future/general consideration.

**Boundary:** Discovery remains worldwide, non-personalized and coverage-led. Candidate skills, role preferences, location, work authorization and match scores must never change discovery eligibility, collection, publication or public ordering.

**Current position:** Studio Discovery Automation V1 is treated as operational and frozen against unnecessary restructuring. Continue scheduled maintenance, source-health monitoring, verification and genuine reliability fixes. Incomplete or permission-limited sources remain explicit coverage limitations; V1 does not claim an exhaustive census of every studio worldwide.

### 2.2 Candidate Profile — define who is applying

The Candidate Profile is the private source of truth for the person using the tool. It is independent of discovery and can be created or updated at any time.

It should cover:

- contact and location details needed for applications;
- professional summary and target contribution;
- employment history, responsibilities and achievements;
- education, projects, training and certifications;
- skills, tools and technologies linked to supporting evidence;
- approved master resume/CV and core motivation letter/message;
- portfolio and other approved application links/materials;
- role-family, studio, work-model and geographic preferences;
- optional user-entered language, work-authorisation or relocation facts where useful.

Evidence must distinguish demonstrated experience, transferable capability, learning/exposure, not evidenced and user-confirmed gaps. Missing profile information is not proof that the candidate lacks a skill.

The profile owns the authoritative candidate facts. Other systems may reference or map those facts, but must not silently create new qualifications or overwrite the profile. Approved master documents remain unchanged unless the user reviews and approves a revision.

**Boundary:** Candidate information, preferences, documents and private notes stay browser-local under the current static-hosting architecture. The profile is never included in the public Studio Directory or discovery checkpoint.

### 2.3 Matching Engine — identify and prioritize relevant studios

Matching consumes two independent inputs:

- canonical studio and application-route facts from Studio Discovery; and
- the current private Candidate Profile.

It creates a private assessment overlay. It must not rewrite the public directory or feed candidate-specific results back into discovery.

The engine must explain three separate dimensions:

1. **Professional relevance:** alignment between the studio's evidenced development disciplines/work and the candidate's demonstrated or transferable experience.
2. **Application accessibility/readiness:** whether the official route is current and usable, and what requirements or unresolved facts need attention.
3. **Personal priority:** how the target aligns with the candidate's preferences, interests and campaign ordering.

Show reasons, evidence, gaps, uncertainty and source/review dates. Do not collapse the dimensions into an unexplained score or represent a match as a probability of being hired. Unknown location, language, remote eligibility, sponsorship or work-authorisation facts remain unknown until verified.

The matching output should help the candidate decide which studios to investigate and prepare first. Selecting a match means “consider/pursue”; it is not confirmation that an application was submitted.

### 2.4 Application Preparation — prepare the actual application

This is the bridge between a promising match and a real submission.

For a selected studio, the preparation system should examine the official application route and, where accessible, the actual employer application page/form. It should identify the platform where relevant (for example SmartRecruiters, Greenhouse, Workday or Lever) without assuming that every employer using the same platform has the same form or requirements.

The system should aim to identify:

- required and optional form fields;
- application questions and character/format limits;
- required and optional resume, cover letter, portfolio or other files;
- discipline, department or role selections;
- location, language, work-model and eligibility questions;
- consent, declarations and relevant process instructions;
- file types, file-size limits and other submission constraints.

It should then map form requirements to existing profile facts and approved materials, prepare truthful draft answers where possible, expose missing information, and create a clear review checklist.

The candidate should be able to see, edit and approve every proposed answer and material before using it. Suggestions must be traceable to profile evidence or the employer's instructions. If the profile does not contain an answer, the system should ask the candidate or mark it unresolved; it must not guess.

**Expected interaction:** Analyze route → extract requirements → map candidate information → prepare drafts/material checklist → candidate reviews and edits → candidate completes/submits on the employer's site.

The first useful version should reduce research and copying without depending on automatic portal control. Copyable values, prepared text, links and checklists are acceptable foundations. Assisted field filling may be explored later as a separate, explicit design.

**Technical constraint:** The current product is a static React/Vite site on GitHub Pages. A page hosted on GitHub Pages cannot reliably read arbitrary third-party ATS pages or authenticated, dynamically rendered forms across origins. CORS, browser isolation, login, dynamic content, site-specific behavior, CAPTCHA and anti-bot controls all affect feasibility. The initial design must include a safe fallback when page content cannot be inspected, such as user-assisted capture/review of the visible requirements. A backend fetcher or browser extension is not implicitly approved by this blueprint.

### 2.5 Application Tracker — track what was actually submitted

The tracker is the final stage of the user-facing workflow: it records the real application and what happens afterward.

The candidate manually confirms that an application was submitted. From that point, the tracker supports statuses and events such as acknowledgement, assessment, interview, offer, rejection, withdrawal or no response, plus submitted date, notes, links, next follow-up and relevant material-version references.

Email communication remains external in the initial scope. The user can manually record a received message or action. Email access, automatic inbox interpretation, automatic replies and sending messages are separate integrations and are not assumed.

**One canonical record:** the existing My applications feature already acts as a private queue for selected targets and a tracker for submitted applications. Keep one local application record per studio/application instance. It may progress from Saved/Selected → Preparing/Reviewing → Applied → later outcomes. The preparation workspace operates on that same record; it must not create a separate queue and then duplicate the record when the user submits. Only user-confirmed submissions count as applications in campaign outcome metrics.

This preserves the desired logical order—prepare before submit, track after submit—without creating two competing histories or discarding the existing match-to-tracker handoff.

## 3. End-to-end workflow and data flow

The normal journey is:

1. **Discover:** Studio Discovery adds and refreshes eligible public studio records.
2. **Maintain profile:** the candidate creates or updates the private Candidate Profile. This can happen independently of discovery.
3. **Match:** the Matching Engine evaluates the directory using the current profile and produces a reasoned shortlist.
4. **Select:** the candidate chooses a target. A private application record is created or opened, referencing the canonical studio ID.
5. **Prepare:** Application Preparation analyzes the official route, maps requirements to the profile, prepares candidate-reviewed answers/materials and highlights unresolved items.
6. **Submit manually:** the candidate opens the employer's official application route and performs the final review and submission.
7. **Track:** the candidate confirms the submission in the tool and manually updates progress as communication arrives.

Conceptual data flow:

- Studio Discovery → public Studio Directory → Matching Engine.
- Candidate Profile → Matching Engine and Application Preparation.
- Matching Engine → selected target → one private application record.
- Application Preparation → reviewed checklist, drafts and material references on that same record.
- Candidate's manual submission → user-confirmed Applied status → Application Tracker and outcome history.

The Candidate Profile is a reusable input to both Matching and Application Preparation. It is not a one-time step that has to be completed after discovery. The Application Tracker is logically last, even though its existing private record also holds a selected target while it is being prepared.

## 4. Shared data ownership and record boundaries

| Data | Owner | Visibility |
|---|---|---|
| Canonical studio identity, games, public metadata and official route evidence | Studio Discovery | Public directory |
| Discovery cursors, candidate leads and aggregate source-health state | Discovery operations | Public discovery-state branch; public employer/operational data only |
| Candidate facts, preferences, profile documents and approved materials | Candidate Profile | Private browser-local storage |
| Match explanations, priority decisions and private assessment snapshots | Matching Engine | Private browser-local storage |
| Extracted form requirements, candidate answer drafts, review checklist and preparation notes | Application Preparation | Private browser-local storage |
| Application status, submitted date, notes, follow-up and outcomes | Application Tracker | Private browser-local storage |

Systems should reference canonical studio IDs and share the same application record where applicable. Do not copy candidate data into public studio records, write private match assessments into discovery state, or create a second application history for the preparation workspace.

A future data schema should preserve provenance and version references: studio/route revision, profile revision, approved material version, analysis date and user-confirmed decisions. This is needed to explain which facts were used for an application without silently rewriting historical applications when the profile changes.

## 5. Cross-system principles

- **Public discovery stays impartial.** Candidate preferences never influence discovery qualification, data collection or public ordering.
- **One source of truth for candidate facts.** The profile is authoritative; matching and preparation reference it.
- **One canonical studio identity.** Matching, preparation and tracking refer to the same directory record.
- **One canonical application record.** Queue, preparation and tracking are lifecycle views of the same private record, not separate histories.
- **Evidence before inference.** Distinguish explicit employer instructions, cautious inference and unknown information.
- **No invented candidate facts.** Never fabricate skills, work history, metrics, language ability, eligibility or motivation.
- **Explain uncertainty.** A missing answer, inaccessible page or unknown condition should remain visible.
- **User-controlled decisions.** User selects targets, approves materials/answers and performs final submission.
- **Privacy by default.** Personal data is not part of the public directory, repository, build artifacts or discovery automation.
- **Incremental automation.** Automate repeatable, permitted research and preparation first; do not build fragile or prohibited portal automation merely to reduce clicks.

## 6. Hosting, privacy and security constraints

The current website is a static React/Vite application published on GitHub Pages. It has no private authenticated backend.

- Keep public studio facts and route evidence in the existing public-safe datasets.
- Keep the candidate profile, original CVs, private materials, assessments, preparation drafts, queue/tracker state and notes in browser-local storage. IndexedDB is preferred for structured records and binary documents; preserve the existing tracker/localStorage data and its migration path.
- Provide validated user-controlled export/import and explain that browser storage is specific to the browser/device/origin, can be cleared and is not automatically encrypted.
- Do not put personal data into GitHub Actions state, logs, artifacts, public Pages assets, repository JSON, commits, issues or PR descriptions.
- The discovery-state branch is public. It can contain public employer leads and aggregate operational metadata only, never applicant data, application history, CVs, drafts or secrets.
- Do not place API credentials in the frontend or public build. Any private backend, cloud sync or external AI processing requires a separate architecture/privacy decision and explicit approval.
- Treat external pages, uploaded files, extracted text and generated suggestions as untrusted input. Validate file type/size and sanitize rendered content.
- Do not bypass login, access controls, CAPTCHA, robots restrictions, rate limits or anti-bot mechanisms.

## 7. Application-preparation automation boundary

This blueprint approves the product direction and the design investigation for Application Preparation. It does **not** authorize an implementation that interacts with external ATS forms.

Current boundary:
- researching and presenting official route information;
- organizing fields/questions and requirements that are available from permitted evidence;
- mapping existing candidate facts to form questions;
- preparing editable, user-reviewed draft answers;
- presenting copyable values, document references and checklists;
- opening the official employer application route for the candidate.

Not authorized without a separate design and explicit approval:
- browser extension or desktop companion;
- cross-tab inspection/control or portal recognition;
- ATS-specific adapters that interact with live accounts;
- automatic field population/autofill;
- automatic file upload;
- automated email access or sending;
- clicking Apply, Submit or any final confirmation on the candidate's behalf.

Any future field-filling assistant must be opt-in, transparent about each value, support a review-before-fill workflow, never overwrite a value the user has changed, and leave final submission to the user. It must respect site controls and terms; no bypass of access protections is permitted.

## 8. Current implementation position

| System | Current implementation | Remaining work |
|---|---|---|
| Studio Discovery | V1 scheduled discovery automation, source verification, public directory and operational health monitoring | Normal source maintenance, genuine reliability fixes and permitted coverage improvements |
| Candidate Profile | Structured profile, IndexedDB persistence, skill evidence, master materials, preferences and validated backup/restore foundations | Continue backend correctness, recovery, migration and browser acceptance audit |
| Matching Engine | On-device qualitative matching, separate relevance/readiness/priority dimensions, explanations and match-to-tracker handoff | Continue false-positive/edge-case validation; richer persisted assessments and manual priority controls remain future work |
| Application Preparation | Direction defined here; existing route metadata and some match context are available | Detailed requirements-analysis and workspace design, then phased implementation; no automatic ATS interaction exists |
| Application Tracker | Existing browser-local My applications record, match handoff, statuses, dates, notes and backup/restore | Finish data-integrity audit and refine lifecycle clarity; advanced campaign views/analytics remain future work |

This table distinguishes the current product foundation from the intended complete workflow. A documented design is not an implemented feature, and an active route is not confirmation of a vacancy or a candidate's eligibility.

## 9. Recommended delivery sequence

1. **Freeze Studio Discovery V1 scope.** Keep it stable while routine scheduled operations continue. Fix actual reliability or data-quality defects, not speculative redesigns.
2. **Complete backend correctness for existing systems.** Validate Candidate Profile storage/import/export, Matching determinism/evidence boundaries, and the My applications lifecycle/storage. Add regression and browser-acceptance tests before expanding functionality.
3. **Design Application Preparation in depth.** Resolve the requirement data model, page-analysis method/fallbacks, candidate-to-field mapping, draft-answer rules, document-version handling, review UX and privacy implications. Evaluate what can be done safely on static hosting.
4. **Implement a non-invasive Application Preparation V1.** Start with route analysis that can be supported by permitted information, structured requirements, candidate mapping, editable drafts, missing-information warnings, checklist and direct employer links. Candidate performs portal entry and submission manually.
5. **Integrate the existing tracker lifecycle.** Use the same canonical application record from selection through preparation and submission. Confirm Applied only after the user says the submission was completed.
6. **Evaluate with real, varied application routes.** Include direct employer forms and common ATS platforms, different countries/languages, email routes, missing/inaccessible content and exceptional document requirements.
7. **Consider optional portal assistance only later.** Decide separately whether an extension or other integration is worth its security, privacy, maintenance and compatibility cost. Require explicit approval; never automate final submission.
8. **Refine campaign operations.** Add manual priority overrides, review waves, reminders and outcome reporting only when the core lifecycle is reliable and actual usage justifies them.

Before moving from one system to the next, agree its detailed requirements, edge cases, acceptance criteria and data contract. This blueprint intentionally defines the big picture; it does not prematurely settle every system-level implementation choice.

## 10. Definition of a successful complete workflow

A complete version of the tool should allow the candidate to:

- browse a broad, evidence-backed public directory of eligible speculative-application routes;
- maintain a reliable, private and recoverable candidate profile;
- see a transparent, explainable shortlist based on both studio evidence and their profile;
- choose a target and understand the employer's real application requirements;
- prepare answers and documents using only truthful, approved candidate information;
- review every proposed value before using it on the employer's site;
- manually complete and submit the application;
- confirm submission and track subsequent progress/outcomes in one canonical record;
- preserve privacy and recoverability throughout the process.

The measure of success is not the number of automated clicks. It is a reliable end-to-end workflow that makes it materially easier to identify, prepare and manage relevant applications while keeping the candidate informed and in control.
