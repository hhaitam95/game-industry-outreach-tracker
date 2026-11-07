import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import {
  createEmptyProfile,
  createProfileBackup,
  loadCandidateProfile,
  readProfileBackup,
  saveCandidateProfile,
} from "../profile/profile-storage";
import {
  MAX_PROFILE_DOCUMENT_BYTES,
} from "../profile/profile.types";
import type {
  CandidateEducation,
  CandidateExperience,
  CandidateProfile,
  CandidateProject,
  CandidateSkill,
  ProfileDocument,
  SkillEvidence,
} from "../profile/profile.types";
import "./profile.css";

type CollectionKey = "experience" | "education" | "projects" | "skills";

const evidenceLabels: Record<SkillEvidence, string> = {
  demonstrated: "Demonstrated",
  transferable: "Transferable",
  learning_exposure: "Learning / exposure",
  not_evidenced: "Not evidenced",
  user_confirmed_gap: "User-confirmed gap",
};

const ROLE_FAMILY_OPTIONS = [
  "Developer support", "Technical support", "Product support", "IT support",
  "DevOps", "Software engineer", "QA / test engineering",
  "Game VFX / technical art", "Art / animation", "Game designer",
] as const;

const STUDIO_TYPE_OPTIONS = [
  "AAA development", "Indie", "Developer", "Publisher", "Co-development",
  "External development services", "Game art", "Animation studio",
  "Game technology", "Game engine developer", "Mobile games",
  "Support studio", "Quality assurance", "AR/VR", "First-party studio",
] as const;

const WORK_MODEL_OPTIONS = ["On-site", "Hybrid", "Remote"] as const;

const REGION_OPTIONS = [
  "Europe", "Asia", "Africa", "North America", "South America", "Oceania",
  "Remote / distributed",
] as const;

const COUNTRY_OPTIONS = [
  "Australia", "Austria", "Belgium", "Brazil", "Bulgaria", "Canada", "China",
  "Costa Rica", "Cyprus", "Czechia", "Denmark", "Finland", "France", "Germany",
  "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Italy", "Japan", "Malaysia",
  "Malta", "Mauritius", "Moldova", "Morocco", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Philippines", "Poland", "Portugal",
  "Saudi Arabia", "Serbia", "Singapore", "South Korea", "Spain", "Sweden",
  "Switzerland", "Thailand", "Türkiye", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Vietnam",
] as const;

type RegionPreferenceKey = "preferredRegions" | "acceptableRegions" | "lowPriorityRegions";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "profile-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separator = result.indexOf(",");
      if (separator < 0) {
        reject(new Error("The selected document could not be read."));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.onerror = () => reject(new Error("The selected document could not be read."));
    reader.readAsDataURL(file);
  });
}

async function profileDocumentFromFile(file: File): Promise<ProfileDocument> {
  const extension = file.name.toLowerCase().split(".").pop();
  const acceptedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (extension !== "pdf" && extension !== "docx") {
    throw new Error("Choose a PDF or DOCX document.");
  }
  if (file.name.length > 255) {
    throw new Error("The document filename must be 255 characters or fewer.");
  }
  if (file.type && file.type !== "application/octet-stream" && !acceptedMimeTypes.includes(file.type)) {
    throw new Error("The selected file type does not match a supported PDF or DOCX document.");
  }
  if (file.size === 0 || file.size > MAX_PROFILE_DOCUMENT_BYTES) {
    throw new Error("Documents must be smaller than 10 MB.");
  }
  const mimeType = extension === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const dataBase64 = await readFileAsBase64(file);
  const fileSignature = window.atob(dataBase64.slice(0, 24));
  const validSignature = extension === "pdf"
    ? fileSignature.startsWith("%PDF-")
    : fileSignature.startsWith("PK\u0003\u0004");
  if (!validSignature) {
    throw new Error("The document contents do not match the selected PDF or DOCX file type.");
  }
  return {
    name: file.name,
    mimeType,
    size: file.size,
    lastModified: file.lastModified,
    dataBase64,
  };
}

