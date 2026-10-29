export const RESUME_PARSE_TIMEOUT_MS = 30_000;

/**
 * Bound the time spent awaiting a resume parser. Callers map the fixed timeout marker to an allowlisted public error.
 * @template T
 * @param {Promise<T>} operation
 * @param {number} [timeoutMs]
 * @returns {Promise<T>}
 */
export function withParseTimeout(operation, timeoutMs = RESUME_PARSE_TIMEOUT_MS) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeoutId;
  /** @type {Promise<never>} */
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("parser-timeout")), timeoutMs);
  });

  return Promise.race([operation, timeout]).finally(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });
}
