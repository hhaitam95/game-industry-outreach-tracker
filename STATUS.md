# StudioScout status

**Date:** 2026-10-30  
**Current goal:** Make the studio directory and application tracker straightforward, functional and reliable before adding visual polish.

## Website

- Two pages: Studio directory and My applications.
- Directory data: 89 researched studio records in `src/data/speculative-route-directory.json`; all currently carry an active application-route status.
- Studio details are pared back to the fields needed to find and assess a speculative route.
- Tracker stages: Saved, In Progress, Applied, Interview, Offer and Archived.
- Tracker storage: browser localStorage only; no personal application data is stored in the repository.
- Current UI implementation branch: `feat/studioscout-functional-mvp`.

## Automation

- A separate older discovery prototype scans advertised job postings and is not suitable for the studio-speculative-route use case.
- The studio-route discovery engine and hourly GitHub Actions workflow are still to be implemented on the default branch.
- Automation must verify official speculative/open application routes and must never treat temporary failures as closure.

## Next

1. Run CI and browser acceptance for the simplified two-page UI.
2. Fix any build/test failures.
3. Implement resumable, batched discovery of studios that accept speculative applications.
4. Enable hourly maintenance only after a successful initial discovery run and validation.
