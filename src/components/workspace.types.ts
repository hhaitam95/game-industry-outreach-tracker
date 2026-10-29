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


export type PrivateRouteMarkerStatus = "planned" | "applied";

export type PrivateRouteMarker = {
  id: string;
  routeId: string;
  studioId: string;
  studioName: string;
  routeUrl: string;
  status: PrivateRouteMarkerStatus;
  createdAt: string;
  updatedAt: string;
};

export type SpeculativeRouteMarkerInput = {
  routeId: string;
  studioId: string;
  studioName: string;
  routeUrl: string;
};

export type PrivateRouteTrackingState = {
  markers: PrivateRouteMarker[];
  setMarker: (
    route: SpeculativeRouteMarkerInput,
    status: PrivateRouteMarkerStatus | null,
  ) => Promise<boolean>;
};
