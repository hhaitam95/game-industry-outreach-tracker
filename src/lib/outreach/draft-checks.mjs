const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/giu;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>()]+/giu;
const PHONE_PATTERN = /\+?\d[\d\s().-]{6,}\d/gu;
const GENERIC_PHRASES = Object.freeze([
  "I am writing to express my interest",
  "I am passionate about gaming",
  "I am excited about this opportunity",
  "I believe I would be a great fit",
  "please find my resume attached",
  "to whom it may concern",
  "dear hiring manager",
]);

/** @param {string} value */
function normalize(value) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("en-US").replace(/\s+/gu, " ").trim();
}

/** @param {unknown} value @param {string} label @param {number} maximum */
function boundedText(value, label, maximum) {
  if (typeof value !== "string" || value.length > maximum) {
    throw new Error(label + " must be text of at most " + maximum + " characters.");
  }
  return value.trim();
}

/**
 * Build an editable starting draft only from the selected studio, user-entered motivation,
 * and explicit candidate-profile fields. No role, skill, achievement, or contact is invented.
 * @param {{profile?: Record<string, unknown> | null, studioName: string, roleTitle?: string, purpose?: string, motivation: string}} input
 */
export function buildOutreachDraft(input) {
  if (!input || typeof input !== "object") throw new Error("Outreach draft input is invalid.");
  const studioName = boundedText(input.studioName, "Studio name", 180);
  const roleTitle = boundedText(input.roleTitle ?? "", "Role title", 180);
  const motivation = boundedText(input.motivation, "Motivation", 2_000);
  if (!studioName) throw new Error("Choose a studio before preparing a draft.");
  if (!motivation) throw new Error("Add a specific reason for contacting this studio.");
  const profile = input.profile && typeof input.profile === "object" ? input.profile : {};
  const displayName = typeof profile.displayName === "string" ? profile.displayName.trim() : "";
  const headline = typeof profile.headline === "string" ? profile.headline.trim() : "";
  const summary = typeof profile.professionalSummary === "string" ? profile.professionalSummary.trim() : "";

  const introduction = displayName
    ? "I'm " + displayName + (headline ? ", a " + headline : "") + "."
    : headline
      ? "I'm a " + headline + "."
      : "I'm reaching out to introduce myself.";
  const lines = [
    "Hello " + studioName + " team,",
    "",
    introduction,
  ];
  if (summary) lines.push("", summary);
  lines.push(
    "",
    "What draws me to your team is: " + motivation,
    "",
    roleTitle
      ? "I'd welcome a conversation about the " + roleTitle + " opportunity."
      : "I'd welcome a conversation about potential ways to contribute to your team.",
    "",
    "Thank you for your time,",
    displayName,
  );
  return lines.join("\n").trim();
}

/**
 * Heuristic pre-send review. It flags checks for human inspection; it cannot establish that claims are true.
 * @param {{body: string, studioName: string, roleTitle?: string, motivation?: string, profile?: Record<string, unknown> | null}} input
 */
export function checkOutreachDraft(input) {
  if (!input || typeof input !== "object") throw new Error("Draft review input is invalid.");
  const body = boundedText(input.body, "Draft body", 20_000);
  const studioName = boundedText(input.studioName, "Studio name", 180);
  const roleTitle = boundedText(input.roleTitle ?? "", "Role title", 180);
  const motivation = boundedText(input.motivation ?? "", "Motivation", 2_000);
  const normalizedBody = normalize(body);
  const profile = input.profile && typeof input.profile === "object" ? input.profile : {};
  const facts = [
    profile.headline,
    profile.professionalSummary,
    ...(Array.isArray(profile.skills) ? profile.skills : []),
    ...(Array.isArray(profile.targetRoles) ? profile.targetRoles : []),
  ].filter((item) => typeof item === "string" && item.trim().length >= 3);
  const matchedFacts = [...new Set(facts.map((item) => item.trim()).filter((item) => normalizedBody.includes(normalize(item))))];
  const genericPhrases = GENERIC_PHRASES.filter((phrase) => normalizedBody.includes(normalize(phrase)));
  const contactPatterns = {
    email: (body.match(EMAIL_PATTERN) ?? []).length,
    phone: (body.match(PHONE_PATTERN) ?? []).length,
    url: (body.match(URL_PATTERN) ?? []).length,
  };
  const excessiveExclamation = (body.match(/!/gu) ?? []).length > 2;
  const allCapsWords = body.match(/\b[A-Z]{5,}\b/gu) ?? [];
  const checks = [
    {
      id: "personalization",
      label: "Studio personalization",
      status: studioName && normalizedBody.includes(normalize(studioName)) ? "pass" : "warning",
      message: studioName && normalizedBody.includes(normalize(studioName))
        ? "The studio name appears in the draft."
        : "Name the studio naturally and verify that the message is specific to it.",
    },
    {
      id: "role-relevance",
      label: "Role relevance",
      status: roleTitle ? (normalizedBody.includes(normalize(roleTitle)) ? "pass" : "warning") : "review",
      message: roleTitle
        ? (normalizedBody.includes(normalize(roleTitle)) ? "The selected role appears in the draft." : "The selected role is not mentioned; add role-specific context if appropriate.")
        : "No role was selected. Confirm that a speculative introduction is the right route.",
    },
    {
      id: "motivation",
      label: "Specific motivation",
      status: motivation && normalizedBody.includes(normalize(motivation)) && motivation.length >= 25 ? "pass" : "warning",
      message: motivation && normalizedBody.includes(normalize(motivation)) && motivation.length >= 25
        ? "Your stated reason is included. Check that it is genuine and specific."
        : "Add and review a concrete reason for contacting this team; the check cannot judge sincerity.",
    },
    {
      id: "factual-grounding",
      label: "Approved profile facts",
      status: matchedFacts.length ? "review" : "warning",
      message: matchedFacts.length
        ? matchedFacts.length + " approved profile phrase(s) matched: " + matchedFacts.slice(0, 5).join(", ") + ". Phrase matching is not fact-checking."
        : "No approved profile phrase matched. Verify every personal claim and remove unsupported achievements.",
    },
    {
      id: "generic-language",
      label: "Generic wording",
      status: genericPhrases.length ? "warning" : "pass",
      message: genericPhrases.length
        ? "Review generic phrase(s): " + genericPhrases.join("; ") + ". Replace them with concrete context where possible."
        : "No listed generic phrase was detected; still read the message for specificity.",
    },
    {
      id: "tone",
      label: "Tone and readability",
      status: excessiveExclamation || allCapsWords.length >= 3 ? "warning" : "review",
      message: excessiveExclamation || allCapsWords.length >= 3
        ? "Check emphatic punctuation or all-caps wording for a professional tone."
        : "Read the full draft aloud and confirm it sounds like you.",
    },
    {
      id: "privacy",
      label: "Contact and link review",
      status: contactPatterns.email || contactPatterns.phone || contactPatterns.url ? "review" : "pass",
      message: contactPatterns.email || contactPatterns.phone || contactPatterns.url
        ? "Detected " + contactPatterns.email + " email-like value(s), " + contactPatterns.phone + " phone-like value(s), and " + contactPatterns.url + " URL(s). Confirm each disclosure is intentional."
        : "No common email, phone, or URL pattern was detected.",
    },
    {
      id: "human-control",
      label: "Final human review",
      status: "review",
      message: "This checklist is heuristic only. Review every claim and recipient; the app never sends or submits anything.",
    },
  ];
  return { checks, matchedProfileFacts: matchedFacts, genericPhrases, contactPatterns };
}
