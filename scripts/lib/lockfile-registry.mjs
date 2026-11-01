const EXPECTED_REGISTRY_ORIGIN = "https://registry.npmjs.org";

/**
 * Return safe, non-URL diagnostics for lockfile entries outside the approved npm registry.
 * @param {unknown} lockfile
 * @returns {{ packagePath: string, reason: string }[]}
 */
export function findUnexpectedRegistryUrls(lockfile) {
  const packages = lockfile && typeof lockfile === "object" && !Array.isArray(lockfile) ? lockfile.packages : undefined;

  if (!packages || typeof packages !== "object" || Array.isArray(packages)) {
    return [{ packagePath: "<lockfile>", reason: "missing-packages-object" }];
  }

  const violations = [];
  for (const [packagePath, metadata] of Object.entries(packages)) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      continue;
    }
    if (!Object.hasOwn(metadata, "resolved")) continue;

    const resolvedValue = metadata.resolved;
    if (typeof resolvedValue !== "string") {
      violations.push({ packagePath, reason: "invalid-url" });
      continue;
    }

    let resolvedUrl;
    try {
      resolvedUrl = new URL(resolvedValue);
    } catch {
      violations.push({ packagePath, reason: "invalid-url" });
      continue;
    }

    if (resolvedUrl.protocol !== "https:") {
      violations.push({ packagePath, reason: "insecure-protocol" });
      continue;
    }
    if (
      resolvedUrl.origin !== EXPECTED_REGISTRY_ORIGIN ||
      resolvedUrl.username.length > 0 ||
      resolvedUrl.password.length > 0
    ) {
      violations.push({ packagePath, reason: "unsupported-origin" });
    }
  }

  return violations;
}
