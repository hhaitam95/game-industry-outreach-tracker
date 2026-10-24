import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const forbiddenFileExtension = /\.(?:pdf|docx?|sqlite3?|db|pem|key)$/i;
const forbiddenPathSegment = /^(?:private|personal-data|resume-uploads|uploads|exports|backups?)$/i;
const credentialPatterns = [
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];

function walk(directory) {
  if (!existsSync(directory)) return [];
  const findings = [];
  for (const name of readdirSync(directory)) {
    const fullPath = path.join(directory, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (forbiddenPathSegment.test(name)) findings.push("private directory");
      findings.push(...walk(fullPath));
      continue;
    }
    const isEnvironmentExample = name === ".env.example";
    if (forbiddenFileExtension.test(name) || (!isEnvironmentExample && /^\.env(?:\.|$)/i.test(name))) {
      findings.push("private file type");
    }
    const bytes = readFileSync(fullPath);
    if (bytes.includes(0)) continue;
    if (credentialPatterns.some((pattern) => pattern.test(bytes.toString("utf8")))) {
      findings.push("credential-like content");
    }
  }
  return findings;
}

function trackedPathFindings() {
  const result = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error("Could not inspect tracked paths for the privacy boundary check.");
  const findings = [];
  for (const filePath of result.stdout.split("\0").filter(Boolean)) {
    const segments = filePath.split(/[\\/]/);
    const name = segments.at(-1) ?? "";
    const isEnvironmentExample = name === ".env.example";
    if (segments.some((segment) => forbiddenPathSegment.test(segment)) ||
        forbiddenFileExtension.test(filePath) ||
        (!isEnvironmentExample && /^\.env(?:\.|$)/i.test(name))) {
      findings.push("tracked private path");
    }
  }
  return findings;
}

const findings = [
  ...trackedPathFindings(),
  ...walk(path.join(root, "public")),
  ...walk(path.join(root, "dist")),
];
if (findings.length > 0) {
  // Never print filenames or matched text: a path may itself contain personal information.
  process.stderr.write(
    "Privacy boundary check failed: " + findings.length +
    " prohibited path/content finding(s). Review locally without sharing raw filenames.\n",
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    "Privacy boundary check passed: no prohibited private file paths or recognized credentials in tracked paths, public assets, or build output.\n",
  );
}
