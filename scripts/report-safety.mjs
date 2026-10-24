const sensitivePathSegments =
  /(^|\/)(?:\.env(?:\.[^/]*)?|private|private-resumes?|personal-data|resume-uploads|uploads?|exports?|backups?)(\/|$)/i;
const sensitiveFileName = /(?:candidate|application-history|correspondence|resume|(?:^|[-_.])cv(?:[-_.]|$))/i;
const sensitiveExtension = /\.(?:pdf|docx|sqlite3?|db|pem|key)$/i;

export function isSensitivePath(path) {
  const normalized = String(path).replaceAll("\\", "/");
  const basename = normalized.split("/").at(-1) ?? normalized;
  return (
    sensitivePathSegments.test(normalized) ||
    sensitiveFileName.test(basename) ||
    sensitiveExtension.test(basename)
  );
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

  for (const [pattern, replacement] of replacements) {
    output = output.replace(pattern, replacement);
  }
  return output;
}

export function safeDiagnosticLines(output, limit = 6) {
  const interesting = String(output)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) =>
      /\b(error|failed|failure|warning|cannot|unable|not found|missing|invalid|unexpected|permission denied|timed out|timeout|syntaxerror|typeerror|assertionerror|err_[a-z]+|ts\d{3,5})\b/i.test(line),
    );

  const safe = [];
  for (const line of interesting) {
    const redacted = redactSensitiveText(line).slice(0, 240);
    if (/\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/.test(redacted)) {
      continue;
    }
    if (!safe.includes(redacted)) safe.push(redacted);
    if (safe.length >= limit) break;
  }

  return safe;
}
