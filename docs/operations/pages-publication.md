# Phase 8 — Same-repository GitHub Pages publication runbook

## Public output model

The canonical repository is `hhaitam95/game-industry-outreach-tracker` and is already public. ADR-055 supersedes the previous proposal for a second output-only repository. GitHub Pages publishes only the generated Vite `dist/` artifact; it does not serve the repository's other files as part of the website.

Expected URL:

https://hhaitam95.github.io/game-industry-outreach-tracker/

Only generated static HTML, CSS, JavaScript, and the schema-validated public opportunity snapshot may reach the artifact. Private vault records stay in browser-local storage and are not inputs to the build.

## One-time Pages setup

In the original repository, open Settings → Pages. Under Build and deployment, set Source to **GitHub Actions**. This is the only one-time GitHub setting required for the selected deployment model.

No second repository or deployment secret is needed. The workflow uses a read-only build job and a dedicated deployment job with only `pages: write` and `id-token: write`.

The connected implementation tools do not expose GitHub Pages settings or workflow dispatch, so the owner needs to perform the one-time Source setting in GitHub and explicitly start the first publish run after the prerequisite PRs are merged. Never paste credentials into chat; the same-repository design does not require a deployment credential.

## Safe workflow use

Open Actions → Public Pages release in the source repository and select the `main` branch.

- **validate-only (default):** runs formatting, lint, type checking, unit/component tests, dependency audit, registry checks, build, privacy checks, artifact checks, and the same-repository path/asset smoke test using the synthetic sample dataset. It does not sync the current public snapshot, upload a Pages artifact, or deploy.
- **publish:** may be selected only from `main`. It syncs the existing public snapshot from `discovery-state` through the shared schema validator, runs all quality/build/privacy checks, uploads only `dist/` as a Pages artifact, and deploys that artifact to this repository's Pages site. It does not run discovery and introduces no schedule.

A failed snapshot check, build, privacy gate, artifact check, or base-path smoke test must stop before the artifact is uploaded or deployed. Review the run and the public data before the first publish. GitHub Pages is public; browser profile/draft/application data is not uploaded, synced, or backed up by Pages.

## Review and rollback

Before the first publication, inspect the workflow run and the public site URL. Check that the role snapshot displays its provenance/freshness notes, no private data is present, and `index.html` plus local JavaScript/CSS assets load from the repository path.

If a published build is wrong, fix or revert the source/workflow change and manually publish the last known-good revision from `main`. Do not force-push or delete history. A failed new deployment must not be reported as published; the last successful Pages deployment remains the known-good state until another deploy succeeds.
