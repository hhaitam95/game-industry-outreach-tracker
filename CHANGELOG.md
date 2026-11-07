# Changelog

## 2026-11-07 — StudioScout discovery and Games catalogue

- Keep NEW markers on the latest genuinely added studio batch with no 24-hour expiry; clear prior markers only when a later batch publishes new studios.
- Publish a privacy-safe hourly discovery summary, including newly added studio count and existing route rechecks, and place the New studios filter beside automation status.
- Integrate scale, platform, focus, role and work-model filters under search; split composite country names, add continent icons and Uruguay's flag.
- Add dedicated studio table columns for scale, role, platform and focus; show one featured title in table rows and retain further titles in expanded profiles.
- Add a Games catalogue with popularity, release date, developer, publisher and Steam review information. Steam review totals are used only as a transparent popularity proxy, never as sales or player counts.
- Extend exact-match Steam enrichment to refresh publisher/developer and release metadata plus aggregate public review totals for known Steam app IDs.


## 2026-11-07 — Introduce StudioScout product name

- Adopt StudioScout as the product name and “Your personalized gateway into the game industry” as its tagline.
- Update the application header, footer, browser metadata and primary project documentation; keep the GitHub repository and internal package identifier unchanged.

## 2026-11-07 — Structured application preferences

- Replace free-text role, studio-type, work-model and geographic preference lists with multi-select checkboxes and country picklists.
- Keep legacy saved preference values visible and removable so existing browser profiles and backups are not silently discarded.
- Fix the space-key issue caused by trimming list input on every keystroke; retain one optional free-text notes field for genuinely open-ended considerations.

## 2026-11-06 — Manual-assisted Application Preparation and Friday workflow hardening (PR #116, merged and deployed)

- Add a per-application Prepare panel with six readiness checks, private employer requirements/questions notes and a separate draft-answer/missing-information area.
- Persist preparation data in the same browser-local application record and include it in version-1 tracker backup/restore; legacy backups receive an empty preparation state.
- Cancel stale tracker backup imports when the user edits tracker data during file reading/review.
- Require confirmation of actual submission before recording Applied, Interview or Offer; stamp the applied date on the first confirmed submitted stage.
- Generate unique non-empty tracker IDs for colliding/non-Latin studio slugs and focus rows by their unique record IDs.
- Add a first-campaign runbook. This is a manual-assisted preparation release; automated ATS page inspection, autofill, uploads, email integration and submission remain unimplemented.
- Exact-head full CI and Chromium browser acceptance passed in [run 42203613709](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/42203613709). PR #116 merged as `8343c12e9b62e7fa3d53515cebdf7e3dd3f6dc95`; GitHub Pages publication completed successfully in [run 42204022828](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/42204022828). Post-merge main-branch build and Chromium browser acceptance passed in [run 42204582887](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/42204582887). The final Pages publication after documentation synchronization passed in [run 42204582874](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/42204582874).


## 2026-11-03 — Document five-system product architecture

- Define Studio Discovery, Candidate Profile, Matching Engine, Application Preparation and Application Tracker as five distinct but connected product responsibilities.
- Add a complete workflow/data-ownership blueprint and align the architecture, implementation plan, detailed feature specification, product decisions, contributor guidance, product spec, README, handoff and status documentation.
- Specify Application Preparation as the stage between Matching and final submission: analyze official requirements where accessible, map fields to candidate facts, prepare editable answers/material checklists, and surface unknowns without guessing.
- Preserve one canonical private application record from selection/preparation through user-confirmed submission and later outcomes; do not create a duplicate queue/history.
- Record static-hosting/cross-origin limits and retain a user-assisted fallback. Browser extensions, ATS interaction, autofill, automatic uploads, email integrations and automated submission remain separately gated.
- Documentation-only change. No application feature, runtime behavior, discovery qualification or data schema is changed by this entry.


## 2026-11-02 — Candidate Profile IndexedDB save-race and recovery hardening (PR #111)

