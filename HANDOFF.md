# Project Handoff

**Current phase, branch/PR state, verification evidence, known limitations, and next action:** see [STATUS.md](STATUS.md), the single source of truth for volatile project state.

**Repository visibility:** Public. Never commit private candidate records, CVs, application history, contact details, credentials, or secrets.


## Phase 8 — Public Pages release

- Read [STATUS.md](STATUS.md) for the current verified code head, pull requests and CI run links.
- ADR-054 selected `hhaitam95/game-industry-outreach-tracker-site` as an output-only public Pages repository. The source repository remains public and its visibility is unchanged.
- `.github/workflows/publish-pages.yml` is `workflow_dispatch` only. `validate-only` is the default and does not sync current discovery data or write to the target. The explicit `publish` mode validates the existing public snapshot, builds and checks static output, then publishes to target `main`.
- `scripts/check-pages-artifact.mjs` rejects known private file types/paths, recognized credential patterns, missing local JS/CSS assets, missing CSP, symbolic links and external/unsafe HTML script/link references. Synthetic tests cover success and failure cases. These checks are guardrails, not a replacement for reviewing public content.
- The deploy token is checked out only after dependency installation, tests, build, privacy validation, artifact validation and a repository-path smoke test have passed. Keep `PUBLIC_PAGES_TOKEN` limited to the target repository's Contents read/write permission, expiring and stored only as an Actions secret.
- **External blocker:** the target repository and secret are not configured; the connected tooling cannot create repositories, configure Pages or write secrets. No publication has been run and no site is live.
- The owner must create the target repository, enable Pages from `main` root, add the narrow `PUBLIC_PAGES_TOKEN` secret and merge the prerequisite PRs #7 and #8 first. After reconciling Phase 8 with the updated `main`, check the current PR head before any merge. Only then manually dispatch the release workflow in `publish` mode.
- Do not enable schedules, add push triggers, dispatch live discovery, publish private application data, or change source-repo visibility as part of this phase.

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
- Phase 6a+6b previously passed exact-head frontend, browser acceptance, and discovery checks; see STATUS.md for the historical evidence. Phase 6c and Phase 7 remain separate owner-controlled PRs #7 and #8 until merged.

## Phase 6a resume lab foundation

- Resume Lab provides local-only DOCX, text-based PDF and UTF-8 TXT extraction with visible warnings and conservative file/page/text limits.
- Resume-guidance Markdown is bundled at build time; it is not fetched at runtime.
- Extracted text is read-only and held in component state only. It is not saved to the encrypted workspace, logged, or uploaded. Scanned PDFs require a text-based copy because OCR is not enabled.
- Structured editing/diff, DOCX/PDF export, and manual ChatGPT handoff remain Phase 6c work.

## Review boundary

- Consult [STATUS.md](STATUS.md) and the current [Phase 5a pull-request checks](https://github.com/hhaitam95/game-industry-outreach-tracker/pull/4/checks) for current verification evidence.
- Keep the merge decision and any live run owner-controlled.
- Discovery remains manual-dispatch-only. No schedule, publication, Pages deployment, or repository visibility change is approved.

## Engineering workflow

Before each phase and each cohesive implementation unit, publish a short uniquely numbered design note and a definition of done before code. Follow the standards in [AGENTS.md](AGENTS.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md); after implementation, record deviations and why. Keep volatile status and check evidence in [STATUS.md](STATUS.md) only.

## Safety boundaries

No private profile, CV, correspondence, personalized drafts, application history, local database/export, credential, or secret belongs in this public repository or the public discovery projection. Do not force-push, rewrite history, delete branches, or destroy generated state. Treat uncertain source data conservatively and preserve the last known good record.
