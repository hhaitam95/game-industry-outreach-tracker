# Phase 8 — Public Pages publication runbook

## Public output model

The source repository remains the canonical code and CI location and is already public. The separate output-only target is hhaitam95/game-industry-outreach-tracker-site. GitHub Pages serves that target's main branch root at:

https://hhaitam95.github.io/game-industry-outreach-tracker-site/

Only generated Vite dist output is copied into the target. The public opportunity snapshot is bundled at build time only after the existing shared schema validator accepts it. Private vault records are browser-local and are not inputs to the snapshot sync or static build.

## One-time target setup

1. Create the public repository hhaitam95/game-industry-outreach-tracker-site with an initial README so its main branch exists. Treat the repository as generated output; do not store personal files, issues exports, credentials, or unrelated source code in it.
2. In the target repository, open Settings → Pages. Select deployment from a branch, choose main and the root folder, save, and require HTTPS once the Pages URL is active. Do not add a custom domain as part of this phase.
3. Create a fine-grained personal access token with repository access limited to hhaitam95/game-industry-outreach-tracker-site and Contents: Read and write only. Give it an expiration date. Do not grant organization, administration, Actions, or unrelated-repository permissions.
4. In the source repository settings, open Settings → Secrets and variables → Actions → Secrets and add the token as PUBLIC_PAGES_TOKEN. Never put the value into a file, variable, build argument, or chat. Do not print it in a workflow log.
5. Make sure the target main branch accepts this automation's fast-forward updates. The workflow replaces the root with generated output and skips commit/push when the output is unchanged.

The connected implementation tools currently support repository/file/branch/PR writes, but do not expose repository creation, Actions-secret writes, or Pages-settings configuration. Until those one-time settings exist, publish mode will stop before it downloads the public snapshot or writes to a target.

## Safe workflow use

Open Actions → Public Pages release in the source repository and select the main branch.

- validate-only (default): runs formatting, lint, type checking, unit/component tests, dependency audit, registry checks, build, privacy checks, artifact checks, and the target-path preview smoke test using the synthetic sample dataset. It does not sync the current snapshot or write to the target repository.
- publish: requires the configured token and an accessible target main branch. It syncs the existing public snapshot from discovery-state through the shared schema validator, runs all build/privacy checks, and only then copies dist output to target main. It does not run discovery and introduces no schedule.

Do not select publish until the target and secret are configured and the latest PR checks are green. GitHub Pages output is public; browser profile/draft/application data is not uploaded, synced, or backed up by Pages.

## Review and rollback

Before the first publication, inspect the workflow run, target commit and public site URL. Check that the role snapshot displays its provenance/freshness notes, no private data is present, and index.html plus local JavaScript/CSS assets load from the target repository path.

If a published build is wrong, restore the previous known-good build by reverting the target repository's latest publication commit and pushing the revert. Do not force-push or delete history. If the token may have been exposed, revoke it in GitHub and create a new target-scoped token before another publication.
