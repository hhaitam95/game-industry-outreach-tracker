# Project Specifications

**Status:** Approved baseline with static-hosting and browser-resume decisions; living document  
**Review version:** 0.3  
**Last updated:** 2026-10-24

## 1. Project story

The candidate has an established technical background in software support and troubleshooting but finds relatively few conventional job postings that provide a credible transition into game development. Relevant opportunities may appear under unfamiliar titles, at studios with appropriate technical teams, or through speculative applications rather than advertised vacancies.

The application should reduce the time and repeated effort required to discover studios, verify application routes, understand each studio, evaluate potential fit, analyze a CV, write credible personalized outreach, and track conversations.

The product is a personal opportunity-discovery and professional-outreach system, not a bulk-email sender and not a guarantee of employment.

## 2. Primary user and goals

The initial product is for one user. The candidate profile is editable and should contain professional facts, interests, preferences, constraints, and communication guidance.

Primary user story:

> As a technical professional seeking to transition into the video game industry, I want to discover relevant studios and opportunities worldwide, understand how my existing skills could contribute, and prepare personalized professional outreach, so that I can create opportunities beyond conventional job applications and manage the process systematically.

Success means helping the user move from discovery to a researched, reviewed, ready-to-send introduction with less repetitive manual work. A reply or job offer is not guaranteed and is not a controllable acceptance criterion.

## 3. Product principles

1. **Global by default:** Do not restrict discovery to a predetermined country list.
2. **Evidence over assumptions:** Important external claims need traceable sources and freshness metadata.
3. **Explicit uncertainty:** Distinguish verified facts, plausible leads, unknown information, and outdated claims.
4. **Human-controlled outreach:** The user reviews and sends every email or application manually.
5. **No invented credentials:** Never invent skills, work history, achievements, personal game preferences, credits, contacts, or salary facts.
6. **Flexible role discovery:** Match transferable skills and plausible stretch opportunities, not just exact job-title strings.
7. **Cost-conscious:** The first usable release must not require paid AI API access.
8. **Privacy by design:** Treat candidate information, CVs, correspondence, and application history as private.
9. **Living requirements:** Scope and decisions can evolve through documented changes.
10. **Practical over elaborate:** Prioritize an end-to-end useful workflow before broad crawling or advanced AI.

## 4. Scope

### In scope

- Editable candidate profile and approved professional story/disclosure settings.
- Global game-studio discovery, advertised opportunities, speculative application routes, and manual lead entry.
- Evidence-backed studio profiles: sites, business type, ownership, notable games, distinct development/publishing/porting credits, career channels and verification dates.
- Scheduled and manually triggered GitHub Actions discovery with normalized snapshots and change events.
- Static browser interface deployed with GitHub Pages, backed by public studio/opportunity data only.
- Browser-side resume upload, text extraction, rules-based comparison, preview, and downloadable tailored DOCX/PDF generation.
- Repository-managed, source-linked resume guidance material.
- Optional manual AI handoff: user can copy a context-specific prompt to ChatGPT and paste reviewed suggestions back.
- Transparent role-family matching, transferable-skill analysis, gap/unknown identification, and employment-feasibility notes.
- Studio-specific email/application drafting and pre-send review.
- Client-side private profile, CV-derived content, drafts, and application history with encrypted local persistence/export/import.
- Manual tracking of submissions, responses, reminders, and outcomes.
- Optional sourced salary estimates that do not filter or rank opportunities.
- Private source repository, separate public deployment target if using GitHub Free Pages, tests, backups and maintainable documentation.

### Out of scope for the first release

- A server-side application or private cloud database hosted directly by GitHub Pages.
- Automatic AI API calls from the static frontend.
- Automatic emailing or job-application submission.
- Storing resumes, private drafts, personal application history, secret keys, or personal contact notes in the public Pages repository/data feed.
- Promise of exhaustive discovery of every studio worldwide.
- Bypassing access controls, CAPTCHA or anti-bot protections.
- Paid AI, search or hosting services as a hard first-release dependency.
- A multi-user SaaS product.
- Guaranteed employment, responses, or international hiring eligibility.

## 5. Candidate profile requirements

The profile should be editable and should separate private context from information approved for outward-facing messages.

