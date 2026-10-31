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

There is no arbitrary ceiling such as 300 or 500 records. Continue adding verified routes while new legitimate candidates and source coverage remain. A candidate count is not a job count or an opportunity count.

This phase is **not** a personal job-matching, application recommendation, vacancy-monitoring or outreach-generation project. Do not reintroduce those features into discovery.

## 2. Eligibility gate A — legitimate game-development organisation

### Include

- Independent and corporate-owned game-development studios, from micro-indies through AAA studios.
- A development studio that is part of a larger publisher, platform holder or entertainment group, while preserving its actual studio identity and parent relationship.
- Organisations that materially create video games, including original-IP development and direct co-development, porting or game-production work.
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

1. **Preserve the model and source registry.** Keep this document and the project handoff current. Add a machine-readable source manifest/coverage ledger so source status, terms, cursors and last-harvest dates are explicit.
2. **Audit existing discovery behaviour.** Check current GameDevMap/Wikidata adapters, candidate states, exclusion patterns, source saturation and reporting against this model. The current script has initial adult/vice keyword patterns; these are not yet a complete company-level classification system.
3. **Add source adapters only after access review.** Evaluate the IGDB Company API first as a structured company/game-credit source, using Twitch credentials stored only in repository Actions secrets after the user configures them. Evaluate GameCompanies.com, Games Jobs Index, Steam and permitted regional datasets independently. Do not automate GameCompanies.com without written permission; retain Games Jobs Index as a manual lead source until its automation terms are established. Preserve provenance for every source.
4. **Review MobyGames access separately.** Use only authorized API access, subject to its current API and content terms. Do not implement page scraping.
5. **Strengthen entity classification and deduplication.** Distinguish original developers, developer-publishers, subsidiaries, co-development/service providers, publishers-only entities and non-studio organisations.
6. **Strengthen exclusion review.** Use evidence-backed manual exclusions and a cautious classifier with tests that protect legitimate mainstream studios from theme/keyword false positives.
7. **Strengthen application-route verification.** Improve multilingual patterns and evidence extraction without weakening the requirement for explicit official acceptance.
8. **Make coverage source-specific.** Add per-source progress, exhaustion, failure and refresh reporting. Ensure new sources reopen discovery and no source's saturation stops global work.
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
