export const APPLICATION_PREPARATION_CHECKLIST = Object.freeze([
  { key: "routeVerified", label: "Official application route rechecked" },
  { key: "requirementsReviewed", label: "Requirements and questions reviewed" },
  { key: "resumeReady", label: "Resume / CV selected and ready" },
  { key: "motivationReady", label: "Motivation letter reviewed" },
  { key: "portfolioReady", label: "Portfolio and supporting materials ready" },
  { key: "answersReviewed", label: "Application answers reviewed" },
]);

/**
 * Return a fresh preparation state for a newly selected application.
 */
export function createEmptyApplicationPreparation() {
  return {
    routeVerified: false,
    requirementsReviewed: false,
    resumeReady: false,
    motivationReady: false,
    portfolioReady: false,
    answersReviewed: false,
    requirementsNotes: "",
    draftAnswers: "",
  };
}