- Track profile edits across asynchronous IndexedDB saves so completion of an older snapshot cannot replace newer in-memory edits or clear the unsaved state.
- Apply the same revision check to backup-import writes; edits made during the write remain visible and flagged for saving.
- Keep profile Save actions disabled until the initial IndexedDB load succeeds or a validated backup is explicitly restored.
- Clear the cached IndexedDB open promise after synchronous, asynchronous or blocked failures so the storage layer can be retried.
- Add Chromium browser-acceptance coverage for edits during a committed-but-pending save and for backup recovery after a simulated one-time IndexedDB open failure.
- Exact-head CI, including Python discovery tests, frontend tests, route/data checks, production build, privacy/artifact validation and the full browser suite, passed in [run 41519964763](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41519964763). PR #111 merged as `26f91b9ba9a1777ccdc19a00227df0fb11703132`; merged-main CI [run 41520306310](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41520306310) and Pages publication [run 41520306365](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41520306365) passed.

## 2026-11-02 — Non-destructive application tracker recovery (PR #110)

- Validate the complete browser-local application tracker before loading it; malformed JSON, an unsupported structure or any invalid record is treated as a storage error rather than an empty/filtered tracker.
- Preserve the exact original localStorage value on validation failure, show a recovery warning at the top of the app and block tracker mutations until a valid versioned backup is explicitly restored.
- Reuse the existing backup validator, retain valid legacy defaults and refresh application activity timestamps when notes change.
- Add unit and browser-acceptance coverage for malformed data preservation, partial-record rejection and explicit backup recovery.
- Exact-head CI, including Python discovery tests, frontend tests, data/route checks, TypeScript build, privacy/artifact checks and Chromium browser acceptance, passed in [run 41517916733](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41517916733). PR #110 merged as `83b6245e3f7c2fb682ff6cc17b71e0a3b5bf67e3`; merged-main CI passed in [run 41518987602](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41518987602) and Pages publication completed in [run 41518807104](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41518807104).


## 2026-11-02 — Discovery automation reliability and verification hardening (PR #109, merged and deployed)

- Queue scheduled/manual discovery workflow runs instead of allowing a newer pending run to replace an earlier pending run.
- Correct the checkpoint boundary: `discovery-state` is a public branch in the public Pages repository. Explicitly prohibit personal applicant data, CVs, application history and secrets from its employer-lead and operational state.
- Add per-source candidate reason counts, overdue-candidate counts and shared-domain identity-review counts to the health snapshot and workflow summary.
- Preserve differently named entities sharing an official domain in an additive identity-review queue instead of silently dropping them during ingestion.
- Expand employer-linked ATS recognition to Traffit, eRecruiter, HRMOS and Alumy; detect explicit Japanese career-registration routes while retaining the official-site development proof, career-context and linked-submission requirements.
- Extend the bounded candidate crawler to follow relevant nested careers pages and return manual review when a relevant linked page is inaccessible. Prefer evidence pages that contain an actual submission method over short parent pages that only link to the route.
- Add regression tests for Japanese career registration, ATS hosts, nested career routes, inaccessible evidence, domain collisions and due-queue metrics.
- Exact-head CI and browser acceptance passed in [run 41510639242](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41510639242); merged-main CI passed in [run 41511025026](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41511025026); Pages publishing completed in [run 41511024791](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41511024791). Merge commit: `27a3dc963976dbb4f161040c22d99b6756cec1d6`.

## 2026-11-02 — Match-to-application handoff and tracker backups (PR #107, merged and deployed)

- Add a duplicate-aware **Save to My applications** action on eligible Matches cards and a direct return path to the saved tracker record.
- Preserve the directory's saved route type/status, evidence URL, review date, work model, submission method, discipline scope, location/eligibility notes and research summary with each selected application.
- Add versioned, validated browser-local JSON backup export/restore for tracker statuses, dates, route context and private notes; replacement requires explicit confirmation.
- Fix the route-context toggle's accessible label so it accurately announces View/Hide state.
- PR-head CI [41496776891], merged-main CI [41497190125] and Pages publishing [41497190769] passed. Merged as `f66fe1e134b08603ea272f568103ee5cf8000266`.
- Keep all candidate/application data local. No ATS autofill, uploads, outbound email or automatic submission is introduced.

