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

- Main contains **313 unique verified studio/employer records / 313 matching profiles**: 308 active routes and 5 paused routes across 51 country/location labels.
- PR #70 (global directory expansion) and PR #71 (source-specific discovery engine) are merged. The 314-row PR #70 snapshot had a duplicate identity pair for the same FakeFish employer and identical open-application route. ADR-078 consolidates it into one canonical **FakeFish** record, preserving the more complete official profile and route detail.
- The integrated candidate feeds are declared in `config/discovery-sources.json` and loaded by `scripts/discover_speculative_studios.py`. The private discovery state now migrates additively from schema v1 to v2.
- The three Wikidata feeds have independent cursors, cycles, verified-addition counts and complete-empty-pass counters. After three complete empty passes, only that individual feed is limited to one page per hourly run. A new verified route resets only its originating feed. Failed or incomplete passes do not count as exhaustion.
- GameDevMap remains a one-time backfill; its terminal cursor is preserved. Legacy Wikidata candidates without a stored feed identity remain `legacy_unattributed` instead of being assigned to a guessed source.
- IGDB, GameCompanies.com, Games Jobs Index, Steam, MobyGames and the community database remain unintegrated research leads; do not describe them as automated feeds.
- DreamCentury Entertainment and President Studio remain held for the reasons recorded in STATUS.md and the Global Discovery Implementation Model. The manual exclusions remain in `config/manual-studio-exclusions.json`.

## Handover checklist

At the start of a new session, read the Global Discovery Implementation Model, this file and STATUS.md; inspect current main, open PRs, discovery-state and latest successful workflows. At the end, update the model with new source/evidence/policy/engineering findings, update STATUS.md and this file for the new checkpoint, and update CHANGELOG.md or an ADR when appropriate. Record why any candidate was held and what evidence would resolve the hold; when new first-party linkage is later found, reconsider the hold rather than leaving stale manual-review notes. Distinguish proposed, implemented, tested, merged and deployed work accurately.

Never put personal application records, CVs, recruiter correspondence, secrets or private profile data in public repository source datasets, issues or PR descriptions.
