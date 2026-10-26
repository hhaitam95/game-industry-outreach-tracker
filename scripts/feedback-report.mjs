import { spawnSync } from "node:child_process";
import { chmodSync, writeFileSync } from "node:fs";
import { safeDiagnosticLines } from "./report-safety.mjs";

const reportPath = "feedback-report.md";
const timeoutMs = 180_000;
const tick = String.fromCharCode(96);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 2 * 1024 * 1024,
    windowsHide: true,
    ...options,
  });
  return {
    status: result.status,
    signal: result.signal,
    error: result.error?.message,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function firstLine(name, result) {
  if (result.error || result.status !== 0) return "unavailable";
  const line = (result.stdout || "").trim().split(/\r?\n/)[0] || "";
  const patterns = {
    "Node.js": /^v\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/,
    npm: /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/,
    Git: /^git version \d+(?:\.\d+){1,3}(?:[-+][\w.-]+)?$/,
  };
  return patterns[name]?.test(line) ? line.slice(0, 40) : "unavailable (version string not recognized)";
}

function changedPathSummary() {
  const result = run("git", ["status", "--short", "--untracked-files=all"]);
  if (result.status !== 0) return ["Git change count unavailable."];
  const entries = result.stdout.split(/\r?\n/).filter(Boolean);
  if (entries.length === 0) return ["No changed paths reported by Git."];
  return [String(entries.length) + " changed path(s) detected; names intentionally omitted for privacy."];
}

function statusLabel(result) {
  if (result.error) return "NOT RUN — command could not start";
  if (result.status === 0) return "PASS";
  if (result.signal) return "FAIL — process ended with signal " + result.signal;
  return "FAIL — exit code " + String(result.status ?? "unknown");
}

function suggestionFor(label, result) {
  if (result.status === 0 && !result.error) return null;
  if (result.error || /not found|enoent|command not found/i.test(result.stderr + result.stdout)) {
    return "Confirm Node.js/npm are installed and run npm ci from the repository root.";
  }
  if (label === "Formatting") {
    return "Review the safe formatting diagnostics, then run npm run format and inspect the resulting diff.";
  }
  if (label === "Lint") {
    return "Review lint diagnostics and fix the source or configuration issue; do not bypass the check.";
  }
  if (label === "Type checking") {
    return "Inspect the reported TypeScript file and line, then rerun npm run typecheck.";
  }
  if (label === "Unit tests") {
    return "Inspect the failed test and its implementation. Raw test output is omitted; ask the assistant to inspect the repository or cloud CI log if needed.";
  }
  if (label === "Production build") {
    return "Inspect the build diagnostics and check VITE_BASE_PATH if the error mentions the deployment base path.";
  }
  if (label === "Privacy boundary") {
    return "Review the privacy-boundary findings locally; do not paste private filenames or matched content into a report.";
  }
  if (label === "Browser vault smoke test") {
    return "Inspect test-results/browser-acceptance-report.md, confirm Chrome/Chromium is available, and rerun the browser test.";
  }
  return "Inspect the repository state and check output, then rerun this command.";
}

const toolVersions = [
  ["Node.js", run("node", ["--version"])],
  ["npm", run("npm", ["--version"])],
  ["Git", run("git", ["--version"])],
];
const branchResult = run("git", ["branch", "--show-current"]);
const commitResult = run("git", ["rev-parse", "--short", "HEAD"]);
const checks = [
  ["Git whitespace check", "git", ["diff", "--check"]],
  ["Formatting", "npm", ["run", "format:check"]],
  ["Lint", "npm", ["run", "lint"]],
  ["Type checking", "npm", ["run", "typecheck"]],
  ["Unit tests", "npm", ["test"]],
  ["Production build", "npm", ["run", "build"]],
  ["Privacy boundary", "npm", ["run", "check:privacy"]],
  ["Browser vault smoke test", "node", ["scripts/browser-vault-smoke.mjs"]],
];

const results = checks.map(([label, command, args]) => {
  const result = run(command, args);
  const diagnostics =
    result.status === 0 && !result.error
      ? []
      : label === "Unit tests"
        ? []
        : safeDiagnosticLines(result.stdout + "\n" + result.stderr);
  return { label, command: [command, ...args].join(" "), result, diagnostics };
});

const changedFiles = changedPathSummary();
const failures = results.filter(({ result }) => result.status !== 0 || result.error);
const lines = [
  "# Local-to-AI Feedback Report",
  "",
  "Please review this report against the current GitHub repository and recommend the next safe fix. Raw logs, source contents, and diffs are deliberately excluded.",
  "",
  "## 1. What was run and what happened",
  "",
  "- Branch: " + (branchResult.status === 0 ? "detected (name omitted for privacy)" : "unavailable"),
  "- Commit: " + (commitResult.status === 0 ? commitResult.stdout.trim() : "unavailable"),
  "",
  "### Tool versions",
  "",
  ...toolVersions.map(([name, result]) => "- " + name + ": " + firstLine(name, result)),
  "",
  "### Changed paths (count only; filenames omitted)",
  "",
  ...changedFiles.map((path) => "- " + path),
  "",
  "### Checks",
  "",
  ...results.map(
    ({ label, command, result }) => "- **" + label + ": " + statusLabel(result) + "** — " + tick + command + tick,
  ),
  "",
  "## 2. Errors or issues I hit",
  "",
];

if (failures.length === 0) {
  lines.push("- No check failures were detected.");
} else {
  for (const failure of failures) {
    lines.push("- **" + failure.label + "**: " + statusLabel(failure.result) + ".");
    if (failure.diagnostics.length > 0) {
      for (const diagnostic of failure.diagnostics) lines.push("  - Safe diagnostic: " + diagnostic);
    } else {
      lines.push(
        "  - Raw output was intentionally omitted because no diagnostic line passed the safety filter, or because this was the unit-test command.",
      );
    }
  }
}

lines.push(
  "",
  "Raw command output, source contents, diffs, resume files, and filenames are omitted from this report. Failed checks are represented by fixed diagnostic categories; arbitrary command output is not copied. This reduces exposure but is not a guarantee that every possible secret or personal detail will be absent from all report fields.",
  "",
  "## 3. Suggested fixes or next steps for you to review",
  "",
);

const suggestions = [...new Set(failures.map((failure) => suggestionFor(failure.label, failure.result)))];
if (suggestions.length === 0) {
  lines.push(
    "- Local checks passed. No immediate fix is suggested; inspect the latest GitHub Actions run for the committed branch as the authoritative cloud result.",
  );
} else {
  lines.push(...suggestions.map((suggestion) => "- " + suggestion));
}
lines.push(
  "- If the issue persists, ask the assistant to inspect the relevant repository files and GitHub Actions logs; do not paste a resume or unredacted secret.",
  "",
);

const report = lines.join("\n");
writeFileSync(reportPath, report, { encoding: "utf8", mode: 0o600 });
chmodSync(reportPath, 0o600);
process.stdout.write(report + "\n");
if (failures.length > 0) process.exitCode = 1;
