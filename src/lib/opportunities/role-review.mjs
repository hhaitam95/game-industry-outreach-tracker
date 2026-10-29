const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "candidate", "candidates", "could",
  "for", "from", "have", "has", "in", "including", "into", "is", "it", "its", "may", "must", "of",
  "on", "or", "our", "please", "position", "preferred", "proven", "role", "roles", "should", "strong",
  "such", "team", "teams", "that", "the", "their", "this", "to", "understanding", "using", "various",
  "we", "will", "with", "work", "working", "you", "your", "years", "experience", "ability", "responsibilities",
  "requirements", "required", "skills", "knowledge", "opportunity", "environment", "excellent", "good",
  "help", "ensure", "supporting", "support", "develop", "development", "across", "within", "based", "new", "use",
]);

const MAX_ROLE_DESCRIPTION_LENGTH = 150_000;

function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9+#./-]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function uniqueStrings(values) {
  const seen = new Set();
  return values
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter((value) => {
      const normalized = normalizeSearchText(value);
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function extractRoleTerms(description, profileText) {
  const profileNormalized = " " + normalizeSearchText(profileText) + " ";
  const tokens = description.match(/[a-z][a-z0-9+#./-]{1,}/giu) ?? [];
  return uniqueStrings(tokens.map((token) => token.replace(/^[./-]+|[./-]+$/gu, "")))
    .filter((token) => {
      const normalized = normalizeSearchText(token);
      return normalized.length >= 3 && !STOP_WORDS.has(normalized) && !profileNormalized.includes(" " + normalized + " ");
    })
    .slice(0, 12);
}

/**
 * Compare literal phrases from the local profile with the role title and an optional description pasted by the user.
 * Terms not found are prompts for review, never claims that the candidate lacks a skill.
 * @param {{ roleTitle: string, roleDescription?: string, profile?: { headline?: string, professionalSummary?: string, targetRoles?: string[], skills?: string[] } | null }} input
 */
export function analyzeRoleAgainstProfile({ roleTitle, roleDescription = "", profile = null }) {
  if (typeof roleTitle !== "string" || roleTitle.length > 300) {
    throw new Error("Role title must be text of at most 300 characters.");
  }
  if (typeof roleDescription !== "string" || roleDescription.length > MAX_ROLE_DESCRIPTION_LENGTH) {
    throw new Error("Role description must be text of at most 150,000 characters.");
  }
  const hasProfile = Boolean(
    profile &&
      [profile.headline, profile.professionalSummary, ...(profile.targetRoles ?? []), ...(profile.skills ?? [])].some(
        (value) => typeof value === "string" && value.trim(),
      ),
  );
  const profileText = hasProfile
    ? [profile.headline, profile.professionalSummary, ...(profile.targetRoles ?? []), ...(profile.skills ?? [])]
        .filter((value) => typeof value === "string")
        .join("\n")
    : "";
  const normalizedRoleText = " " + normalizeSearchText([roleTitle, roleDescription].join("\n")) + " ";
  const literalMatch = (value) => {
    const normalized = normalizeSearchText(value);
    return normalized.length > 1 && normalizedRoleText.includes(" " + normalized + " ");
  };
  const skills = hasProfile ? uniqueStrings(profile.skills ?? []) : [];
  const targetRoles = hasProfile ? uniqueStrings(profile.targetRoles ?? []) : [];
  return {
    hasProfile,
    hasRoleDescription: Boolean(roleDescription.trim()),
    matchedSkills: skills.filter(literalMatch),
    matchedTargetRoles: targetRoles.filter(literalMatch),
    termsNotMentioned: hasProfile && roleDescription.trim() ? extractRoleTerms(roleDescription, profileText) : [],
    evidenceUsed: [
      "role title",
      roleDescription.trim() ? "description pasted by the user for this review" : "no full role description supplied",
      hasProfile ? "saved local profile headline, summary, target roles, and skills" : "no unlocked profile available",
    ],
  };
}
