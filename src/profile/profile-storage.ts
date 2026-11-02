import {
  MAX_PROFILE_DOCUMENT_BYTES,
  PROFILE_BACKUP_FORMAT,
  PROFILE_SCHEMA_VERSION,
} from "./profile.types.ts";
import type { CandidateProfile, ProfileDocument } from "./profile.types.ts";

const DATABASE_NAME = "game-industry-outreach-private";
const DATABASE_VERSION = 1;
const STORE_NAME = "candidate-profile";
const PRIMARY_RECORD_KEY = "primary";
const MAX_PROFILE_TEXT_LENGTH = 30_000;
const MAX_PROFILE_RECORDS = 200;
const MAX_PROFILE_PREFERENCE_ITEMS = 100;
const MAX_PROFILE_PREFERENCE_LENGTH = 200;
const MAX_PROFILE_BACKUP_BYTES = 32 * 1024 * 1024;
const VALID_SKILL_EVIDENCE = new Set([
  "demonstrated",
  "transferable",
  "learning_exposure",
  "not_evidenced",
  "user_confirmed_gap",
]);

type ProfileRecord = { id: string; profile: CandidateProfile };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, MAX_PROFILE_TEXT_LENGTH) : fallback;
}

function assertStringField(value: unknown, label: string, maxLength = MAX_PROFILE_TEXT_LENGTH): void {
  if (typeof value !== "string") {
    throw new Error("The profile contains an invalid " + label + ".");
  }
  if (value.length > maxLength) {
    throw new Error("The " + label + " exceeds the " + maxLength.toLocaleString() + "-character profile limit.");
  }
}

function requireRecord(value: unknown, label: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("The profile contains invalid " + label + ".");
  }
  return value;
}

function assertStringArray(value: unknown, label: string): void {
  if (!Array.isArray(value) || value.length > MAX_PROFILE_PREFERENCE_ITEMS) {
    throw new Error(
      "The " + label + " list must contain no more than " + MAX_PROFILE_PREFERENCE_ITEMS + " items.",
    );
  }
  value.forEach((item, index) =>
    assertStringField(item, label + " item " + (index + 1), MAX_PROFILE_PREFERENCE_LENGTH),
  );
}

function assertRecordArray(value: unknown, label: string, fields: string[]): void {
  if (!Array.isArray(value) || value.length > MAX_PROFILE_RECORDS) {
    throw new Error(
      "The " + label + " list must contain no more than " + MAX_PROFILE_RECORDS + " records.",
    );
  }

  const ids = new Set<string>();
  value.forEach((item, index) => {
    const entry = requireRecord(item, label + " record " + (index + 1));
    for (const field of fields) {
      assertStringField(
        entry[field],
        label + " record " + (index + 1) + " " + field,
        field === "id" ? 200 : MAX_PROFILE_TEXT_LENGTH,
      );
    }
    const id = entry.id as string;
    if (!id.trim() || ids.has(id)) {
      throw new Error("The " + label + " list contains an empty or duplicate record ID.");
    }
    ids.add(id);
  });
}

function assertProfileDocument(value: unknown, label: string): void {
  if (value === null) return;
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    value.name.length > 255 ||
    documentValue(value) === null
  ) {
    throw new Error("The " + label + " contains an invalid or unsupported PDF/DOCX document.");
  }
}

