export type TrackerStatus =
  | "saved"
  | "in_progress"
  | "applied"
  | "interview"
  | "offer"
  | "archived";

export type ApplicationPreparation = {
  routeVerified: boolean;
  requirementsReviewed: boolean;
  resumeReady: boolean;
  motivationReady: boolean;
  portfolioReady: boolean;
  answersReviewed: boolean;
  requirementsNotes: string;
  draftAnswers: string;
};

export type TrackedApplication = {
  id: string;
  studioName: string;
  websiteUrl: string;
  applicationUrl: string;
  country: string;
  countryCode?: string;
  hqLabel: string;
  applicationLocation?: string;
  /** Snapshot of the employer's published application-route instructions when saved. */
  routeType?: string;
  routeStatus?: string;
  routeCheckedAt?: string;
  routeEvidenceUrl?: string;
  routeNotes?: string;
  workModel?: string;
  submissionMethods?: string[];
  eligibleLocations?: string[];
  disciplineScope?: string[];
  status: TrackerStatus;
  createdAt: string;
  updatedAt: string;
  appliedAt: string | null;
  note: string;
  preparation?: ApplicationPreparation;
};