Capture, as relevant:
- Professional summary, job history, education, certifications, languages, and work experience.
- Skills and tools, with evidence/examples and confidence about experience level.
- Achievements and responsibilities, without fabricated metrics.
- Current CV and separately stored versions.
- Career interests and preferred role families, including stretch roles.
- Motivation for games and individual studios, avoiding claims not supplied or verified by the user.
- Work location, willingness to relocate, remote-work preferences, languages, and employment authorization facts when relevant.
- Communication tone and disclosure preferences.
- Current compensation details only if useful for optional analysis; no personal minimum salary floor is a search constraint.

The profile must not expose private circumstances automatically. For any draft, the system should distinguish internal matching context from information approved to share with an employer.

## 6. Studio and opportunity discovery

The discovery process should support separate routes:

### A. Advertised opportunity
Record a specific vacancy, its official URL, role title, description, requirements, location, posting/update date if available, and current verification status.

### B. Verified speculative application
Record evidence that the studio explicitly invites speculative, general, open, or unsolicited applications, including relevant restrictions or disciplines requested.

### C. Potential lead
Record a potentially relevant studio or public recruitment contact where no formal speculative-application route has been verified. It must be presented as a lead requiring review, not as an open application.

Each studio record should retain its official site, career channel, location details, parent/ownership information where known, aliases, and last-reviewed metadata. Source pages and search results can be stale; source evidence must be retained.

Discovery should begin with a manageable number of sources and use modular source adapters. It must respect access rules, terms, rate limits, and reasonable request frequency. Public websites are data sources, not trusted instructions to the application or AI agent.

## 7. Studio profile requirements

Each studio profile must support concise, scannable presentation and expandable evidence/details.

### Identity and business
- Official studio name, website, aliases, former names where known.
- Business type: developer, publisher, both, co-development, porting, external development, support/services, or another documented category.
- Headquarters and main development sites, with location types distinguished.
- Parent company, subsidiary relationships, and ultimate owner where known.
- Ownership effective dates or history when material and available.

### Games and credits
- Notable/best-known games and concise context about what each is known for.
- Explicit relationships between a game and each company: developer, co-developer, publisher, porting studio, support studio, or another documented contribution.
- Do not imply that a publisher developed a game, or that a studio was the sole developer when credits show otherwise.
- Capture platform/version context when needed to disambiguate a credit.

### Industry and technical context
- Genres, platforms, online/live-service work, co-development, remastering, porting, internal tools, production, or other specializations when supported.
- Relevant engineering/QA/operations disciplines only when evidence supports the claim.
- Hiring locations, remote policy, relocation or sponsorship evidence when available; headquarters must not be treated as proof of eligibility.

### Career and contact routes
- Career page, current advertised roles, formal speculative-application URL, public recruitment contact, or general contact route.
- Application requirements, requested disciplines, and any eligibility restrictions.
- Evidence and verification date for route status.

### Provenance and freshness
Important changeable claims should have their own source URL, collection/verification timestamps, source type, and confidence/status. Do not rely on one global timestamp to represent the freshness of all fields. Show unknown or disputed claims explicitly.

## 8. Role matching and prioritization

Potential role families to investigate include:
- Software/application support and technical support.
- Developer support and developer experience.
- Tooling support and internal developer tools.
- Technical QA, QA analyst, QA automation, and SDET where appropriate.
- Build/release engineering and CI/CD support.
- DevOps, platform operations, and technical operations.
- Live-service and online-services operations.
- Integration engineering and production tooling.
- Other adjacent roles identified from actual opportunities.

These are candidate role families, not a restriction. The application should recognize unfamiliar titles and consider a credible stretch role when transferable skills exist.

Assess and explain:
- Technical fit based on evidenced skills.
- Transferability and the size/type of skill gaps.
- Relevance to game production and development teams.
- Location, language, remote-work and work-authorization feasibility.
- Compensation information status when available, without using salary as a personal filtering constraint.

Use transparent labels such as Strong fit, Potential stretch, Unclear—investigate, and Low relevance. Explain the reasons. Unknown information is not automatically a negative mismatch. Avoid opaque scores unless a later requirement establishes a transparent, explainable method.

## 9. CV analysis and document generation

The resume workflow must run in the browser for the initial GitHub Pages release, without uploading the original file to a server by default.

