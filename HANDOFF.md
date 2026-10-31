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

1. Discover legitimate video-game development studios globally, from indie to AAA, without prioritizing geography, size, discipline, platform, work model or the user's current career interests. Paid employment is not required: genuine non-profit/volunteer studios can be included, but volunteer-only participation must be prominently labelled as unpaid and not employment.
2. Publish a studio only when both conditions are verified: it materially develops video games (or performs direct game-development work, including digital mobile/GPS/location-based/AR games), and it explicitly accepts speculative, unsolicited, spontaneous, open or general applications for consideration beyond a specific advertised vacancy. Pure event/escape-room operators without direct digital-game development do not qualify.
3. Candidate indexes are leads only. Verify the organisation and route using official evidence or a directly linked employer-controlled application platform.
4. Exclude organisations materially focused on pornography/adult sexual entertainment, gambling/iGaming/casinos/betting, recreational drugs/cannabis, alcohol, tobacco/nicotine/vaping and related vice sectors. Confirmed company-level adult businesses such as 3Sigma Games must be manually excluded. Do not reject a legitimate mainstream studio because of one mature-themed game or a keyword alone; uncertain cases go to review.
5. There is no arbitrary studio-count ceiling. Source saturation is not global discovery completion.
6. Keep unknown hiring locations, applicant eligibility, remote status, ownership and other facts explicitly unknown. Never infer them from headquarters or generic 'remote' labels.

## Scope guardrails

Keep the application to the two existing pages. Do not reintroduce the old job-posting monitor, resume tools, outreach drafting, analytics, accounts, remote tracker sync or automatic applications. Personal career targeting can be considered later; it must not filter or prioritize global discovery now.



## Current global-discovery checkpoint

- Main remains at **287 verified routes / 287 profiles** (284 active, 3 paused) until the current batch-6 PR is merged and deployed.
- The in-progress branch `data/global-discovery-batch-6-20261031` consolidates the previously validated fifth expansion and adds 22cans, Absolutely Games and AB Games, for a proposal of **293 routes / 293 profiles** (289 active, 4 paused).
- It adds Favo Games, DON’T NOD Montréal's explicitly caveated candidate bank and Ubisoft Saguenay, and refreshes Bossa Studios, Brave At Night and Ember Crows.
- Techtive Games GmbH is paused until its JOIN application route is linked or confirmed through an official employer channel. Fawkes Games was initially held but is now included as a developer/publisher/live-service operator after official evidence confirmed direct game modernization, gameplay and content development plus active Unity/game-art/game-design roles. DreamCentury Entertainment remains held pending review of paid-entry game credits and prize redemption; President Studio remains held while its linked application endpoint returns HTTP 502.
- Candidate source status and access restrictions are recorded in the Global Discovery Implementation Model. IGDB, GameCompanies.com, Games Jobs Index, Steam, MobyGames and the community dataset are not yet automated feeds; do not describe them as integrated.
- PR #68 is superseded by the consolidated batch-6 proposal because of a base-branch conflict after the global-model documentation merge. Do not merge it independently.

## Handover checklist

At the start of a new session, read the Global Discovery Implementation Model, this file and STATUS.md; inspect current main, open PRs, discovery-state and latest successful workflows. At the end, update the model with new source/evidence/policy/engineering findings, update STATUS.md and this file for the new checkpoint, and update CHANGELOG.md or an ADR when appropriate. Record why any candidate was held and what evidence would resolve the hold; when new first-party linkage is later found, reconsider the hold rather than leaving stale manual-review notes. Distinguish proposed, implemented, tested, merged and deployed work accurately.

Never put personal application records, CVs, recruiter correspondence, secrets or private profile data in public repository source datasets, issues or PR descriptions.
