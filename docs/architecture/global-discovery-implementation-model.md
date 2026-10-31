# Global discovery implementation model

**Status:** Authoritative project guidance  
**Last updated:** 2026-10-31  
**Applies to:** Candidate discovery, studio qualification, industry exclusions, speculative-route verification, source coverage and handovers.

This document records the agreed discovery model. Read it before changing discovery scope, source adapters, qualification rules, exclusion rules, verification logic or discovery cadence. It is the durable source of truth when work moves to another chat, contributor or AI assistant.

## 1. Mission and non-goals

Build the broadest practical, continuously maintained global directory of legitimate video-game development studios that explicitly accept speculative, unsolicited, spontaneous, open or general applications when no currently advertised vacancy necessarily matches.

The two eligibility gates are:

1. **Legitimate video-game development organisation:** the organisation materially develops video games or performs direct game-development work.
2. **Explicit non-vacancy application route:** the organisation itself, or an employer-controlled application platform directly linked by it, explicitly invites applications for consideration beyond a specific advertised vacancy.

The discovery phase is global and coverage-led. Do not rank, prioritize or filter candidates by the user's current career interests, job discipline, seniority, country, preferred work model, relocation feasibility, studio size, platform, genre, prestige or likelihood of hiring the user. Indie, AA, AAA, mobile, PC, console, web and other legitimate game-development studios all receive the same discovery consideration.

There is no arbitrary ceiling such as 300 or 500 records. Continue adding verified routes while new legitimate candidates and source coverage remain. A candidate count is not a job count or an opportunity count. Paid employment is not an inclusion requirement: legitimate non-profit and volunteer-run game studios may be included when they genuinely develop video games and offer an explicit route to join, but unpaid/volunteer-only participation must be stated prominently and must never be represented as employment.

This phase is **not** a personal job-matching, application recommendation, vacancy-monitoring or outreach-generation project. Do not reintroduce those features into discovery.

## 2. Eligibility gate A — legitimate game-development organisation

### Include

- Independent and corporate-owned game-development studios, from micro-indies through AAA studios.
- A development studio that is part of a larger publisher, platform holder or entertainment group, while preserving its actual studio identity and parent relationship.
- Organisations that materially create video games, including original-IP development and direct co-development, porting or game-production work. Direct development of mobile, GPS-based, location-based and augmented-reality games qualifies when the organisation authors digital games/gameplay and supporting game software; a pure event organiser, escape-room operator or general software platform without direct digital-game development does not.
- Studios across all countries and regions, including locations that are underrepresented in existing directories.
- Studios across all game platforms and business models, provided their material business is legitimate video-game development.

### Classify carefully rather than silently conflating entities

- A publisher-only business is not automatically a game studio. Include it as a developer only when there is evidence of its own in-house game-development operation or identifiable development studio.
- A co-development, porting, QA, localization or other service provider should be classified accurately. Direct game-production providers may be included as game-industry development organisations, but must not be mislabeled as original-IP studios.
- Job boards, recruiting agencies, talent marketplaces, industry associations, event organisers, storefront pages and general business directories are candidate sources, not studios.
- A general software/web agency is not in scope merely because it has a game client or uses the word 'gaming'.
- Do not merge unrelated entities because they share a name. Do not collapse a subsidiary studio into its parent if it has a distinct development identity or hiring route.
- Preserve parent company, developer/publisher/service classification and studio relationships when known. Leave unknown facts explicitly unknown.

## 3. Eligibility gate B — explicit speculative application route

A route qualifies only when official employer evidence explicitly invites applications outside a specific advertised vacancy, or clearly invites general/future consideration.

Examples of potentially qualifying language or routes:

- Speculative, unsolicited or spontaneous application.
- Open application, general application or expression of interest.
- A clearly described invitation to submit a CV, resume, portfolio or application even when no suitable role is listed.
- An employer-run future-opportunities or discipline-specific talent pool, where the employer explicitly invites candidates to apply for future consideration.

The exact route must be reachable and attributable to the employer's official website or an employer-controlled recruitment platform directly linked from that website.

### Does not qualify by itself

- A generic careers page.
- A list of currently advertised vacancies.
- A generic contact page, business inquiry email or social-media account.
- A newsletter, job alert, follow/fan page or passive CV database without an explicit invitation to apply.
- A third-party directory's claim that a studio accepts speculative applications.
- An ATS page that only lists advertised roles.
- A speculative application claim found in a search snippet where the official page or actual application destination cannot be verified.

A talent pool qualifies only when the employer describes it as an application or submission for future consideration. Record its discipline, location, eligibility, contract type and any other limitations. A regional freelance collaboration, volunteer placement, internship, revenue-share arrangement or unpaid opportunity must never be presented as a normal salaried vacancy or unrestricted global employment.

### Evidence standard

For every published route, retain:

- Official studio name and official website.
- Direct application URL.
- Official evidence URL showing the invitation.
- Route type and submission method.
- A concise evidence note explaining why it qualifies.
- Last checked date and next review date.
- Explicit role, discipline, location, work-authorisation, language, contract, compensation and applicant eligibility caveats where the employer states them.

A company headquarters is not proof of job location. 'Remote' is not proof of worldwide hiring. Never infer sponsorship, applicant eligibility or work-authorisation support.

If the official evidence page or application destination is blocked, inaccessible, contradictory or ambiguous, send the candidate to manual review or retry. Do not publish a guessed route. A timeout, robots denial, 403/429 response, parsing failure or temporary website issue is not proof that no route exists and must not close an existing route.

## 4. Industry exclusion policy

Exclude an organisation when its material/core business is in prohibited adult or vice sectors, including:

- Pornography, adult sexual entertainment, sexually explicit games, erotic/hentai businesses whose core product is explicit sexual content, and sex-oriented adult-game businesses.
- iGaming, online casinos, real-money gambling, sportsbooks, betting, wagering, slots and social/simulated casino businesses.
- Recreational drugs, cannabis and businesses primarily built around drug-use products or promotion.
- Alcohol, tobacco, nicotine, vaping and comparable vice-product businesses.

