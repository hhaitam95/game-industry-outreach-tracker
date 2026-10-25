# Phase 3 — Manual studio catalogue

Status: Initial catalogue and data-contract foundation implemented on feat/phase3-manual-studio-catalog. Confirm standard CI and browser-acceptance results on the current commit before treating this milestone as accepted.

## Included in this increment

- Four source-linked starter records: CD PROJEKT RED, Naughty Dog, Santa Monica Studio, and Riot Games.
- Separate entities for studios, physical sites, ownership relationships, games, studio-credit roles, advertised opportunities, application routes, source evidence, and change events.
- Strict validation for stable IDs, HTTPS URLs, entity references, enumerated statuses, duplicate studio names, and direct evidence for verified routes.
- A searchable catalogue page for studio name, location, ownership name, and game title.
- Official websites, official career entry points, source labels, source type, access date, and verification date.
- Browser acceptance check for the four catalogue cards on the Phase 3 feature branch.
- No crawler, live vacancy import, or private application integration.

## Data semantics

- The studio registry is not a vacancy list. The opportunities and changeEvents collections intentionally start empty; the UI does not imply current vacancies exist.
- A verified application route means its URL was checked against a directly matching official source record on the recorded date. It is not a guarantee that the link will remain reachable or that any role is open.
- developer, co-developer, publisher, porting, support, and other are distinct credit types. Each seeded credit points to evidence.
- Missing ownership information means unknown/not yet verified, not independent ownership.
- Source records are manually curated. No scheduled polling or website crawling is included in this phase.
- The public studio catalogue is separate from encrypted private workspace data. Studio career links do not create, inspect, or update personal application records.

## Manual maintenance procedure

1. Inspect the official studio/company/careers page and record the exact URL as a source with an access date.
2. Add or update studio, site, ownership, game, and credit entities separately; keep stable slug IDs and explicit credit roles.
3. Add an application route only when its intended destination is supported by a direct source URL. Mark it verified only when its URL matches a source URL in the same record.
4. Do not add a role to opportunities merely because a careers page exists. Record an advertised role only after directly verifying the role-specific posting, status, evidence, and observation date.
5. Treat unavailable pages, blocking, and parse errors as unknown/unavailable; do not infer closure.
6. Run CI and review visible profile/source links. Revisit source records when they become stale; do not silently update verification dates without re-checking them.

## Known limits

- The four entries are a deliberately small starter sample, not a ranking or claim of worldwide coverage.
- Source facts and route availability can change after the recorded check date.
- This increment is not an independent security audit and does not test every possible malformed payload.
