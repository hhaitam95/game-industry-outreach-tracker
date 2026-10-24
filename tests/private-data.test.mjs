import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import {
  createEncryptedSession,
  MAX_ENCRYPTED_BACKUP_BYTES,
  openEncryptedSession,
  PBKDF2_ITERATIONS,
  VAULT_FORMAT,
} from "../src/lib/private-data/crypto-vault.mjs";
import { createEmptyWorkspace, validateWorkspaceData } from "../src/lib/private-data/schema.mjs";
import { createIndexedDbVaultStore } from "../src/lib/private-data/indexed-db.mjs";

const passphrase = "correct horse battery staple";
const timestamp = "2026-10-25T00:00:00.000Z";

function sampleWorkspace() {
  const workspace = createEmptyWorkspace(timestamp);
  workspace.profile.displayName = "PRIVATE_PROFILE_CANARY_8348";
  workspace.profile.professionalSummary = "PRIVATE_SUMMARY_CANARY_8348";
  workspace.profile.targetRoles = ["Developer Support Specialist"];
  workspace.profile.skills = ["REST APIs", "CI/CD"];
  workspace.applications.push({
    id: "app-test-1",
    studioName: "PRIVATE_STUDIO_CANARY_8348",
    roleTitle: "Developer Support Specialist",
    status: "interested",
    applicationUrl: "https://example.com/careers",
    notes: "PRIVATE_NOTE_CANARY_8348",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  workspace.drafts.push({
    id: "draft-test-1",
    title: "Sample draft",
    body: "PRIVATE_DRAFT_CANARY_8348",
    updatedAt: timestamp,
  });
  workspace.resumes.push({
    id: "resume-meta-1",
    label: "CV metadata only",
    kind: "pdf",
    processedAt: timestamp,
  });
  return validateWorkspaceData(workspace);
}

test("empty workspace and known schema fields validate", () => {
  assert.equal(createEmptyWorkspace(timestamp).schemaVersion, 1);
  assert.deepEqual(validateWorkspaceData(sampleWorkspace()), sampleWorkspace());
});

test("unknown fields including raw resume text are rejected", () => {
  const workspace = createEmptyWorkspace(timestamp);
  assert.throws(() => validateWorkspaceData({ ...workspace, rawResumeText: "not allowed" }), /unsupported field/i);
  assert.throws(
    () => validateWorkspaceData({ ...workspace, profile: { ...workspace.profile, resumeText: "not allowed" } }),
    /unsupported field/i,
  );
});

test("application URLs reject script schemes and embedded credentials", () => {
  const workspace = createEmptyWorkspace(timestamp);
  workspace.applications.push({
    id: "bad-app",
    studioName: "Example Studio",
    roleTitle: "Engineer",
    status: "interested",
    applicationUrl: "javascript:alert(1)",
    notes: "",
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  assert.throws(() => validateWorkspaceData(workspace), /HTTPS or HTTP/i);
});

test("vault uses AES-GCM-256 and the fixed PBKDF2-SHA-256 work factor", async () => {
  const created = await createEncryptedSession(passphrase, webcrypto);
  const envelope = JSON.parse(created.envelope);
  assert.equal(envelope.format, VAULT_FORMAT);
  assert.equal(envelope.cipher, "AES-GCM-256");
  assert.equal(envelope.kdf, "PBKDF2-SHA-256");
  assert.equal(envelope.iterations, PBKDF2_ITERATIONS);
  assert.equal((await openEncryptedSession(created.envelope, passphrase, webcrypto)).data.schemaVersion, 1);
});

test("encrypted backup restores profile, metadata, draft, and application records", async () => {
  const { session } = await createEncryptedSession(passphrase, webcrypto);
  const original = sampleWorkspace();
  const backup = await session.encrypt(original);
  assert.deepEqual((await openEncryptedSession(backup, passphrase, webcrypto)).data, original);
});

test("encrypted backup does not reveal private record values", async () => {
  const { session } = await createEncryptedSession(passphrase, webcrypto);
  const backup = await session.encrypt(sampleWorkspace());
  for (const marker of [
    "PRIVATE_PROFILE_CANARY_8348",
    "PRIVATE_SUMMARY_CANARY_8348",
    "PRIVATE_STUDIO_CANARY_8348",
    "PRIVATE_NOTE_CANARY_8348",
    "PRIVATE_DRAFT_CANARY_8348",
  ]) {
    assert.equal(backup.includes(marker), false);
  }
});

test("wrong passphrase and modified ciphertext fail authentication", async () => {
  const { session } = await createEncryptedSession(passphrase, webcrypto);
  const backup = await session.encrypt(sampleWorkspace());
  await assert.rejects(openEncryptedSession(backup, "different incorrect passphrase", webcrypto), /Unable to unlock/i);
  const envelope = JSON.parse(backup);
  const index = Math.floor(envelope.ciphertext.length / 2);
  envelope.ciphertext = envelope.ciphertext.slice(0, index) +
    (envelope.ciphertext[index] === "A" ? "B" : "A") + envelope.ciphertext.slice(index + 1);
  await assert.rejects(openEncryptedSession(JSON.stringify(envelope), passphrase, webcrypto), /Unable to unlock/i);
});

test("unsupported KDF parameters and malformed or oversized backups are rejected", async () => {
  const { envelope } = await createEncryptedSession(passphrase, webcrypto);
  const parsed = JSON.parse(envelope);
  parsed.iterations = 10;
  await assert.rejects(openEncryptedSession(JSON.stringify(parsed), passphrase, webcrypto), /unsupported encryption format/i);
  await assert.rejects(openEncryptedSession("not json", passphrase, webcrypto), /valid encrypted workspace backup/i);
  await assert.rejects(
    openEncryptedSession("x".repeat(MAX_ENCRYPTED_BACKUP_BYTES + 1), passphrase, webcrypto),
    /too large/i,
  );
});

test("new vault creation requires a passphrase of at least twelve characters", async () => {
  await assert.rejects(createEncryptedSession("too-short", webcrypto), /at least 12 characters/i);
});

test("IndexedDB adapter refuses plaintext data before opening storage", async () => {
  const store = createIndexedDbVaultStore(undefined);
  await assert.rejects(store.save(JSON.stringify(createEmptyWorkspace(timestamp))), /only encrypted workspace envelopes/i);
  await assert.rejects(store.save("not encrypted"), /only encrypted workspace envelopes/i);
});