Apply exclusions to the organisation's actual business, not isolated words or the themes of an individual mainstream game. A legitimate mainstream studio is not excluded merely because one title contains violence, adult-rated themes, fictional drugs, alcohol, romance or mature subject matter.

Do not automatically exclude based on a single keyword match. Use company-level evidence, multiple indicators where appropriate, manual exclusions for confirmed cases, and manual review for uncertainty. Prefer false-positive prevention over aggressive keyword exclusion. Record the reason and supporting source for manual exclusions.

The exclusion policy is about the employer's material business. It is not a broad content-rating filter for games.

## 5. Global candidate-source strategy

Candidate indexes are discovery inputs only. They do not prove that a company is a legitimate studio, and they never prove speculative application acceptance. Verify both eligibility gates independently.

### Existing integrated sources

- **GameDevMap** — existing paginated global studio/company directory adapter. Use its public results interface as permitted; do not assume every row is a distinct studio or that a listed location is headquarters.
- **Wikidata** — existing structured feeds for video-game developer entities, organisations credited as video-game developers and video-game companies. Treat entity types and credits as leads requiring validation.

### Additional source leads identified on 2026-10-31

These are candidate sources to evaluate and integrate; they are not yet confirmed as implemented adapters.

1. **IGDB API** — https://api-docs.igdb.com/  
   A promising structured company/game-credit source. Its Company endpoint exposes company identifiers, names, websites, country, parent-company relationships, company types and links to games developed or published. The API requires a Twitch developer application and OAuth credentials; the documented request limit is 4 requests per second and the endpoint supports paginated requests of up to 500 records. Review the current Twitch/IGDB agreement, attribution rules and any commercial-partnership requirements before integration. No credentials or adapter are currently configured. Never commit Client Secrets; use repository Actions secrets only after the owner has configured them. Candidate data remains a lead and must be verified against official employer evidence.

2. **GameCompanies.com** — https://gamecompanies.com/  
   Its public site describes a directory of studios, publishers, hubs, organisations and service companies across 195 countries, plus a game-title catalogue. Useful for breadth and regional discovery. It mixes entity types, so classify every candidate. Its Terms restrict use to the provided interface unless written permission is obtained; use for manual research only until permission for bulk collection is secured.

3. **Games Jobs Index studio directory** — https://gamesjobsindex.com/studios.html  
   On 2026-10-31 the live page displayed 2,573 studios in its header but a regional roll-up of 2,415, so the aggregate count is inconsistent and must not be quoted as a reconciled total. The page exposes a visible **Speculative only** hiring-status filter, useful for manual lead generation. Treat its filter results only as leads: independently verify the organisation and its application route on the employer's official website. No documented bulk API or automated-harvesting permission was established during this review. Keep it as a manual lead source until access terms/permission are clear.

4. **Steam Developer & Publisher Homepages** — https://store.steampowered.com/dev/?l=english and https://store.steampowered.com/pub/?l=english  
   Steam exposes a large paginated set of developer and publisher homepages. It mixes developers, publishers and other creator/homepage entities and is not a count of unique game studios. Use official, permitted access methods and respect Steam's terms and rate limits; do not assume the pages authorize bulk extraction or republication.

5. **MobyGames API** — https://www.mobygames.com/info/api/  
   MobyGames can help identify development companies from game credits and historical releases. The official API documentation says an API key is required and documents non-commercial request limits (720 requests per hour, maximum one request per second, as documented when checked on 2026-10-31). **Do not scrape MobyGames pages or automate access outside the API/permission allowed by its current terms.** Review API access, permitted uses, attribution and redistribution restrictions before implementation. Terms: https://www.mobygames.com/info/terms/.

6. **Community-maintained Game Studios & Publishers Database** — https://github.com/EddieWing/gamedev-studios-db  
   Its README describes a hand-verified list of 1,116 PC/console studios and publishers across 64 countries, with mobile-only studios excluded and Europe prioritised. It is not an exhaustive or neutral global census. No licence was found at the repository root during review; do not import or redistribute its dataset until a reuse licence or permission is confirmed.

7. **Regional and national sources to discover** — local game-industry associations, national game-development directories, government creative-industry registries, public grant/production-funding recipient lists, game-cluster member directories, game-conference/exhibitor lists, and official storefront/developer-credit sources. Add each source only after documenting its provenance, coverage and lawful access method.

The list above is a living source registry, not a closed list. Add new indexes whenever credible global or regional sources are found. Do not stop because a finite list of sources has been exhausted.

### Source evaluation before adapter implementation

For every source, document:

- Canonical source URL, owner/operator and source type.
- What it indexes (developers, publishers, service providers, games, jobs, studios, locations).
- Geographic, platform, size and business-model coverage or known omissions.
- Available pagination, export, API or other public access method.
- Terms of service, licence, robots policy, API-key requirement, rate limits and reuse/attribution rules.
- Update cadence, pagination/cursors and how to detect a completed pass.
- Candidate yield, duplicate rate, invalid/out-of-scope rate, and uncovered segments.
- Last successful harvest date and current source-health status.

Never assume that a public page can be bulk-scraped or that visible data may be republished. Prefer documented APIs and permitted public interfaces. If permission is needed, obtain it before automated collection. A source that cannot lawfully or reliably be harvested can still be used for manual research.

## 6. Candidate lifecycle and entity resolution

Keep candidate discovery separate from published route verification. Use explicit, auditable states such as:

- queued / discovered
- retry
- needs_review
- no_route (only after a sufficiently complete official-site review)
- published
- duplicate
- excluded

Use the current private discovery-state implementation as the source for actual state-field names; this list describes the required meanings, not a mandate to break existing schemas.

Resolve identity using official domains and corroborating company identity, not company name alone. Preserve same-name entities on different official domains until verified as the same organisation. Track aliases, former names, parent companies, subsidiaries, studio branches and separate recruitment routes.

