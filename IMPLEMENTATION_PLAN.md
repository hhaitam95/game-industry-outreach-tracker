# Game Industry Outreach Tracker — product and implementation plan

## Product objective

Maintain a broad global directory of game-development studios that explicitly accept speculative/open applications, then help the user identify relevant opportunities and manage applications efficiently.

The product is organized into three layers:
1. Studio Discovery — global and non-personalized.
2. Candidate Profile & Matching — private profile, preferences and transparent assessment.
3. Application Workspace — private queue, requirements summary, preparation and tracking.

The full specification is [Candidate Profile, Matching and Application Workspace](docs/architecture/candidate-profile-matching-application-workspace.md).

## Existing foundation

- React/Vite static website on GitHub Pages.
- Worldwide studio directory with verified employer-backed speculative/open application routes.
- Researched studio profiles and game artwork.
- Existing browser-local My applications tracker.
- Scheduled discovery maintenance and validation.

Keep this foundation stable. Do not change the discovery inclusion rules or hide studios based on a candidate's personal preferences.

## Next roadmap — candidate profile and application workspace

### Phase C1 — Candidate Profile foundation (merged in PR #95; deployed)
- Add a structured profile for contact details, professional summary, experience, education, projects/training and skills.
- Associate skills with evidence and distinguish demonstrated, transferable, learning/exposure, not evidenced and user-confirmed gaps.
- Add one approved master resume and one master motivation letter/message.
- Add editable role, work-model and geographical priority preferences.
- Keep all candidate data browser-local; use a versioned local schema and user-controlled export/import.
- Preserve original uploaded documents and require approval before changing master materials.
- Implemented: structured profile UI, separate versioned IndexedDB storage, PDF/DOCX original-file preservation, manual save, versioned JSON export/import, and browser acceptance coverage for persistence and restore.
- Not included in C1: text extraction from attachments, matching, queue/workspace features, server sync or any application automation.

### Phase C2 — Matching and assessment (foundation merged in PR #96)
- Implemented: on-device assessments for active directory records; separate professional relevance, route freshness/accessibility and personal priority dimensions; filters and sorting; evidence, gaps, route facts, source links and review dates.
- Implemented: qualitative Strong / Potential / Weak / Needs profile details classifications. Unspecified role scope is treated as unknown/potential, never as a mismatch. No hiring-probability score is produced.
- Implemented: region, work-model and studio-type preferences affect personal priority only and do not remove or alter directory records.
- Implemented: deterministic fixture-based engine tests and browser acceptance for the Matches page.
- Current limitation: route readiness is conservative. An active route on record is not labelled ready-to-submit; employer instructions and personal eligibility still require human review. Requirement-level provenance is shown only where the public directory currently stores it.
- Matching-quality follow-up merged in PR #104: direct/related discipline alignment; same-discipline demonstrated evidence for Strong matches; whole-phrase skill matching; responsibilities/achievements in work-history assessment; directory-country precedence; neutral treatment of mixed work models; and geography-first campaign sorting. PR CI, main-branch build and Pages publish all passed. Language, visa/work-authorisation, relocation and country-specific remote eligibility remain unstructured and are not scored.
- Deferred to later queue/requirements phases: persistent assessment snapshots, user overrides, manual priority pins, exhaustive form/document/language/eligibility extraction and AI processing.

### Phase C3 — Basic match-to-tracker workflow (implemented in PR #107)

- Implemented: save an eligible Matches target directly into the existing private My applications tracker.
- Implemented: duplicate-aware handoff from Matches back into the tracker.
- Implemented: saved route-context snapshot, including route type/status, source, check date, work model, submission method, stated discipline scope, recorded locations and research notes.
- Implemented: versioned, validated local tracker JSON export/restore, explicit replacement confirmation, and preservation of private notes, status and dates.
- Validation: PR-head CI [41496776891](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41496776891), merged-main CI [41497190125](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41497190125) and Pages publish [41497190769](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41497190769) passed.
- Still later work: a richer queue board with pinned/manual priority, saved assessment history, campaign waves and analytics. The existing tracker is sufficient for the first manually reviewed application wave; do not expand C3 before the weekend pilot.



### Phase C4 — Application requirements intelligence
- Capture route type, submission channel, required/optional documents, department/discipline, form questions, language, location, eligibility and special instructions.
- Use official employer evidence; mark each finding explicit, inferred or unknown.
- Include evidence URL and last-checked date.
- Never invent requirements or infer global hiring/visa eligibility.

### Phase C5 — Application Workspace
- Present studio context, route, requirements, skill mapping, approved materials, preparation checklist, private notes and progress.
- Make the next action clear and reduce repetitive copying/research.
- Keep application preparation user-reviewed and submission manual.

### Phase C6 — Evaluation and refinement
- Test against varied studios, countries, application routes and employer instructions.
- Review false positives/negatives and usability with the user before expanding scope.
- Validate local persistence, migrations, export/import and public-build privacy boundaries.

### Phase C7 — Campaign readiness and outcome tracking (proposed; not implemented)

- Define a private, reviewable campaign queue that can group candidate-selected studios into priority waves.
- Show a pre-submission checklist covering current official route, professional rationale, role/discipline scope, location/work model, language evidence, applicant eligibility, required documents and form exceptions.
- Reference the single approved master resume and master motivation letter/message by default; require human review for genuine employer-specific exceptions.
- Track submitted applications, acknowledgements, recruiter responses, screenings, interviews, offers, rejections and no-response outcomes separately from studio-discovery counts.
- Provide cohort/funnel reporting by wave, region, role family, route type and submission channel without presenting results as a hiring-probability prediction.
- Keep final review and submission manual. Any portal automation is a separate design and approval.

The detailed target tiers and campaign operating principles are in [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md). The 200+ application ambition is a scale objective, not a quota or a promised outcome.

## Explicitly deferred

Browser extension/desktop companion, portal recognition, ATS adapters, automatic form filling, file upload automation, automated email sending and automated application submission are not part of these phases. Revisit only after the profile, matching and workspace are implemented and evaluated, and after a separate design/approval.

## Non-negotiable boundaries

- Never commit CVs, profile data, private assessments, application records, notes or correspondence.
- Never send personal data to a server or AI service without a separate, explicit privacy decision and user approval.
- Never fabricate skills, experience, metrics, eligibility or employer requirements.
- Never change the global discovery set based on personal preferences.
- Never submit an application automatically.
