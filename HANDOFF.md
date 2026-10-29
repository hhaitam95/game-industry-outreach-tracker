# Project Handoff

**Current phase, branch/PR state, verification evidence, known limitations, and next action:** see [STATUS.md](STATUS.md), the single source of truth for volatile project state.

**Repository visibility:** Public. Never commit private candidate records, CVs, application history, contact details, credentials, or secrets.

## Phase 7 implementation

- Working branch: `feat/phase7-outreach-tracker`; design/acceptance: ADR-050 in DECISIONS.md and Phase 7 in IMPLEMENTATION_PLAN.md.
- Outreach provides deterministic editable templates from user motivation, approved saved profile facts, and sourced studio context; pre-send checks are heuristic prompts, not fact checks.
- Every saved edit creates a new private draft revision with profile timestamp, CV label (metadata only), guidance version and source context.
- Applications tracks interested leads, manually confirmed submission, statuses, responses, interviews, outcomes, activity history and follow-up dates.
- Personal data remains in the encrypted browser-local vault. There is no auto-send/submit, AI API, backend or localStorage persistence. Legacy v1 vault data is validated and migrated in memory to schema v2 on unlock; next save exports the new validated schema.
- Phase 7 implementation is complete and verified on its feature head. [PR #8](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/8) remains open as a draft and unmerged for owner review; STATUS.md records exact-head evidence and the current verification boundary.

## Phase 8 — Same-repository GitHub Pages release

- ADR-055 supersedes ADR-054 and selects the original `hhaitam95/game-industry-outreach-tracker` repository for source, tests, docs, and Pages deployment workflow.
- `.github/workflows/publish-pages.yml` is `workflow_dispatch` only. `validate-only` is the default and uses synthetic sample data; it does not upload an artifact or deploy. The explicit `publish` mode is allowed only from `main`, validates the existing public snapshot, checks the build/privacy boundary, uploads only `dist/`, then calls the official Pages deployment action.
- The build job has `contents: read`. Only the separate deploy job receives `pages: write` and `id-token: write`. No second repository, personal access token, or deployment secret is required.
- `scripts/check-pages-artifact.mjs` rejects known private file types/paths, recognized credential patterns, missing local JS/CSS assets, missing CSP, symbolic links and external/unsafe HTML script/link references. Synthetic tests cover success and failure cases. These checks are guardrails, not a replacement for reviewing public content.
- **Pages setting:** the owner confirmed this repository's Settings → Pages source is configured as GitHub Actions. The connected GitHub integration does not expose workflow dispatch, so start `Public Pages release` from Actions manually: run `validate-only`, review the checks, then select `publish` from `main`. No site is live until publication succeeds and the public URL/privacy boundary are reviewed.
- Do not enable schedules, add push triggers, dispatch live discovery, publish private application data, or change repository visibility.
- Read [STATUS.md](STATUS.md) for current PR, checks, review order and next action.

## Phase 9 — Launch feedback and stabilization

- ADR-056 defines the launch acceptance gate, public feedback loop, rollback path, and stable release rules.
- Use the GitHub Issue Forms linked from README for one bug or enhancement per issue. Reports are public; never include personal CV/profile/application material, vault exports, correspondence, credentials, or unredacted screenshots.
- Triage reported items into launch blockers, defects/regressions, usability polish, and later-version ideas. Deliver small reviewed changes, run CI/privacy/browser checks, manually publish, then have the owner retest the deployed scenario.
- Do not tag `v1.0.0` until the public URL/assets and core user flows are accepted, all required CI is green, no launch blockers remain, and limitations are documented. Ideas outside the stable scope remain backlog items for a future version.
- Read [STATUS.md](STATUS.md) for the current branch/checks and deployment state.

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
- Phase 6a/6b subsequently passed their required exact-head checks and were merged into main. See STATUS.md for final acceptance evidence.

## Phase 6a resume lab foundation

- Resume Lab provides local-only DOCX, text-based PDF and UTF-8 TXT extraction with visible warnings and conservative file/page/text limits.
- Resume-guidance Markdown is bundled at build time; it is not fetched at runtime.
- Extracted text is read-only and held in component state only. It is not saved to the encrypted workspace, logged, or uploaded. Scanned PDFs require a text-based copy because OCR is not enabled.
- Phase 6c provides structured resume editing with imported baselines and provenance, add/remove/reorder, before/after review, local DOCX export, browser-print PDF, and selective/redacted manual AI handoff. ADR-049 also fixes failed-paste data loss, makes section changes explicit in the diff, and preserves text when too many headings prevent safe structuring. Frontend CI, discovery fixtures, and browser acceptance passed on verified implementation/test head `9c60dccc`; PR #7 has since been squash-merged into main. See STATUS.md for current verification evidence.

## Review boundary

- Consult [STATUS.md](STATUS.md) for current verification evidence.
- Keep live discovery and publication owner-controlled; they remain manual actions.
- Discovery remains manual-dispatch-only. No schedule, publication, Pages deployment, or repository visibility change is approved.

## Engineering workflow

Before each phase and each cohesive implementation unit, publish a short uniquely numbered design note and a definition of done before code. Follow the standards in [AGENTS.md](AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); after implementation, record deviations and why. Keep volatile status and check evidence in [STATUS.md](STATUS.md) only.

## Safety boundaries

No private profile, CV, correspondence, personalized drafts, application history, local database/export, credential, or secret belongs in this public repository or the public discovery projection. Do not force-push, rewrite history, delete branches, or destroy generated state. Treat uncertain source data conservatively and preserve the last known good record.
