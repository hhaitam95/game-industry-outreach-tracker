# Resume Guidance Library

**Version:** 1.0 draft  
**Last reviewed:** 2026-10-24  
**Status:** Initial synthesized guidance; review periodically

This repository maintains a concise, source-linked reference library for the resume analysis and generation workflow. It is guidance, not a universal standard. Employer instructions, local job-market conventions, role type and the candidate's actual evidence take precedence.

## Files

- ATS_FORMATTING.md — readable and conservative technical-resume layout.
- TECHNICAL_RESUMES.md — evidence-based software, support, QA, tooling and infrastructure content.
- GAME_INDUSTRY_CONTEXT.md — how the resume should reflect the target game-development function.
- KEYWORDS_AND_EVIDENCE.md — truthful keyword use, achievements and transferable skills.
- SOURCES.md — sources, links, review dates and scope.

## How the application should use this library

1. Select the relevant role family and target market when known.
2. Apply general readability/ATS checks, while allowing the employer's application instructions to override defaults.
3. Explain each finding and distinguish a definite issue from a heuristic.
4. Never silently add skills, metrics, achievements, game credits, or qualifications not supported by the user's profile/CV.
5. Record which guidance version informed a generated resume.
6. Keep the guidance available at build time as a versioned local/static resource; the app should not fetch private guidance dynamically from a server.
7. Recheck source links and review this library periodically. If a source changes or a rule is disputed, update this document and note the rationale in the project decision log.

The initial guidance focuses on ATS-friendly technical roles. Creative VFX applications may need a separate resume/portfolio strategy.
