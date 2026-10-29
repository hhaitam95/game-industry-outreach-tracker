# Project Handoff

**Current phase, branch/PR state, verification evidence, known limitations, and next action:** see [STATUS.md](STATUS.md), the single source of truth for volatile project state.

**Repository visibility:** Public. Never commit private candidate records, CVs, application history, contact details, credentials, or secrets.

## Phase 5a implementation

- `src/data/sample-public-opportunities.json` contains synthetic Riot-style roles, the exact 16-field public record shape, `last-seen` statuses, a conspicuously synthetic timestamp, and placeholder posting URLs.
- The shared snapshot validator is used by the frontend loader and sync CLI. The loader prefers the gitignored generated snapshot and falls back only when it is absent; invalid synced data fails closed. The sample fallback is visibly labelled “Sample data - not a real scan”.
- `npm run data:sync -- --from <path|https-url>` validates input before writing the gitignored local snapshot. Read/parse/schema failures preserve the destination. Unit tests use local files, not network requests.
- The discovery workflow stages the public projection in the existing handoff artifact, validates it before persistence, and stores generated data on `discovery-state`, not in the application source tree.
- The explorer preserves the studio cards and filters by studio, role family, title, seniority, country, contract, and freshness. It explains source/derived values, shows snapshot freshness and last-seen uncertainty, and performs no runtime career-site fetches.
- Fit/skill-gap explanations and manual leads remain deferred to Phase 5b until a candidate profile and active browser-vault session exist.

## Phase 6b deterministic resume checks and comparison

- Phase 6b adds baseline word/character/line counts, cautious section-heading detection, and count-only email/phone/URL patterns with no matched values echoed.
- When unlocked, the vault's candidate profile projection is held in App memory so the Resume Lab can compare exact skill mentions and target-role phrases. Locking or deleting the vault clears that projection; raw resume text and the role description are not persisted.
- Role comparison reads either a selected public snapshot title or a manually pasted description. The app does not fetch career pages at runtime. Current sample roles are synthetic and last-seen links never prove current availability.
- Matching is literal and explanatory only: a missing term does not mean the user lacks a skill. There are no fit scores, AI calls, eligibility conclusions, or external submissions.
- Phase 6a's formatter gate remains unresolved on the prior slice; see STATUS.md. Phase 6b must not be described as accepted until all exact-head gates pass.

## Phase 6a resume lab foundation

- Resume Lab provides local-only DOCX, text-based PDF and UTF-8 TXT extraction with visible warnings and conservative file/page/text limits.
- Resume-guidance Markdown is bundled at build time; it is not fetched at runtime.
- Extracted text is read-only and held in component state only. It is not saved to the encrypted workspace, logged, or uploaded. Scanned PDFs require a text-based copy because OCR is not enabled.
- Phase 6c includes structured editing, provenance, before/after review, local DOCX and browser-print PDF export, and selective manual AI handoff. ADR-049 also fixes failed-paste data loss, makes section changes explicit in the diff, and preserves text when too many headings prevent safe structuring. Frontend CI, discovery fixtures, and browser acceptance (24/24 synthetic checkpoints) passed on implementation/test head 9c07e20. See STATUS.md for verification links; PR #7 remains draft and unmerged pending owner review.

## Review boundary

- Consult [STATUS.md](STATUS.md) and the current [Phase 5a pull-request checks](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks) for current verification evidence.
- Keep any future merge decision and any live discovery run owner-controlled.
- Discovery remains manual-dispatch-only. No schedule, publication, Pages deployment, or repository visibility change is approved.

## Engineering workflow

Before each phase and each cohesive implementation unit, publish a short uniquely numbered design note and a definition of done before code. Follow the standards in [AGENTS.md](AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); after implementation, record deviations and why. Keep volatile status and check evidence in [STATUS.md](STATUS.md) only.

## Safety boundaries

No private profile, CV, correspondence, personalized drafts, application history, local database/export, credential, or secret belongs in this public repository or the public discovery projection. Do not force-push, rewrite history, delete branches, or destroy generated state. Treat uncertain source data conservatively and preserve the last known good record.