Requirements:
- Allow the user to select a local DOCX or text-based PDF resume; record format and extraction warnings.
- Use browser-compatible parsing libraries for supported formats. Clearly identify scanned PDFs or unsupported structures rather than pretending the text was extracted correctly. OCR is not required in the initial release.
- Compare the approved candidate profile and extracted resume content with a selected studio or opportunity.
- Report demonstrated matches, partial/transferable matches, missing or unclear evidence, relevant content omitted from the resume, and unsupported claims.
- Offer deterministic, reviewable edits: section ordering, relevant skills and experience emphasis, bullet structure, length, typography, headings, links and formatting.
- Generate a suggested resume using an editable structured representation and approved template, with downloadable DOCX and PDF output.
- Keep the original file unchanged. Show a before/after review of proposed edits, and do not assert that the generated document exactly preserves the source file's arbitrary layout.
- Process the selected file in browser memory where practical. Do not upload, log, commit or transmit resume text unless the user explicitly chooses a separate service interaction.
- Keep the resume-guidance rules in versioned Markdown files under docs/resume-guidelines/ with sources, review dates, rationale, and context-sensitive caveats.
- Support ATS-friendly technical resume defaults without claiming that any document can be guaranteed ATS-compatible.
- Preserve an audit trail linking each generated version to the role, selected profile/CV version, guidance version, and user edits where practical.

The first release must use deterministic/rule-based analysis and layout as its baseline. Optional manual AI-assisted revision is allowed through a user-mediated prompt/copy/paste workflow. Direct model API integration requires a future architecture and privacy/cost decision.

Never invent education, employment, skills, game credits, achievements, metrics, qualifications, or responsibilities. Describe gaps honestly rather than silently rewriting them as experience.

## 10. Draft generation and pre-send analysis

Each draft must use:
1. The user's approved professional profile and CV.
2. Verified studio/opportunity evidence.
3. The chosen application route and goal.
4. A relevant contribution hypothesis supported by the user's experience.

Check:
- Studio-specific personalization.
- Relevance of experience to role/team.
- Claims supported by profile/CV evidence.
- Generic or spam-like wording and excessive flattery.
- Professional, concise, authentic tone and readability.
- Whether the studio requires a specific form or procedure.
- Unapproved sensitive/personal disclosures.

Provide findings and actionable suggestions, not only a numeric score. Text analysis cannot guarantee how a recipient mail system classifies spam.

The user sends all messages and applications manually. Draft generation must not mark an application as sent. User confirmation is required to record submission.

## 11. Application tracking

Track studio, opportunity/application route, status, dates, message version, CV version, contact channel, manual submission confirmation, replies, follow-ups, interviews, outcomes, and notes.

Suggested lifecycle:
Discovered → Needs research → Qualified → Shortlisted → Draft ready → Reviewed → Sent → Response received → Interview → Offer / Rejected / Withdrawn.

Follow-up scheduling should be a separate action/date, not a substitute for application status. The user may update states manually. Preserve interaction history and avoid accidentally duplicating applications.

## 12. Optional salary estimates

Salary estimates are a P2 enhancement and must never exclude, rank down, or otherwise filter a studio or opportunity.

Potential role families include software/application support, developer support, tooling support, build/release engineering, technical QA, QA automation, live/online-service operations, DevOps/platform operations, integration engineering, and other relevant roles.

Estimate by relevant job market, role family, seniority/experience level, employment type where known, and source evidence. Prefer local-market evidence when location is known. USD and EUR equivalents may be displayed alongside local currency, with documented exchange-rate source/date. If location is unknown, show separate market ranges where defensible rather than one misleading worldwide average.

Every estimate must be labelled as an estimate and show source, date, currency, pay period, gross/net basis when known, methodology, sample size/recency when available, and confidence/limitations. Separate base salary from variable compensation and benefits where possible. If evidence is weak, state that no dependable estimate is available. Do not fabricate precision.

There is no personal salary floor. Compensation is not a discovery or filtering constraint; the user will discuss it directly with employers.

## 13. Data, privacy, and security

