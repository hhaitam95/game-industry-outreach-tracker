# Feedback, launch acceptance, and stability

## Where to give feedback

Open [GitHub Issue Forms](https://github.com/hhaitam95/game-industry-outreach-tracker/issues/new/choose) in this repository. Use **Bug report** for a reproducible defect/regression and **Product feedback or enhancement** for usability polish, improvements, and later-version ideas.

**Issues are public.** Never submit a CV/resume, resume text, private profile facts, application records, recruiter correspondence, email addresses/phone numbers from personal records, encrypted-vault exports, credentials, API keys, or unredacted screenshots. Use synthetic data and redact evidence. If a report contains sensitive information, do not add more detail to the public thread; replace it with a sanitized reproduction.

## Triage categories

Every new report is triaged into one of four buckets:

1. **Launch blocker:** a private-data exposure, broken deploy, lost/corrupted vault record, or core workflow that cannot be completed. This blocks the stable release.
2. **Defect/regression:** a reproducible deviation from existing behavior, including browser/asset routing, parsing/export, drafts, or application tracking.
3. **Usability polish:** confusing copy, navigation, accessibility, layout, or avoidable friction that doesn't compromise private data or core functionality.
4. **Later-version idea:** new functionality, broader discovery, analytics, paid services, backend/cloud sync, or other scope expansion. Preserve it in Issues instead of expanding the stable release automatically.

Severity is based on observed user impact and reproducibility, not on the volume of comments. Unknowns should be recorded as unknown rather than inferred.

## Feedback cycle

For each cycle:

1. Test the currently published site using synthetic/test data and open one issue per distinct concern.
2. Triage issues. Prioritize privacy/security and core-flow failures first; choose a small, coherent batch of fixes. Keep unrelated feature proposals for a later version.
3. Implement the batch on a feature branch and PR. All required frontend, browser acceptance, discovery fixture, and privacy/artifact checks must pass before merge.
4. Publish manually using Actions → **Public Pages release** → `publish` on `main` after a successful validation run. Never infer that a merge deployed the website.
5. Retest the deployed behavior and close an issue only after the owner confirms the result, or explicitly defer it with rationale to a later version.

Keep the cycle focused on a few high-impact items at a time. Do not rewrite large areas merely to polish a small issue. Changes to private-data boundaries require particular care and regression tests.

## Initial go-live acceptance checklist

Before considering the first published build accepted, verify:

- The site and local JS/CSS assets load at [the Pages URL](https://hhaitam95.github.io/game-industry-outreach-tracker/).
- The repository-base path works on refresh and navigation.
- Studio/opportunity entries show their source, provenance, freshness, and last-seen caveats; sample records are unmistakably labelled as sample/test data.
- Vault setup, lock/unlock, encrypted backup export/import/restore, and local deletion behave as expected using synthetic records.
- Resume parsing/editing/export works locally, generated content is reviewable, and no uploaded file/raw resume text is silently persisted or transmitted.
- Outreach drafts can be reviewed and versioned; application status/submission requires explicit user confirmation. The app never sends mail or submits an application automatically.
- The public artifact includes only the validated static build/public snapshot; no profile, CV, private draft, application history, contact note, vault export, credential, or token appears in public files or logs.
- All required CI checks pass and no unresolved launch blockers remain.

Record browser/OS differences and known limitations in issues or release notes. Do not claim exhaustive discovery or current availability from `last-seen` sample data.

## Stable release and later versions

Tag `v1.0.0` only after the initial acceptance checklist passes, the owner has completed a few feedback cycles, all required CI is green, no launch-blocking issues remain, and non-blocking limitations are documented. Keep the release tag immutable.

After `v1.0.0`, use GitHub Issues as the backlog for later ideas. A future version should have a focused scope, tests, changelog/release notes, and its own acceptance gate. Do not silently widen the stable version with unrelated features.
