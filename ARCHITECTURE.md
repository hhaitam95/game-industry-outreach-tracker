# Architecture

**Last reviewed:** 2026-11-03  
**Product blueprint:** [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md)

## Product architecture

Game Industry Outreach Tracker is organized around five connected systems:

1. **Studio Discovery** — globally discover, verify and maintain game-development studios that explicitly accept speculative, unsolicited, spontaneous, open or general applications beyond ordinary advertised vacancies.
2. **Candidate Profile** — maintain the candidate's private structured professional record, evidence, preferences and approved application materials.
3. **Matching Engine** — compare canonical studio records with the Candidate Profile and explain professional relevance, application accessibility/readiness and personal priority separately.
4. **Application Preparation** — analyze a selected studio's actual official application route and, where accessible, its form; identify requirements and questions; map them to truthful candidate facts; and prepare materials and draft answers for review.
5. **Application Tracker** — record user-confirmed submissions and manually maintain application progress and outcomes.

These are five product responsibilities, not a requirement for five independent services or databases. The intended workflow is Discovery → Profile + Studio inputs → Matching → Application Preparation → manual employer-site submission → Tracker.

The Candidate Profile is configured independently and is a reusable input to both Matching and Application Preparation. The existing My applications record is the single canonical private application record: it may begin as a selected/preparing target and becomes an actual application only when the user confirms submission. Do not create a second queue/history for the preparation workspace.

The public Studio Directory remains worldwide, non-personalized and evidence-backed. Candidate preferences and match assessments are private overlays and must never change discovery qualification, coverage, publication or public ordering.

## System responsibilities

### 1. Studio Discovery

- Public directory data lives in src/data/speculative-route-directory.json and src/data/studio-profiles.json.
- A studio is eligible only when direct game-development activity and an explicit employer-backed speculative/general application route are verified.
- Candidate feeds are leads only; official employer evidence is required for publication.
- Store source provenance, official route/evidence links, relevant public studio metadata, route context and verification dates.
- Scheduled automation and discovery operational state are separate from candidate data.
- Treat V1 as operational and maintenance-led. Continue normal source checks and fix demonstrated reliability/data-quality defects; do not reopen broad redesign without evidence.

Detailed source qualification, permitted feeds, verification and coverage rules are in the [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).

### 2. Candidate Profile

- Maintain one structured profile for contact details, professional summary, work history, education, projects/training, skills and evidence, preferences and approved master materials.
- The profile is private and browser-local under the current hosting model.
- Preserve original uploaded documents and use versioned, validated export/restore.
- Do not infer candidate facts or silently alter approved materials.

### 3. Matching Engine

- Consume public studio/route data and the current private Candidate Profile.
- Calculate assessments on-device.
- Keep professional relevance, route accessibility/readiness and personal priority independent and explainable.
- Preserve evidence, gaps, unknowns, source URLs and verification dates.
- Never treat a compatibility category as a hiring probability.
- Do not write candidate-specific assessments into the public directory.

### 4. Application Preparation

- Work from a candidate-selected canonical studio record and its official employer route.
- Analyze only information available through permitted access; distinguish explicit requirements, cautious inference and unknowns.
- Extract or organize form fields, application questions, required/optional documents, portfolio needs, file constraints, language, location and eligibility instructions where available.
- Map these requirements to profile evidence and approved materials; expose missing information rather than guessing.
- Produce editable answer drafts, document/checklist guidance and direct employer links.
- Keep the candidate in control of review and all final portal actions.

The static GitHub Pages application cannot reliably inspect arbitrary cross-origin or authenticated ATS pages. Dynamic forms, CORS, browser isolation, login requirements and anti-bot protections require a staged design and a manual/user-assisted fallback. A backend page fetcher, browser extension, ATS adapter or autofill is not implicitly approved.

### 5. Application Tracker

- Reuse the existing browser-local My applications feature as the canonical queue and tracker.
- A selected target can be saved before applying; distinguish Saved/Preparing from Applied.
- Only the user confirms that an external application was submitted.
- Track statuses, submitted date, notes, follow-up and outcomes through manual updates.
- Keep email communication external in the initial scope.
- Do not duplicate the canonical studio or create a second application history.

## Shared data flow

- Studio Discovery → canonical public Studio Directory.
- Studio Directory + Candidate Profile → Matching Engine.
- Candidate Profile + selected studio/route → Application Preparation.
- Matching selection → one private application record referencing the canonical studio ID.
- Preparation checklist, reviewed drafts and material references → that same private application record.
- User's external submission → manually confirmed Applied state → Application Tracker and outcome history.

The Candidate Profile and all candidate-specific state remain local. Public studio records remain independent.

## Website and hosting

- React and Vite publish static assets on GitHub Pages.
- GitHub Pages has no private server-side runtime or authentication.
- Public studio facts and verified routes remain in the public-safe datasets.
- Use IndexedDB for private structured candidate records, profile documents and future preparation artifacts where appropriate. Preserve and safely migrate the existing localStorage tracker.
- Provide validated user-controlled export/import. Explain that browser storage is device/browser/origin-specific, can be cleared and is not automatically encrypted.
- Never commit candidate profile data, CVs, drafts, preferences, private assessments, queue state, application history or notes.
- The discovery-state branch is publicly visible and may contain public employer leads and aggregate operational metadata only. Never place candidate or application data or secrets there.
- Any private backend, cloud sync or external AI processing requires a separate privacy/architecture decision and explicit user approval.

## Detailed specifications

- [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md) — overall product purpose, workflow, responsibilities, data ownership and delivery order.
- [Candidate Profile, Matching, Application Preparation and Tracking](docs/architecture/candidate-profile-matching-application-workspace.md) — detailed profile, matching, preparation and application lifecycle requirements.
- [Studio Targeting and Application Campaign Strategy](docs/architecture/studio-targeting-and-application-campaign.md) — private targeting tiers, standard application package, review and outcome principles.
- [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md) — public discovery qualification, source/access policy and verification behavior.

The blueprint defines product direction; detailed feature specifications and implementation status determine what is actually built. Do not describe a proposed capability as implemented.