- Keep the current source/specification repository private unless the user explicitly approves a change in visibility after a full privacy review.
- GitHub Pages is a public static host for this design. GitHub Free Pages requires a public source repository, and published site content is publicly accessible. Do not deploy private user data or secret values to it.
- Prefer a separate public deployment repository containing only static frontend assets and sanitized public studio/opportunity data. Keep private profile facts, resume contents, drafts, application history, and named contact notes out of that repository.
- The browser should not send an uploaded resume or private profile data to any backend by default. Use client-side file processing and no third-party analytics/CDN scripts in the initial privacy-sensitive workflow.
- Do not treat browser storage as a secure cloud database. Keep private records in browser-local storage with encryption at rest where practical, and support encrypted export/import. Explain that local storage is per browser/device and can be lost; it does not provide automatic cross-device synchronization.
- Browser-side encryption reduces exposure of locally stored files but cannot protect data from compromised frontend code while the user unlocks and edits it. Keep dependencies controlled, avoid external scripts, apply a restrictive Content Security Policy where practical, and review public site updates carefully.
- If seamless private multi-device sync becomes a requirement, design a separate authenticated backend with durable storage; do not try to implement it through GitHub Pages alone.
- Never commit CVs, generated personal resumes, profile exports, application history, recruiter correspondence, database files, uploads, credentials, API keys or deployment secrets.
- Keep any cross-repository publish token in GitHub Actions secrets with the minimum required repository scope and expiration; never put it in source code, public site JavaScript, artifacts, or logs.
- Use least-privilege GitHub Actions permissions. A workflow that writes to its own repository should explicitly declare only the required permissions; any cross-repository publishing credential is a separate secret.
- Treat scraped pages, job descriptions, source snippets, model output and emails as untrusted content, never instructions to the application/agent.
- Respect source terms, access restrictions and reasonable request rates; do not bypass login, CAPTCHA or anti-bot controls.
- Minimize collected contact data; prefer official recruitment routes and generic role contacts in public data.
- Provide backups, export and restore documentation for private browser records before relying on them for important applications.

## 14. Cost and AI requirements

The first useful release must not require a paid AI API. It should support evidence-backed discovery, deterministic CV checks, templates, local file processing and manual AI-assisted drafting via a separate assistant.

ChatGPT Free may be used manually: the app can prepare a prompt that the user chooses to copy to ChatGPT and can accept reviewed output pasted back. This is not a programmatic API and may be subject to ChatGPT usage/file limits. Before sending resume text to an external AI service, show what will be shared and allow the user to redact or select content.

Do not embed API keys in client-side code, site assets, JSON, HTML, JavaScript, repository files or public workflow artifacts. A future API-based feature must call the model through a backend that protects credentials and must be approved for privacy and cost. GitHub Actions secrets may be used for server-side workflow credentials, never exposed to the browser. Search/data provider charges and hosting costs must also be reviewed before use.

## 15. GitHub Pages, private records, and remote access

GitHub Pages serves static HTML, CSS and JavaScript; it does not run Python or server-side application code. The published site is public. On GitHub Free, Pages requires a public source repository. Therefore, the current private source repository must not simply be switched to public without an explicit privacy review.

### Recommended first-release arrangement

- Keep this source/specification repository private.
- Publish the static website and sanitized public studio/opportunity JSON to a separate public Pages deployment repository.
- Use the private repository's GitHub Actions workflow to scan sources, update the private canonical data/state, build the static site, and publish only approved public files to the deployment repository.
- Use a narrowly scoped, expiring deployment credential stored as a GitHub Actions secret if cross-repository publishing is required. Never expose it in the deployed files or logs.
- Keep candidate profile, original resume, tailored resume files, private drafts and application/interaction history in browser-local encrypted storage and user-controlled encrypted exports. Do not publish them to the site repository.
- Allow manual encrypted export/import to move private records between devices. Explain that this is not automatic syncing and that browser-local data can be cleared or lost.
- Provide a local/offline fallback where feasible.

This is the lowest-cost way to combine a public static site with a private development repository and avoid putting personal data in a public dataset. It introduces a second, public deployment repository and a publish secret; that complexity must be weighed against publishing the entire codebase openly.

### Future alternative

If private cloud storage and automatic multi-device synchronization become necessary, add a separate authenticated backend with a persistent database/storage layer. Keep the static Pages frontend if desired, but send private operations only to the authenticated backend. Model API keys remain server-side. Do not expose a public unauthenticated endpoint for CV analysis or private records.

## 16. Maintainability and quality

