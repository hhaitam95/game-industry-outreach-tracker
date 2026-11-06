# Game Industry Outreach Tracker — product and implementation plan

## Product objective

Build a reliable end-to-end workflow for finding game studios that explicitly accept speculative/open applications, deciding which are relevant to the candidate, preparing strong and truthful applications, and tracking confirmed submissions and outcomes.

The product has five connected systems, defined in the [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md):

1. **Studio Discovery** — worldwide, evidence-backed studio and speculative-application route discovery.
2. **Candidate Profile** — private structured candidate facts, skills/evidence, preferences and approved materials.
3. **Matching Engine** — explainable assessment of studio data against the candidate profile.
4. **Application Preparation** — analysis of the employer's actual application route/form and preparation of reviewed answers and materials.
5. **Application Tracker** — one canonical private record for selected targets, confirmed submissions and subsequent progress/outcomes.

The profile can be maintained independently and is an input to both matching and preparation. The user manually completes and submits the employer's application. The tracker record may exist before submission as a selected/preparing target, but only a user-confirmed submission counts as an application.

## Existing foundation

- React/Vite static website on GitHub Pages.
- Worldwide studio directory with verified employer-backed speculative/open application routes.
- Public studio profiles, game metadata and source evidence.
- Scheduled discovery maintenance and validation.
- Structured browser-local Candidate Profile with IndexedDB persistence, skill evidence, preferences, master materials and backup/restore.
- On-device Matching foundation with separate professional relevance, route status/accessibility and personal priority.
- Existing browser-local My applications tracker with match handoff, statuses, notes, dates and backup/restore.

Preserve this foundation. Do not change discovery eligibility or public ordering based on candidate preferences.

## Current system status

| System | Current state | Status of next work |
|---|---|---|
| Studio Discovery | V1 automation and public directory operational | Freeze broad restructuring; maintain source health and address real reliability/data-quality defects |
| Candidate Profile | Foundation implemented | Continue storage, validation, recovery, migration and browser-acceptance hardening |
| Matching Engine | Foundation and quality improvements implemented | Continue deterministic edge-case, evidence and false-positive validation |
| Application Preparation | Manual-assisted preparation panel implemented in My applications: six readiness checks, private requirement/question notes and draft-answer notes, included in tracker backup/restore | Design reliable official-page analysis and user-assisted fallbacks; live ATS extraction/autofill/uploads remain unimplemented |
| Application Tracker | Basic private queue/tracker and match handoff implemented | Complete data-integrity audit; refine selected → preparing → applied lifecycle without duplicating records |

A completed documentation phase or an existing route field is not evidence that Application Preparation is implemented. The live employer form still has to be checked, and eligibility/requirements must not be invented.

## Recommended implementation roadmap

### Phase 0 — Product blueprint (documented 2026-11-03)

- Agree the five-system product model and overall end-to-end workflow.
- Define which system owns each category of data.
- Preserve the global/private boundary and one canonical application record.
- Record Application Preparation as a distinct system before the tracker.
- Keep proposed portal assistance separate from currently authorized functionality.

Deliverable: [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md).

### Phase 1 — Complete backend correctness of existing systems

Before adding another major feature, validate that the existing foundations preserve user data and behave predictably.

- **Candidate Profile:** schema validation, non-destructive load/save, asynchronous import/save races, document integrity, backup/restore, recovery and migration.
- **Matching Engine:** deterministic role/discipline mapping, phrase boundaries, evidence classification, uncertain facts, profile updates and stable explanations.
- **Application Tracker:** non-destructive storage validation, backup/restore, asynchronous import behavior, duplicate prevention, status transitions, submission confirmation and notes.
- **Cross-system:** local-only privacy, stable canonical studio IDs, no duplicate application histories and browser refresh/recovery.
- Add focused unit and browser-acceptance regressions for every discovered defect. Run the relevant full CI/build and inspect actual results before declaring this phase complete.

Do not add more UI complexity until core persistence and data transitions are trustworthy.

### Phase 2 — Design Application Preparation in depth

This is the next major product system to design. Before coding, decide:

