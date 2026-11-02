import {
  MAX_PROFILE_DOCUMENT_BYTES,
  PROFILE_BACKUP_FORMAT,
  PROFILE_SCHEMA_VERSION,
} from "./profile.types";
import type { CandidateProfile, ProfileDocument } from "./profile.types";

const DATABASE_NAME = "game-industry-outreach-private";
const DATABASE_VERSION = 1;
const STORE_NAME = "candidate-profile";
const PRIMARY_RECORD_KEY = "primary";

type ProfileRecord = { id: string; profile: CandidateProfile };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 30_000) : fallback;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, 100)
    .map((item) => item.slice(0, 200));
}

function documentValue(value: unknown): ProfileDocument | null {
  if (!isRecord(value)) return null;
  const { name, mimeType, size, lastModified, dataBase64 } = value;
  if (
    typeof name !== "string" ||
    typeof mimeType !== "string" ||
    typeof size !== "number" ||
    !Number.isFinite(size) ||
    size <= 0 ||
    size > MAX_PROFILE_DOCUMENT_BYTES ||
    typeof lastModified !== "number" ||
    !Number.isFinite(lastModified) ||
    lastModified < 0 ||
    typeof dataBase64 !== "string" ||
    dataBase64.length === 0 ||
    dataBase64.length > Math.ceil(MAX_PROFILE_DOCUMENT_BYTES / 3) * 4 ||
    dataBase64.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(dataBase64)
  ) return null;

  const padding = dataBase64.endsWith("==") ? 2 : dataBase64.endsWith("=") ? 1 : 0;
  const decodedSize = (dataBase64.length / 4) * 3 - padding;
  const extension = name.toLowerCase().split(".").pop();
  const validPdf = extension === "pdf" && mimeType === "application/pdf";
  const validDocx =
    extension === "docx" &&
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (decodedSize !== size || (!validPdf && !validDocx)) return null;

  return {
    name: name.slice(0, 255),
    mimeType: mimeType.slice(0, 150),
    size,
    lastModified,
    dataBase64,
  };
}

function recordArray(value: unknown, fields: string[]): Record<string, string>[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 200).filter(isRecord).map((entry) => {
    const output: Record<string, string> = {};
    for (const field of fields) output[field] = stringValue(entry[field]);
    return output;
  });
}

const SKILL_EVIDENCE_VALUES = new Set([
  "demonstrated",
  "transferable",
  "learning_exposure",
  "not_evidenced",
  "user_confirmed_gap",
]);

const PROFILE_COLLECTION_FIELDS: Record<string, string[]> = {
  experience: [
    "id", "employer", "title", "location", "startDate", "endDate",
    "responsibilities", "achievements",
  ],
  education: ["id", "qualification", "institution", "startDate", "endDate", "details"],
  projects: ["id", "name", "kind", "url", "startDate", "endDate", "description"],
  skills: ["id", "name", "category", "evidence", "evidenceDetails", "evidenceSource"],
};

const PROFILE_PERSONAL_FIELDS = [
  "fullName", "email", "phone", "currentLocation", "linkedinUrl", "portfolioUrl", "otherLink",
];
const PROFILE_MATERIAL_FIELDS = ["resumeText", "motivationLetter"];
const PROFILE_PREFERENCE_FIELDS = ["additionalConsiderations"];
const PROFILE_PREFERENCE_LISTS = [
  "roleFamilies", "studioTypes", "workModels", "preferredRegions",
  "acceptableRegions", "lowPriorityRegions",
];

function assertKnownProfileRecord(record: Record<string, unknown>): asserts record is Record<string, unknown> & ProfileRecord {
  if (
    Object.keys(record).some((key) => !["id", "profile"].includes(key)) ||
    record.id !== PRIMARY_RECORD_KEY ||
    !Object.prototype.hasOwnProperty.call(record, "profile")
  ) {
    throw new Error("Saved Candidate Profile contains an invalid storage record. The original data was not modified.");
  }
}

/**
 * Reject malformed or oversized data before normalization can filter, default or truncate it.
 * Missing fields remain compatible with earlier schema-v1 records and receive normal defaults.
 */
function rejectInvalidProfileField(context: string, field: string): never {
  throw new Error(`${context} contains invalid or unsupported data at ${field}. The original data was not modified.`);
}

