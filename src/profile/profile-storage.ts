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

  databasePromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
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
      databasePromise = null;
      reject(request.error || new Error("Could not open private profile storage."));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("Profile storage is blocked by another open tab. Close older tabs and retry."));
    };
  });
  return databasePromise;
}

export async function loadCandidateProfile(): Promise<CandidateProfile> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(PRIMARY_RECORD_KEY);
    request.onsuccess = () => {
      const record = request.result as ProfileRecord | undefined;
      resolve(record ? normalizeCandidateProfile(record.profile) : createEmptyProfile());
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
  return new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
}

export async function readProfileBackup(file: File): Promise<CandidateProfile> {
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("The backup file is too large. The maximum supported backup size is 25 MB.");
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