A source row for an office must not automatically become a new studio. Conversely, do not merge separately branded development studios merely because they share a parent company. Keep source provenance attached to candidates so that later handovers can explain where each entity came from.

## 7. Coverage, saturation and progress reporting

There is no global target count and no arbitrary maximum. Report these as separate measures:

- Raw source rows harvested.
- Normalized candidate entities.
- Confirmed in-scope game-development organisations.
- Published verified speculative routes.
- Active, paused and closed routes.
- Duplicate candidates, exclusions and manual-review cases.
- Candidates still queued or awaiting retry.
- Source pages/cursors completed and sources not yet integrated.

Never describe 10,000 candidate companies as 10,000 jobs or opportunities. The published route count is the number of verified application routes, not the number of current vacancies.

Saturation is source-specific, not global. A source may enter a slower maintenance cadence after its documented full passes stop producing new eligible studios, but:

- Adding a new source or expanding a source query/schema must reopen discovery for that source.
- A new verified studio must reset the relevant saturation logic.
- A source timeout or incomplete cursor must not count as a complete pass.
- A source's saturation must not suppress work on other sources.
- Existing sources should continue periodic refresh and candidate verification.
- Global discovery remains open while new sources, regions or source coverage gaps remain.

Keep source-level checkpoints and candidate progress resumable. Do not overwrite a newer discovery-state snapshot with a stale workflow run.

### Implemented source-specific cadence (ADR-070)

The runtime feed inventory is `config/discovery-sources.json`. The discovery script loads this manifest and validates each source ID, adapter kind, refresh policy and saturation settings. The private state schema is v2 and migrates schema-v1 cursors/candidates additively.

The three Wikidata feeds each own their cursor, cycle, verified-addition count, complete-empty-pass count, saturation flag and last-pass outcome. Three complete empty passes throttle only that feed to one page per hourly run; unsaturated feeds retain the remaining run budget. A verified route resets only its originating feed. Due candidate work keeps that feed's pass open; future retries/manual-review candidates mark the pass incomplete and cannot increment saturation. Failed fetches do not advance cursors or count as complete passes.

GameDevMap remains a one-time catalogue backfill. Its terminal numeric offset is preserved and is not restarted by recurring Wikidata maintenance. Legacy candidate records without saved Wikidata query-feed provenance remain unattributed; do not guess their origin.


## 8. Accuracy and quality safeguards

- Candidate directories are leads, never proof.
- Verify on official sites or directly linked employer-controlled systems.
- Do not invent missing HQ, team size, ownership, games, hiring location, remote eligibility or work authorisation.
- Keep listed office location distinct from headquarters and application location.
- Preserve conflicting official evidence as a discrepancy instead of choosing a convenient number.
- Do not close routes after transient fetch errors. Follow the existing requirement for repeated, explicit negative evidence before closure.
- Keep manual-review candidates visible in discovery reporting, but out of the public verified directory until resolved.
- Keep personal application records, CVs, recruiter conversations, secrets and private profile information out of public source datasets and public issue/PR text.
- Add tests for every new source adapter, language pattern, exclusion rule and false-positive edge case.
- Require exact-head CI and review before merging dataset or pipeline changes.

## 9. Implementation roadmap

The following is an ordered engineering plan, not a priority ranking of employers or regions.

1. **Preserve the model and source registry.** Keep this document and the project handoff current. Maintain `config/discovery-sources.json` as the machine-readable inventory for integrated adapters, source coverage, access/policy notes, pagination, refresh policy and per-source saturation settings.
2. **Continue the discovery-quality audit.** The GameDevMap/Wikidata adapter cadence, private checkpoint migration and source-specific saturation are implemented. Continue auditing candidate identity, adult/vice false positives, source failure handling and company-level classification against this model; keyword patterns are not a complete company-level classification system.
3. **Add source adapters only after access review.** Evaluate the IGDB Company API first as a structured company/game-credit source, using Twitch credentials stored only in repository Actions secrets after the user configures them. Evaluate GameCompanies.com, Games Jobs Index, Steam and permitted regional datasets independently. Do not automate GameCompanies.com without written permission; retain Games Jobs Index as a manual lead source until its automation terms are established. Preserve provenance for every source.
4. **Review MobyGames access separately.** Use only authorized API access, subject to its current API and content terms. Do not implement page scraping.
5. **Strengthen entity classification and deduplication.** Distinguish original developers, developer-publishers, subsidiaries, co-development/service providers, publishers-only entities and non-studio organisations.
6. **Strengthen exclusion review.** Use evidence-backed manual exclusions and a cautious classifier with tests that protect legitimate mainstream studios from theme/keyword false positives.
7. **Strengthen application-route verification.** Improve multilingual patterns and evidence extraction without weakening the requirement for explicit official acceptance.
8. **Maintain source-specific coverage.** Per-source cursors, pass outcomes, empty-pass counters, saturation and throttle budgets are implemented. Ensure every new adapter enters the source manifest with reviewed access terms, explicit coverage and tests; a new source must start with its own unsaturated checkpoint.
9. **Expand, validate and maintain.** Process sources in resumable batches, review ambiguous cases, deduplicate, test and publish only verified route/profile datasets.

## 11. Live research decision log — 2026-10-31

### Verified new speculative routes prepared for publication

- **22cans (United Kingdom):** official website says there are no open roles but still accepts speculative applications by email at `jobs@22cans.com`. Its published address is in Guildford, Surrey. Remote and applicant-country eligibility are not stated.
- **Absolutely Games (United Kingdom):** official Careers page expressly directs candidates to its form when no applicable role is available. The studio's About page confirms it develops strategy/tactics games and is based in Guildford. The form does not state remote or international eligibility.
- **AB Games (Ukraine / Cyprus):** official Careers section says there are no positions currently and invites candidates who found no suitable vacancy to upload a CV or portfolio. The form lists Kyiv, Kharkiv, Rivne and Limassol as location options. The employer states it develops its own free-to-play hidden-object games; remote and applicant-country eligibility are not stated.

### Existing records rechecked and refined

