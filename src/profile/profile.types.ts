export const PROFILE_SCHEMA_VERSION = 1 as const;

export type SkillEvidence =
  | "demonstrated"
  | "transferable"
  | "learning_exposure"
  | "not_evidenced"
  | "user_confirmed_gap";

export type ProfileDocument = {
  name: string;
  mimeType: string;
  size: number;
  lastModified: number;
  dataBase64: string;
};

export type CandidateExperience = {
  id: string;
  employer: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  achievements: string;
};

export type CandidateEducation = {
  id: string;
  qualification: string;
  institution: string;
  startDate: string;
  endDate: string;
  details: string;
};

export type CandidateProject = {
  id: string;
  name: string;
  kind: string;
  url: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type CandidateSkill = {
  id: string;
  name: string;
  category: string;
  evidence: SkillEvidence;
  evidenceDetails: string;
  evidenceSource: string;
};

export type CandidateProfile = {
  schemaVersion: typeof PROFILE_SCHEMA_VERSION;
  updatedAt: string | null;
  personal: {
    fullName: string;
    email: string;
    phone: string;
    currentLocation: string;
    linkedinUrl: string;
    portfolioUrl: string;
    otherLink: string;
  };
  professionalSummary: string;
  experience: CandidateExperience[];
  education: CandidateEducation[];
  projects: CandidateProject[];
  skills: CandidateSkill[];
  materials: {
    masterResume: ProfileDocument | null;
    resumeText: string;
    motivationLetter: string;
    motivationDocument: ProfileDocument | null;
  };
  preferences: {
    roleFamilies: string[];
    studioTypes: string[];
    workModels: string[];
    preferredRegions: string[];
    acceptableRegions: string[];
    lowPriorityRegions: string[];
    additionalConsiderations: string;
  };
};

export const MAX_PROFILE_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const PROFILE_BACKUP_FORMAT = "game-industry-outreach-candidate-profile";
