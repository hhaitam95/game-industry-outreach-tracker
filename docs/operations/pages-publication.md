# Pages publication

The public site is deployed to:

https://hhaitam95.github.io/game-industry-outreach-tracker/

The active workflows are:

- .github/workflows/ci.yml: runs discovery unit tests, frontend/data tests and the production build on branches and pull requests.
- .github/workflows/publish-pages.yml: publishes the static website after commits to main.
- .github/workflows/discover-studios.yml: after successful discovery and validation, commits changed public studio data and deploys the updated Pages artifact in the same run.

The site contains only generated static files and the public verified studio directory. Personal tracker data is stored in browser localStorage and is never uploaded to Pages.

Before publishing data changes, the discovery workflow runs the Python discovery tests, frontend tests, studio directory validation, route review and production build. A failure stops publication. Discovery cursors and detailed candidate state are stored on the separate discovery-state branch rather than the public dataset.
