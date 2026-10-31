# ADR-071 — Global discovery batch 6 and supplementary source review

- Date: 2026-10-31
- Status: Proposed for review
- Depends on: [Global Discovery Implementation Model](../architecture/global-discovery-implementation-model.md).

## Scope

Continue global discovery without prioritizing geography, studio size, AAA/indie status, platform, discipline, work model or personal career fit. This batch consolidates the previously validated fifth expansion and adds three new employer routes, while correcting three existing records.

## New verified speculative routes

### 22cans — United Kingdom

- Official source and route: https://22cans.co.uk/
- The website says there are no open roles at present but explicitly invites speculative applications by email to jobs@22cans.com.
- Published contact address: Guildford, Surrey.
- Applicant-country and remote eligibility are not stated.
- Submission method: email.

### Absolutely Games — United Kingdom

- Official evidence and route: https://www.absolutelygames.net/careers/
- The Careers page explicitly invites candidates to use its form when no applicable role is available.
- Official studio background: https://www.absolutelygames.net/about-us/
- Guildford-based developer formed in 2019, creating strategy/tactics games for PC and consoles.
- The reviewed form exposes an Enquiry field; no CV upload field was visible.
- Remote and applicant-country eligibility are not stated.
- Submission method: employer website contact form.

### AB Games — Ukraine / Cyprus

- Official evidence and form: https://ab-games.com/en/
- The Careers section says there are no positions currently and invites candidates who did not find a suitable vacancy to submit a CV or portfolio.
- Form location options: Kyiv, Kharkiv and Rivne (Ukraine), and Limassol (Cyprus).
- The official site identifies the organisation as a developer of its own free-to-play hidden-object games, including Hidden City.
- The site reports 100 people, which is labelled company-reported rather than independently verified.
- Applicant-country and remote eligibility are not stated.
- Submission method: official website form.

## Existing record precision updates

- **Bossa Studios:** official Careers page invites speculative resumes by email to jobs@bossastudios.com and marks the speculative route for all departments / remote / any time. The route is updated to email. An internationally distributed team is not treated as proof of unrestricted applicant-country eligibility.
- **Brave At Night:** official About page confirms Manchester as its base; speculative route is jobs@braveatnight.co.uk with CV and portfolio requested. Remote and applicant-country eligibility remain unknown.
- **Ember Crows:** official Careers FAQ confirms a dedicated Spontaneous Application form, opt-in future consideration and international applicants. The form asks about in-person availability in Battersea. The current spontaneous route is project-based freelance using points-based profit sharing, with no guaranteed upfront salary or freelance fee; this caveat remains prominent.
- **Sudden Forest:** consolidated from the previous PR #68 proposal. The official site lists a speculative Unreal Engine 5 application despite no open positions. The current funded Tidewind freelance collaboration is limited to Berlin/Brandenburg residents; applicants elsewhere may contact the studio about future collaboration. It is not described as salaried or worldwide-remote.
- **Chimera Entertainment:** consolidated from PR #68. Its Personio speculative route is classified as an employer-managed ATS; the Munich listing and company careers page's multi-country remote/hybrid statements are reconciled with mandatory five-month, on-site Munich internships. Conflicting official headcount statements (25 vs around 70) are disclosed rather than resolved by guesswork.
- **Supermassive Games:** consolidated from PR #68. The official Careers page's speculative application is email-based; Guildford is recorded without inferring remote or cross-border eligibility.

## Candidate-source findings

- **IGDB API** was evaluated as a promising structured company/game-credit source. Its Company endpoint exposes company identifiers, names, websites, country, parent-company relationships, company types and game relationships. API access requires a Twitch developer application and OAuth credentials; the documented limit is 4 requests per second and up to 500 records per paginated request. Review current terms, attribution and commercial requirements before integration. No adapter or credentials were added.
- **Games Jobs Index** exposes a visible “Speculative only” filter, useful for manual lead generation. On 2026-10-31, its header showed 2,573 studios while its regional roll-up showed 2,415; do not quote either as reconciled coverage. No documented bulk API or automated-harvesting permission was established.
- **GameCompanies.com** Terms restrict automated use beyond the provided interface without written permission. Use as a manual source unless permission is obtained.
- The community-maintained Game Studios & Publishers Database has no licence located at its repository root; do not import or redistribute the dataset until a reuse licence or permission is confirmed.
- Steam developer/publisher homepages and MobyGames remain source-evaluation leads; terms and authorized access must be reviewed before automation.

## Held out, rejected or queued for manual review

- **3MenStudio:** its Careers page invites applications even when no role fits, but its official Game Development Services page also advertises casino-game development. Hold for company-level review under the gambling exclusion; do not publish while the extent/materiality of that business is unresolved.
- **2Awesome Studio:** the reviewed page is a specific advertised vacancy and merely encourages applications from candidates who do not match every requirement; it is not a general speculative route.
- **Abstraction Games:** an employer-branded Breezy page says it accepts open applications, but the current official Careers page did not establish a direct link to that ATS.
- **Abylight:** the official Careers page says submitted profiles are archived for future selection, but no directly usable general submission method was established on the reviewed page.
- **Primal Game Studio:** the official Careers page links a speculative JazzHR form, but the linked destination returned HTTP 403 during review. Retry rather than publish an inaccessible route.
- **PRELOADED:** the inspected official page provided a general enquiry form, not an explicit speculative application invitation. Search snippets alone are insufficient.
- **24 Bit Games:** confirmed as a game-development services provider, but no explicit speculative application route was found.

These dispositions should be rechecked against current official sources before changing their status.

## Validation and rollback

- The proposed dataset contains **291 routes / 291 matching profiles**, with **288 active** and **3 paused** entries across 49 country/location labels.
- Data files remain one-to-one; no personal application records or CVs are included.
- Run Python discovery tests, frontend tests, directory validation, route review, production build, privacy boundary, Pages artifact check and browser acceptance on the exact PR head.
- Roll back only this batch's three new routes/profile records, the Sudden Forest addition, and the five refreshed route/profile entries if an inclusion decision fails review.