- **Bossa Studios:** the current Careers page directs speculative resumes to `jobs@bossastudios.com`, and labels the speculative route for all departments, remote, any time. Correct the submission method to email; do not treat a distributed team as proof of unrestricted applicant-country eligibility.
- **Brave At Night:** official About page confirms Manchester as the studio base. Its Speculative Application page publishes `jobs@braveatnight.co.uk` and requests a CV and portfolio where possible. Record Manchester and keep remote/cross-border eligibility unknown.
- **Ember Crows:** official Careers FAQ confirms a dedicated spontaneous form, opt-in future consideration and international applicants. The form asks about in-person availability in Battersea. The current spontaneous route is expressly project-based freelance using points-based profit sharing, without a guaranteed upfront salary or fee. Preserve this prominently; do not present it as conventional salaried employment.

### Leads held out, rejected or queued for manual review

- **3MenStudio:** its Careers page invites applications even when no role fits, but its official Game Development Services page also advertises casino-game development. Hold for business-level review under the gambling exclusion; do not automatically publish it while the extent of that business is unresolved.
- **2Awesome Studio:** the inspected page asks applicants to apply even if they do not meet every requirement for a specific advertised vacancy; that is not a general speculative route.
- **Abstraction Games:** an employer-branded Breezy page says it accepts open applications, but the current official Careers page did not establish a direct link to that ATS. Hold until the employer-route relationship is verified.
- **Abylight:** the official Careers page says submitted profiles are archived for future selection, but no directly usable general submission method was established.
- **Primal Game Studio:** the official Careers page links a speculative JazzHR application, but the linked destination returned HTTP 403 during review. Retry rather than publish an inaccessible route.
- **PRELOADED:** the reviewed official Studio page provides a general enquiry form, not an explicit speculative-application route. Search snippets alone are insufficient.
- **24 Bit Games:** verified as a game-development services provider, but no explicit speculative application invitation was found. Do not add on the basis of a generic contact address.

All these decisions are evidence-led and provisional where marked for manual review; recheck employer pages before changing a held or excluded disposition.

### Additional verified speculative-route findings — 2026-10-31

- **Favo Games (Türkiye):** its official Careers page offers an explicit Open application option for skills not represented by current openings, accepts a CV and portfolio through its form, and states that the five-person Istanbul studio works remotely from anywhere. Country-specific employment/contract arrangements are not enumerated. Added as a legitimate mobile/puzzle game developer with an active route.
- **DON’T NOD Montréal (France / Canada):** the official careers page lists a Montréal Spontaneous Application and links to an employer-hosted SmartRecruiters candidate-bank posting. The posting asks candidates to describe their desired work and explicitly states it does not represent a current or future recruitment need; only selected applicants are contacted. It says candidates may work anywhere in Québec. Added as a speculative candidate-bank route with these limitations prominent; do not describe it as an active vacancy.
- **Ubisoft Saguenay (Canada):** the official studio careers page explicitly invites applicants whose desired position is not posted to email a CV and portfolio to `rhsaguenay@ubisoft.com`. The official studio site separately identifies Saguenay's contribution to NFL Primetime Fantasy and XDefiant. Added as a distinct Ubisoft development studio, without inferring remote or applicant-country eligibility.

### Qualification corrections from source rechecks — 2026-10-31

- **Techtive Games GmbH:** the JOIN company profile contains a spontaneous application and links to `techtive.games`, but the current official Techtive domain redirects to the ARDEM game website and does not link back to the JOIN route. The route's employer-controlled relationship cannot currently be established under the direct official-evidence standard. The directory record is paused pending direct employer confirmation; do not count it as active.
- **Fawkes Games:** kept out of the public directory pending review. Its current Careers page now advertises Unity Game Engineer, art, design and producer roles and invites spontaneous applications, but its official About page still describes a publisher/operator and live-operations business. Recheck if official evidence confirms that the company itself performs in-house game development.



### Additional verified and reviewed findings — 2026-10-31

#### Added to the batch-6 proposal branch

These records are proposed on the current open data PR and are not yet part of main or the live site:

- **AnkleBreaker Studio (France):** its official Careers page explicitly says that candidates who do not see their role should still contact the studio, and asks for a portfolio, project or letter for exceptional skills not listed. The page links the studio's current Mithrall hiring effort, states the studio is near Paris and says in-person work is the default, with remote considered for the right person/role. It reports a ten-person senior team. The invitation is open to unlisted skills; it is not a claim that every listed vacancy is open to every discipline. Sources: https://anklebreaker-studio.com/ and https://anklebreaker-studio.com/careers.
- **Alice in Games (Germany):** its official Career page has an explicit Open Application for artists, developers, designers and other creatives when no specific role fits, accepting a resume, portfolio or brief introduction by email. Its official Contact page lists a Berlin office. The About page describes a small independent studio; the homepage says its first narrative game is in development, but no title, platform, release date or team size is disclosed. It is included as an early-stage/pre-release studio with those unknowns preserved. Sources: https://aliceingames.com/, https://aliceingames.com/about/, https://aliceingames.com/career/, https://aliceingames.com/contact/.
- **No Roof Games (Finland):** the official homepage identifies a small mobile game studio in Tampere; its About page reports three industry professionals with 20+ years of combined experience. Its dedicated Open Application page asks for an application letter and CV, with portfolio links where available. The employer's developer presence for Heroes & Friends GO provides a further game-credit cross-check. Remote and applicant-country eligibility are not stated. Sources: https://noroofgames.com/, https://noroofgames.com/about/, https://noroofgames.com/open-application/, https://play.google.com/store/apps/details?id=com.NoRoofGames.HeroesFriendsGO.
- **Skytale (France):** its official site describes an independent non-profit video-game studio with 80+ volunteers across three continents and no employees. Its recruitment page explicitly includes a spontaneous-application route; applicants can submit a CV and two or three links. The studio is 100% remote and its work is entirely volunteer-produced/non-commercial. It is included because the project does not require paid employment, but the route and profile clearly state that this is unpaid volunteering, not a job. Projects include The Last Artifact and Z'Wonder Battle. Sources: https://skytale.fr/en/, https://skytale.fr/en/qui-sommes-nous, https://app.skytale.fr/rejoindre.