function downloadDocument(document: ProfileDocument): void {
  const binary = window.atob(document.dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: document.mimeType }));
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = document.name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadBackup(profile: CandidateProfile): void {
  const url = URL.createObjectURL(createProfileBackup(profile));
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = "candidate-profile-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const reactId = useId();
  const id = "profile-field-" + reactId.replace(/:/g, "");
  return (
    <label className="form-field profile-field" htmlFor={id}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className="form-control"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <input
          id={id}
          className="form-control"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint ? <small className="profile-field-hint">{hint}</small> : null}
    </label>
  );
}

function CheckboxOptionGrid({
  id,
  selected,
  options,
  onToggle,
}: {
  id: string;
  selected: string[];
  options: readonly string[];
  onToggle: (option: string, checked: boolean) => void;
}) {
  return (
    <div className="profile-choice-grid">
      {options.map((option, index) => {
        const inputId = id + "-" + index;
        return (
          <label className="profile-choice-option" htmlFor={inputId} key={option}>
            <input
              id={inputId}
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(event) => onToggle(option, event.target.checked)}
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}

function ChoiceGroup({
  id,
  label,
  selected,
  options,
  onToggle,
  hint,
}: {
  id: string;
  label: string;
  selected: string[];
  options: readonly string[];
  onToggle: (option: string, checked: boolean) => void;
  hint?: string;
}) {
  const savedOptions = selected.filter((option) => !options.includes(option));
  return (
    <fieldset id={id} className="profile-choice-group">
      <legend>{label}</legend>
      <CheckboxOptionGrid id={id} selected={selected} options={options} onToggle={onToggle} />
      {savedOptions.length > 0 ? (
        <div className="profile-saved-choices">
          <span>Previously saved choices</span>
          <CheckboxOptionGrid
            id={id + "-saved"}
            selected={selected}
            options={savedOptions}
            onToggle={onToggle}
          />
        </div>
      ) : null}
      {hint ? <small className="profile-field-hint">{hint}</small> : null}
    </fieldset>
  );
}

function RegionPreferenceGroup({
  id,
  label,
  selected,
  onToggle,
}: {
  id: string;
  label: string;
  selected: string[];
  onToggle: (option: string, checked: boolean) => void;
}) {
  const knownOptions: readonly string[] = [...REGION_OPTIONS, ...COUNTRY_OPTIONS];
  const savedOptions = selected.filter((option) => !knownOptions.includes(option));
  const selectedCountryCount = selected.filter((option) =>
    COUNTRY_OPTIONS.includes(option as (typeof COUNTRY_OPTIONS)[number]),
  ).length;
  return (
    <fieldset id={id} className="profile-choice-group profile-region-choice-group">
      <legend>{label}</legend>
      <span className="profile-choice-subheading">Broad regions</span>
      <CheckboxOptionGrid
        id={id + "-regions"}
        selected={selected}
        options={REGION_OPTIONS}
        onToggle={onToggle}
      />
      <details className="profile-choice-more">
        <summary>
          Choose specific countries{selectedCountryCount ? " (" + selectedCountryCount + " selected)" : ""}
        </summary>
        <CheckboxOptionGrid
          id={id + "-countries"}
          selected={selected}
          options={COUNTRY_OPTIONS}
          onToggle={onToggle}
        />
      </details>
      {savedOptions.length > 0 ? (
        <div className="profile-saved-choices">
          <span>Previously saved values</span>
          <CheckboxOptionGrid
            id={id + "-saved"}
            selected={selected}
            options={savedOptions}
            onToggle={onToggle}
          />
        </div>
      ) : null}
      <small className="profile-field-hint">
        Use broad regions or individual countries. The same selection can belong to only one priority tier.
      </small>
    </fieldset>
  );
}

function Section({
  id,
  icon,
  title,
  description,
  children,
}: {
  id: string;
  icon: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="profile-panel" id={"profile-section-" + id}>
      <div className="profile-section-heading">
        <div>
          <h2><span className="profile-section-icon" aria-hidden="true">{icon}</span>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function EmptyList({ children }: { children: string }) {
  return <p className="profile-empty-list">{children}</p>;
}

export default function CandidateProfile() {
  const [profile, setProfile] = useState<CandidateProfile>(createEmptyProfile);
  const [loaded, setLoaded] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const editRevision = useRef(0);
  const [status, setStatus] = useState("Loading your private profile…");
  const [error, setError] = useState("");
  const [resumeInputKey, setResumeInputKey] = useState(0);
  const [motivationInputKey, setMotivationInputKey] = useState(0);
  const [backupInputKey, setBackupInputKey] = useState(0);

  useEffect(() => {
    let active = true;
    loadCandidateProfile()
      .then((saved) => {
        if (!active) return;
        setProfile(saved);
        setStorageReady(true);
        setStatus("Stored in this browser");
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Could not load profile storage.");
        setStatus("Profile storage unavailable");
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  function markEdited() {
    editRevision.current += 1;
    setDirty(true);
    setError("");
  }

  function updateProfile<K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    markEdited();
  }

  function updatePersonal(key: keyof CandidateProfile["personal"], value: string) {
    setProfile((current) => ({
      ...current,
      personal: { ...current.personal, [key]: value },
    }));
    markEdited();
  }

  function updateMaterials<K extends keyof CandidateProfile["materials"]>(
    key: K,
    value: CandidateProfile["materials"][K],
  ) {
    setProfile((current) => ({
      ...current,
      materials: { ...current.materials, [key]: value },
    }));
    markEdited();
  }

  function updatePreference<K extends keyof CandidateProfile["preferences"]>(
    key: K,
    value: CandidateProfile["preferences"][K],
  ) {
    setProfile((current) => ({
      ...current,
      preferences: { ...current.preferences, [key]: value },
    }));
    markEdited();
  }

  function toggleListPreference(
    key: "roleFamilies" | "studioTypes" | "workModels",
    option: string,
    checked: boolean,
  ) {
    setProfile((current) => {
      const existing = current.preferences[key];
      const next = checked
        ? [...new Set([...existing, option])]
        : existing.filter((item) => item !== option);
      return {
        ...current,
        preferences: { ...current.preferences, [key]: next },
      };
    });
    markEdited();
  }

  function toggleRegionPreference(key: RegionPreferenceKey, option: string, checked: boolean) {
    const regionKeys: RegionPreferenceKey[] = [
      "preferredRegions",
      "acceptableRegions",
      "lowPriorityRegions",
    ];
    setProfile((current) => {
      const preferences = { ...current.preferences };
      for (const regionKey of regionKeys) {
        const existing = preferences[regionKey];
        preferences[regionKey] =
          checked && regionKey === key
            ? [...new Set([...existing, option])]
            : existing.filter((item) => item !== option);
      }
      return { ...current, preferences };
    });
    markEdited();
  }

  function updateCollectionItem<K extends CollectionKey>(
    key: K,
    id: string,
    patch: Partial<CandidateProfile[K][number]>,
  ) {
    setProfile((current) => ({
      ...current,
      [key]: current[key].map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    } as CandidateProfile));
    markEdited();
  }

  function removeCollectionItem(key: CollectionKey, id: string) {
    setProfile((current) => ({
      ...current,
      [key]: current[key].filter((item) => item.id !== id),
    } as CandidateProfile));
    markEdited();
  }

  function addExperience() {
    const item: CandidateExperience = {
      id: createId(), employer: "", title: "", location: "",
      startDate: "", endDate: "", responsibilities: "", achievements: "",
    };
    updateProfile("experience", [...profile.experience, item]);
  }

  function addEducation() {
    const item: CandidateEducation = {
      id: createId(), qualification: "", institution: "",
      startDate: "", endDate: "", details: "",
    };
    updateProfile("education", [...profile.education, item]);
  }

  function addProject() {
    const item: CandidateProject = {
      id: createId(), name: "", kind: "Personal project", url: "",
      startDate: "", endDate: "", description: "",
    };
    updateProfile("projects", [...profile.projects, item]);
  }

  function addSkill() {
    const item: CandidateSkill = {
      id: createId(), name: "", category: "Technical",
      evidence: "not_evidenced", evidenceDetails: "", evidenceSource: "",
    };
    updateProfile("skills", [...profile.skills, item]);
  }

  async function handleSave() {
    if (!storageReady || saving) return;
    setSaving(true);
    setError("");
    const revisionAtSave = editRevision.current;
    const next = { ...profile, updatedAt: new Date().toISOString() };
    try {
      await saveCandidateProfile(next);
      if (editRevision.current === revisionAtSave) {
        setProfile(next);
        setDirty(false);
        setStatus("Saved in this browser · " + new Date().toLocaleTimeString());
      } else {
        setDirty(true);
        setStatus("Earlier changes saved · newer edits still need saving");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save your profile.");
      setStatus("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDocumentChange(
    event: ChangeEvent<HTMLInputElement>,
    key: "masterResume" | "motivationDocument",
  ) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    try {
      const document = await profileDocumentFromFile(file);
      updateMaterials(key, document);
      setStatus("Document added · save your profile to keep it");
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "Could not add this document.");
    }
  }

  function handleBackupExport() {
    try {
      downloadBackup(profile);
      setError("");
      setStatus("Backup exported · keep the file private");
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Could not export this profile backup.");
      setStatus("Backup export failed");
    }
  }

  async function handleBackupImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file || saving) return;
    const revisionAtImport = editRevision.current;
    setSaving(true);
    try {
      const imported = await readProfileBackup(file);
      if (!window.confirm("Replace the profile currently in this browser with this backup?")) return;
      if (editRevision.current !== revisionAtImport) {
        setError(
          "Your profile changed while the backup was being read. No data was replaced. Review your latest edits and import the backup again if you still want to replace them.",
        );
        setStatus("Import cancelled to protect newer edits");
        return;
      }
      const next = { ...imported, updatedAt: new Date().toISOString() };
      await saveCandidateProfile(next);
      setStorageReady(true);
      setError("");
      if (editRevision.current === revisionAtImport) {
        setProfile(next);
        setDirty(false);
        setStatus("Backup imported and saved in this browser");
      } else {
        setDirty(true);
        setStatus("Backup imported · newer edits still need saving");
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Could not import this backup.");
    } finally {
      setSaving(false);
      setBackupInputKey((current) => current + 1);
    }
  }

  if (!loaded) {
    return <section className="profile-page"><p className="profile-loading">{status}</p></section>;
  }

  return (
    <section className="profile-page">
      <div className="page-heading profile-page-heading">
        <div>
          <h1>My profile</h1>
          <p>Your professional source of truth for future game-industry opportunities.</p>
        </div>
        <div className="profile-actions">
          <label className="btn btn-outline-secondary btn-sm profile-file-action">
            Import backup
            <input
              key={backupInputKey}
              className="visually-hidden"
              type="file"
              accept=".json,application/json"
              disabled={saving}
              onChange={handleBackupImport}
            />
          </label>
          <button className="btn btn-outline-secondary btn-sm" type="button" disabled={!storageReady || saving} onClick={handleBackupExport}>
            Export backup
          </button>
          <button className="btn btn-primary btn-sm" type="button" disabled={!storageReady || !dirty || saving} onClick={handleSave}>
            {saving ? "Saving…" : dirty ? "Save profile" : "Profile saved"}
          </button>
        </div>
      </div>

      <div className="profile-storage-notice">
        <strong>Private browser storage</strong>
        <span>
          Your profile and documents stay in this browser on this device. They are not uploaded or synced,
          and browser storage is not automatically encrypted. Export a backup regularly; it contains personal
          details and full document contents, so keep it private. Clearing site data or changing browsers can remove this profile.
        </span>
        <span className={error ? "profile-save-state is-error" : "profile-save-state"} role={error ? "alert" : "status"}>
          {error || (!storageReady && loaded
            ? status + " · Save is disabled until storage can be loaded or a valid backup is restored."
            : dirty ? "Unsaved changes" : status)}
        </span>
      </div>

      <nav className="profile-section-nav" aria-label="Jump to profile section">
        <a href="#profile-section-personal"><span aria-hidden="true">👤</span> Contact</a>
        <a href="#profile-section-summary"><span aria-hidden="true">🧭</span> Summary</a>
        <a href="#profile-section-experience"><span aria-hidden="true">💼</span> Experience</a>
        <a href="#profile-section-education"><span aria-hidden="true">🎓</span> Education</a>
        <a href="#profile-section-projects"><span aria-hidden="true">🎮</span> Projects</a>
        <a href="#profile-section-skills"><span aria-hidden="true">🧩</span> Skills</a>
        <a href="#profile-section-materials"><span aria-hidden="true">📄</span> Materials</a>
        <a href="#profile-section-preferences"><span aria-hidden="true">🎯</span> Preferences</a>
      </nav>

      <Section id="personal" icon="👤" title="Personal and contact details" description="Only add details you are comfortable keeping in this browser and reusing in applications.">
        <div className="profile-form-grid">
          <Field label="Full name" value={profile.personal.fullName} onChange={(value) => updatePersonal("fullName", value)} placeholder="Your full name" />
          <Field label="Email" value={profile.personal.email} onChange={(value) => updatePersonal("email", value)} type="email" placeholder="you@example.com" />
          <Field label="Phone" value={profile.personal.phone} onChange={(value) => updatePersonal("phone", value)} placeholder="Include country code if useful" />
          <Field label="Current location" value={profile.personal.currentLocation} onChange={(value) => updatePersonal("currentLocation", value)} placeholder="City, country" />
          <Field label="🔗 LinkedIn" value={profile.personal.linkedinUrl} onChange={(value) => updatePersonal("linkedinUrl", value)} placeholder="https://www.linkedin.com/in/…" />
          <Field label="🎨 Portfolio" value={profile.personal.portfolioUrl} onChange={(value) => updatePersonal("portfolioUrl", value)} placeholder="https://…" />
          <Field label="Other professional link" value={profile.personal.otherLink} onChange={(value) => updatePersonal("otherLink", value)} placeholder="GitHub, ArtStation, personal site…" />
        </div>
      </Section>

      <Section id="summary" icon="🧭" title="Professional summary" description="A concise, honest overview of your background and the contribution you want to make. You can refine the wording later.">
        <Field
          label="Professional summary"
          value={profile.professionalSummary}
          onChange={(value) => updateProfile("professionalSummary", value)}
          multiline
          rows={5}
          placeholder="Describe your professional background, strongest capabilities, relevant projects and the kinds of problems you enjoy solving…"
          hint="Keep this factual. The profile does not automatically rewrite your CV or generate claims."
        />
      </Section>

      <Section id="experience" icon="💼" title="Work experience" description="Keep employer names, job titles and dates accurate. Add responsibilities and achievements separately where possible.">
        {profile.experience.length === 0 ? <EmptyList>No work experience has been added yet.</EmptyList> : null}
        <div className="profile-record-list">
          {profile.experience.map((item, index) => (
            <article className="profile-record" key={item.id}>
              <div className="profile-record-heading">
                <h3>Experience {index + 1}</h3>
                <button className="text-button is-danger" type="button" onClick={() => removeCollectionItem("experience", item.id)}>Remove</button>
              </div>
              <div className="profile-form-grid">
                <Field label="Employer" value={item.employer} onChange={(value) => updateCollectionItem("experience", item.id, { employer: value })} />
                <Field label="Exact job title" value={item.title} onChange={(value) => updateCollectionItem("experience", item.id, { title: value })} />
                <Field label="Location (optional)" value={item.location} onChange={(value) => updateCollectionItem("experience", item.id, { location: value })} />
                <Field label="Start date" placeholder="e.g. Sep 2023" value={item.startDate} onChange={(value) => updateCollectionItem("experience", item.id, { startDate: value })} />
                <Field label="End date" placeholder="e.g. Present" value={item.endDate} onChange={(value) => updateCollectionItem("experience", item.id, { endDate: value })} hint="Leave empty for a current position." />
                <Field label="Responsibilities" value={item.responsibilities} onChange={(value) => updateCollectionItem("experience", item.id, { responsibilities: value })} multiline rows={4} />
                <Field label="Achievements and outcomes" value={item.achievements} onChange={(value) => updateCollectionItem("experience", item.id, { achievements: value })} multiline rows={4} />
              </div>
            </article>
          ))}
        </div>
        <button className="btn btn-outline-secondary btn-sm profile-add-button" type="button" onClick={addExperience}>＋ Add experience</button>
      </Section>

      <Section id="education" icon="🎓" title="Education" description="Include degrees and other formal education that are relevant to your professional background.">
        {profile.education.length === 0 ? <EmptyList>No education records have been added yet.</EmptyList> : null}
        <div className="profile-record-list">
          {profile.education.map((item, index) => (
            <article className="profile-record" key={item.id}>
              <div className="profile-record-heading">
                <h3>Education {index + 1}</h3>
                <button className="text-button is-danger" type="button" onClick={() => removeCollectionItem("education", item.id)}>Remove</button>
              </div>
              <div className="profile-form-grid">
                <Field label="Qualification" value={item.qualification} onChange={(value) => updateCollectionItem("education", item.id, { qualification: value })} />
                <Field label="Institution" value={item.institution} onChange={(value) => updateCollectionItem("education", item.id, { institution: value })} />
                <Field label="Start date" type="month" value={item.startDate} onChange={(value) => updateCollectionItem("education", item.id, { startDate: value })} />
                <Field label="End date" type="month" value={item.endDate} onChange={(value) => updateCollectionItem("education", item.id, { endDate: value })} />
                <Field label="Additional details" value={item.details} onChange={(value) => updateCollectionItem("education", item.id, { details: value })} multiline rows={3} />
              </div>
            </article>
          ))}
        </div>
        <button className="btn btn-outline-secondary btn-sm profile-add-button" type="button" onClick={addEducation}>＋ Add education</button>
      </Section>

      <Section id="projects" icon="🎮" title="Projects and training" description="Keep personal projects, bootcamps, coursework and certifications distinct from paid employment.">
        {profile.projects.length === 0 ? <EmptyList>No projects or training records have been added yet.</EmptyList> : null}
        <div className="profile-record-list">
          {profile.projects.map((item, index) => (
            <article className="profile-record" key={item.id}>
              <div className="profile-record-heading">
                <h3>Project or training {index + 1}</h3>
                <button className="text-button is-danger" type="button" onClick={() => removeCollectionItem("projects", item.id)}>Remove</button>
              </div>
              <div className="profile-form-grid">
                <Field label="Name" value={item.name} onChange={(value) => updateCollectionItem("projects", item.id, { name: value })} />
                <Field label="Type" value={item.kind} onChange={(value) => updateCollectionItem("projects", item.id, { kind: value })} placeholder="Personal project, bootcamp, course, certification…" />
                <Field label="Link (optional)" value={item.url} onChange={(value) => updateCollectionItem("projects", item.id, { url: value })} placeholder="https://…" />
                <Field label="Start date" type="month" value={item.startDate} onChange={(value) => updateCollectionItem("projects", item.id, { startDate: value })} />
                <Field label="End date" type="month" value={item.endDate} onChange={(value) => updateCollectionItem("projects", item.id, { endDate: value })} />
                <Field label="Description and your contribution" value={item.description} onChange={(value) => updateCollectionItem("projects", item.id, { description: value })} multiline rows={4} />
              </div>
            </article>
          ))}
        </div>
        <button className="btn btn-outline-secondary btn-sm profile-add-button" type="button" onClick={addProject}>＋ Add project or training</button>
      </Section>

      <Section id="skills" icon="🧩" title="Skills and evidence" description="A skill label is not a claim by itself. Record where and how you have used it; missing evidence is not automatically a confirmed gap.">
        {profile.skills.length === 0 ? <EmptyList>No skills have been added yet.</EmptyList> : null}
        <div className="profile-record-list">
          {profile.skills.map((item, index) => (
            <article className="profile-record" key={item.id}>
              <div className="profile-record-heading">
                <h3>Skill {index + 1}</h3>
                <button className="text-button is-danger" type="button" onClick={() => removeCollectionItem("skills", item.id)}>Remove</button>
              </div>
              <div className="profile-form-grid">
                <Field label="Skill or technology" value={item.name} onChange={(value) => updateCollectionItem("skills", item.id, { name: value })} placeholder="e.g. REST APIs, SQL, Kubernetes" />
                <Field label="Category" value={item.category} onChange={(value) => updateCollectionItem("skills", item.id, { category: value })} placeholder="Technical, tool, domain, collaboration…" />
                <label className="form-field profile-field">
                  <span>Evidence level</span>
                  <select className="form-select" value={item.evidence} onChange={(event) => updateCollectionItem("skills", item.id, { evidence: event.target.value as SkillEvidence })}>
                    {Object.entries(evidenceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <Field label="Evidence source" value={item.evidenceSource} onChange={(value) => updateCollectionItem("skills", item.id, { evidenceSource: value })} placeholder="Employer, role, project or training record" />
                <Field label="What supports this assessment?" value={item.evidenceDetails} onChange={(value) => updateCollectionItem("skills", item.id, { evidenceDetails: value })} multiline rows={3} />
              </div>
            </article>
          ))}
        </div>
        <button className="btn btn-outline-secondary btn-sm profile-add-button" type="button" onClick={addSkill}>＋ Add skill</button>
      </Section>

      <Section id="materials" icon="📄" title="Master application materials" description="Keep one reusable master package. Original documents are stored unchanged; no automatic tailoring or submission happens here.">
        <div className="profile-material-grid">
          <div className="profile-material-card">
            <h3>Master resume</h3>
            <p>Attach one PDF or DOCX and/or keep a text representation for future evidence mapping.</p>
            {profile.materials.masterResume ? (
              <div className="profile-document-row">
                <span><strong>{profile.materials.masterResume.name}</strong><small>{(profile.materials.masterResume.size / 1024 / 1024).toFixed(2)} MB · Original file preserved</small></span>
                <div>
                  <button className="text-button" type="button" onClick={() => downloadDocument(profile.materials.masterResume!)}>Download</button>
                  <button className="text-button is-danger" type="button" onClick={() => updateMaterials("masterResume", null)}>Remove</button>
                </div>
              </div>
            ) : <p className="profile-empty-list">No resume document attached.</p>}
            <label className="btn btn-outline-secondary btn-sm profile-file-action">
              {profile.materials.masterResume ? "Replace resume" : "Attach resume"}
              <input
                key={resumeInputKey}
                className="visually-hidden"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  void handleDocumentChange(event, "masterResume");
                  setResumeInputKey((current) => current + 1);
                }}
              />
            </label>
            <Field label="Resume text (optional)" value={profile.materials.resumeText} onChange={(value) => updateMaterials("resumeText", value)} multiline rows={7} placeholder="Paste or maintain the text version of your master resume…" />
          </div>
          <div className="profile-material-card">
            <h3>Master motivation letter / message</h3>
            <p>Maintain one honest, reusable message. Studio-specific edits should be deliberate and reviewed separately.</p>
            {profile.materials.motivationDocument ? (
              <div className="profile-document-row">
                <span><strong>{profile.materials.motivationDocument.name}</strong><small>{(profile.materials.motivationDocument.size / 1024 / 1024).toFixed(2)} MB · Original file preserved</small></span>
                <div>
                  <button className="text-button" type="button" onClick={() => downloadDocument(profile.materials.motivationDocument!)}>Download</button>
                  <button className="text-button is-danger" type="button" onClick={() => updateMaterials("motivationDocument", null)}>Remove</button>
                </div>
              </div>
            ) : <p className="profile-empty-list">No motivation document attached.</p>}
            <label className="btn btn-outline-secondary btn-sm profile-file-action">
              {profile.materials.motivationDocument ? "Replace document" : "Attach document"}
              <input
                key={motivationInputKey}
                className="visually-hidden"
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(event) => {
                  void handleDocumentChange(event, "motivationDocument");
                  setMotivationInputKey((current) => current + 1);
                }}
              />
            </label>
            <Field label="Motivation text" value={profile.materials.motivationLetter} onChange={(value) => updateMaterials("motivationLetter", value)} multiline rows={7} placeholder="Your reusable introduction, motivation and relevant contribution…" />
          </div>
        </div>
        <p className="profile-field-hint">PDF/DOCX files are stored as local browser data. This first version does not extract text from attachments; paste text above when you want it available for later matching.</p>
      </Section>

      <Section id="preferences" icon="🎯" title="Application preferences" description="Choose from structured options to guide your private opportunity priority. These preferences do not remove or change studios in the global directory.">
        <div className="profile-preference-grid">
          <ChoiceGroup
            id="profile-role-families"
            label="Role families"
            selected={profile.preferences.roleFamilies}
            options={ROLE_FAMILY_OPTIONS}
            onToggle={(option, checked) => toggleListPreference("roleFamilies", option, checked)}
            hint="Select every role family you would seriously consider."
          />
          <ChoiceGroup
            id="profile-studio-types"
            label="Studio types"
            selected={profile.preferences.studioTypes}
            options={STUDIO_TYPE_OPTIONS}
            onToggle={(option, checked) => toggleListPreference("studioTypes", option, checked)}
            hint="Select the kinds of studios or development organisations that interest you."
          />
          <ChoiceGroup
            id="profile-work-models"
            label="Work arrangements"
            selected={profile.preferences.workModels}
            options={WORK_MODEL_OPTIONS}
            onToggle={(option, checked) => toggleListPreference("workModels", option, checked)}
            hint="Select all arrangements you would consider."
          />
          <div className="profile-region-preferences">
            <p className="profile-preference-intro">Set geographic priorities independently. Choose broad regions or open the country list for more precise choices.</p>
            <RegionPreferenceGroup
              id="profile-preferred-regions"
              label="Preferred regions"
              selected={profile.preferences.preferredRegions}
              onToggle={(option, checked) => toggleRegionPreference("preferredRegions", option, checked)}
            />
            <RegionPreferenceGroup
              id="profile-acceptable-regions"
              label="Acceptable regions"
              selected={profile.preferences.acceptableRegions}
              onToggle={(option, checked) => toggleRegionPreference("acceptableRegions", option, checked)}
            />
            <RegionPreferenceGroup
              id="profile-low-priority-regions"
              label="Lower-priority regions"
              selected={profile.preferences.lowPriorityRegions}
              onToggle={(option, checked) => toggleRegionPreference("lowPriorityRegions", option, checked)}
            />
          </div>
          <Field
            label="Additional notes (optional)"
            value={profile.preferences.additionalConsiderations}
            onChange={(value) => updatePreference("additionalConsiderations", value)}
            multiline
            rows={3}
            placeholder="Anything important that is not covered by the selections above…"
            hint="This is an optional note, not a matching filter. The structured choices above drive matching priority."
          />
        </div>
      </Section>

      <div className="profile-bottom-actions">
        <span>{dirty ? "You have unsaved changes." : "Your saved profile is available in this browser."}</span>
        <button className="btn btn-primary" type="button" disabled={!storageReady || !dirty || saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>
    </section>
  );
}