function assertProfileRecord(
  value: unknown,
  context: string,
  field: string,
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) rejectInvalidProfileField(context, field);
}

function assertProfileArray(
  value: unknown,
  context: string,
  field: string,
): asserts value is unknown[] {
  if (!Array.isArray(value)) rejectInvalidProfileField(context, field);
}

/**
 * Reject malformed or oversized data before normalization can filter, default or truncate it.
 * Missing fields remain compatible with earlier schema-v1 records and receive normal defaults.
 */
function assertCandidateProfileIntegrity(value: unknown, context: string): void {
  assertProfileRecord(value, context, "profile");
  const profile = value;
  const fail = (field: string): never => rejectInvalidProfileField(context, field);
  const assertKnownKeys = (record: Record<string, unknown>, allowed: string[], path: string) => {
    for (const key of Object.keys(record)) {
      if (!allowed.includes(key)) fail(`${path}.${key}`);
    }
  };
  const assertOptionalStrings = (
    record: Record<string, unknown>,
    fields: string[],
    path: string,
  ) => {
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) continue;
      const item = record[field];
      if (typeof item !== "string" || item.length > 30_000) fail(`${path}.${field}`);
    }
  };
  const assertOptionalStringLists = (
    record: Record<string, unknown>,
    fields: string[],
    path: string,
  ) => {
    for (const field of fields) {
      if (!Object.prototype.hasOwnProperty.call(record, field)) continue;
      const list = record[field];
      assertProfileArray(list, context, `${path}.${field}`);
      if (list.length > 100) fail(`${path}.${field}`);
      if (list.some((item: unknown) => typeof item !== "string" || item.length > 200)) {
        fail(`${path}.${field}`);
      }
    }
  };

  assertKnownKeys(profile, [
    "schemaVersion", "updatedAt", "personal", "professionalSummary",
    "experience", "education", "projects", "skills", "materials", "preferences",
  ], "profile");
  if (
    Object.prototype.hasOwnProperty.call(profile, "schemaVersion") &&
    profile.schemaVersion !== PROFILE_SCHEMA_VERSION
  ) fail("schemaVersion");
  if (
    Object.prototype.hasOwnProperty.call(profile, "updatedAt") &&
    profile.updatedAt !== null &&
    (typeof profile.updatedAt !== "string" || profile.updatedAt.length > 100)
  ) fail("updatedAt");
  assertOptionalStrings(profile, ["professionalSummary"], "profile");

  if (Object.prototype.hasOwnProperty.call(profile, "personal")) {
    const personal = profile.personal;
    assertProfileRecord(personal, context, "personal");
    assertKnownKeys(personal, PROFILE_PERSONAL_FIELDS, "personal");
    assertOptionalStrings(personal, PROFILE_PERSONAL_FIELDS, "personal");
  }

  for (const [collection, fields] of Object.entries(PROFILE_COLLECTION_FIELDS)) {
    if (!Object.prototype.hasOwnProperty.call(profile, collection)) continue;
    const items = profile[collection];
    assertProfileArray(items, context, collection);
    if (items.length > 200) fail(collection);
    const ids = new Set<string>();
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const path = `${collection}[${index}]`;
      assertProfileRecord(item, context, path);
      assertKnownKeys(item, fields, path);
      const id = item.id;
      if (typeof id !== "string" || !id.trim() || id.length > 200) {
        fail(`${path}.id`);
      }
      const validId = id as string;
      if (ids.has(validId)) fail(`${path}.id (duplicate)`);
      ids.add(validId);
      assertOptionalStrings(item, fields.filter((field) => field !== "id"), path);
      if (
        collection === "skills" &&
        Object.prototype.hasOwnProperty.call(item, "evidence") &&
        (typeof item.evidence !== "string" || !SKILL_EVIDENCE_VALUES.has(item.evidence))
      ) fail(`${path}.evidence`);
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, "materials")) {
    const materials = profile.materials;
    assertProfileRecord(materials, context, "materials");
    assertKnownKeys(
      materials,
      ["masterResume", "resumeText", "motivationLetter", "motivationDocument"],
      "materials",
    );
    assertOptionalStrings(materials, PROFILE_MATERIAL_FIELDS, "materials");
    for (const key of ["masterResume", "motivationDocument"]) {
      if (!Object.prototype.hasOwnProperty.call(materials, key)) continue;
      const document = materials[key];
      if (document === null) continue;
      assertProfileRecord(document, context, `materials.${key}`);
      if (!documentValue(document)) fail(`materials.${key}`);
      if (
        typeof document.name !== "string" ||
        typeof document.mimeType !== "string" ||
        document.name.length > 255 ||
        document.mimeType.length > 150
      ) fail(`materials.${key}`);
      assertKnownKeys(
        document,
        ["name", "mimeType", "size", "lastModified", "dataBase64"],
        `materials.${key}`,
      );
    }
  }

  if (Object.prototype.hasOwnProperty.call(profile, "preferences")) {
    const preferences = profile.preferences;
    assertProfileRecord(preferences, context, "preferences");
    assertKnownKeys(
      preferences,
      [
        ...PROFILE_PREFERENCE_FIELDS,
        ...PROFILE_PREFERENCE_LISTS,
      ],
      "preferences",
    );
    assertOptionalStrings(preferences, PROFILE_PREFERENCE_FIELDS, "preferences");
    assertOptionalStringLists(preferences, PROFILE_PREFERENCE_LISTS, "preferences");
  }
}