#### Exclusion and manual-review decisions from the same pass

- **Chouic — excluded:** the company develops mobile couple/party games. Its developer catalogue includes Sex Game For Couple – PleaseMe, described as a sensual experience, intimate couple-game products, and an alcohol/party title. This is a material sexual-entertainment/alcohol-game portfolio rather than a single mature theme in an otherwise unrelated mainstream title. Added to `config/manual-studio-exclusions.json` with the supporting reason and review date. Evidence: https://chouic.com/recrutement, https://apps.apple.com/us/developer/chouic/id824866807, https://play.google.com/store/apps/developer?id=Chouic.
- **Duhndal (Denmark) — manual review, not published:** the official Careers page has an “uopfordret ansøgning” (unsolicited application) section and states that it hires only within Denmark; the company says it develops its own games and works fully remotely. Its portfolio includes One-Armed Cook, One-Armed Robber and Drug Lord Tycoon. Because the latter is explicitly drug-themed, the candidate is held for a company/portfolio-level assessment under the drug-content boundary rather than silently included or automatically rejected based on a single title. Sources: https://www.duhndal.com/careers, https://www.duhndal.com/contentcreator.
- **Manc Games (Türkiye) — manual review, not published:** the company is a legitimate Istanbul mobile-game developer. Its main Careers page lists current vacancies, while a separate Rummikub Social microsite has a General Application route. The reviewed Manc main-site careers page did not link to that separate application route, so employer-controlled route linkage is not yet established. Hold until an official cross-link or direct confirmation is available. Sources: https://www.mancgames.com/about, https://www.mancgames.com/career, https://www.rummikubsocial.com/careers.
- **Fawkes Games — hold resolved:** subsequent official evidence establishes direct in-house game development/maintenance through Unity engineering, game-design and art roles, client modernization, gameplay overhaul and content expansion. Included in batch 10 as a developer/publisher/live-service operator; do not revert to the superseded publisher-only classification without new evidence. See ADR-075.
- **AMIGO Spiele (Germany) — out of scope:** its official careers site documents board/card-game publishing and development, not video-game development. An unsolicited-application route for tabletop-gaming roles does not satisfy the video-game developer gate. Source: https://blog.amigo-spiele.de/ueber-amigo/karriere-2/.

#### Duplicate checks and confirmation

Several newly surfaced pages were already represented in the directory and were not duplicated: Reply Game Studios, Ocellus, Old Skull Games, VestGames, Yabu Games, Funday Games, Octocube Games, Abyssal Interactive, Aethra Studios, Katal Games, Sencorp Games, Studios DRAMA, D4N Games and the other current batch records. Rechecking existing records is useful maintenance, but a new search result is not a new studio record.

### Additional verified and reviewed findings — 2026-10-31 (batch 8)

#### New verified speculative routes prepared for publication on PR #70

- **Rapidfire Games (Cyprus):** its official Careers section says there are no open positions but explicitly invites an open application with a CV or portfolio through the careers contact shown on its site. The studio describes an independent senior team of 18 working remotely from around the world and developing free-to-play mobile games for iOS/Android; its live title is Backpack Brawl. Official terms identify RAPIDFIRE LTD, registration HE460989, with a Geri, Cyprus registered office, while its privacy policy styles the name RAPIDFIRE GAME LTD with the same registration number/address. Keep that legal-name discrepancy visible. A globally distributed team is not proof that candidates can be hired in every country; applicant-country/contract eligibility is unstated. Sources: https://rapidfire.games/, https://rapidfire.games/privacy-policy/, https://rapidfire.games/terms-and-conditions/.
- **Sleeprunner Studios (Germany):** its official Jobs page explicitly invites unsolicited applications from designers, programmers, artists, marketers and other contributors when no role fits. It asks for CV, portfolio and motivation letter by email to `hello@sleeprunnerstudios.com`, in PDF format. The official About page describes a five-person Bayreuth indie developing core PC/console games with Unreal Engine. Employees must reside in Germany or the EU; freelancers can collaborate worldwide. Its workplace is hybrid and relocation support is stated. Projects include Trail of Toads, Downfall Hearts and the Windstorm remaster. Sources: https://sleeprunnerstudios.com/, https://sleeprunnerstudios.com/jobs/, https://sleeprunnerstudios.com/about/, https://sleeprunnerstudios.com/press/.
- **Cluetivity (Germany):** the official Careers page embeds its employer-controlled Personio recruitment system, which lists an Initiative Application. The Personio listing explicitly invites contact when the desired job is not listed. The official About page says the company began developing GPS-based games in 2006 and now develops location-based/mobile games and a game-creation platform for augmented-reality outdoor/indoor experiences. It is included as a specialised digital-game developer, not represented as a conventional PC/console studio. The employer listing allows remote or Berlin; applicant-country eligibility is not stated. The official careers footer identifies Life Action Games GmbH. Sources: https://www.cluetivity.com/, https://www.cluetivity.com/about/, https://www.cluetivity.com/careers/, https://cluetivity.jobs.personio.de/job/431574?language=en.

#### Existing route refinement

- **Next Level Games (Canada):** the existing General Application remains active and explicitly invites experienced game developers when no position is open. The latest employer-managed application form now states hybrid work with at least three days per week at the Vancouver studio, Canada work authorization and current British Columbia residence. The existing route record has been updated to `workModel: hybrid` and its eligibility caveats corrected. Do not create a duplicate. Evidence: https://nextlevelgames.applytojob.com/apply/YyYQvToJW1/General-Application.

#### Company-level exclusion

- **3Sigma Games — excluded:** its own hiring page explicitly labels the business an “Adult Game Studio” and invites general applications for VFX, editing, directing, 2D/3D art, game development and game design roles. The same application asks about the applicant's sector, including adult entertainment. Added `3sigma-games.com` to `config/manual-studio-exclusions.json`. This is explicit company-level evidence, not a keyword or mature-theme inference. Source: https://www.3sigma-games.com/public/hiring.

