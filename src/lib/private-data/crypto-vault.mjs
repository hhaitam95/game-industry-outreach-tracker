import { createEmptyWorkspace, validateWorkspaceData } from "./schema.mjs";

export const VAULT_FORMAT = "game-industry-outreach-tracker/encrypted-vault";
export const VAULT_FORMAT_VERSION = 1;
export const PBKDF2_ITERATIONS = 600_000;
export const MIN_PASSPHRASE_LENGTH = 12;
export const MAX_ENCRYPTED_BACKUP_BYTES = 5 * 1024 * 1024;
const SALT_BYTES = 16;
const IV_BYTES = 12;
const AAD = new TextEncoder().encode(VAULT_FORMAT + ":v" + VAULT_FORMAT_VERSION + ":AES-GCM-256");
const ENVELOPE_KEYS = ["format", "version", "cipher", "kdf", "iterations", "salt", "iv", "ciphertext"];

/** @param {Crypto | undefined} provider */
function ensureCryptoProvider(provider) {
  if (!provider?.subtle || typeof provider.getRandomValues !== "function") {
    throw new Error("Encrypted local storage requires a secure browser context with Web Crypto support.");
  }
}

/** @param {unknown} passphrase @param {{creating?: boolean}} [options] */
function assertPassphrase(passphrase, { creating = false } = {}) {
  if (typeof passphrase !== "string" || passphrase.length === 0) {
    throw new Error("Enter the passphrase used to protect this local vault.");
  }
  if (creating && passphrase.length < MIN_PASSPHRASE_LENGTH) {
    throw new Error("Use a passphrase with at least " + MIN_PASSPHRASE_LENGTH + " characters.");
  }
}

/** @param {Uint8Array} bytes */
function bytesToBase64(bytes) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, Math.min(offset + 0x8000, bytes.length)));
  }
  return btoa(binary);
}

/** @param {unknown} value @param {string} label */
function base64ToBytes(value, label) {
  if (typeof value !== "string" || value.length === 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(value)) {
    throw new Error("Encrypted backup " + label + " is malformed.");
  }
  let binary;
  try {
    binary = atob(value);
  } catch {
    throw new Error("Encrypted backup " + label + " is malformed.");
  }
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** @param {unknown} serialized */
function validateEnvelope(serialized) {
  if (typeof serialized !== "string" || new TextEncoder().encode(serialized).byteLength > MAX_ENCRYPTED_BACKUP_BYTES) {
    throw new Error("Encrypted backup is too large or is not valid text (maximum 5 MiB).");
  }
  let parsed;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error("This file is not a valid encrypted workspace backup.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("This file is not a valid encrypted workspace backup.");
  }
  const keys = Object.keys(parsed);
  if (keys.length !== ENVELOPE_KEYS.length || keys.some((key) => !ENVELOPE_KEYS.includes(key)) ||
      ENVELOPE_KEYS.some((key) => !Object.hasOwn(parsed, key))) {
    throw new Error("Encrypted backup contains an unsupported format.");
  }
  if (parsed.format !== VAULT_FORMAT || parsed.version !== VAULT_FORMAT_VERSION ||
      parsed.cipher !== "AES-GCM-256" || parsed.kdf !== "PBKDF2-SHA-256" ||
      parsed.iterations !== PBKDF2_ITERATIONS) {
    throw new Error("This encrypted backup uses an unsupported encryption format.");
  }
  const salt = base64ToBytes(parsed.salt, "salt");
  const iv = base64ToBytes(parsed.iv, "initialization vector");
  const ciphertext = base64ToBytes(parsed.ciphertext, "ciphertext");
  if (salt.length !== SALT_BYTES || iv.length !== IV_BYTES || ciphertext.length < 16) {
    throw new Error("Encrypted backup has invalid cryptographic parameters.");
  }
  return { salt, iv, ciphertext };
}

/** @param {string} passphrase @param {Uint8Array} salt @param {Crypto} provider @returns {Promise<CryptoKey>} */
async function deriveKey(passphrase, salt, provider) {
  const material = await provider.subtle.importKey(
    "raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"],
  );
  return provider.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"],
  );
}

/** @param {CryptoKey} key @param {Uint8Array} salt @param {Crypto} provider */
function makeSession(key, salt, provider) {
  return Object.freeze({
    /** @param {unknown} input @returns {Promise<string>} */
    async encrypt(input) {
      const workspace = validateWorkspaceData(input);
      const plaintext = new TextEncoder().encode(JSON.stringify(workspace));
      if (plaintext.byteLength > MAX_ENCRYPTED_BACKUP_BYTES - 4096) {
        throw new Error("Workspace is too large to store or export safely (maximum 5 MiB).");
      }
      const iv = provider.getRandomValues(new Uint8Array(IV_BYTES));
      const encrypted = await provider.subtle.encrypt(
        { name: "AES-GCM", iv, additionalData: AAD, tagLength: 128 }, key, plaintext,
      );
      const serialized = JSON.stringify({
        format: VAULT_FORMAT,
        version: VAULT_FORMAT_VERSION,
        cipher: "AES-GCM-256",
        kdf: "PBKDF2-SHA-256",
        iterations: PBKDF2_ITERATIONS,
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        ciphertext: bytesToBase64(new Uint8Array(encrypted)),
      }, null, 2);
      if (new TextEncoder().encode(serialized).byteLength > MAX_ENCRYPTED_BACKUP_BYTES) {
        throw new Error("Encrypted backup exceeds the 5 MiB size limit.");
      }
      return serialized;
    },
  });
}

/** @param {string} passphrase @param {Crypto} [provider=globalThis.crypto] */
export async function createEncryptedSession(passphrase, provider = globalThis.crypto) {
  assertPassphrase(passphrase, { creating: true });
  ensureCryptoProvider(provider);
  const salt = provider.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await deriveKey(passphrase, salt, provider);
  const session = makeSession(key, salt, provider);
  const data = createEmptyWorkspace();
  return { session, data, envelope: await session.encrypt(data) };
}

/** @param {string} serialized @param {string} passphrase @param {Crypto} [provider=globalThis.crypto] */
export async function openEncryptedSession(serialized, passphrase, provider = globalThis.crypto) {
  assertPassphrase(passphrase);
  ensureCryptoProvider(provider);
  const { salt, iv, ciphertext } = validateEnvelope(serialized);
  const key = await deriveKey(passphrase, salt, provider);
  let plaintext;
  try {
    plaintext = await provider.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: AAD, tagLength: 128 }, key, ciphertext,
    );
  } catch {
    throw new Error("Unable to unlock this backup. Check the passphrase and the file's integrity.");
  }
  let data;
  try {
    data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(plaintext));
  } catch {
    throw new Error("The decrypted backup payload is malformed.");
  }
  return { session: makeSession(key, salt, provider), data: validateWorkspaceData(data) };
}