## 2026-11-02 — Matching quality follow-up (PR #104, merged and deployed)

- Tighten matching so directly aligned disciplines are distinguished from adjacent disciplines and a Strong result requires demonstrated skill evidence for the same directly aligned discipline.
- Replace substring skill checks with phrase-boundary matching and include responsibilities/achievements when assessing transferable work-history evidence.
- Use the route directory's recorded country instead of silently substituting a separate headquarters country; add Mauritius location mapping for the Playtouch record.
- Treat mixed work arrangements as unresolved rather than as an automatic preference mismatch.
- Make the default campaign sort geography-first (preferred, acceptable, unassigned/unknown, lower-priority), then use overall preference and professional relevance as tie-breakers; expose the geography tier in expanded assessment details.
- Add unit and browser regression coverage. PR-head CI run 41463495519 passed; main-branch build run 41464012676 and Pages publish run 41464012718 also passed.


## 2026-11-02 — Document studio targeting and application campaign strategy

- Add a durable campaign-strategy handover covering global discovery versus private prioritisation, application-route versus vacancy distinctions, geographic priority waves, one approved master resume and motivation letter, pre-submission review, outcome tracking and campaign evaluation.
- Clarify that the public directory remains worldwide and non-personalized, with its existing two qualification gates unchanged.
- Record a 200+ application campaign as an aspiration rather than a quota or guaranteed result; preserve human review and manual final submission.
- Update HANDOFF.md, STATUS.md, architecture, implementation plan and product decisions to distinguish current implementation from future campaign workflow work.
- No application automation, discovery adapter, schema migration or runtime behavior is changed.


## 2026-11-02 — Add IGDB company discovery feed (PR #100)

- Add a recurring IGDB Companies API candidate feed for companies with developed-game credits and an officially typed company website.
- Resolve the official website type via `/v4/website_types`; use numeric company-ID pagination and raw response-row counts.
- Reuse the existing Twitch application secrets in the scheduled workflow, mint app tokens at runtime, and never expose secret values or tokens.
- Pace IGDB requests at 0.27 seconds. If credentials are unavailable, skip this feed without counting an empty pass.
- Preserve the existing strict official-site speculative-application verification. No new sources beyond IGDB are introduced.
- Full exact-head CI and browser acceptance passed in [run 41415897521](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41415897521). PR #100 merged as `b3183f5fae5f3f3793dcefc3241f957267a56a79`; GitHub Pages deployment completed successfully in [run 41416182699](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41416182699).


## 2026-11-01 — Studio discovery information redesign

- Replace the Studio type table column with an At a glance column showing compact platform and game-focus tags; show up to three notable game covers and the normalized scale beside each studio name.
- Add normalized platform, focus and studio-role fields while preserving the original research fields used by matching; leave ambiguous or undisclosed studio scale unclassified rather than infer a tier.
- Add multi-select scale/platform/focus/role filters, keep work model as an advanced application-route filter, and display removable active-filter chips.
- Simplify expanded profiles, split Platforms and Focus, merge relevant highlights into About, remove the visible internal source list, and retain official website, application and social links.
- Show each notable title with its thumbnail and a sourced release-year label when known; preserve release years through exact Steam title/developer enrichment and keep unreleased titles labeled In development.
- Align the primary filter toolbar to its three visible controls; keep route work-model filtering under More filters.
- Use parent-company favicons with accessible fallbacks.

## 2026-11-01 — Shared visual design refresh

- Introduce a consistent neutral, card-led visual system across the studio directory, matching dashboard, application tracker and candidate profile.
- Refine navigation with lightweight inline icons, clearer active states, rounded controls, accessible focus styling and responsive spacing.
- Improve light and dark theme surfaces, typography, table readability and mobile navigation without adding UI or icon-library dependencies.

## 2026-11-01 — Studio directory overview and UI refresh