#### Other search results reviewed; no new record

- **Raw Power Games:** already in the directory; its official Teamtailor page continues to show an Unsolicited Application. No duplicate added.
- **Futureplay Games:** already in the directory; its official Open Application continues to say Remote: Global. No duplicate added.
- **Shiro Games:** already in the directory; its official General Application continues to invite experienced game developers by email. No duplicate added.
- **Next Level Games:** already recorded; only eligibility/work-model details were refreshed.
- **Studio Countdown:** not added. Its official Careers page describes an animation studio; the inspected opportunities include a comic project and revenue-share roles, but do not establish direct video-game development.
- **welevel München:** not added. The speculative route surfaced through LinkedIn, but an official company-controlled application destination/evidence path was not established.
- **Axonlab:** not added; the search result was a multi-country initiative-application portal, not evidence of a video-game development studio.

#### Classification clarification

Location-based, GPS-based, mobile and augmented-reality game developers can qualify when the organisation materially creates digital games/gameplay and the supporting software. Cluetivity is included under this rule, with its specialised business category clearly stated. Do not automatically include events companies, escape-room operators or general software/platform vendors that do not actually develop digital games.

### Additional verified and rechecked findings — 2026-10-31 (batch 9)

#### New verified speculative routes prepared for publication on PR #70

- **Tarokai (Switzerland):** the official homepage explicitly says candidates who do not see their role may send a spontaneous application to `careers@tarokai.com`. The Legal Notice identifies Tarokai SA, a Swiss société anonyme registered in the Swiss Commercial Register, but does not publish a city/address. Its current game Peach Farmer is a free-to-play mobile collectible-card game for iOS/Android connecting card collection to real-world experiences. Current listed roles are marked remote; applicant-country/contracting eligibility is not stated. Sources: https://www.tarokai.com/, https://www.tarokai.com/legal.
- **Procedural Games (Spain):** its official homepage links directly to its Careers subdomain. The employer-managed Open Application is labelled “Always open”, invites candidates who do not see a matching role to submit a CV for future consideration, and states CVs are stored for up to 12 months only with applicant permission. The official homepage describes an independent Valencia mobile studio founded in 2023, with game design, Unity development, live operations, monetization and user acquisition in-house. Open application work setup is hybrid at Lanzadera in Valencia, depending on role; the studio encourages international applications and remote collaboration, but the open posting itself is Valencia/hybrid. Sources: https://proceduralgames.com/, https://careers.proceduralgames.com/en/jobs/candidatura-espontanea, https://careers.proceduralgames.com/en.
- **Thought Pennies (country not stated):** its official homepage's “Join Us” link directly opens https://thought-pennies.careers-page.com/. That linked careers page contains an explicit Open application and invites resumes even when no suitable role is listed. This resolves the earlier missing-employer-linkage concern; the candidate is now qualified and included. The official website describes a fully remote, story-first RPG studio and identifies Thought Pennies, Inc., but gives no incorporation country, HQ city or applicant-country eligibility. Those facts remain unknown rather than being inferred. Sources: https://www.thoughtpennies.com/, https://thought-pennies.careers-page.com/, https://thought-pennies.careers-page.com/open-application.

#### Existing route precision refresh — Playtouch (Mauritius / France)

- The current official Careers page now clearly describes a year-round spontaneous talent pool, even while the team is complete. Applicants select one of six skill tracks (AI/automation, HTML5 game/web engineering, 2D art/motion/Creative AI, design/narrative/audio, QA/release operations, or product/AdTech/B2B) and send a CV or portfolio directly to the Grand Baie studio leads; `contact@playtouch.net` is published. The record now distinguishes the production studio in Grand Baie, Mauritius; administration in Port Louis; and French headquarters in Roquefort-les-Pins. Current advertised roles are on-site in Grand Baie; remote and applicant-country eligibility for spontaneous candidates are not stated. Sources: https://playtouch.net/career, https://playtouch.net/about.
- Playtouch remains one record. Do not duplicate it because it appears in new search results.

#### Other candidate rechecks

- Kuuasema and Bananagun were already present and retained; their open-application records were not duplicated.
- Thought Pennies' earlier manual hold is superseded by the new first-party Join Us link described above.
- Other candidates without a verified employer-backed route or sufficient developer identity should remain unlisted until the missing evidence is found.

#### Current data checkpoint

The working PR #70 branch now proposes **307 route/profile pairs**, **303 active and 4 paused**, across **50 country/location labels**. Main remains at 287/287 until the replacement PR is reviewed, merged and deployed.

### Additional verified and reviewed findings — 2026-10-31 (batch 10)

#### New verified route added to PR #70

- **Fawkes Games (Bulgaria):** the official Careers page explicitly invites spontaneous applications and currently advertises Unity Game Engineer, 2D Game Artist, Game Designer, Producer and 2.5D Pixel Artist roles. The official Terms identify Fawkes Games LTD as registered in Plovdiv, Bulgaria. The official homepage and company documents describe a developer/publisher/live-service operator that operates five established online worlds and performs or coordinates client modernization, gameplay-system overhauls, content expansions and game updates. Its current careers pipeline includes direct Unity engineering, game-art and game-design positions. It is included as a **developer / publisher / live-service operator**, not as an original-IP-only studio; its games are labelled as operated/live-service titles where appropriate. The Careers page says work can be remote worldwide; individual roles are freelance and prefer Europe-friendly time zones. Sources: https://fawkesgames.com/, https://fawkesgames.com/en/careers/, https://fawkesgames.com/en/terms/.

#### Earlier manual hold resolved

- **Fawkes Games:** the prior manual hold was based on its About page describing a publisher/operator and did not yet establish direct in-house development. New official evidence (Unity Game Engineer, Game Designer and game-art recruitment; client modernization; gameplay changes; content cycles) demonstrates direct development/maintenance. This supersedes the earlier hold. The public profile retains the publisher/operator/live-service classification rather than misrepresenting the company as an original-IP-only studio.