export function createEmptyProfile(): CandidateProfile {
  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    updatedAt: null,
    personal: {
      fullName: "", email: "", phone: "", currentLocation: "",
      linkedinUrl: "", portfolioUrl: "", otherLink: "",
    },
    professionalSummary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    materials: {
      masterResume: null,
      resumeText: "",
      motivationLetter: "",
      motivationDocument: null,
    },
    preferences: {
      roleFamilies: [],
      studioTypes: [],
      workModels: [],
      preferredRegions: [],
      acceptableRegions: [],
      lowPriorityRegions: [],
      additionalConsiderations: "",
    },
  };
}

/** Rebuild a profile from untrusted browser/import data using the current schema. */
export function normalizeCandidateProfile(value: unknown): CandidateProfile {
  const empty = createEmptyProfile();
  if (!isRecord(value)) return empty;

  const personal = isRecord(value.personal) ? value.personal : {};
  const materials = isRecord(value.materials) ? value.materials : {};
  const preferences = isRecord(value.preferences) ? value.preferences : {};

  const experience = recordArray(value.experience, [
    "id", "employer", "title", "location", "startDate", "endDate",
    "responsibilities", "achievements",
  ]) as unknown as CandidateProfile["experience"];
  const education = recordArray(value.education, [
    "id", "qualification", "institution", "startDate", "endDate", "details",
  ]) as unknown as CandidateProfile["education"];
  const projects = recordArray(value.projects, [
    "id", "name", "kind", "url", "startDate", "endDate", "description",
  ]) as unknown as CandidateProfile["projects"];
  const skills = recordArray(value.skills, [
    "id", "name", "category", "evidence", "evidenceDetails", "evidenceSource",
  ]).map((skill) => ({
    ...skill,
    evidence: (
      ["demonstrated", "transferable", "learning_exposure", "not_evidenced", "user_confirmed_gap"]
        .includes(String(skill.evidence))
        ? skill.evidence
        : "not_evidenced"
    ),
  })) as unknown as CandidateProfile["skills"];

  return {
    schemaVersion: PROFILE_SCHEMA_VERSION,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null,
    personal: {
      fullName: stringValue(personal.fullName),
      email: stringValue(personal.email),
      phone: stringValue(personal.phone),
      currentLocation: stringValue(personal.currentLocation),
      linkedinUrl: stringValue(personal.linkedinUrl),
      portfolioUrl: stringValue(personal.portfolioUrl),
      otherLink: stringValue(personal.otherLink),
    },
    professionalSummary: stringValue(value.professionalSummary),
    experience,
    education,
    projects,
    skills,
    materials: {
      masterResume: documentValue(materials.masterResume),
      resumeText: stringValue(materials.resumeText),
      motivationLetter: stringValue(materials.motivationLetter),
      motivationDocument: documentValue(materials.motivationDocument),
    },
    preferences: {
      roleFamilies: stringArray(preferences.roleFamilies),
      studioTypes: stringArray(preferences.studioTypes),
      workModels: stringArray(preferences.workModels),
      preferredRegions: stringArray(preferences.preferredRegions),
      acceptableRegions: stringArray(preferences.acceptableRegions),
      lowPriorityRegions: stringArray(preferences.lowPriorityRegions),
      additionalConsiderations: stringValue(preferences.additionalConsiderations),
    },
  };
}

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.reject(new Error("This browser does not provide IndexedDB storage."));
  }

  const pending = new Promise<IDBDatabase>((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Could not open private profile storage."));
      return;
    }

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => {
        database.close();
        databasePromise = null;
      };
      resolve(database);
    };
    request.onerror = () => {
      reject(request.error || new Error("Could not open private profile storage."));
    };
    request.onblocked = () => {
      reject(new Error("Profile storage is blocked by another open tab. Close older tabs and retry."));
    };
  });
  databasePromise = pending;
  void pending.catch(() => {
    if (databasePromise === pending) databasePromise = null;
  });
  return pending;
}

