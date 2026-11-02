# Studio discovery operations

The live workflow is .github/workflows/discover-studios.yml; the active script is scripts/discover_speculative_studios.py.

## What it does

1. Collect studio candidates from GameDevMap's public paginated results interface, four Wikidata feeds and IGDB company records.
2. Deduplicate candidates by official website domain. Same-name candidates with different domains are retained for separate verification.
3. Check official websites and relevant careers/application links for explicit speculative-application invitations.
4. Publish only verified, active routes. Keep ambiguous, blocked and unverified candidates in discovery state.

GameDevMap is read through its public results interface only. Do not use its raw data files. Respect robots.txt and source request limits. The Wikidata and IGDB feeds are candidate hints, not authoritative proof of current development activity or hiring practices. IGDB is queried for companies with developed-game credits and an official website type resolved dynamically from its current website-types endpoint.

## Bulk backfill

The workflow selects bulk mode while the initial GameDevMap catalogue pass is incomplete. It requests up to 110 pages (100 raw rows per page) and processes candidates within a bounded 25-minute discovery budget. The numeric offset and candidate state are saved on the separate discovery-state branch, so interrupted work resumes safely. Once GameDevMap reaches the end of its catalogue, hourly runs share their source-page budget fairly across all recurring feeds, including IGDB.

Once the GameDevMap backfill is complete, the workflow switches to hourly mode even if another feed still has retries or manual-review candidates. A stalled candidate from one feed must not suspend discovery work from other feeds.

To resume the initial catalogue backfill manually: Actions → Studio speculative-route discovery → Run workflow → bulk.

## Hourly maintenance

Hourly runs continue recurring Wikidata, GameDevMap and IGDB feeds, handle newly discovered and due candidates, and check a rotating subset of existing application routes. Source pages are scheduled fairly across enabled feeds. Each feed has its own cycle, verified-addition count, consecutive complete-empty-pass count and saturation state. After five complete empty passes, only that feed is limited to four pages per hourly run; unsaturated feeds retain access to the 20-page hourly run budget. The IGDB adapter is skipped without both repository Actions secrets and is not counted as an empty pass.

A verified route resets saturation only for the feed that discovered it. Incomplete or failed passes do not increment the empty-pass counter. A pass with due verification work remains open; a pass with future retries or manual-review candidates may advance, but is recorded as incomplete and cannot count toward saturation.

The GameDevMap adapter is recurring. Its terminal offset is preserved through the current pass and reset to page one after completion so new monthly catalogue entries are revisited.

## Acceptance rule

A generic careers page, a current advertised vacancy, a directory label or an aggregator claim is not sufficient. The route must explicitly invite speculative/open/general applications on the studio's website or a directly linked employer-controlled ATS.

Timeouts, robots denials, blocked pages, HTTP 403/429 and parse failures do not count as negative evidence. Route closure requires two consecutive authoritative negative/missing checks. Keep uncertain records out of the public directory.


## Source manifest and source-specific saturation

The integrated feed inventory is `config/discovery-sources.json`; the discovery script loads this manifest as its runtime feed list. Update it whenever a feed is added, changed or retired, including adapter, coverage, pagination, access/policy notes and refresh behavior.

The private discovery-state schema is v2. Migration preserves v1 cursors, candidates, route checks and counters while adding independent per-feed cycle and saturation metrics. Legacy Wikidata candidates without a recorded query-feed ID remain unattributed rather than being assigned to a guessed source.

Each recurring feed is finalized only after its own source pages are complete and its due verification queue is clear. A future retry or manual-review result marks that pass incomplete, so it cannot increase the feed's empty-pass count. A failed fetch leaves the cursor and completion flag unchanged.

After five complete empty passes, only that feed receives a four-page hourly cap. Other feeds keep their normal budget. A verified route resets only its originating feed. The aggregate saturation field is retained for summaries and is not used to throttle the whole workflow.


## IGDB credentials

The workflow passes `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` from repository Actions secrets to the discovery step. It mints an app access token during the run and dynamically resolves the official company-website type through IGDB's `website_types` endpoint. Secret values are never written to discovery state, logs, or the workflow summary. If either secret is absent, the IGDB feed remains pending and is skipped without affecting other sources or increasing its saturation counter. The workflow summary records only whether IGDB was enabled.