- Separate the static UI, browser-local private data services, generated public data contract, and Python discovery runner.
- Store studio sources/seed registry separately from normalized output and change history.
- Implement a scheduled GitHub Actions workflow with manual dispatch. A registry change may also trigger a run for prompt verification.
- Use a non-top-of-hour schedule in Europe/Budapest; schedules can be delayed and run only from the default branch. Add visible run status and failure reporting.
- Add per-domain rate limits, bounded timeouts/retries, cache validators where supported, normalized field comparisons and duplicate detection.
- Never interpret a timeout, block, parse failure or empty error response as evidence that a vacancy closed.
- Store only necessary normalized fields, evidence URLs and hashes; avoid committing full scraped page bodies.
- Commit generated public data only when there is a meaningful data or status change; don't repeatedly rewrite unchanged content merely to update a timestamp.
- Test parsing and change detection with static fixtures, not only live websites.
- Add security checks ensuring private resume/application fields cannot be included in the public export.
- Keep frontend and Python dependency sets separate and documented.
- Maintain automated tests for data schema, normalization/deduplication, change states, privacy boundary, resume analysis, output generation and tracking behavior.
- Document setup, source access limitations, manual fallbacks, and recovery of private data.
- Explicitly ask for approval before commits and report tests and diffs.

## 17. Priority definitions

- **P0 — Essential:** needed for the first useful end-to-end release.
- **P1 — Important:** valuable improvements after core workflow works.
- **P2 — Optional/later:** enhancements that must not delay the first useful release.

Core studio identity, main locations, ownership relationships, game-credit roles, source evidence, and verification status are P0. Richer ownership timelines, advanced reporting and salary estimates are P1/P2 as recorded in IMPLEMENTATION_PLAN.md.

## 18. Acceptance criteria

- AC-01: User profile is editable and reused across research, matching, and drafts.
- AC-02: Studios/opportunities can be added manually even if discovery fails.
- AC-03: Advertised jobs, verified speculative routes, and potential leads are distinct.
- AC-04: Every verified application route has official evidence and a verification timestamp.
- AC-05: Studio profiles distinguish business type, sites, ownership, titles, and company credit roles.
- AC-06: Important external claims retain source and claim-specific verification metadata.
- AC-07: Duplicates and obsolete routes are identified/flagged.
- AC-08: Fit assessments explain evidence, gaps, and unknowns.
- AC-09: CV analysis is truthful and preserves original versions.
- AC-10: Drafts are studio-specific, evidence-linked, editable and saved with version/history.
- AC-11: Pre-send checks identify generic language, unsupported claims, privacy concerns and channel instructions.
- AC-12: No email is sent automatically; only user confirmation records a submission.
- AC-13: Responses, follow-ups, interviews, offers and other outcomes can be tracked.
- AC-14: Personal data and secrets are excluded from source control by default.
- AC-15: The initial useful workflow works without a paid AI API.
- AC-16: The GitHub Pages deployment contains only public UI assets and an allowlisted public data feed; private profile/resume/application data is not published.
- AC-17: Optional salary estimates disclose evidence, market, date, pay basis, currency handling and uncertainty, and do not filter opportunities.
- AC-18: Core data operations and workflows are tested; failures are visible and recoverable.
- AC-19: A scheduled and manually triggered discovery workflow checks the registered studio sources and records structured results.
- AC-20: Change detection distinguishes new, updated, explicitly closed, stale/unavailable, and needs-review states; fetch/parse failures never auto-close a role.
- AC-21: The public data export contains only approved public studio/opportunity information and cannot include personal candidate records or private contacts.
- AC-22: Resume file selection, extraction, rule-based analysis, preview and DOCX/PDF generation run client-side by default; originals remain unchanged.
- AC-23: Resume-generation guidance is versioned, source-linked, reviewed, and available to the analysis/drafting process.
- AC-24: Optional manual AI handoff requires the user to review the text to be shared and never requires an API key.
- AC-25: No API key, deploy token, or other secret appears in client code, public assets, logs, or generated public data.
- AC-26: Private user data supports encrypted export/import and has documented local-storage loss and cross-device limitations.
- AC-27: Cross-repository publishing uses a scoped GitHub Actions secret and does not publish private source files.

## 19. Living document and change management

Requirements will evolve as new needs, data sources, deployment constraints, and real outreach outcomes emerge. Changes should be recorded with the rationale, affected requirements, privacy/cost/architecture impacts, and implementation status. Update this file and the relevant architecture/plan/decision documents after an approved material change.

The current specification is a starting baseline, not a claim that all future needs are known.
