# Phase A — Initial Global Discovery Closeout

**Checkpoint date:** 2026-10-31  
**Status:** Proposed for final merge in PR #75  
**Scope:** Public verified studio directory and resumable discovery maintenance pipeline

## Exit baseline

The final Phase A proposal contains:

| Measure | Baseline |
|---|---:|
| Verified studio/employer routes | 327 |
| Matching studio profiles | 327 |
| Active routes | 322 |
| Paused routes | 5 |
| Country/location labels | 51 |
| Documented manual discovery sources | 22 |
| Integrated candidate feeds | 4 |

The five final route additions are Laki Studios, Makemake Creative Studio, PixelAnt Games, Played With Fire and Rebel Wolves. Each has an explicit employer-backed non-vacancy application route and a matching researched profile. Codebox Games (Nigeria) and G7 Studio (Saudi Arabia) were rechecked during the same sweep and were already in the directory, so no duplicates were added.

This count is a baseline of records that passed the project's verification rules. It is not a count of every game studio worldwide and is not a guarantee that each employer has a currently advertised vacancy suitable for every applicant.

## Qualification and data-quality standard

Every public record must pass both gates:

1. The organisation materially develops video games or performs direct game-development work.
2. Its official website or directly linked employer-controlled hiring platform explicitly accepts speculative, unsolicited, spontaneous, open or general applications beyond a specific advertised vacancy.

Candidate indexes remain leads, not proof. Unknown hiring eligibility and work locations remain unknown. Transient errors, blocked pages and ambiguous evidence do not close routes. The directory validator checks route/profile matching, secure official links and duplicate official employer-route tuples.

Company-level adult/vice exclusions remain evidence-based. An isolated mature theme in a mainstream game is not, by itself, an exclusion.

## Automation handover

The existing GitHub Actions discovery workflow remains enabled on main:

- Hourly schedule at minute 17.
- GameDevMap is a one-time public catalogue backfill; its completed offset is retained.
- Three recurring Wikidata feeds cover developer entities, credited developer organisations and video-game company entities.
- Each recurring feed maintains its own cursor, cycle, empty-pass count and saturation state. Three complete empty passes throttle only that saturated source; incomplete or failed passes do not count as exhaustion.
- Hourly runs use a bounded budget: up to eight source pages, up to eight existing-route rechecks, 65-second spacing for Wikidata requests and a 25-minute script ceiling.
- Public data is validated after the discovery merge and before rebuild/deployment. Candidate names and route-review evidence remain on the separate discovery-state branch.

No new adapter, scraper, schedule, secret, credential, repository permission or manual-source ingestion was introduced during this closeout.

The integrated feed inventory is config/discovery-sources.json. The separate config/manual-discovery-sources.json register has 22 entries, but it is intentionally not loaded by the automated runtime.

## Known limitations and maintenance backlog

The following remain ongoing maintenance rather than Phase A blockers:

- IGDB requires written permission for the intended public-directory reuse and attribution model.
- Steam remains manual-only. GameCompanies.com requires permission for automation. Games Jobs Index automated access has not been established. MobyGames requires authorized API access. The community dataset's licence/provenance has not been established.
- Regional association, national and community directories are incomplete or mixed in scope. Their catalogue counts are not unique-studio counts.
- Some candidates remain in manual review because of identity, industry-policy, official-route linkage or applicant-eligibility questions. Do not force uncertain candidates into the public directory.
- Hiring locations, applicant eligibility and remote-work conditions can change and should be confirmed from employer sources before an individual application.

Automated candidate-pipeline telemetry is separate from public directory totals. The last completed scheduled discovery summary before the PR #74 merge, run 41216225203, recorded 10,372 candidates seen, 126 routes verified by automation, 56 exclusions, 7,885 no-route outcomes and 79 manual-review cases. These figures describe the automated pipeline, not the public directory or manually researched additions. The push-triggered discovery run 41224727139 was still in progress when this closeout proposal was prepared; consult its own summary before quoting newer counters.

## Exit decision

Phase A is complete when this proposal passes exact-head CI, is merged, and the resulting Pages deployment succeeds. At that point:

- Initial global discovery is closed at the documented evidence-backed baseline.
- Hourly discovery continues as routine maintenance; new additions and route refreshes do not reopen Phase A.
- Restricted or unapproved indexes remain manual or blocked until their access conditions change.
- The private manual-review queue remains a maintenance backlog.
- Primary development focus moves to Phase B — UI/UX improvements for the existing Studio Directory and My applications workflows.

Phase A completion does not close the separate launch-acceptance, security, accessibility or v1.0.0 stabilization work.