- Reduce the main studio table to studio, location, notable work, studio type and tracker action; move the website and speculative-application links into the expanded overview.
- Replace route-specific overview text with general studio facts: description, up to four games, scale, team size, type, workplace listing, platforms, headquarters, ownership and optional social links.
- Remove artwork-source explanation copy and make the theme control icon-only; remove the redundant workspace label.
- Increase typography across the directory, matching, profile and application areas while retaining the existing locally bundled Bootstrap / React setup.
- Prioritize IGDB covers ahead of Steam artwork and developer-hosted imagery; add the explicitly supplied IGDB cover for Stuck Together while retaining its verified Steam page link.
- Keep team-size research manual or limited to sources that permit automated access; do not scrape LinkedIn without permission.


## 2026-11-01 — Private candidate matching foundation

- Add a Matches page that compares the browser-local Candidate Profile with active public studio route records on-device.
- Keep professional relevance, application-route freshness/accessibility and personal priority as separate qualitative assessments; never represent them as hiring probability.
- Map saved role-family preferences and skill evidence to employer-stated discipline scope; keep unspecified scope visible as unknown/potential and show transferable context, gaps and evidence provenance.
- Apply region, work-model and studio-type preferences only to private personal priority. The global studio directory remains unchanged.
- Show route type, submission channel, work model, eligibility/location notes, check date and employer-controlled application/evidence links. An active route is not a ready-to-submit guarantee.
- Recalculate assessments locally; no private profile data, documents or assessments are sent to a remote service or stored in public assets. Queue persistence, manual overrides and deeper requirements extraction remain deferred.

## 2026-11-01 — Candidate Profile foundation (merged in PR #95)

- Add the new My profile area with editable contact details, professional summary, work experience, education, projects/training, skills and evidence, reusable master application materials and preferences.
- Persist structured profile data and original PDF/DOCX document bytes in a versioned IndexedDB record separate from the existing application tracker.
- Add versioned JSON export/import with confirmation, document validation and browser tests for persistence, original-file preservation and backup restore.
- Keep profile data out of the public directory and network writes; explicitly disclose local-storage limitations and the need for private backups.
- No matching engine, Application Queue, requirements intelligence, Application Workspace or application automation is implemented in this phase.

## 2026-11-01 — Candidate profile and application workspace roadmap

- Define the next product layer: a structured, private Candidate Profile, evidence-based matching, a personal Application Queue and an application preparation workspace.
- Keep global studio discovery worldwide and non-personalized; profile preferences affect private priority only.
- Separate professional relevance, application accessibility/readiness and personal priority; preserve source evidence, unknowns and manual overrides.
- Standardize on one approved master resume and one master motivation letter/message by default, with no automatic embellishment or per-studio resume tailoring.
- Keep candidate data browser-local and document IndexedDB/export-import/privacy requirements.
- Explicitly defer browser-extension/desktop automation, ATS adapters, autofill, uploads, email sending and automated submission pending a separate design and approval.

## 2026-10-31 — Phase B game-poster artwork fallback (PR #78 update)

- Keep Steam library covers as the first choice and add IGDB cover art as a fallback when Steam image URLs are missing or unavailable.
- Store verified IGDB game IDs, slugs and cover image IDs in studio profile data; do not call IGDB from the public browser or expose Twitch credentials.
- Add an offline metadata-enrichment script that uses Twitch application credentials, exact normalized-title matching and conservative handling of ambiguous/missing results.
- Add validation and tests for IGDB metadata, Steam-first source ordering and IGDB fallback links.
- The enrichment script is ready, but no IGDB credentials were available in this session; existing profile data has not yet been bulk-enriched with IGDB image IDs.

## 2026-11-01 — Automate IGDB artwork enrichment after merge (PR #78 update)

- Run the IGDB metadata-enrichment script automatically when the workflow implementation or script is pushed to `main`; merging PR #78 triggers the first full run without a manual dispatch.
- Check repository secret availability without displaying credential values, query all remaining unique titles, and write only exact unambiguous matches with covers.
- Validate the profile dataset and run tests/build before opening a separate data-only pull request; never auto-merge generated metadata.
- Keep IGDB credentials out of browser bundles, public data, logs and commits. A merge of the resulting data-only PR does not retrigger the enrichment.