#### Manual review — not published

- **DreamCentury Entertainment (France):** official company pages describe a digital casual-game creator since 1999, with around 50 web/mobile games and an explicit spontaneous-application form asking for a CV and motivation letter. However, official MadWin/Wonderz game rules describe both free rounds and a Credits Mode in which players can purchase game credits, use credits to enter games, score points and exchange points for prizes/gifts. This creates a material gambling/prize-game policy question. Keep the company out of the public directory pending company-level assessment of the paid-entry/prize model; do not silently classify it as either ordinary casual gaming or gambling without resolving the boundary. Sources: https://www.dreamcentury.com/playbox/site/index.asp, https://www.dreamcentury.com/playbox/site/recrutement/index.asp, https://www.dreamcentury.com/playbox/site/recrutement/candidaturespontanee.asp, https://php.dreamcentury.com/backend/external/madnetix/reglement_site/reglement_madwin_en.php, https://php.dreamcentury.com/backend/external/madnetix/reglement_site/reglement_wonderz_en.php.
- **President Studio S.A. (Poland):** its official games page identifies it as a Warsaw-based development studio and publisher, listing Celestial Empire, Crime Scene Cleaner, Ship Builder and Viking City Builder. Its Careers page explicitly invites spontaneous applications and asks for CV/portfolio. However, the official page's linked TSP application destination (https://www.presidentstudio.tsp.link/pl/kontakt) returned HTTP 502 during review, so the usable application route could not be verified. Hold until the official endpoint works or an alternative employer-controlled application method is confirmed. A 502 is not evidence the studio withdrew the route. Sources: https://www.president-studio.com/en/games, https://www.president-studio.com/en/careers.

#### Current batch checkpoint

The proposal branch contains **308 route/profile pairs**, **304 active** and **4 paused**, across **51 country/location labels**. Main remains at 287/287 until PR #70 is reviewed, merged and deployed.

### Additional verified and reviewed findings — 2026-10-31 (batch 11)

#### New verified routes prepared for publication on PR #70

- **FakeFish Games (Finland):** its official Careers page says that if there are no suitable openings, applicants should fill out the Open Application; the dedicated form invites candidates who do not see their job listed to submit details for future consideration. FakeFish Oy is an independent PC/console developer based in Turku with a smaller Helsinki office, developing Barotrauma (with Undertow Games) and an undisclosed second game. The current homepage says about 20 people; the form page's older early-2023 figure is about 25. It describes a flexible workplace and location “Turku, Finland & beyond”, but does not guarantee worldwide employment. Sources: https://www.fakefishgames.com/jobs, https://www.fakefishgames.com/jobs/open-application, https://www.fakefishgames.com/about-us, https://www.fakefishgames.com/our-games.
- **Winning Streak Games (Germany):** official Cologne company homepage has a dedicated Initiativbewerbung section that asks candidates to write even when no position fits; the official Impressum provides the contact email. It develops PC football-management/simulation titles including WE ARE FOOTBALL 2027 and WE ARE FOOTBALL 2024, was founded in Cologne in 2018 and has a THQ Nordic publishing agreement. All advertised jobs are full-time in Cologne; home office only in exceptional cases. Sources: https://winningstreakgames.de/, https://winningstreakgames.de/impressum.html.
- **ByteRockers' Games (Germany):** its official Jobs page explicitly invites an Initiativbewerbung by email to `jobs@byterockers.games` when no listed role fits or the company is not actively hiring. The official About page says the company creates its own games and began publishing other teams' projects in 2024. It has developer credits for Insurmountable, Beat Slayer and Gelly Break Deluxe. The official Impressum identifies ByteRockers' Games GmbH & Co. KG at Schloßstraße 110, 12163 Berlin. Work model and applicant-country eligibility are not stated for unsolicited applications. Sources: https://www.byterockers.games/de/jobs, https://www.byterockers.games/de/%C3%BCber-uns, https://www.byterockers.games/de/impressum, https://www.byterockers.games/insurmountable, https://www.byterockers.games/beatslayer, https://www.byterockers.games/gelly-break-deluxe.

#### Existing route corrections

- **Redly Games (Finland):** official homepage Join Us link goes to its employer-managed Ashby General Interest / Open Application. The route invites candidates without a current matching role for future consideration. It is a remote contract application; EU and Canada are preferred, exceptional candidates elsewhere may be considered depending on role. The route now uses the official Redly homepage as `websiteUrl`, the direct Ashby application URL, and `employer_managed_career_platform` as source type. First mobile 3D adventure title is in development with Unreal Engine 5; no title announced. Sources: https://www.redlygames.com/, https://jobs.ashbyhq.com/redlygames/3c2a1d1e-5e80-4b4e-895d-f43d0efe4d3b.
- **HypeHype (Finland):** the current Jobs page describes it as an AI-native game studio in Helsinki backed by Supercell and Benchmark. It has a specific Open Application for AI-native people interested in shaping games and game creation. The work model and applicant-country eligibility are not stated; Helsinki is the studio location, not proof of onsite eligibility. This record was refreshed, not duplicated. Source: https://hypehype.com/jobs.

#### Candidate held / paused

- **Plummy Games (Moldova):** the employer-branded Teamtailor site hosts an Open Application and links back to plummygames.com, but the official company homepage could not be inspected for a forward link to the application. To preserve the strict direct-linkage standard, the existing record is paused, not deleted or declared closed. Restore only after a first-party careers link or direct employer confirmation. Existing application URL: https://plummygames.teamtailor.com/jobs/6670751-open-application/applications/new. Official homepage: https://plummygames.com.

#### Manual exclusion

- **Xatronic Software GmbH (Austria):** official Products and homepage describe online-casino platforms and slot/reel games made for clients, including reel mechanics and bonuses to maximise players' chances of winning. Although its careers page invites spontaneous applicants for game/software roles, the core business is explicitly iGaming/online-casino software. Added `xatronic.at` to `config/manual-studio-exclusions.json`. Sources: https://xatronic.at/, https://xatronic.at/produkte/, https://karriere.xatronic.at/.

