# Studio discovery operations

The live workflow is .github/workflows/discover-studios.yml; the active script is scripts/discover_speculative_studios.py.

## What it does

1. Collect studio candidates from GameDevMap's public paginated results interface and three Wikidata feeds.
2. Deduplicate candidates by official website domain. Same-name candidates with different domains are retained for separate verification.
3. Check official websites and relevant careers/application links for explicit speculative-application invitations.
4. Publish only verified, active routes. Keep ambiguous, blocked and unverified candidates in discovery state.

GameDevMap is read through its public results interface only. Do not use its raw data files. Respect robots.txt and source request limits. The Wikidata feeds are candidate hints, not authoritative proof of hiring practices.

## Bulk backfill

The workflow selects bulk mode while the one-time GameDevMap catalogue backfill is incomplete. It requests up to 110 pages (100 raw rows per page) and processes candidates within a bounded 25-minute discovery budget. The numeric offset and candidate state are saved on the separate discovery-state branch, so interrupted work resumes safely.

Once the GameDevMap backfill is complete, the workflow switches to hourly mode even if another feed still has retries or manual-review candidates. A stalled candidate from one feed must not suspend discovery work from other feeds.

To resume the initial catalogue backfill manually: Actions → Studio speculative-route discovery → Run workflow → bulk.

## Hourly maintenance

Hourly runs continue recurring Wikidata feeds, handle newly discovered and due candidates, and check a rotating subset of existing application routes. Source pages are scheduled fairly across feeds. Each feed has its own cycle, verified-addition count, consecutive complete-empty-pass count and saturation state. After three complete empty passes, only that feed is limited to one page per hourly run; unsaturated feeds retain access to the remaining eight-page run budget.

A verified route resets saturation only for the feed that discovered it. Incomplete or failed passes do not increment the empty-pass counter. A pass with due verification work remains open; a pass with future retries or manual-review candidates may advance, but is recorded as incomplete and cannot count toward saturation.

The GameDevMap adapter is a one-time backfill. Its terminal offset is preserved and it is not restarted during recurring hourly maintenance.

## Acceptance rule

A generic careers page, a current advertised vacancy, a directory label or an aggregator claim is not sufficient. The route must explicitly invite speculative/open/general applications on the studio's website or a directly linked employer-controlled ATS.

Timeouts, robots denials, blocked pages, HTTP 403/429 and parse failures do not count as negative evidence. Route closure requires two consecutive authoritative negative/missing checks. Keep uncertain records out of the public directory.


## Source manifest and source-specific saturation

The integrated feed inventory is `config/discovery-sources.json`; the discovery script loads this manifest as its runtime feed list. Update it whenever a feed is added, changed or retired, including adapter, coverage, pagination, access/policy notes and refresh behavior.

The private discovery-state schema is v2. Migration preserves v1 cursors, candidates, route checks and counters while adding independent per-feed cycle and saturation metrics. Legacy Wikidata candidates without a recorded query-feed ID remain unattributed rather than being assigned to a guessed source.

Each recurring feed is finalized only after its own source pages are complete and its due verification queue is clear. A future retry or manual-review result marks that pass incomplete, so it cannot increase the feed's empty-pass count. A failed fetch leaves the cursor and completion flag unchanged.

After three complete empty passes, only that feed receives a one-page hourly cap. Other feeds keep their normal budget. A verified route resets only its originating feed. The aggregate saturation field is retained for summaries and is not used to throttle the whole workflow.
