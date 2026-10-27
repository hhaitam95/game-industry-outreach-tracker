# Project Status

**Last updated:** 2026-10-27  
**Current phase:** Phase 5a explorer and core logic implemented; waiting for the reviewed real snapshot before final golden-title validation and the single PR.  
**Working branch:** `feat/phase5-studio-research`  
**Base/main:** `07d8e15cec544e56a09fbcab44202dc7051753c6` (PR #3 merged). No changes to `main`.

## Phase 4 accepted boundary

Phase 4 remains accepted for manual-only, best-effort monitoring after owner-directed run [40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573). Riot yielded 183 links without complete-listing evidence; two prior Riot observations were retained in the 185-record projection, all `last-seen`. CD PROJEKT RED and Naughty Dog returned `needs-review/no-matching-role-links`; Santa Monica Studio remains `needs-review/adapter-required`. This does not establish complete four-studio coverage. Schedules, future scans, publishing and Pages deployment remain disabled unless separately approved.

## Phase 5a progress

- [x] Synthetic `src/data/public-opportunities.json`: 8 sample records with the exact 16-field shape, versioned root and placeholder URLs.
- [x] `snapshot.mjs`: validates exact root/role keys, allowed statuses, HTTPS URLs without credentials, unique IDs and timestamps; returns a controlled error for invalid shape. The committed snapshot has a validator unit test. Synthetic marker remains enabled until the owner supplies the artifact.
- [x] Pure logic: title parsing, precise role-family rules, freshness labels/banner, filters/counts and default sorting. 33 golden title cases cover the requested positive and negative examples; the current golden set is synthetic until actual titles are supplied.
- [x] UI source: explorer is integrated into Studios & roles while the four studio cards remain. It shows status, last seen, parsed clues, matched phrase, filters/counts, target-family preset, the snapshot date and a permanent non-availability disclaimer. Links use HTTPS with `rel="noopener noreferrer"`; synthetic links are labelled placeholders.
- [x] Per-studio coverage uses observed-link counts and partial-coverage language; studios without observed roles say “Manual check needed” with the verified careers route. No studio is labelled “no vacancies”.
- [x] Browser acceptance source is extended to check explorer rendering, a reducing family filter, snapshot date and absence of availability claims. It will run on PR creation; no workflow dispatch has been used.
- [ ] Owner uploads the real `public-opportunities.json` from the `discovery-scan-report` artifact of run [40569785573](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40569785573). Replace the synthetic file, set the marker false, add golden cases from real titles, validate, and run final browser acceptance through the single PR.

## CI log by implementation commit

- `d1fbc414`: Frontend CI failed formatting/type narrowing [40573950815](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40573950815); discovery fixtures passed [40573950788](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40573950788).
- `39410989`: Frontend CI passed [40574144617](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574144617); discovery passed [40574144612](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574144612).
- `555886b8`: Frontend CI failed formatting, typing and one golden phrase expectation [40574565107](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574565107); discovery passed [40574565120](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574565120).
- `8726876b`: Frontend CI still failed JSDoc union parsing and phrase case [40574729272](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574729272); discovery passed [40574732257](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574732257).
- `0f08c59e`: Type check and 47 unit tests passed but formatting remained red [40574926680](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574926680); discovery passed [40574926424](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40574926424).
- `3464c29a`: Temporary formatter-preview validation failed only formatting [40575172270](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575172270); discovery passed [40575172634](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575172634). The helper was removed immediately after use.
- `a77d5e09`: Frontend CI passed [40575330861](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575330861); discovery passed [40575330771](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575330771).
- `48892dd8`: status-only commit; Frontend CI passed [40575451449](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575451449); discovery passed [40575451469](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40575451469).
- `d837826c`: Frontend CI found formatting and TypeScript errors [40576474019](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576474019); discovery passed [40576473978](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576473978).
- `78cf2f49`: Frontend CI still found one unknown facet count and formatting [40576681606](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576681606); discovery passed [40576681595](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576681595).
- `1aedcfb0`: Type check passed but formatter check failed [40576830012](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576830012); discovery passed [40576829677](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40576829677). Temporary preview helper was subsequently removed.
- `335a3206`: Type check and unit tests passed; formatting flagged only `navigation.mjs` [40577008027](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577008027); discovery passed [40577008238](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577008238).
- `d2573b78`: Frontend CI passed [40577176942](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176942); discovery passed [40577176882](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/40577176882).

## Working boundaries

- Repository is public. Never commit personal data, CVs, contact details, private drafts/application records, credentials, tokens or keys.
- Do not modify `main`, merge a PR, run a live scan or workflow dispatch, enable schedules, publish or deploy Pages, change permissions/secrets/visibility, add dependencies, force-push, rewrite history or delete branches.
- No fit score, skill-gap explanation or manual-lead workflow in Phase 5a; those are Phase 5b, deferred until candidate profile and active vault session exist.
- Derived location, seniority, contract and relocation clues are labelled `parsed from listing text`; they never infer eligibility or work authorization.

## Next action

Owner uploads the real snapshot artifact. After validation and real-title golden tests, complete the last acceptance checks and open one Phase 5a PR. Do not merge it.