- what the user supplies or opens to identify the official application route;
- how the system may inspect public route/form information on static GitHub Pages;
- how to handle dynamic forms, CORS, login, inaccessible pages and user-assisted fallback;
- the structured model for required/optional fields, questions, documents, constraints and evidence provenance;
- how each field maps to candidate-profile facts or approved documents;
- how answer drafts are created, reviewed, edited and versioned;
- how missing facts and unverified requirements are surfaced;
- where preparation state lives and how it attaches to the existing canonical application record;
- what can be done without an external AI provider or private backend.

The output of this phase should be a feature-level specification, interaction flow, data contract, constraints, test plan and explicit acceptance criteria.

### Phase 3 — Implement Application Preparation V1

**Initial manual-assisted foundation implemented in PR #116 (pending final verification):** each My applications record has a Prepare panel with six readiness checks, an employer requirements/questions notes field and a separate draft-answers/missing-information field. These values stay browser-local and are preserved by tracker backup/restore. This provides a usable preparation stage without claiming automatic employer-page analysis.

Remaining scope in this phase is to design reliable official-route analysis and user-assisted content capture for forms that cannot be inspected safely.

Start with a non-invasive, user-reviewed workflow:

1. Open the selected studio's official application route.
2. Gather requirements from permitted, accessible official information; provide a user-assisted path where the site cannot be inspected automatically.
3. Organize application fields/questions, required/optional files, portfolio, language, location and eligibility conditions.
4. Map requirements to the Candidate Profile and its approved master materials.
5. Prepare editable candidate-grounded answer drafts and copyable values.
6. Highlight unanswered fields, unsupported claims, exceptions and missing documents.
7. Present a final checklist with direct links to the employer's site.
8. Let the user complete the form and submit it manually.

Never assume all ATS products expose the same data or form behavior. Common platforms are examples for compatibility evaluation, not an approved integration list.

### Phase 4 — Integrate the application lifecycle

- Continue to use the existing My applications item created from a Match.
- Attach preparation status, requirement snapshot, reviewed answers and material-version references to that canonical item.
- Keep selected/preparing items distinct from submitted applications in views and metrics.
- Provide a clear, deliberate user action to confirm submission and record the submitted date.
- Continue manual status changes for acknowledgement, assessment, interview, offer, rejection, withdrawal and no response.
- Keep email external unless a separate email-integration design is approved.

### Phase 5 — Evaluate and refine

Test the system with varied official application routes: direct studio forms, common ATS platforms, email routes, multi-language pages, dynamic/authenticated pages, missing fields and exceptional document requirements.

Evaluate correctness, requirement provenance, answer quality, missing-information handling, privacy, persistence, mobile/desktop usability and time saved. Refine based on actual use, not hypothetical automation.

### Phase 6 — Optional assisted portal interaction (separate decision)

Only after Application Preparation V1 has been used and evaluated, consider whether a browser extension or other controlled integration is worth its security, privacy, support and compatibility cost. It requires a separate design and explicit user approval. Any future autofill must be transparent, opt-in and reviewable. Automatic uploads and final Submit interaction remain prohibited unless separately reconsidered; final submission must remain with the user.

### Phase 7 — Campaign refinement

Once the core workflow is stable, consider manual priority pins, campaign waves, reminders, follow-up dates and outcome analytics. Measure outcomes from user-confirmed submissions, not from the number of studios discovered. The 200+ campaign ambition is a scale objective, not a quota or response guarantee.

## Explicit boundaries

- Studio discovery remains worldwide, impartial and based on official speculative/open-route evidence.
- Candidate profile, matching, preparation drafts and application history remain browser-local under the current hosting model.
- Do not fabricate candidate facts or employer requirements.
- Do not send candidate data to an external AI service without a separate, explicit privacy decision and approval.
- Do not introduce a private backend, cloud sync, browser extension, ATS portal control, automatic uploads or email sending as an implicit subtask.
- Never click Apply/Submit or otherwise submit an application on the user's behalf.
- Preserve one canonical studio identity and one private application record per application instance.

## Detailed references

- [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md)
- [Candidate Profile, Matching, Application Preparation and Tracking](docs/architecture/candidate-profile-matching-application-workspace.md)
- [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md)
- [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md)
