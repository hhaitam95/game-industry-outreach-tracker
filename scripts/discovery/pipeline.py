"""Compatibility facade for discovery pipeline imports.

The implementation lives in fetch, adapters, state, and projection modules.
Keep these re-exports so callers and existing tests do not need import changes.
"""
from __future__ import annotations

from .adapters import (
    JobAnchorParser,
    JsonLdScriptParser,
    _types,
    _walk_json,
    extract_job_links,
    extract_job_postings,
    extract_jsonld,
    parse_iso_date,
)
from .fetch import (
    DEFAULT_RETRIES,
    DEFAULT_TIMEOUT_SECONDS,
    MAX_RESPONSE_BYTES,
    USER_AGENT,
    FetchResult,
    SameHostHTTPSRedirectHandler,
    canonical_url,
    fetch_source,
)
from .projection import (
    PUBLIC_FIELDS,
    _PRIVATE_KEY_PARTS,
    public_projection,
    validate_public_projection,
    write_json,
)
from .state import (
    CLOSURE_ABSENCE_THRESHOLD,
    MAX_EVENTS,
    SCHEMA_VERSION,
    _event,
    apply_scan,
    empty_state,
    load_state,
    utc_now,
)
