# Changelog

## 2026-10-31 — Merge and data-quality reconciliation

- Merged **PR #71**: added the manifest-backed discovery source inventory, source-specific saturation, independent recurring-feed checkpoints and additive v1-to-v2 private state migration.
- Merged **PR #70**: consolidated global discovery batches 5–12, adding and refreshing official speculative-application routes and recording manual exclusions/held cases.
- Reconciled the duplicate **Fakefish / FakeFish Games** rows. The official site and open-application route identify one employer, **FakeFish Oy**; the canonical directory/profile record is now **FakeFish**. Its richer current profile and route detail are retained, along with earlier profile-source provenance.
- Added an exact application-route duplicate check to `scripts/check-studio-directory.mjs`, so rows with the same official website, application URL and evidence URL cannot silently pass directory validation.
- Main now contains **313 unique studio records / 313 matching profiles**: **308 active**, **5 paused**, across **51 country/location labels**.
- The merges automatically triggered main-branch Build, Pages publication and source-discovery workflows. Their final outcomes are recorded in the current STATUS checkpoint; a merge is not treated as a confirmed deployment until the publication run succeeds.

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
