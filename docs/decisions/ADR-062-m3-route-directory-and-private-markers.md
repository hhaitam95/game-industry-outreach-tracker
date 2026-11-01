# ADR-062 — M3 route directory UI and private tracking markers

- Date: 2026-10-29
- Status: Design completed before implementation; implementation is scoped to the M3 branch.
- Depends on: M2 speculative-route domain contract (merged as \`713a4cf\`).

## Goals

1. Make the versioned speculative-route directory usable through search, structured filters, deterministic sorting, pagination, and evidence-first route cards.
2. Let the owner privately label an eligible curated route as Planned or Applied without submitting anything or creating an application record.
3. Add private markers to the encrypted workspace as schema version 3 and migrate existing v2 vault data without losing profile, resume metadata, drafts, application notes, statuses, history, or draft lineage.

## Directory presentation

- Route records are sourced only from the M2 loader and its shared schema. Join studio display names by \`studioId\`; never infer speculative acceptance from generic studio catalog entries.
- Expose route status, route type, country scope/codes, language, discipline, work model, a short evidence paraphrase, official route URL, evidence URL, first-seen date, last-checked date and last-verified date.
- Search across studio name and route metadata; filters cover lifecycle status, route type, country scope, and discipline. Sorting is stable and uses explicit route fields. Pagination has a fixed page size and resets when filters change.
- When loader origin is \`sample\`, identify the synthetic sample prominently and disable tracking controls. Never permit a fake sample record to be marked as submitted or planned. With curated routes, the UI must show each record's actual status rather than imply that the whole directory is verified.
- Keep the separate starter-studio catalog as research context, visibly below the route directory. It is not part of the verified-route count and does not become application-route evidence.

## Private marker v1 (workspace schema v3)

- Add an exact-key \`routeMarkers\` array to the encrypted workspace; each marker has its own record ID, public route ID, studio ID/name snapshot, HTTPS route URL, status (\`planned\` or \`applied\`), createdAt and updatedAt.
- Allow at most 1,000 markers, require unique record IDs and one marker per route ID, and reject HTTP, credential-bearing or malformed route URLs. The marker contains no CV/profile/resume content and does not reuse the existing \`applications\` record type.
- The directory displays a marker only from the decrypted in-memory workspace passed by the vault owner. Locking/deleting the vault clears the route-tracking view from UI state. No marker is written to a public file, browser localStorage, API or server.
- The Planned/Applied state is only a manual private label. It does not launch a browser, send a message, submit a form, or claim that an application was successfully received.
- Preserve markers when a route later disappears from the current directory; show them in a separate list of saved markers whose route is not currently listed, so a data refresh does not silently delete user-owned history.

## Migration and backup compatibility

- Schema v3 is the current workspace schema. v2 payloads are validated against their old exact key set, then migrate in memory to v3 with an empty \`routeMarkers\` array. Preserve every existing v2 field.
- Keep v1 compatibility by validating/migrating v1 → v2 → v3. Do not silently accept unexpected keys at either migration boundary.
- New vaults and encrypted backups use v3. Opening a v1/v2 encrypted backup validates and migrates decrypted data in memory; the next explicit save/export writes a v3 encrypted envelope under the same existing encryption format. Never store plaintext or attempt automatic sending.
- Keep the existing vault envelope format and cryptographic parameters unchanged; do not add dependencies.

## M3 definition of done

1. Add deterministic search/filter/sort/page helpers with unit tests, and build an accessible, responsive route directory with evidence and status on each route card.
2. Label sample origin clearly and disable its Planned/Applied controls.
3. Add encrypted workspace v3 marker validation and UI integration for curated routes; all changes flow through the existing validate → encrypt → IndexedDB save path.
4. Test v2 → v3 and v1 → v2 → v3 migrations, preservation of old records, route-marker strictness/uniqueness, encrypted backup round-trip, and existing vault behavior.
5. Expose orphaned markers without discarding them when current public route data lacks the route.
6. Update browser acceptance to cover the directory UI and its trust boundary. Keep the studio catalog as separate research context.
7. No new dependency, workflow permission, schedule, live scan, publication, external submission, or server-side storage. Frontend CI, discovery fixture tests and browser acceptance must pass on the exact final PR head.

## Rollback

Revert the M3 directory component/model and private workspace v3 migration together. Leave the M2 public contract and existing encrypted-vault envelope format unchanged.
