import type { analyzeResume } from "../lib/resume/analysis.mjs";
import type { extractResumeDocument } from "../lib/resume/document-extractor.mjs";
import type { validateWorkspaceData } from "../lib/private-data/schema.mjs";

export type Extraction = Awaited<ReturnType<typeof extractResumeDocument>>;
export type ResumeProfile = ReturnType<typeof validateWorkspaceData>["profile"];
export type ResumeAnalysis = ReturnType<typeof analyzeResume>;

export type ResumeSection =
  | "Summary"
  | "Experience"
  | "Skills"
  | "Education"
  | "Projects"
  | "Certifications"
  | "Portfolio"
  | "Languages"
  | "Awards"
  | "Other";

export type ResumeBlockOrigin = "imported" | "typed" | "ai-paste";

export type ResumeModelBlock = {
  id: string;
  section: ResumeSection;
  content: string;
  origin: ResumeBlockOrigin;
  originalContent: string;
  modified: boolean;
};

export type ResumeBaselineBlock = {
  id: string;
  section: ResumeSection;
  content: string;
};

export type StructuredResumeDocument = {
  version: 1;
  nextId: number;
  baseline: ResumeBaselineBlock[];
  blocks: ResumeModelBlock[];
};
