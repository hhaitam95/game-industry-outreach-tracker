import type { analyzeResume } from "../lib/resume/analysis.mjs";
import type { extractResumeDocument } from "../lib/resume/document-extractor.mjs";
import type { validateWorkspaceData } from "../lib/private-data/schema.mjs";

export type Extraction = Awaited<ReturnType<typeof extractResumeDocument>>;
export type ResumeProfile = ReturnType<typeof validateWorkspaceData>["profile"];
export type ResumeAnalysis = ReturnType<typeof analyzeResume>;