function assertCandidateProfile(value: Record<string, unknown>): void {
  if (value.schemaVersion !== PROFILE_SCHEMA_VERSION) {
    throw new Error("The profile uses an unsupported schema version.");
  }
  if (value.updatedAt !== null) {
    assertStringField(value.updatedAt, "profile update timestamp", 80);
  }

  const personal = requireRecord(value.personal, "personal details");
  for (const field of [
    "fullName", "email", "phone", "currentLocation", "linkedinUrl", "portfolioUrl", "otherLink",
  ]) {
    assertStringField(personal[field], "personal " + field);
  }

  assertStringField(value.professionalSummary, "professional summary");

  assertRecordArray(value.experience, "experience", [
    "id", "employer", "title", "location", "startDate", "endDate", "responsibilities", "achievements",
  ]);
  assertRecordArray(value.education, "education", [
    "id", "qualification", "institution", "startDate", "endDate", "details",
  ]);
  assertRecordArray(value.projects, "projects", [
    "id", "name", "kind", "url", "startDate", "endDate", "description",
  ]);
  assertRecordArray(value.skills, "skills", [
    "id", "name", "category", "evidence", "evidenceDetails", "evidenceSource",
  ]);
  for (const [index, item] of (value.skills as Record<string, unknown>[]).entries()) {
    if (!VALID_SKILL_EVIDENCE.has(item.evidence as string)) {
      throw new Error("The profile contains an unsupported evidence level for skill " + (index + 1) + ".");
    }
  }

  const materials = requireRecord(value.materials, "profile materials");
  assertProfileDocument(materials.masterResume, "master resume");
  assertStringField(materials.resumeText, "resume text");
  assertStringField(materials.motivationLetter, "motivation letter");
  assertProfileDocument(materials.motivationDocument, "motivation document");

  const preferences = requireRecord(value.preferences, "application preferences");
  for (const field of [
    "roleFamilies", "studioTypes", "workModels", "preferredRegions", "acceptableRegions", "lowPriorityRegions",
  ]) {
    assertStringArray(preferences[field], field);
  }
  assertStringField(preferences.additionalConsiderations, "additional considerations");
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

  const fileSignature = atob(dataBase64.slice(0, 24));
  const hasPdfSignature = fileSignature.startsWith("%PDF-");
  const hasDocxSignature = fileSignature.startsWith("PK\u0003\u0004");
  if ((validPdf && !hasPdfSignature) || (validDocx && !hasDocxSignature)) return null;

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
  if (!isRecord(value)) {
    throw new Error("The saved Candidate Profile is not a valid object.");
  }
  assertCandidateProfile(value);

  const personal = value.personal as Record<string, unknown>;
  const materials = value.materials as Record<string, unknown>;
  const preferences = value.preferences as Record<string, unknown>;

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
      const storedRecord: unknown = request.result;
      if (storedRecord === undefined) {
        resolve(createEmptyProfile());
        return;
      }
      if (!isRecord(storedRecord) || storedRecord.id !== PRIMARY_RECORD_KEY || !("profile" in storedRecord)) {
        reject(new Error("The saved Candidate Profile record is malformed. The original browser data has been left untouched; restore a valid backup to recover it."));
        return;
      }
      try {
        resolve(normalizeCandidateProfile(storedRecord.profile));
      } catch (profileError) {
        reject(profileError instanceof Error
          ? new Error(profileError.message + " The original browser data has been left untouched.")
          : new Error("The saved Candidate Profile could not be validated. The original browser data has been left untouched."));
      }
    };
    request.onerror = () => reject(request.error || new Error("Could not read the saved profile."));
    transaction.onerror = () => reject(transaction.error || new Error("Could not read the saved profile."));
    transaction.onabort = () => reject(transaction.error || new Error("Profile read was cancelled."));
  });
}

export async function saveCandidateProfile(profile: CandidateProfile): Promise<void> {
  const database = await openDatabase();
  const record: ProfileRecord = {
    id: PRIMARY_RECORD_KEY,
    profile: normalizeCandidateProfile(profile),
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
  const backup = {
    format: PROFILE_BACKUP_FORMAT,
    version: PROFILE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile: normalizeCandidateProfile(profile),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  if (blob.size > MAX_PROFILE_BACKUP_BYTES) {
    throw new Error("This profile backup exceeds the 32 MB limit. Remove unnecessary text or documents before exporting.");
  }
  return blob;
}

export async function readProfileBackup(file: File): Promise<CandidateProfile> {
  if (file.size === 0 || file.size > MAX_PROFILE_BACKUP_BYTES) {
    throw new Error("Choose a non-empty profile backup no larger than 32 MB.");
  }
  let backup: unknown;
  try {
    backup = JSON.parse(await file.text()) as unknown;
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (
    !isRecord(backup) ||
    backup.format !== PROFILE_BACKUP_FORMAT ||
    backup.version !== PROFILE_SCHEMA_VERSION ||
    !isRecord(backup.profile)
  ) {
    throw new Error("This is not a supported Candidate Profile backup.");
  }
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
