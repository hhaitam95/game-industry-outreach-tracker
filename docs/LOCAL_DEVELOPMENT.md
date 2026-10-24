# Local Development and Feedback Workflow

**Default:** GitHub Actions is the primary validation environment. You do not need to run tests locally for routine changes unless you want to review the interface or investigate a machine-specific issue.

## 1. One-time macOS prerequisites

The frontend uses Node.js 24 LTS and npm 11. Python and a local backend are not required for Phase 1.

### Check what is already installed

Open **Terminal** and run:

```sh
node --version
npm --version
git --version
brew --version
```

Expected: Node reports `v24.x.x`, npm reports `11.x.x`, Git reports `git version x.y.z`, and Homebrew reports its version. If Node/npm or Git already work, do not reinstall them unnecessarily.

### Install missing tools with Homebrew

If Homebrew is not installed, open Terminal and run the official installer:

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow any PATH setup instructions printed by the installer. This command installs Homebrew; it is not needed if `brew --version` already works.

Once Homebrew is available, install Node.js 24 and Git:

```sh
brew install node@24 git
echo 'export PATH="$(brew --prefix node@24)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Verify again:

```sh
node --version
npm --version
git --version
```

Expected: Node `v24.x.x`, npm `11.x.x`, and a Git version. If the Node or npm major version differs, stop and resolve that before running project checks.

## 2. Open the repository in VS Code

Open the existing repository clone in VS Code, then open **Terminal → New Terminal**. Change to the repository root if needed; this is the folder containing `package.json`.

If you do not already have the repository locally, clone the private repository using your configured GitHub authentication:

```sh
git clone --branch feat/static-frontend-shell --single-branch https://github.com/hhaitam95/game-industry-outreach-tracker.git
cd game-industry-outreach-tracker
```

Install the exact versions recorded in the lockfile:

```sh
npm ci
```

Expected: npm installs the packages and exits with code 0. Do not continue if npm reports a lockfile mismatch or dependency installation error.

## 3. Recommended VS Code extensions

The repository recommends the ESLint and Prettier extensions. If the `code` command is available, run:

```sh
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

Expected: VS Code reports that each extension was installed. If `code` is not found, open the VS Code Command Palette and choose **Shell Command: Install 'code' command in PATH**, then repeat the commands. No Python interpreter, virtual environment, Docker service, or local database is needed for Phase 1.

The repository includes workspace recommendations and settings under `.vscode/`. Reopen the folder after installing extensions if VS Code does not show them as active.

## 4. Optional local checks

Usually, let GitHub Actions run the checks automatically after a branch push. To run everything locally after editing, use the one-command feedback flow in the next section.

If diagnosing a specific issue, these individual commands are available from the repository root:

```sh
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Expected results:

- `npm run format:check`: Prettier says all matched files use the expected style.
- `npm run lint`: exits with code 0 and no lint errors.
- `npm run typecheck`: exits with code 0 without TypeScript diagnostics.
- `npm test`: reports 9 passing tests and 0 failures.
- `npm run build`: creates `dist/` and reports a successful Vite production build.

An empty successful output from lint or type checking is normal. Always check the command's exit code, not just whether it printed text.

## 5. Optional browser preview

To view the shell on your Mac:

```sh
npm run dev
```

Expected: Vite prints a local URL, normally http://localhost:5173/. Open that URL in your browser. Use the sidebar to navigate to each placeholder. No real studio list, profile, resume, or application is loaded.

Stop the dev server by returning to Terminal and pressing `Ctrl+C`.

To verify a repository-subpath build explicitly:

```sh
VITE_BASE_PATH=/game-industry-outreach-tracker/ npm run build
```

Expected: the build succeeds and the generated HTML/asset references use the configured subpath. This is a build check, not a public deployment.

## 6. One-command local-to-AI feedback report

From the repository root, run:

```sh
npm run feedback-report
```

The command:

1. Reports whether a branch was detected, a short commit identifier, and Node/npm/Git versions; the branch name is omitted.
2. Reports only the number of changed paths; filenames, branch names, diffs, and source files are omitted.
3. Runs Git's whitespace check, formatting, lint, type checking, unit tests, and the production build.
4. Writes `feedback-report.md` in the repository root and prints the same Markdown to the terminal. The report file is ignored by Git.

Copy the entire report from the terminal, or open `feedback-report.md` and paste its contents into the conversation. If a check fails, the script adds only fixed diagnostic-category labels and suggests a next step. It never copies free-form diagnostic lines, which could contain personal details despite pattern-based redaction. It does not include raw logs, source content, test output, filenames, or diffs.

### Privacy limitation

The report does not copy arbitrary command stdout/stderr into its output. Failed checks are summarized with fixed diagnostic categories, and raw unit-test output is omitted. The separate helper includes pattern-based functions tested against common sensitive values, but these functions are not a guarantee that every secret, name, or personal detail can be detected. Review the generated report before sharing it.

## 7. Cloud-first troubleshooting

The source repository's GitHub Actions run is authoritative for the committed revision. A local report can explain local setup failures or uncommitted work, but it does not replace the CI log. When asking for help, paste the report first; the assistant can inspect the corresponding GitHub workflow and repository state directly. Never paste your resume, raw private exports, credentials, or unredacted logs.

## 8. Common outcomes

- **`npm: command not found`**: install Node.js 24 using the steps above, reopen Terminal, and verify `node --version` and `npm --version`.
- **`npm ci` fails**: retain the error summary, check the Node/npm versions, and do not delete or regenerate the lockfile as a workaround.
- **Cloud CI passes but local checks fail**: compare your Node/npm versions and ensure `npm ci` was run in the repository root.
- **Local checks pass but cloud CI fails**: share the cloud Actions run URL or ask the assistant to inspect the run; do not repeat tests needlessly.
