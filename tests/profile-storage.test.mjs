import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyProfile,
  createProfileBackup,
  normalizeCandidateProfile,
  readProfileBackup,
} from "../src/profile/profile-storage.ts";

function experience(id) {
  return {
    id,
    employer: "Example Studio",
    title: "Developer Support Engineer",
    location: "Budapest",
    startDate: "2023",
    endDate: "Present",
    responsibilities: "Troubleshot application and API issues.",
    achievements: "Improved support workflows.",
  };
}

function skill(id, evidence = "demonstrated") {
  return {
    id,
    name: "REST APIs",
    category: "Technical",
    evidence,
    evidenceDetails: "Investigated production API behavior.",
    evidenceSource: "Work",
  };
}

test("valid Candidate Profiles round-trip without changing user data", async () => {
  const profile = createEmptyProfile();
  profile.updatedAt = "2026-11-02T12:00:00.000Z";
  profile.personal.fullName = "Test Candidate";
  profile.professionalSummary = "A structured professional profile.";
  profile.experience = [experience("experience-1")];
  profile.skills = [skill("skill-1")];
  profile.preferences.roleFamilies = ["Developer support", "DevOps"];
  profile.materials.masterResume = {
    name: "resume.pdf",
    mimeType: "application/pdf",
    size: 8,
    lastModified: 1,
    dataBase64: Buffer.from("%PDF-1.4").toString("base64"),
  };

  assert.deepEqual(normalizeCandidateProfile(profile), profile);
  const backup = createProfileBackup(profile);
  const restored = await readProfileBackup(
    new File([backup], "candidate-profile-backup.json", { type: "application/json" }),
  );
  assert.deepEqual(restored, profile);
});

test("malformed top-level and nested profile structures are rejected", () => {
  assert.throws(() => normalizeCandidateProfile(null), /not a valid object/);

  const profile = createEmptyProfile();
  delete profile.experience;
  assert.throws(() => normalizeCandidateProfile(profile), /experience list/);

  const missingPersonal = createEmptyProfile();
  missingPersonal.personal = null;
  assert.throws(() => normalizeCandidateProfile(missingPersonal), /personal details/);
});

test("profile text exceeding its limit is rejected rather than truncated", () => {
  const profile = createEmptyProfile();
  profile.professionalSummary = "x".repeat(30_001);
  assert.throws(() => normalizeCandidateProfile(profile), /30,000-character profile limit/);
});

test("profile collection limits are enforced without dropping records", () => {
  const profile = createEmptyProfile();
  profile.experience = Array.from({ length: 201 }, (_, index) => experience("experience-" + index));
  assert.throws(() => normalizeCandidateProfile(profile), /no more than 200 records/);
});

test("duplicate or empty record IDs are rejected before storage", () => {
  const duplicate = createEmptyProfile();
  duplicate.skills = [skill("duplicate"), skill("duplicate")];
  assert.throws(() => normalizeCandidateProfile(duplicate), /empty or duplicate record ID/);

  const empty = createEmptyProfile();
  empty.projects = [{
    id: "   ",
    name: "",
    kind: "",
    url: "",
    startDate: "",
    endDate: "",
    description: "",
  }];
  assert.throws(() => normalizeCandidateProfile(empty), /empty or duplicate record ID/);
});

test("preference limits and unsupported skill evidence are rejected", () => {
  const tooManyPreferences = createEmptyProfile();
  tooManyPreferences.preferences.roleFamilies = Array.from({ length: 101 }, (_, index) => "Role " + index);
  assert.throws(() => normalizeCandidateProfile(tooManyPreferences), /no more than 100 items/);

  const tooLongPreference = createEmptyProfile();
  tooLongPreference.preferences.preferredRegions = ["x".repeat(201)];
  assert.throws(() => normalizeCandidateProfile(tooLongPreference), /200-character profile limit/);

  const invalidEvidence = createEmptyProfile();
  invalidEvidence.skills = [skill("skill-1", "invented-level")];
  assert.throws(() => normalizeCandidateProfile(invalidEvidence), /unsupported evidence level/);
});

test("unsupported or mislabeled document contents are rejected", () => {
  const profile = createEmptyProfile();
  profile.materials.masterResume = {
    name: "resume.pdf",
    mimeType: "application/pdf",
    size: 7,
    lastModified: 0,
    dataBase64: Buffer.from("not pdf").toString("base64"),
  };
  assert.throws(() => normalizeCandidateProfile(profile), /invalid or unsupported PDF\/DOCX document/);
});

test("backup import rejects malformed profile fields instead of restoring an empty substitute", async () => {
  const profile = createEmptyProfile();
  profile.personal.fullName = 17;
  const file = new File([JSON.stringify({
    format: "game-industry-outreach-candidate-profile",
    version: 1,
    exportedAt: "2026-11-02T12:00:00.000Z",
    profile,
  })], "malformed-profile.json", { type: "application/json" });

  await assert.rejects(readProfileBackup(file), /invalid personal fullName/);
});
