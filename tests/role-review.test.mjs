import assert from "node:assert/strict";
import test from "node:test";
import { analyzeRoleAgainstProfile } from "../src/lib/opportunities/role-review.mjs";

const profile = {
  headline: "Technical support engineer",
  professionalSummary: "Works with APIs and diagnostic logs.",
  targetRoles: ["Developer Support Specialist", "DevOps Engineer"],
  skills: ["Python", "REST APIs", "Kibana"],
};

test("role review identifies literal skill and target-role mentions without a score", () => {
  const result = analyzeRoleAgainstProfile({
    roleTitle: "Developer Support Specialist",
    roleDescription: "We use Python and REST APIs to investigate production Kubernetes issues.",
    profile,
  });
  assert.equal(result.hasProfile, true);
  assert.equal(result.hasRoleDescription, true);
  assert.deepEqual(result.matchedTargetRoles, ["Developer Support Specialist"]);
  assert.deepEqual(result.matchedSkills, ["Python", "REST APIs"]);
  assert.ok(result.termsNotMentioned.includes("production"));
  assert.ok(result.termsNotMentioned.includes("Kubernetes"));
  assert.equal("score" in result, false);
});

test("role review explains missing evidence only when a description is supplied", () => {
  const withoutDescription = analyzeRoleAgainstProfile({ roleTitle: "QA Engineer", profile });
  assert.deepEqual(withoutDescription.termsNotMentioned, []);
  assert.equal(withoutDescription.hasRoleDescription, false);
  const withoutProfile = analyzeRoleAgainstProfile({
    roleTitle: "QA Engineer",
    roleDescription: "Python Kubernetes",
    profile: null,
  });
  assert.equal(withoutProfile.hasProfile, false);
  assert.deepEqual(withoutProfile.matchedSkills, []);
  assert.deepEqual(withoutProfile.termsNotMentioned, []);
});

test("role review validates input bounds", () => {
  assert.throws(() => analyzeRoleAgainstProfile({ roleTitle: "x".repeat(301), profile }), /Role title/);
  assert.throws(() => analyzeRoleAgainstProfile({ roleTitle: "Test", roleDescription: "x".repeat(150_001), profile }), /Role description/);
});

test("role review avoids substring-only skill matches", () => {
  const result = analyzeRoleAgainstProfile({
    roleTitle: "Google platform engineer",
    roleDescription: "Investigate rapid service failures.",
    profile: { headline: "", professionalSummary: "", targetRoles: [], skills: ["Go", "API"] },
  });
  assert.deepEqual(result.matchedSkills, []);
});
