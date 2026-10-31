# Handoff

Game Industry Outreach Tracker is a two-page static application: a global directory of verified speculative-application routes plus a personal browser-local application tracker.

## Read this first

- **Authoritative discovery rules, source strategy, exclusion policy and future implementation roadmap:** [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md).
- Current repository state and open work: [STATUS.md](STATUS.md).
- Product scope and decisions: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [DECISIONS.md](DECISIONS.md).

The Global Discovery Implementation Model is the durable source of truth for discovery work and handovers. Read it before changing candidate sources, studio qualification, exclusions, route verification, source cadence or coverage reporting. Incorporate every material new finding into it and update this handoff/status when direction or checkpoint changes.

## Current product and data

- Public verified routes: `src/data/speculative-route-directory.json`.
- Studio profiles: `src/data/studio-profiles.json`.
- Main UI: Studio Directory and My applications.
- Personal tracker data stays in browser localStorage; it is not committed to public repository datasets.
- Candidate/source progress is stored on the separate `discovery-state` branch.
- Active discovery implementation: `scripts/discover_speculative_studios.py`.
- Discovery workflow: `.github/workflows/discover-studios.yml`.

## Non-negotiable discovery rules

1. Discover legitimate video-game development studios globally, from indie to AAA, without prioritizing geography, size, discipline, platform, work model or the user's current career interests. Paid employment is not required: genuine non-profit/volunteer studios can be included, but volunteer-only participation must be prominently labelled as unpaid and not employment. One-person/sole-proprietor game developers can also qualify where direct game development and an explicit unsolicited route are verified; if the route is for project pitches or collaboration rather than a salaried job, label that distinction and leave commercial terms unknown unless stated.
2. Publish a studio only when both conditions are verified: it materially develops video games (or performs direct game-development work, including digital mobile/GPS/location-based/AR games), and it explicitly accepts speculative, unsolicited, spontaneous, open or general applications for consideration beyond a specific advertised vacancy. Pure event/escape-room operators without direct digital-game development do not qualify.
3. Candidate indexes are leads only. Verify the organisation and route using official evidence or a directly linked employer-controlled application platform.
4. Exclude organisations materially focused on pornography/adult sexual entertainment, gambling/iGaming/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Confirmed company-level adult businesses such as 3Sigma Games must be manually excluded. Do not reject a legitimate mainstream studio because of one mature-themed game or a keyword alone; uncertain cases go to review.
5. There is no arbitrary studio-count ceiling. Source saturation is not global discovery completion.
6. Keep unknown hiring locations, applicant eligibility, remote status, ownership and other facts explicitly unknown. Never infer them from headquarters or generic 'remote' labels.

## Scope guardrails

Keep the application to the two existing pages. Do not reintroduce the old job-posting monitor, resume tools, outreach drafting, analytics, accounts, remote tracker sync or automatic applications. Personal career targeting can be considered later; it must not filter or prioritize global discovery now.



## Current global-discovery checkpoint

- Main contains **322 unique verified studio/employer records / 322 matching profiles**: 317 active routes and 5 paused routes across 51 country/location labels. The final Phase A proposal contains 327 route/profile pairs: 322 active and 5 paused across the same 51 labels.
- PRs #70–#74 are merged. PR #73 added seven verified routes and the manual-only source register; PR #74 added CAPCOM, Cygames Group and Small Giant Games and corrected Fawkes Games and Stunlock Studios. PR #72 reconciled the duplicate FakeFish identity into one canonical record, preserving the more complete profile and route detail.
- The integrated candidate feeds are declared in `config/discovery-sources.json` and loaded by `scripts/discover_speculative_studios.py`. The private discovery state now migrates additively from schema v1 to v2.
- The three Wikidata feeds have independent cursors, cycles, verified-addition counts and complete-empty-pass counters. After three complete empty passes, only that individual feed is limited to one page per hourly run. A new verified route resets only its originating feed. Failed or incomplete passes do not count as exhaustion.
- GameDevMap remains a one-time backfill; its terminal cursor is preserved. Legacy Wikidata candidates without a stored feed identity remain `legacy_unattributed` instead of being assigned to a guessed source.
- The post-PR #74 322-row directory was deployed by Pages run 41224727091 from merge commit 02645bf679f866f98e077fea73b320b1eeb2c979; the production build passed in run 41224727035. The last completed scheduled discovery cycle before PR #74 is [41216225203](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41216225203). The push-triggered discovery run [41224727139](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41224727139) was still running when the final closeout proposal was prepared; inspect its summary before quoting newer counters.
- IGDB, GameCompanies.com, Games Jobs Index, Steam, MobyGames and the community database remain unintegrated research leads; do not describe them as automated feeds. Their current access gates and regional association lead sources are recorded in config/manual-discovery-sources.json.
- DreamCentury Entertainment and President Studio remain held for the reasons recorded in STATUS.md and the Global Discovery Implementation Model. The manual exclusions remain in `config/manual-studio-exclusions.json`.


