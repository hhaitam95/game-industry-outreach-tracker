# Studio discovery operations

The live workflow is .github/workflows/discover-studios.yml; the active script is scripts/discover_speculative_studios.py.

## What it does

1. Collect studio candidates from GameDevMap's public paginated results interface and three Wikidata feeds.
2. Deduplicate candidates by normalized name and official website domain.
3. Check official websites and relevant careers/application links for explicit speculative-application invitations.
4. Publish only verified, active routes. Keep ambiguous, blocked and unverified candidates in discovery state.

GameDevMap is read through its public results interface only. Do not use its raw data files. Respect robots.txt and source request limits. The Wikidata feeds are candidate hints, not authoritative proof of hiring practices.

## Bulk backfill

The workflow selects bulk mode while the GameDevMap feed or due candidate verification queue remains incomplete. It requests up to 110 pages (100 results per page) and processes candidates within a bounded 25-minute discovery budget. It saves the numeric offset and candidate state on the discovery-state branch, so an interrupted run resumes safely.

To resume manually: Actions → Studio speculative-route discovery → Run workflow → bulk.

## Hourly maintenance

After the bulk catalogue and due candidate queue are processed, scheduled runs select hourly mode. Hourly mode continues the Wikidata feeds, handles newly discovered and due candidates, and checks a rotating subset of existing application routes.

## Acceptance rule

A generic careers page, a current advertised vacancy, a directory label or an aggregator claim is not sufficient. The route must explicitly invite speculative/open/general applications on the studio's website or a directly linked employer-controlled ATS.

Timeouts, robots denials, blocked pages, HTTP 403/429 and parse failures do not count as negative evidence. Route closure requires two consecutive authoritative negative/missing checks. Keep uncertain records out of the public directory.
