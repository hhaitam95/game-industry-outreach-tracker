const sensitivePathSegments =
  /(^|\/)(?:\.env(?:\.[^/]*)?|private|private-resumes?|personal-data|resume-uploads|uploads?|exports?|backups?)(\/|$)/i;
const sensitiveFileName = /(?:candidate|application-history|correspondence|resume|(?:^|[-_.])cv(?:[-_.]|$))/i;
const sensitiveExtension = /\.(?:pdf|docx|sqlite3?|db|pem|key)$/i;

export function isSensitivePath(path) {
  const normalized = String(path).replaceAll("\\", "/");
  const basename = normalized.split("/").at(-1) ?? normalized;
  return sensitivePathSegments.test(normalized) || sensitiveFileName.test(basename) || sensitiveExtension.test(basename);
}

export function redactSensitiveText(value) {
  let output = String(value);
  const replacements = [
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi, "[redacted private key]"],
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "[redacted GitHub token]"],
    [/\bgh[pousr]_[A-Za-z0-9]{20,}\b/g, "[redacted GitHub token]"],
    [/\bAKIA[0-9A-Z]{16}\b/g, "[redacted AWS key]"],
    [/\bsk-[A-Za-z0-9_-]{16,}\b/g, "[redacted API key]"],
    [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, "[redacted token]"],
    [/\bBearer\s+[^\s,;]+/gi, "Bearer [redacted]"],
    [/((?:api[_-]?key|access[_-]?token|secret|password|authorization)\s*[=:]\s*)[^\s,;]+/gi, "$1[redacted]"],
    [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[redacted email]"],
    [/(?<!\w)\+?\d[\d ().-]{7,}\d(?!\w)/g, "[redacted phone/number]"],
    [/\/Users\/[^/\s]+/g, "/Users/<redacted>"],
    [/\/home\/[^/\s]+/g, "/home/<redacted>"],
    [/C:\\Users\\[^\\\s]+/gi, "C:\\Users\\<redacted>"],
  ];
  for (const [pattern, replacement] of replacements) output = output.replace(pattern, replacement);
  return output;
}

/**
 * Return only fixed category labels. Free-form command output can contain unique personal data
 * that pattern-based redaction will not reliably detect.
 */
export function safeDiagnosticLines(output, limit = 6) {
  const text = String(output);
  const categories = [
    [/\b(?:TS\d{3,5}|tsc|typescript)\b/i, "TypeScript diagnostics detected; details omitted."],
    [/\b(?:prettier|format(?:ting)?)\b/i, "Formatting diagnostics detected; details omitted."],
    [/\b(?:eslint|lint)\b/i, "Lint diagnostics detected; details omitted."],
    [/\b(?:syntaxerror|typeerror|referenceerror)\b/i, "JavaScript runtime or syntax diagnostics detected; details omitted."],
    [/\b(?:assertionerror|not ok|test(?:s|ing)?|failed test)\b/i, "Test diagnostics detected; details omitted."],
    [/\b(?:vite|rollup|esbuild|production build)\b/i, "Build-tool diagnostics detected; details omitted."],
    [/\b(?:enoent|not found|command could not start|permission denied|timed out|timeout)\b/i, "Command or environment diagnostics detected; details omitted."],
    [/\b(?:error|failed|failure|warning|cannot|unable|missing|invalid|unexpected|err_[a-z]+)\b/i, "Command diagnostics detected; details omitted."],
  ];
  const safe = [];
  for (const [pattern, label] of categories) {
    if (pattern.test(text)) safe.push(label);
    if (safe.length >= limit) break;
  }
  return safe;
}
