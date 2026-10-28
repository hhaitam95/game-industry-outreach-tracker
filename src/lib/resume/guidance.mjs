import overview from "../../../docs/resume-guidelines/README.md?raw";
import atsFormatting from "../../../docs/resume-guidelines/ATS_FORMATTING.md?raw";
import technicalResumes from "../../../docs/resume-guidelines/TECHNICAL_RESUMES.md?raw";
import gameIndustry from "../../../docs/resume-guidelines/GAME_INDUSTRY_CONTEXT.md?raw";
import keywordsEvidence from "../../../docs/resume-guidelines/KEYWORDS_AND_EVIDENCE.md?raw";
import sources from "../../../docs/resume-guidelines/SOURCES.md?raw";

export const RESUME_GUIDANCE_VERSION = "1.0 draft · reviewed 2026-10-24";

/** @type {Array<{id: string, title: string, relevance: string, markdown: string}>} */
export const RESUME_GUIDANCE_DOCUMENTS = Object.freeze([
  { id: "overview", title: "How to use this guidance", relevance: "General process and caveats", markdown: overview },
  {
    id: "ats-formatting",
    title: "ATS-friendly formatting",
    relevance: "Layout, typography, structure, and submission format",
    markdown: atsFormatting,
  },
  {
    id: "technical-resumes",
    title: "Technical-resume evidence",
    relevance: "Support, tooling, QA, production, and infrastructure roles",
    markdown: technicalResumes,
  },
  {
    id: "game-industry",
    title: "Game-industry context",
    relevance: "Technical and creative role-specific framing",
    markdown: gameIndustry,
  },
  {
    id: "keywords-evidence",
    title: "Keywords, grammar, and evidence",
    relevance: "Truthful keyword use and reviewable suggestions",
    markdown: keywordsEvidence,
  },
  {
    id: "sources",
    title: "Source references and caveats",
    relevance: "Source URLs, review dates, and applicability limits",
    markdown: sources,
  },
]);
