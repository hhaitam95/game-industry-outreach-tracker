# Product specification

## Product purpose

StudioScout helps a candidate move from discovering legitimate game studios with speculative/open application routes to preparing, submitting and tracking relevant applications.

The product consists of five systems. The complete workflow and data boundaries are described in the [Five-System Product Blueprint](docs/architecture/five-system-product-blueprint.md).

## 1. Studio Discovery

- Maintain a worldwide, non-personalized directory of verified game-development organisations.
- Require both direct game-development evidence and an explicit employer-backed speculative, unsolicited, spontaneous, open, general or future-opportunity application route.
- Treat external source feeds as candidate leads only. Publish only after the official employer or directly linked employer-controlled platform confirms the route.
- Store canonical studio identity, public metadata, selected games, official website/route, evidence links, route type/conditions and review dates.
- Distinguish an open application route from an advertised vacancy.
- Do not use Candidate Profile preferences or Matching results to change what is discovered or published.

Detailed eligibility, access and verification rules remain in the Global Discovery Implementation Model.

## 2. Candidate Profile

- Maintain structured contact details, professional summary, work history, education, projects/training, skills and supporting evidence.
- Distinguish demonstrated, transferable, learning/exposure, not evidenced and user-confirmed gap skills.
- Store one approved master resume/CV and one approved core motivation letter/message, with optional portfolio and supporting files.
- Capture candidate preferences and optional user-entered language/work-authorisation/relocation facts.
- Preserve original documents and support validated, user-controlled backup/restore.
- Keep all candidate data browser-local under the current static-hosting architecture.

## 3. Matching Engine

- Compare the public Studio Directory with the private Candidate Profile.
- Assess professional relevance, application accessibility/readiness and personal priority separately.
- Explain each result using employer evidence, candidate evidence, gaps, uncertainty, source URLs and review dates.
- Use qualitative categories, not hiring probability.
- Keep unknown location, language, remote eligibility, sponsorship and work-authorisation facts unknown until verified.
- Treat Matching as a private overlay; it must not mutate or suppress the public directory.

## 4. Application Preparation

- Start from a studio the candidate selected from Matches and its official application route.
- Analyze the actual application page/form when information is accessible through permitted means.
- Identify form fields, questions, required/optional documents, portfolio requirements, discipline options, format/character limits, language/location/eligibility conditions and other instructions where present.
- Record whether each requirement is explicit, inferred or unknown, with source and review date.
- Map the fields to Candidate Profile facts and approved materials.
- Prepare editable, truthful draft answers and a document/checklist view.
- Ask the candidate for missing facts; never guess or invent qualifications.
- Keep all proposed answers and materials subject to user review.
- Provide a safe user-assisted fallback when a cross-origin, dynamic or authenticated form cannot be inspected.
- The initial version may provide copyable values, prepared text, documents and direct links. Browser extension, ATS interaction, autofill, automatic upload, email integration and automated submission are not implicitly approved.

## 5. Application Tracker

- Reuse the existing private My applications feature as the one canonical queue and application history.
- Create/open a record when the candidate selects a match; keep Saved/Preparing separate from Applied.
- Allow the same record to move through preparation and later user-confirmed submission.
- Require the user to confirm that they actually submitted the application.
- Track submitted date, status, notes, follow-up and outcomes such as acknowledgement, assessment, interview, offer, rejection, withdrawal or no response.
- Keep email communication external in the initial scope; the user may manually record updates.
- Preserve validated export/restore and duplicate-aware match handoff.
- Count only confirmed submissions as applications for campaign reporting.

## Shared rules

- One canonical studio identity and one private application record per application instance.
- Candidate data, private assessments, preparation drafts, application history and notes are not public data.
- No private backend, cloud sync or external AI processing without a separate privacy/architecture decision and explicit approval.
- The candidate approves material changes and performs the final employer-site review and submission.
- Respect employer-site terms, browser security boundaries, access controls, CAPTCHA and anti-bot protections.
- Browser storage is device/browser/origin-specific, can be cleared and is not automatically encrypted.

## Out of scope unless separately designed and approved

- Public job-board aggregation as a replacement for speculative-route discovery.
- Candidate-specific filtering of the public directory.
- Unreviewed resume/cover-letter rewriting or invented candidate facts.
- Automatic portal login, ATS field filling, file uploads or submission.
- Automated email access, replies or sending.
- Browser extension, desktop companion, private backend or cloud sync.