## Batch 13 research branch (merged in PR #73)

- Seven new employer routes were merged: Tanglewood Games, Iceflake Studios, Frozenbyte, Mainstay Games, Big Moxi Games, Rogue Snail and Cyberborz Interactive. Awe Interactive was refreshed, not duplicated.
- The merged data consolidates two identical ByteRockers route rows into one canonical identity and adds validation after automated discovery-data merging.
- Main now contains 319 route/profile pairs, 314 active, 5 paused, across 51 labels. The snapshot was deployed by Pages run 41216159119.
- The manual source registry is separate from automated runtime ingestion. IGDB requires written redistribution permission; Steam is manual-only; other commercial/community indexes retain their individual terms/licence gates.

## Batch 14 (merged in PR #74)

- Adds CAPCOM, Cygames Group and Small Giant Games with official Career Registration / Open Application routes and matching profiles.
- Refreshes Fawkes Games and Stunlock Studios using current employer evidence.
- Expands the manual-only source register to 22 leads; it remains separate from the runtime and does not enable scraping.
- Main now contains 322 route/profile pairs, 317 active and 5 paused, across 51 labels. Pages deployment run 41224727091 and main build run 41224727035 passed.

## Phase A final global sweep (proposed)

- Branch: research/final-global-discovery-closeout-20261031.
- Adds Laki Studios, Makemake Creative Studio, PixelAnt Games, Played With Fire and Rebel Wolves, each with an official non-vacancy route and matching studio profile.
- Rechecks Codebox Games and G7 Studio and confirms both are already represented; no duplicates are added. Other rediscovered studios already in the directory are documented in STATUS and the discovery model.
- Proposal totals: 327 route/profile pairs, 322 active, 5 paused, across 51 labels. Manual source registry remains at 22; no new runtime adapter, scraper, secret, permission or schedule is added.
- Once merged and deployed, initial global discovery becomes an ongoing maintenance responsibility and primary work shifts to Phase B UI/UX. This is a practical verified baseline, not a claim of an exhaustive worldwide census.

## Phase A exit criteria and handover

Phase A closes once the final global sweep PR passes exact-head CI, is merged, and its Pages deployment succeeds. The proposed exit baseline is **327 verified studio/employer route records and 327 matching profiles**, with 322 active and 5 paused across 51 country/location labels. Every public record passes the two eligibility gates: direct game-development activity and an explicit employer-backed non-vacancy application route.

The discovery engine stays enabled as maintenance: one GameDevMap initial backfill, three recurring Wikidata feeds with independent cursors and source-specific saturation, and an hourly bounded workflow. The 22-entry manual-source register remains research-only. Restricted or unapproved indexes are not scheduled or scraped.

Phase A does not claim that every studio worldwide has been found. The private candidate-review backlog, uncertain cases and permission-gated sources remain maintenance work. They do not block Phase B UI/UX development.

## Handover checklist

At the start of a new session, read the Global Discovery Implementation Model, this file and STATUS.md; inspect current main, open PRs, discovery-state and latest successful workflows. At the end, update the model with new source/evidence/policy/engineering findings, update STATUS.md and this file for the new checkpoint, and update CHANGELOG.md or an ADR when appropriate. Record why any candidate was held and what evidence would resolve the hold; when new first-party linkage is later found, reconsider the hold rather than leaving stale manual-review notes. Distinguish proposed, implemented, tested, merged and deployed work accurately.

Never put personal application records, CVs, recruiter correspondence, secrets or private profile data in public repository source datasets, issues or PR descriptions.
