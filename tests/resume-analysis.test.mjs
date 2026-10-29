import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeResume,
  MAX_RESUME_ANALYSIS_TEXT_CHARS,
  MAX_ROLE_DESCRIPTION_CHARS,
  MAX_ROLE_TERMS,
} from "../src/lib/resume/analysis.mjs";

const profile = {
  skills: ["Python", "REST APIs", "C++", "CI/CD", "Go"],
  targetRoles: ["Developer Support Specialist", "Technical Artist"],
};

test("baseline counts and common section headings are transparent and deterministic", () => {
  const result = analyzeResume({
    resumeText:
      "Professional Summary\nTechnical support engineer.\n\nExperience\nDiagnosed production issues.\n\nSkills\nPython, REST APIs\nEducation\nMSc Computer Science",
    profile,
  });

  assert.equal(result.stats.wordCount, 17);
  assert.equal(result.stats.lineCount, 10);
  assert.deepEqual(result.sections, ["Summary", "Experience", "Skills", "Education"]);
  assert.equal(result.stats.sectionCount, 4);
  assert.equal(result.profile.available, true);
  assert.equal(result.role.terms.length, 0);
});

test("profile skills use exact normalized phrases without asserting competence", () => {
  const result = analyzeResume({
    resumeText: "Built tools with PYTHON and REST APIs. Maintained a C++ service.",
    profile,
  });
  const mentions = Object.fromEntries(result.profile.skillMentions.map((item) => [item.label, item.found]));

  assert.equal(mentions.Python, true);
  assert.equal(mentions["REST APIs"], true);
  assert.equal(mentions["C++"], true);
  assert.equal(mentions["CI/CD"], false);
  assert.equal(mentions.Go, false);
});

test("token matching respects boundaries and normalization for accented text", () => {
  const result = analyzeResume({
    resumeText: "Cafe diagnostics and Golang services.",
    profile: { skills: ["Café", "Go"], targetRoles: [] },
  });
  const mentions = Object.fromEntries(result.profile.skillMentions.map((item) => [item.label, item.found]));

  assert.equal(mentions.Café, true);
  assert.equal(mentions.Go, false);
});

test("role comparison is title/description text matching, never a score", () => {
  const result = analyzeResume({
    resumeText: "Python developer with REST APIs experience and Linux diagnostics.",
    profile,
    roleTitle: "Developer Support Specialist",
    roleDescription: "Python, REST APIs, Kubernetes, CI/CD, Jira",
  });
  const roleTerms = Object.fromEntries(result.role.terms.map((item) => [item.label, item.found]));

  assert.equal(result.profile.targetRoleMatches[0].found, true);
  assert.equal(result.role.descriptionProvided, true);
  assert.equal(roleTerms.python, true);
  assert.equal(roleTerms.rest, true);
  assert.equal(roleTerms.jira, false);
  assert.equal(Object.hasOwn(result, "fitScore"), false);
  assert.equal(Object.hasOwn(result, "score"), false);
  assert.ok(result.role.terms.length <= MAX_ROLE_TERMS);
});

test("absence of terms is not phrased as a skill or eligibility judgment", () => {
  const result = analyzeResume({
    resumeText: "Technical support and incident response.",
    profile: { skills: ["Kubernetes"], targetRoles: [] },
    roleTitle: "Site Reliability Engineer",
  });

  assert.deepEqual(result.profile.skillMentions, [{ label: "Kubernetes", found: false }]);
  assert.equal(
    result.role.terms.some((item) => !item.found),
    true,
  );
  assert.equal(JSON.stringify(result).includes("not qualified"), false);
  assert.equal(JSON.stringify(result).includes("ineligible"), false);
});

test("empty text returns safe zero counts without throwing", () => {
  const result = analyzeResume({ resumeText: "", profile: null });
  assert.equal(result.stats.characterCount, 0);
  assert.equal(result.stats.wordCount, 0);
  assert.equal(result.stats.lineCount, 0);
  assert.equal(result.stats.hasReadableText, false);
  assert.equal(result.profile.available, false);
});

test("analysis rejects excessive resume and role-description lengths with fixed errors", () => {
  assert.throws(
    () => analyzeResume({ resumeText: "x".repeat(MAX_RESUME_ANALYSIS_TEXT_CHARS + 1) }),
    /supported analysis limit/i,
  );
  assert.throws(
    () => analyzeResume({ resumeText: "sample", roleDescription: "x".repeat(MAX_ROLE_DESCRIPTION_CHARS + 1) }),
    /supported length/i,
  );
});

test("analysis results do not copy raw resume text, contact values, or role descriptions", () => {
  const privateEmail = "synthetic.private@example.com";
  const privatePhrase = "EXTRA_PRIVATE_CANARY_8472";
  const roleOnlyText = "SECRET_ROLE_DESCRIPTION_CANARY_8472";
  const serialized = JSON.stringify(
    analyzeResume({
      resumeText: "Experience\n" + privatePhrase + "\nContact: " + privateEmail + "\nPython",
      profile: { skills: ["Python"], targetRoles: [] },
      roleTitle: "Synthetic Engineer",
      roleDescription: roleOnlyText,
    }),
  );

  assert.equal(serialized.includes(privateEmail), false);
  assert.equal(serialized.includes(privatePhrase), false);
  assert.equal(serialized.includes(roleOnlyText), false);
});
