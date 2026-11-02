const BACKUP_FORMAT = "game-industry-outreach-application-tracker";
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 20 * 1024 * 1024;
const MAX_APPLICATIONS = 10000;
const MAX_NOTE_LENGTH = 2000;
const VALID_STATUSES = new Set([
  "saved",
  "in_progress",
  "applied",
  "interview",
  "offer",
  "archived",
]);

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @param {string} label
 * @param {number} [maxLength]
 * @returns {string}
 */
function requiredString(value, label, maxLength = 2000) {
  if (typeof value !== "string" || !value.trim() || value.length > maxLength) {
    throw new Error("The application backup contains an invalid " + label + ".");
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @param {number} [maxLength]
 * @returns {string | undefined}
 */
function optionalString(value, label, maxLength = 2000) {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length > maxLength) {
    throw new Error("The application backup contains an invalid " + label + ".");
  }
  return value;
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string[] | undefined}
 */
function optionalStringArray(value, label) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 100) {
    throw new Error("The application backup contains an invalid " + label + ".");
  }
  return value.map((entry, index) => requiredString(entry, label + " item " + (index + 1), 1000));
}

/** @param {unknown} value @returns {value is import("../components/studio.types").TrackerStatus} */
function isTrackerStatus(value) {
  return typeof value === "string" && VALID_STATUSES.has(value);
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
function validHttpUrl(value, label) {
  const candidate = requiredString(value, label, 2000);
  try {
    const url = new URL(candidate);
    if (url.protocol === "http:" || url.protocol === "https:") return candidate;
  } catch {
    // Reject malformed URLs below.
  }
  throw new Error("The application backup contains an invalid " + label + ".");
}

/**
 * @param {unknown} value
 * @param {number} index
 * @returns {import("../components/studio.types").TrackedApplication}
 */
function validateApplication(value, index) {
  const prefix = "application " + (index + 1);
  if (!isRecord(value)) {
    throw new Error("The application backup contains an invalid " + prefix + ".");
  }

  const statusValue = requiredString(value.status, prefix + " status", 40);
  if (!isTrackerStatus(statusValue)) {
    throw new Error("The application backup contains an unsupported status for " + prefix + ".");
  }
  const status = statusValue;

  const appliedAt = value.appliedAt === null || value.appliedAt === undefined
    ? null
    : requiredString(value.appliedAt, prefix + " applied date", 80);
  const note = value.note === undefined ? "" : value.note;
  if (typeof note !== "string" || note.length > MAX_NOTE_LENGTH) {
    throw new Error("The note for " + prefix + " exceeds 2,000 characters.");
  }

  return {
    id: requiredString(value.id, prefix + " ID", 200),
    studioName: requiredString(value.studioName, prefix + " studio name", 300),
    websiteUrl: validHttpUrl(value.websiteUrl, prefix + " studio URL"),
    applicationUrl: validHttpUrl(value.applicationUrl, prefix + " application URL"),
    country: typeof value.country === "string" && value.country.length <= 160 ? value.country : "Not stated",
    ...(value.countryCode === undefined
      ? {}
      : { countryCode: optionalString(value.countryCode, prefix + " country code", 8) }),
    hqLabel: typeof value.hqLabel === "string" && value.hqLabel.length <= 160 ? value.hqLabel : "Not specified",
    ...(value.applicationLocation === undefined
      ? {}
      : { applicationLocation: optionalString(value.applicationLocation, prefix + " application location", 1000) }),
    ...(value.routeType === undefined ? {} : { routeType: optionalString(value.routeType, prefix + " route type", 80) }),
    ...(value.routeStatus === undefined ? {} : { routeStatus: optionalString(value.routeStatus, prefix + " route status", 80) }),
    ...(value.routeCheckedAt === undefined ? {} : { routeCheckedAt: optionalString(value.routeCheckedAt, prefix + " route check date", 80) }),
    ...(value.routeEvidenceUrl === undefined
      ? {}
      : { routeEvidenceUrl: validHttpUrl(value.routeEvidenceUrl, prefix + " source evidence URL") }),
    ...(value.routeNotes === undefined ? {} : { routeNotes: optionalString(value.routeNotes, prefix + " route notes", 5000) }),
    ...(value.workModel === undefined ? {} : { workModel: optionalString(value.workModel, prefix + " work model", 80) }),
    ...(value.submissionMethods === undefined ? {} : { submissionMethods: optionalStringArray(value.submissionMethods, prefix + " submission methods") }),
    ...(value.eligibleLocations === undefined ? {} : { eligibleLocations: optionalStringArray(value.eligibleLocations, prefix + " eligible locations") }),
    ...(value.disciplineScope === undefined ? {} : { disciplineScope: optionalStringArray(value.disciplineScope, prefix + " discipline scope") }),
    status,
    createdAt: requiredString(value.createdAt, prefix + " created date", 80),
    updatedAt: requiredString(value.updatedAt, prefix + " updated date", 80),
    appliedAt,
    note,
  };
}

/**
 * Validate and normalize an application-tracker backup before it can replace
 * the records currently stored in the browser.
 * @param {unknown} value
 * @returns {import("../components/studio.types").TrackedApplication[]}
 */
export function parseApplicationTrackerBackup(value) {
  if (!isRecord(value) || value.format !== BACKUP_FORMAT || value.version !== BACKUP_VERSION) {
    throw new Error("This is not a supported application-tracker backup.");
  }
  if (!Array.isArray(value.applications) || value.applications.length > MAX_APPLICATIONS) {
    throw new Error("The application backup contains an invalid number of records.");
  }

  const applications = value.applications.map(validateApplication);
  const ids = new Set();
  const studioNames = new Set();
  for (const application of applications) {
    const normalizedName = application.studioName.trim().toLocaleLowerCase();
    if (ids.has(application.id) || studioNames.has(normalizedName)) {
      throw new Error("The application backup contains duplicate application records.");
    }
    ids.add(application.id);
    studioNames.add(normalizedName);
  }
  return applications;
}

/**
 * Create a downloadable backup without sending or persisting any data remotely.
 * @param {import("../components/studio.types").TrackedApplication[]} applications
 * @param {string} [exportedAt]
 * @returns {Blob}
 */
export function createApplicationTrackerBackup(applications, exportedAt = new Date().toISOString()) {
  const validated = parseApplicationTrackerBackup({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    applications,
  });
  return new Blob([JSON.stringify({
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt,
    applications: validated,
  }, null, 2)], { type: "application/json" });
}

/**
 * Read and validate a user-selected JSON backup file.
 * @param {File} file
 * @returns {Promise<import("../components/studio.types").TrackedApplication[]>}
 */
export async function readApplicationTrackerBackup(file) {
  if (!(file instanceof Blob) || file.size === 0 || file.size > MAX_BACKUP_BYTES) {
    throw new Error("Choose a non-empty application backup smaller than 20 MB.");
  }
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw new Error("The selected application backup is not valid JSON.");
  }
  return parseApplicationTrackerBackup(parsed);
}


/**
 * Read the existing browser-local tracker without ever turning corrupt or
 * partially-invalid data into an empty list that could overwrite the original.
 * @param {string | null} raw
 * @returns {{ok: true, applications: import("../components/studio.types").TrackedApplication[]} | {ok: false, message: string}}
 */
export function parseStoredApplicationTracker(raw) {
  if (raw === null) {
    return { ok: true, applications: [] };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      ok: false,
      message: "Your saved application tracker is not valid JSON. The original browser data has been left untouched.",
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      message: "Your saved application tracker has an unsupported data structure. The original browser data has been left untouched.",
    };
  }

  try {
    return {
      ok: true,
      applications: parseApplicationTrackerBackup({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        applications: parsed,
      }),
    };
  } catch {
    return {
      ok: false,
      message: "Your saved application tracker contains an invalid or unsupported record. The original browser data has been left untouched.",
    };
  }
}