## 2026-10-31 — Phase B first efficiency UI batch (prepared for review)

- Bundle Bootstrap 5.3.3 CSS locally and apply compact Bootstrap tables and controls; add a browser-local light/dark theme switch.
- Display studio website favicons with initials fallbacks and headquarters flags.
- Show hourly discovery status and the most recent successful run from public GitHub Actions history.
- Add first-publication timestamps, 24-hour NEW markers, a new-only filter and an always-available Reset filters action.
- Keep tracker data local; the workflow status request is read-only.

## 2026-10-31 — Phase A final global sweep and initial-baseline closeout (merged in PR #75)

- Added Laki Studios, Makemake Creative Studio, PixelAnt Games, Played With Fire and Rebel Wolves with official open/general/future-application routes and matching studio profiles.
- Rechecked Codebox Games and G7 Studio and confirmed both were already in the directory; other rediscovered employers were not duplicated.
- Baseline: 327 route/profile pairs, 322 active and 5 paused, across 51 country/location labels.
- The manual-only source register remains at 22; the integrated runtime remains GameDevMap plus three Wikidata feeds. No new adapter, scraper, schedule, secret or permission was added.
- Defines initial global discovery as a practical, evidence-backed baseline followed by ongoing hourly maintenance, not an exhaustive worldwide census. After merge and deployment, primary development focus moves to Phase B UI/UX.
## 2026-10-31 — Global discovery batch 14 (merged in PR #74)

- Added CAPCOM's official mid-career Career Registration (Japan), Cygames Group's HRMOS Career Registration (Japan), and Small Giant Games' Greenhouse Open Application (Finland), each with a matching researched profile.
- Refreshed Fawkes Games' spontaneous-application submission method and current ATS/landing-page caveat; corrected Stunlock Studios to its Teamtailor Open Application, online-only submission, Skövde location and “Temporarily Remote” status.
- Added five manual-only candidate sources in Poland, Germany and India: BAZA POLSKI GAMEDEV, game (German Games Industry Association), GDAI, IGDA India and USK member companies.
- The manual-only source register now contains 22 entries. No new runtime adapter was added; config/discovery-sources.json, workflow schedules, secrets and permissions are unchanged.
- Main now contains 322 route/profile pairs (317 active, 5 paused; 51 country/location labels), deployed successfully in Pages run 41224727091.

## 2026-10-31 — Global discovery batch 13 (merged in PR #73)

- Adds Tanglewood Games, Iceflake Studios, Frozenbyte, Mainstay Games, Big Moxi Games, Rogue Snail and Cyberborz Interactive after verifying official non-vacancy application routes and direct game-development activity.
- Refreshes Awe Interactive's existing speculative application route and remote-work evidence; removes an unsupported 120+ team-size assertion because current company press materials do not confirm total headcount.
- Consolidates the duplicate ByteRockers' Games / Byterockers’ Games rows into one official employer identity and retains combined profile-source provenance.
- Adds config/manual-discovery-sources.json, a manual-only research registry covering national/regional association directories, curated studio catalogues, IGDB, Steam and other global indexes. It is not loaded by the runtime and does not enable scraping.
- Keeps IGDB blocked pending written permission for public-directory redistribution; keeps Steam manual-only; leaves GameCompanies, Games Jobs Index, MobyGames and the community dataset behind their terms/licence gates.
- Adds a post-merge npm run check:studio-directory step so discovery-generated data is validated after automated merging and before rebuild/deployment.
- Does not add a new adapter to config/discovery-sources.json; approved runtime feeds remain separate from manual indexes.
- Holds Two Men and a Dog because its indexed Open Applications page returned HTTP 404 on direct review; AARISE was already present and was not duplicated.
- After PR #73, main contains 319 route/profile pairs (314 active, 5 paused; 51 country/location labels), including one canonicalised existing identity and seven new routes.


## 2026-10-31 — Merge and data-quality reconciliation

