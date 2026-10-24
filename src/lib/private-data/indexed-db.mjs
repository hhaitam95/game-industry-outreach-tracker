import { MAX_ENCRYPTED_BACKUP_BYTES, PBKDF2_ITERATIONS, VAULT_FORMAT, VAULT_FORMAT_VERSION } from "./crypto-vault.mjs";

export const PRIVATE_VAULT_DATABASE = "studio-outreach-private-vault";
export const PRIVATE_VAULT_STORE = "encrypted-records";
const DATABASE_VERSION = 1;
const PRIMARY_KEY = "encrypted-workspace-v1";
const ENVELOPE_KEYS = ["format", "version", "cipher", "kdf", "iterations", "salt", "iv", "ciphertext"];

/** Reject plaintext or unsupported envelope objects before opening browser storage. @param {unknown} serialized */
function assertEncryptedEnvelope(serialized) {
  if (typeof serialized !== "string" || new TextEncoder().encode(serialized).byteLength > MAX_ENCRYPTED_BACKUP_BYTES) {
    throw new Error("Only valid-size encrypted vault envelopes can be stored locally.");
  }
  let envelope;
  try { envelope = JSON.parse(serialized); }
  catch { throw new Error("The local vault accepts only encrypted workspace envelopes."); }
  if (!envelope || typeof envelope !== "object" || Array.isArray(envelope) ||
      Object.keys(envelope).length !== ENVELOPE_KEYS.length ||
      Object.keys(envelope).some((key) => !ENVELOPE_KEYS.includes(key)) ||
      ENVELOPE_KEYS.some((key) => !Object.hasOwn(envelope, key)) ||
      envelope.format !== VAULT_FORMAT || envelope.version !== VAULT_FORMAT_VERSION ||
      envelope.cipher !== "AES-GCM-256" || envelope.kdf !== "PBKDF2-SHA-256" ||
      envelope.iterations !== PBKDF2_ITERATIONS || typeof envelope.salt !== "string" ||
      typeof envelope.iv !== "string" || typeof envelope.ciphertext !== "string") {
    throw new Error("The local vault accepts only encrypted workspace envelopes.");
  }
}

/** @param {IDBFactory | undefined} [factory=globalThis.indexedDB] */
export function createIndexedDbVaultStore(factory = globalThis.indexedDB) {
  /** @returns {Promise<IDBDatabase>} */
  function openDatabase() {
    if (!factory) return Promise.reject(new Error("This browser does not support IndexedDB. Use a current browser over HTTPS or localhost."));
    return new Promise((resolve, reject) => {
      const request = factory.open(PRIVATE_VAULT_DATABASE, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PRIVATE_VAULT_STORE)) {
          request.result.createObjectStore(PRIVATE_VAULT_STORE);
        }
      };
      request.onerror = () => reject(new Error("The local encrypted vault could not be opened."));
      request.onblocked = () => reject(new Error("The local vault is busy in another tab. Close other project tabs and retry."));
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
    });
  }

  return Object.freeze({
    /** @returns {Promise<string | null>} */
    async load() {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PRIVATE_VAULT_STORE, "readonly");
        const request = transaction.objectStore(PRIVATE_VAULT_STORE).get(PRIMARY_KEY);
        /** @type {string | null} */
        let result = null;
        request.onsuccess = () => {
          if (request.result !== undefined && request.result !== null && typeof request.result !== "string") {
            transaction.abort();
            reject(new Error("The stored vault has an invalid format."));
            return;
          }
          result = request.result ?? null;
        };
        request.onerror = () => reject(new Error("The local encrypted vault could not be read."));
        transaction.oncomplete = () => { database.close(); resolve(result); };
        transaction.onerror = () => { database.close(); reject(new Error("The local encrypted vault could not be read.")); };
        transaction.onabort = () => { database.close(); reject(new Error("The local encrypted vault read was cancelled.")); };
      });
    },

    /** @param {string} encryptedEnvelope @returns {Promise<void>} */
    async save(encryptedEnvelope) {
      assertEncryptedEnvelope(encryptedEnvelope);
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PRIVATE_VAULT_STORE, "readwrite");
        transaction.objectStore(PRIVATE_VAULT_STORE).put(encryptedEnvelope, PRIMARY_KEY);
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => { database.close(); reject(new Error("The encrypted vault could not be saved to this browser.")); };
        transaction.onabort = () => { database.close(); reject(new Error("Saving the encrypted vault was cancelled.")); };
      });
    },

    /** @returns {Promise<void>} */
    async clear() {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(PRIVATE_VAULT_STORE, "readwrite");
        transaction.objectStore(PRIVATE_VAULT_STORE).delete(PRIMARY_KEY);
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => { database.close(); reject(new Error("The local vault could not be deleted.")); };
        transaction.onabort = () => { database.close(); reject(new Error("Deleting the local vault was cancelled.")); };
      });
    },
  });
}