export async function loadCandidateProfile(): Promise<CandidateProfile> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(PRIMARY_RECORD_KEY);
    request.onsuccess = () => {
      const stored = request.result as unknown;
      if (stored === undefined) {
        resolve(createEmptyProfile());
        return;
      }
      try {
        if (!isRecord(stored)) {
          throw new Error("Saved Candidate Profile contains an invalid storage record. The original data was not modified.");
        }
        assertKnownProfileRecord(stored);
        assertCandidateProfileIntegrity(stored.profile, "Saved Candidate Profile");
        resolve(normalizeCandidateProfile(stored.profile));
      } catch (loadError) {
        reject(loadError instanceof Error
          ? loadError
          : new Error("Saved Candidate Profile contains invalid or unsupported data. The original data was not modified."));
      }
    };
    request.onerror = () => reject(request.error || new Error("Could not read the saved profile."));
    transaction.onerror = () => reject(transaction.error || new Error("Could not read the saved profile."));
    transaction.onabort = () => reject(transaction.error || new Error("Profile read was cancelled."));
  });
}

export async function saveCandidateProfile(profile: CandidateProfile): Promise<void> {
  assertCandidateProfileIntegrity(profile, "Candidate Profile");
  const normalized = normalizeCandidateProfile(profile);
  const database = await openDatabase();
  const record: ProfileRecord = {
    id: PRIMARY_RECORD_KEY,
    profile: normalized,
  };
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Could not save the profile."));
    transaction.onabort = () => reject(transaction.error || new Error("Profile save was cancelled."));
  });
}

export function createProfileBackup(profile: CandidateProfile): Blob {
  assertCandidateProfileIntegrity(profile, "Candidate Profile");
  const backup = {
    format: PROFILE_BACKUP_FORMAT,
    version: PROFILE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: normalizeCandidateProfile(profile),
  };
  return new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
}

export async function readProfileBackup(file: File): Promise<CandidateProfile> {
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("The backup file is too large. The maximum supported backup size is 32 MB.");
  }
  let backup: unknown;
  try {
    backup = JSON.parse(await file.text()) as unknown;
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (
    !isRecord(backup) ||
    Object.keys(backup).some((key) => !["format", "version", "exportedAt", "profile"].includes(key)) ||
    backup.format !== PROFILE_BACKUP_FORMAT ||
    backup.version !== PROFILE_SCHEMA_VERSION ||
    typeof backup.exportedAt !== "string" ||
    !Number.isFinite(Date.parse(backup.exportedAt)) ||
    !isRecord(backup.profile)
  ) {
    throw new Error("This is not a supported Candidate Profile backup.");
  }
  assertCandidateProfileIntegrity(backup.profile, "Candidate Profile backup");
  const importedMaterials = isRecord(backup.profile.materials) ? backup.profile.materials : {};
  const declaredDocuments = [
    importedMaterials.masterResume,
    importedMaterials.motivationDocument,
  ].filter((item) => item !== null && item !== undefined);
  const normalized = normalizeCandidateProfile(backup.profile);
  const storedDocuments = [
    normalized.materials.masterResume,
    normalized.materials.motivationDocument,
  ].filter((item) => item !== null);
  if (declaredDocuments.length !== storedDocuments.length) {
    throw new Error("The backup contains an invalid or unsupported document. No profile data was imported.");
  }
  return normalized;
}