- Merged **PR #71**: added the manifest-backed discovery source inventory, source-specific saturation, independent recurring-feed checkpoints and additive v1-to-v2 private state migration.
- Merged **PR #72**: consolidated duplicate FakeFish identities and added the exact-route duplicate guard/regression test.
- Merged **PR #70**: consolidated global discovery batches 5–12, adding and refreshing official speculative-application routes and recording manual exclusions/held cases.
- Reconciled the duplicate **Fakefish / FakeFish Games** rows. The official site and open-application route identify one employer, **FakeFish Oy**; the canonical directory/profile record is now **FakeFish**. Its richer current profile and route detail are retained, along with earlier profile-source provenance.
- Added an exact application-route duplicate check to `scripts/check-studio-directory.mjs`, so rows with the same official website, application URL and evidence URL cannot silently pass directory validation.
- Main now contains **313 unique studio records / 313 matching profiles**: **308 active**, **5 paused**, across **51 country/location labels**.
- The corrected 313-record directory was deployed successfully by [Pages publication run 41212913830](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41212913830) from main commit `360d0a79530a1d0402deb8bba158b966fe1562e8`.
- The first post-merge source-discovery run [41212342190](https://github.com/hhaitam95/game-industry-outreach-tracker/actions/runs/41212342190) passed and persisted the schema-v2 private discovery-state checkpoint (commit `61bc51c0830fb62521ce182e806ca3fe282b54b9`). A follow-up run triggered by PR #72 is processing separately.

## 2026-10-31 — Global discovery batch 12 (merged in PR #70)

- Added **SQUARE ENIX** (Japan) with the official three-year group-wide Career Registration for candidates without a current target role; the listing is not a job or guaranteed interview.
- Added **Iteration One** (Germany) after confirming the official homepage links directly to JOIN's Spontaneous Application.
- Added **Cenrellia Studios** (country not stated), a one-person developer whose official Careers page explicitly invites unsolicited project/collaboration pitches through its contact form. Public notes distinguish this from an advertised salaried vacancy and leave compensation unknown.
- Refreshed **Stormind Games** using its current spontaneous-application form, studio scale/location and current credits.
- Refreshed **GAME FREAK** using the current HRMOS Career Registration and official FAQ: overseas applicants are accepted but business-level Japanese is required; work model is not assumed.
- Added ADR-077 and updated the authoritative model, STATUS and HANDOFF.
- Batch 12 brought the proposed dataset to 314 route/profile rows before duplicate identity reconciliation; see the merge/data-quality entry above for the canonical 313-studio count.

## 2026-10-31 — Global discovery batch 11 (merged in PR #70)

- Added **FakeFish Games** (Finland), **Winning Streak Games** (Germany) and **ByteRockers' Games** (Germany), with official open/spontaneous application evidence and matching profiles.
- Refreshed **Redly Games** to link its official homepage to the employer-managed Ashby General Interest application, correctly marking source type and remote-contract eligibility.
- Refreshed **HypeHype** to reflect its current AI-native studio positioning and Open Application; removed the unsupported assumption that its open application is necessarily on-site.
- Paused the existing **Plummy Games** route because the employer-branded Teamtailor open application could not be confirmed by a forward link from the official company domain; this is not evidence the application closed.
- Added **Xatronic Software GmbH** to the manual exclusion configuration because its official Products page expressly identifies online-casino and slot/reel game development.
- Historical batch-11 snapshot contained 311 route/profile rows before the final batch-12 additions and duplicate identity reconciliation.
- Added ADR-076 and updated the authoritative model, STATUS and handover.

## 2026-10-31 — Global discovery batch 10 (merged in PR #70)

- Added **Fawkes Games** (Bulgaria) after current official evidence confirmed direct game-development/live-service work alongside its publisher/operator business: Unity engineering and game-design recruitment, client modernization, gameplay-system overhauls and content expansions.
- Resolved the earlier Fawkes manual hold; it is now classified as a developer / publisher / live-service operator, not an original-IP-only studio.
- Recorded **DreamCentury Entertainment** as manual review: it is a digital casual-game creator with a spontaneous-application route, but official rules describe purchaseable credits used to enter games for points/prizes, requiring a gambling/prize-game policy determination.
- Recorded **President Studio S.A.** as manual review: official studio and spontaneous-application evidence is clear, but the linked employer application endpoint returned HTTP 502 and must be retried before publication.
- Historical proposal snapshot contained **308 route/profile pairs (304 active, 4 paused; 51 country/location labels)**. PR #70 subsequently merged; see the current checkpoint above.
- Added ADR-075 and updated the authoritative model, STATUS and HANDOFF.

## 2026-10-31 — Global discovery batch 9 (merged in PR #70)

- Added **Tarokai** (Switzerland), **Procedural Games** (Spain) and **Thought Pennies** (country not stated), each with a first-party or directly linked employer open/spontaneous application route and matching researched profile.
- Resolved the earlier Thought Pennies manual hold after confirming its official homepage links directly to its careers-page.com Open application; retained unknown country and applicant eligibility rather than inferring them.
- Refreshed **Playtouch** to document its six year-round spontaneous talent-pool tracks, direct Grand Baie application handling and separate Mauritius production/administration and French HQ locations.
- Reconfirmed Kuuasema and Bananagun as existing qualifying entries; no duplicates added.
- Historical proposal snapshot contained **307 route/profile pairs (303 active, 4 paused; 50 country/location labels)**. PR #70 subsequently merged; see the current checkpoint above.
- Added ADR-074 and preserved the source evidence and unknowns in the Global Discovery Implementation Model, STATUS and HANDOFF.

## 2026-10-31 — Global discovery batch 8 (merged in PR #70)

- Added **Rapidfire Games** (Cyprus), **Sleeprunner Studios** (Germany) and **Cluetivity** (Germany), each with an official open, unsolicited or initiative application route and matching studio profile.
- Classified Cluetivity accurately as a location-based/mobile/GPS/AR games developer and platform provider rather than a conventional PC/console studio.
- Refreshed **Next Level Games** to record hybrid work (at least three days per week in Vancouver) and the employer's explicit requirements for Canadian work authorization and current British Columbia residence.
- Added **3Sigma Games** to the manual exclusion configuration after its official hiring page explicitly described the company as an Adult Game Studio.
- Rechecked Raw Power Games, Futureplay Games and Shiro Games; their existing records were already present and were not duplicated.
- Kept Studio Countdown and welevel out of the public directory because the reviewed evidence did not establish both a legitimate video-game development business and an official employer-backed general application route.
- Historical proposal snapshot contained **304 route/profile pairs (300 active, 4 paused; 50 country/location labels)**. PR #70 subsequently merged; see the current checkpoint above.
- Added ADR-073 and updated the authoritative model, STATUS and handover rules.

## 2026-10-31 — Global discovery batch 7 (merged in PR #70)

- Added AnkleBreaker Studio (France), Alice in Games (Germany), No Roof Games (Finland) and Skytale (France), each with an official open/spontaneous application route and matching researched profile.
- Marked Skytale clearly as a non-profit, volunteer-only studio with no employees; this is unpaid volunteering, not employment.
- Added Chouic to the manual exclusion configuration because its company-level mobile-game catalogue includes sexual-entertainment/intimate-couple games and alcohol/party games.
- Recorded Duhndal as manual review due to the drug-themed Drug Lord Tycoon title in a broader game portfolio; recorded Manc Games as manual review because the separate General Application microsite is not linked from the main official Careers page.
- Reconsidered Fawkes Games: its spontaneous application and development role listings warrant review, but the official About page still describes a publisher/operator rather than establishing in-house development. AMIGO Spiele is kept out as a tabletop-only publisher/developer.
- Confirmed multiple other rediscovered studios were already in the directory and were not duplicated.
- The historical proposal snapshot contained 301 route/profile pairs (297 active, 4 paused; 49 country/location labels). PR #70 subsequently merged; see the current checkpoint above.
- Updated the global discovery implementation model, ADR-072 and STATUS.md to preserve the evidence and handover decisions.

## 2026-10-31 — Global discovery batch 6 (merged in PR #70)

- Consolidates the validated fifth expansion: adds Sudden Forest and refines Chimera Entertainment and Supermassive Games.
- Adds 22cans, Absolutely Games and AB Games, plus Favo Games (Türkiye), DON’T NOD Montréal (France / Canada) and Ubisoft Saguenay (Canada), each with an official non-vacancy application route.
- Corrects Bossa Studios' submission method to email; updates Brave At Night's Manchester location; clarifies Ember Crows' international eligibility and points-based freelance/profit-share caveat.
- Pauses Techtive Games GmbH until its JOIN spontaneous route is directly linked or confirmed by an official company channel.
- Holds Fawkes Games pending confirmation of direct in-house development; its publisher/operator identity has not been reconciled with the current development-role listings.
- Records source/access findings for IGDB, Games Jobs Index, GameCompanies.com, Steam, MobyGames and the community dataset.
- Records held/manual-review decisions in ADR-071 and the Global Discovery Implementation Model. Candidate-index claims remain leads, not employer evidence.

## 2026-10-31 — Global discovery implementation model documented

- Added [Global Discovery Implementation Model](docs/architecture/global-discovery-implementation-model.md) as the authoritative source for global coverage, studio qualification, speculative-route evidence, adult/vice exclusions, source evaluation, coverage/saturation and handover rules.
- Reaffirmed that discovery is global and non-prioritized: indie through AAA, all geographies, platforms and work models; no arbitrary directory-size cap and no personal career-targeting filter at this stage.
- Documented additional candidate indexes for evaluation: GameCompanies.com, Games Jobs Index, Steam Developer/Publisher Homepages, the MobyGames API, a community-maintained studio dataset and regional/national sources. These are discovery leads, not integrated adapters or proof of speculative application acceptance.
- Recorded access and accuracy caveats, including MobyGames API authorization/terms, mixed entity types in directories, manual review for uncertain exclusions and source-specific (not global) saturation as the target model.
- Linked the model from README.md and HANDOFF.md; refreshed STATUS.md to remove outdated career-path/geography prioritization and record the current discovery checkpoint.

## 2026-10-31 — Route quality refresh (merged in PR #70)

- Updated Aska Studios to its official email-based General Application page and explicit remote-first wording.
- Updated Obsidian Entertainment to its employer-managed ATS General Application, including discipline scope.
- Updated SOFTGAMES' unsolicited application requirements and remote-first details.
- Corrected Lost Boys Interactive's General Application to US-only remote eligibility and no visa sponsorship.
- Expanded Rustling Leaves Games' discipline scope and prominently documented its rev-share compensation model.

# Changelog

## 2026-10-31 — Worldwide expansion batch 4 (merged in PR #70)

- Added Kokku (remote co-development talent pools), Side (Philippines Player Support and regional co-development / QA / animation pools), and Raini Studios (spontaneous remote application).
- Refreshed Havoc Games to reflect current Remote (India) general application and listed disciplines.

## 2026-10-31 — Worldwide expansion batch 3 (merged in PR #65)

- Added six more employers/teams across Iraq, the Philippines, Brazil and South Korea.
- Updated Bananagun's wildcard route to its email-based any-discipline application.
- Expanded Larian Studios' route to include its DevOps and other discipline-specific Open Applications, with seven studio locations and on-site conditions.
- Expanded Garena's profile to include current talent pools in Singapore, Jakarta and Hanoi / Ho Chi Minh City.

## Earlier changes — Worldwide expansion batch 2

- Added 12 employers and refreshed Speedway Games (merged in PR #64), extending the directory across Europe, North America and Asia.
- Preserved explicit work-location, country-eligibility and compensation caveats; Funder Games is volunteer/unpaid while pre-funding.

## Earlier changes — Worldwide expansion batch 1

- Added 14 researched routes (merged in PR #63) and corresponding studio profiles across Australia, Denmark, Germany, India, Japan, Malaysia, Nigeria, Portugal, Türkiye, the United States and Vietnam.
