# Project Specifications

**Status:** Approved baseline for initial scaffolding; living document  
**Review version:** 0.2  
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

- Candidate profile and professional story.
- CV upload/reference, baseline analysis, and optional tailored variants.
- Discovery of game studios and game-industry employers worldwide.
- Discovery of advertised vacancies and formal speculative/open-application routes.
- Potential leads where no formal open route is confirmed, clearly marked for manual investigation.
- Studio profiles: sites, business type, ownership, notable games, credits, specialization, careers channels, and evidence.
- Public and relevant professional/recruitment contacts where available.
- Role-family matching, transferable-skill analysis, gaps, and employment-feasibility notes.
- Personalized email/application drafting and quality analysis.
- Manual application tracking, response history, reminders, and reporting.
- Optional salary estimates using documented data and methods.
- Private remote access planning, backups, exports, tests, and maintainable documentation.

### Out of scope for the initial release

- Automatically sending emails, submitting applications, or contacting recruiters.
- Promising exhaustive global coverage.
- Scraping login-protected or access-restricted platforms, bypassing bot controls, or collecting private contact details.
- A multi-user SaaS product or public directory.
- Automatic acceptance/rejection decisions without human review.
- Paid AI or data APIs as a hard dependency.
- A guarantee that a discovered company has budget, a suitable vacancy, or international hiring eligibility.

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

## 9. CV analysis

The CV analyzer should provide:
- Baseline review of structure, clarity, readability, consistency, skills evidence, claims, and potential parsing issues.
- Comparison against a specific role or studio opportunity.
- Requirements met, partially met, transferable, missing, or unclear.
- Experience or achievements underemphasized in the CV.
- Suggested edits and reasons.
- Separate storage of original and revised variants.

Never invent education, employment, skills, project credits, achievements, metrics, or responsibilities. A gap should be described honestly rather than silently rewritten as experience.

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

The candidate's current reported compensation is approximately HUF 700,000 net per month, with approximately HUF 200,000 rent, as optional context only. This is not a personal salary floor and must not shape discovery or filtering. The user will discuss compensation directly with employers.

## 13. Data, privacy, and security

- Treat candidate profile, CV files, correspondence, private notes, and application history as sensitive personal data.
- Keep a private repository. Never commit private data, databases, uploads, credentials, API keys or deployment secrets.
- Use environment/configuration files for settings and keep real secret files out of version control.
- Plan private remote access early. Do not expose a public unauthenticated dashboard or database.
- Assess authentication, secure transport, durable storage, backups, restore procedure, exports, and least-privilege access before remote deployment.
- Do not assume free hosting supports adequate privacy or persistent storage. Maintain a local fallback if necessary.
- Minimize collected personal information about contacts; use public professional/recruitment details that are relevant to the application.
- Respect source terms, rate limits and access restrictions.
- Validate external data and handle external page text as untrusted input; never follow instructions embedded in scraped content.
- Log errors without leaking secrets or unnecessary personal data.
- Provide backups and a documented restore process before the application is used for meaningful application history.

## 14. Cost and AI requirements

The first usable release must not require paid AI API access. Provide a useful workflow through structured data, rule-based checks, templates, evidence-backed research, and manual AI-assisted drafting in a separately opened assistant when appropriate.

ChatGPT subscription access must not be treated as a programmatic API credential. Any future API/model integration should be optional, replaceable, configurable, and approved for cost before use. The same cost review applies to search/data providers and hosting.

## 15. Remote/private hosting

Design the application with private remote access in mind, but do not select a provider until its capabilities and current terms are verified.

Requirements:
- Authentication and access restricted to the user.
- Persistent data and file storage across restarts/deployments.
- Secret/configuration management outside the repository.
- Backup, restore, and export.
- Secure transport and appropriate session protection.
- Documented hosting cost and free-tier limitations.
- Local development/fallback option.
- No public deployment with private candidate data before security review.

Free AI and free hosting are separate requirements. If no reliable zero-cost private hosting option is appropriate, explain the trade-off and request a decision rather than silently exposing data.

## 16. Maintainability and quality

- Modular discovery/source adapters and separation between data access, services, UI, AI assistance, and tracking.
- Database migrations or a documented safe schema-evolution strategy.
- Automated tests for essential matching, evidence, duplicate handling, data operations, drafting checks, and application states.
- Clear handling of request failures, malformed pages, rate limits, timeouts, and stale data.
- Deduplication and idempotent import where feasible.
- Structured logs and a record of discovery runs/source failures.
- CSV/JSON export and backup/restore.
- Documentation for setup, decisions, current implementation state, and handoff to another AI chat.
- Explicit user approval before repository commits; summarize changes and test results first.

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
- AC-16: Remote deployment is private, authenticated, persistent, backed up, and documented before storing real private data.
- AC-17: Optional salary estimates disclose evidence, market, date, pay basis, currency handling and uncertainty, and do not filter opportunities.
- AC-18: Core data operations and workflows are tested; failures are visible and recoverable.

## 19. Living document and change management

Requirements will evolve as new needs, data sources, deployment constraints, and real outreach outcomes emerge. Changes should be recorded with the rationale, affected requirements, privacy/cost/architecture impacts, and implementation status. Update this file and the relevant architecture/plan/decision documents after an approved material change.

The current specification is a starting baseline, not a claim that all future needs are known.
