#!/usr/bin/env node
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const forbiddenExtensions = /\.(?:pdf|docx?|sqlite3?|db|pem|key|map)$/i;
const forbiddenPathSegment = /^(?:private|personal-data|resume-uploads|uploads|exports|backups?)$/i;
const credentialPatterns = [
  /\b(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16})\b/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
];
const localAssetPath = /^\/[A-Za-z0-9._~!$&'()*+,;=:@%/-]+$/;

/**
 * Inspect generated static assets without printing paths or matched content.
 * This is a guardrail, not a substitute for reviewing the proposed public data.
 * @param {string} root
 * @returns {string[]}
 */
export function inspectPagesArtifact(root) {
  const findings = [];
  if (!existsSync(root)) return ["missing-output-directory"];
  let rootStat;
  try {
    rootStat = lstatSync(root);
  } catch {
    return ["unreadable-output-directory"];
  }
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) return ["invalid-output-directory"];

  /** @type {string[]} */
  const files = [];
  /**
   * @param {string} directory
   * @param {string[]} relativeSegments
   */
  function walk(directory, relativeSegments = []) {
    let names;
    try {
      names = readdirSync(directory);
    } catch {
      findings.push("unreadable-output-entry");
      return;
    }
    for (const name of names) {
      const fullPath = path.join(directory, name);
      const segments = [...relativeSegments, name];
      let stat;
      try {
        stat = lstatSync(fullPath);
      } catch {
        findings.push("unreadable-output-entry");
        continue;
      }
      if (segments.some((segment) => forbiddenPathSegment.test(segment))) findings.push("private-path-segment");
      if (stat.isSymbolicLink()) {
        findings.push("symbolic-link");
        continue;
      }
      if (stat.isDirectory()) {
        walk(fullPath, segments);
        continue;
      }
      if (!stat.isFile()) {
        findings.push("non-regular-output-entry");
        continue;
      }
      files.push(segments.join("/"));
      const basename = segments.at(-1) ?? "";
      if (
        forbiddenExtensions.test(basename) ||
        /^\.env(?:\.|$)/i.test(basename) ||
        /(?:encrypted-backup|private-export|resume-upload)/i.test(basename)
      ) {
        findings.push("prohibited-public-file");
      }

      let bytes;
      try {
        bytes = readFileSync(fullPath);
      } catch {
        findings.push("unreadable-output-entry");
        continue;
      }
      if (bytes.includes(0)) continue;
      if (credentialPatterns.some((pattern) => pattern.test(bytes.toString("utf8")))) {
        findings.push("credential-like-content");
      }
    }
  }

  walk(root);
  const relativeFiles = new Set(files);
  if (!relativeFiles.has("index.html")) findings.push("missing-index");
  if (!files.some((file) => /^assets\/.+\.(?:m?js)$/i.test(file))) findings.push("missing-script-asset");
  if (!files.some((file) => /^assets\/.+\.css$/i.test(file))) findings.push("missing-stylesheet-asset");

  if (relativeFiles.has("index.html")) {
    let html;
    try {
      html = readFileSync(path.join(root, "index.html"), "utf8");
    } catch {
      findings.push("unreadable-index");
      html = "";
    }
    const localReferences = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((match) => match[1]);
    if (
      localReferences.some(
        (reference) =>
          !localAssetPath.test(reference) ||
          reference.startsWith("//") ||
          /^\/\//.test(reference) ||
          /^(?:https?:|data:|javascript:)/i.test(reference),
      )
    ) {
      findings.push("external-or-unsafe-index-asset-reference");
    }
    if (!/http-equiv=["']Content-Security-Policy["']/i.test(html)) {
      findings.push("missing-content-security-policy");
    }
  }

  return [...new Set(findings)].sort();
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const root = path.resolve(process.argv[2] ?? "dist");
  const findings = inspectPagesArtifact(root);
  if (findings.length > 0) {
    process.stderr.write(
      "Public Pages artifact check failed: " +
        findings.join(", ") +
        ". No file paths or matched content were printed.\n",
    );
    process.exitCode = 1;
  } else {
    process.stdout.write(
      "Public Pages artifact check passed: static entry point, local assets, CSP, and file/content boundaries validated.\n",
    );
  }
}
