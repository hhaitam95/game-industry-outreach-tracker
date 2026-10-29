 expression returned the final DOM element while the CDP helper requires by-value serializable results; the protocol failure is now understood. Frontend lint/typecheck/tests/audit/build and discovery fixtures passed, while formatting failed on two exact lines documented by the formatter.
- **Correction:** Make the render condition return a boolean and apply the exact two Prettier changes. No workflow or permissions change.
- **Verification limit:** This is the second and final CI cycle for this diagnostic unit. If browser acceptance is still failing, preserve the named safe checkpoint and document the unresolved category; do not make speculative edits or dispatch/rerun workflows.
- **Acceptance:** The browser test must pass all new checkpoints plus existing vault tests before the PR is marked ready.

## ADR-048 — Return serializable booleans from all Phase 6c wait predicates

- **Date:** 2026-10-29
- **Status:** Corrective change committed; final exact-head CI pending.
- **Context:** ADR-047's second/final checkpoint run passed synthetic TXT/DOCX/PDF extraction and structured editor/export controls (9/10 checkpoints) before failing at the handoff-disclosure checkpoint. The remaining wait predicate returned a DOM element to the browser helper's Runtime.evaluate call, which requires by-value serialization.
- **Decision:** Wrap the handoff-panel presence predicate in Boolean(...), and audit all client.waitFor(...) call sites in the browser smoke script to ensure predicates return scalar booleans rather than DOM nodes. Preserve the underlying assertion and content/privacy checks.
- **Verification:** This is a narrowly scoped follow-up fix for the second discovered occurrence. The normal repository CI triggered by this commit is the only verification cycle for ADR-048. No workflow dispatch, manual rerun, trigger/permission change, or PR merge.
- **Acceptance:** Frontend CI, discovery fixtures, and the full browser suite must pass on this exact head. If any further issue appears, record it and stop rather than begin another speculative CI loop.
