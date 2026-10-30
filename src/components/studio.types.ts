export type TrackerStatus="saved"|"in_progress"|"applied"|"interview"|"offer"|"archived";

export type TrackedApplication={
  id:string;
  studioName:string;
  websiteUrl:string;
  applicationUrl:string;
  country:string;
  hqLabel:string;
  status:TrackerStatus;
  createdAt:string;
  updatedAt:string;
  appliedAt:string|null;
  note:string;
};
