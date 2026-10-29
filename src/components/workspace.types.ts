export type RoleReviewProfile = {
  headline: string;
  professionalSummary: string;
  targetRoles: string[];
  skills: string[];
};

export type RoleLeadPrefillData = {
  studioId: string;
  studioName: string;
  roleTitle: string;
  applicationUrl: string;
};

export type RoleLeadPrefill = RoleLeadPrefillData & {
  requestId: string;
};

export type PrivateWorkspaceSummary = {
  draftCount: number;
  applicationCount: number;
  dueFollowUpCount: number;
};
