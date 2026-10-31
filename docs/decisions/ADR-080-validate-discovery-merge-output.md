# ADR-080: validate the public directory after automated discovery merging

**Status:** Proposed in PR #73  
**Date:** 2026-10-31  
**Scope:** Automated discovery workflow and directory integrity.

## Context

The discovery workflow validated the current checkout before merging its newly verified candidate output with the latest published dataset. The merge step can create or preserve records that were not present in the pre-merge checkout. A duplicate employer route was found in main: ByteRockers' Games and Byterockers’ Games had different name punctuation but the same official website, application URL and evidence URL. Directory validation and a duplicate-route regression test existed, but the workflow did not rerun the public-dataset validator after the merge script committed a new dataset.

## Decision

Add a dedicated npm run check:studio-directory workflow step immediately after the merge step and before any post-merge build, artifact upload or deployment. This validates the exact merged output for duplicate routes, profile cardinality and secure URLs. If validation fails, the pipeline stops before deployment.

## Result

The branch consolidates the ByteRockers records into one canonical ByteRockers' Games row, preserving merged profile-source provenance, and adds the post-merge validation step. The existing duplicate-route validator test remains the regression guard.