#### Current batch checkpoint

The proposal branch contains **311 route/profile pairs**, **306 active** and **5 paused**, across **51 country/location labels**. Main remains at 287/287 until PR #70 is reviewed, merged and deployed.

### Additional verified and refreshed findings — 2026-10-31 (batch 12)

#### New verified routes prepared for publication on PR #70

- **SQUARE ENIX (Japan):** the official mid-career site has an explicit Career Registration system for people who do not want to select a single job type or whose target position is not currently advertised. The employer reviews profiles across divisions and may introduce matching openings, including unpublished roles. This is a group-wide talent registration, valid for three years, and does not guarantee an interview, job or contact. Current categories include Digital Entertainment/game development, production/operations, CG, sound, localization, R&D, publishing, media and corporate roles. Official company data reports 3,235 employees as of 2026-03-31, with Shinjuku HQ and Shibuya/Osaka offices; the company is wholly owned by Square Enix Holdings. Work model and overseas eligibility are not stated for the registration. Sources: https://www.jp.square-enix.com/recruit/career/careerlink/index.html, https://www.jp.square-enix.com/recruit/career/data/index.html, https://hrmos.co/pages/square-enix/jobs/00001/apply.
- **Iteration One (Germany):** its official homepage links directly to its JOIN recruiting portal, where a dedicated Spontaneous Application explicitly invites CVs and cover letters for future roles when no suitable position is open. It is a self-funded independent Karlsruhe-based mobile game developer/publisher making free-to-play idle/tycoon games; its live game is Nightclub Tycoon. JOIN lists 1–10 employees. The spontaneous route does not state a work model or applicant-country eligibility. Sources: https://www.iterationone.com/, https://join.com/companies/iterationonecom/spontaneous-application.
- **Cenrellia Studios (country not stated):** its own Careers page says there are no current positions but explicitly invites unsolicited Art, Music, commissioned game-development, QA and Community pitches through its first-party contact form (select “Careers”). Its Games page lists Stellar Hustler for Steam/PC (Linux-first), Android and iOS. The business is a one-person sole proprietorship. Country/HQ, compensation and engagement terms are not stated. It qualifies because it demonstrably develops a digital game and explicitly invites unsolicited work/collaboration pitches. State clearly that this is not an advertised salaried vacancy and do not imply employment. Sources: https://cenrelliastudios.com/de/careers, https://cenrelliastudios.com/de/contact, https://cenrelliastudios.com/de/about, https://cenrelliastudios.com/de/games.

#### Existing route/profile precision refreshes

- **Stormind Games (Italy):** rechecked the current spontaneous-application form, which accepts a CV/resume and supporting details. The official Company page states that the independent studio was founded in 2016, has 100+ internal resources plus external collaborators, and has HQ in Catania/Acireale with registered office in Milan. The refreshed profile records Remothered: Red Nun's Legacy (released 2026-10-27), upcoming remasters, A Quiet Place: The Road Ahead, Batora: Lost Haven and its co-development contribution on Mafia: The Old Country. The spontaneous route does not state work model or applicant-country eligibility. Sources: https://stormindgames.com/careers/, https://stormindgames.com/company/, https://stormindgames.com/games/.
- **GAME FREAK (Japan):** rechecked the employer-managed HRMOS Career Registration. It invites mid-career regular-employee candidates to register their experience even when no target position is open; HR may contact them if a matching job or hiring event becomes available. The registration may be held for up to two years and is not a job vacancy or guarantee. The official FAQ accepts overseas applications but requires business-level Japanese for all roles and approximately JLPT N1 for development work. The route now uses workModel `not_stated`; Tokyo is retained as an HQ reference only, not a presumption of hybrid work. Sources: https://www.gamefreak.co.jp/recruit/, https://www.gamefreak.co.jp/recruit/faq/, https://hrmos.co/pages/gamefreak/jobs/10-4.

#### Classification clarification: solo studios and non-job applications

A legitimate one-person video-game developer can satisfy the studio gate. If the explicit unsolicited route is for project pitches, commissioned work or collaboration rather than a salaried vacancy, include only when the game-development identity and application invitation are both established, and describe the route as such. Do not convert “no current jobs” into a claim that paid employment is open. Record compensation/contract conditions as unknown if the employer does not state them. Cenrellia Studios is the example captured in this batch.

#### Current batch checkpoint

Main contains **313 unique studio/employer records / 313 matching profiles**, **308 active** and **5 paused**, across **51 country/location labels**. PR #70 and PR #71 are merged. The pre-deduplication PR #70 dataset had 314 rows because Fakefish and FakeFish Games represented the same official employer/application route; ADR-078 records the canonical FakeFish consolidation.

## 10. Handover protocol

At the start of any new work session or handover:

1. Read this document first, then HANDOFF.md and STATUS.md.
2. Inspect the current main branch, open PRs, discovery-state checkpoint and latest successful workflow runs. Do not rely on old chat summaries as current repository state.
3. Preserve the two eligibility gates and no-prioritization rule.
4. Before adding a source, inspect its current coverage, terms, API/robots policy, data shape and provenance.
5. Record every material new source, policy interpretation, exclusion case, verification finding, source limitation or pipeline decision here, with a dated link and implementation status.
6. Update HANDOFF.md and STATUS.md when the current direction or checkpoint changes; update CHANGELOG.md and create/update an ADR when a material implementation decision is made.
7. Distinguish proposed work from implemented, tested and merged work. Never claim a source is integrated until the adapter is in the repository and its tests/checkpoints confirm it.
8. Do not change or reprioritize the user's goal without an explicit instruction.

**Current decision:** Global discovery accuracy and coverage are the only focus at this stage. No employer, geography, discipline, company size or work model is prioritized. The personal career-targeting layer can be considered later, after the global discovery work has matured.
