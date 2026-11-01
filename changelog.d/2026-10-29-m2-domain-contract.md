# M2 — speculative-route domain contract

- Add a versioned, strict route-directory schema shared by the JavaScript and Python validators.
- Validate HTTPS evidence links, route-to-studio references, lifecycle state and timestamp invariants, route classifications, and public-data allowlists.
- Keep curated data empty until researched routes qualify; expose synthetic fallback origin and fail closed when curated input is invalid.
- Add offline tests for both validators without introducing dependencies, live scans, scheduled workflows, or publication changes.
