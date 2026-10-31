# ADR-078: consolidate duplicate FakeFish studio identity

**Status:** Implemented on branch `fix/fakefish-duplicate-and-checkpoint-20261031`; pending exact-head CI and merge  
**Date:** 2026-10-31  
**Scope:** Public studio directory, studio profiles and directory validation.

## Context

After PR #70 was merged, the directory contained both `Fakefish` and `FakeFish Games`. Both records pointed to the same official website, the same dedicated Open Application form and the same Jobs evidence page. The profiles also described the same Turku studio and its Barotrauma development.

The official company website brands the studio as **FakeFish** and identifies the legal company as FakeFish Oy. Its own About page confirms the Turku headquarters and 2014 founding. The Finnish game-industry studio listings also use the name FakeFish.

Sources:
- Official website: https://www.fakefishgames.com/
- Official About page: https://www.fakefishgames.com/about-us
- Official Jobs page: https://www.fakefishgames.com/jobs
- Official Open Application: https://www.fakefishgames.com/jobs/open-application
- Play Finland studio index: https://www.playfinland.fi/studios

## Decision

- Retain one directory entry, canonicalized to **FakeFish**.
- Retain the richer current official route/profile details from the later FakeFish Games record, including its open-form submission method, discipline scope and current workplace/location caveats.
- Merge the earlier profile's source references into the surviving profile so candidate provenance is not lost.
- Remove the duplicate `Fakefish` row and `FakeFish Games` row/profile key after creating the single canonical replacement.
- Add an exact duplicate-route guard to `scripts/check-studio-directory.mjs`: two rows cannot share the same canonical official website, application URL and evidence URL tuple.

This is an identity-resolution correction, not the removal of a distinct studio or application route.

## Result

- Public directory: 313 unique studios and 313 matching profiles.
- Route status: 308 active and 5 paused.
- The one FakeFish open-application route remains active.
