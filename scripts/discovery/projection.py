"""Allowlisted public projection and JSON output for discovery state."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .fetch import canonical_url
from .state import utc_now

PUBLIC_FIELDS = {
    "id", "studioId", "studioName", "title", "url", "locations", "employmentType",
    "datePosted", "validThrough", "status", "sourceUrl", "firstSeenAt", "lastSeenAt",
    "lastChangedAt", "observedAt", "contentHash",
}
_PRIVATE_KEY_PARTS = ("resume", "candidate", "profile", "draft", "applicationstatus", "personal", "email", "notes")
def public_projection(state: dict[str, Any], studio_sources: dict[str, str] | None = None) -> dict[str, Any]:
    """Return a strict public allowlist projection; never export operational or candidate state."""
    studio_sources = studio_sources or {}
    opportunities = []
    for job in state.get("opportunities", {}).values():
        if not isinstance(job, dict):
            continue
        entry = {
            "id": job.get("id"),
            "studioId": job.get("studio_id"),
            "studioName": job.get("studio_name"),
            "title": job.get("title"),
            "url": job.get("url"),
            "locations": job.get("locations", []),
            "employmentType": job.get("employment_type", []),
            "datePosted": job.get("date_posted"),
            "validThrough": job.get("valid_through"),
            "status": job.get("status"),
            "sourceUrl": job.get("source_url"),
            "firstSeenAt": job.get("first_seen_at"),
            "lastSeenAt": job.get("last_seen_at"),
            "lastChangedAt": job.get("last_changed_at"),
            "observedAt": job.get("observed_at"),
            "contentHash": job.get("content_hash"),
        }
        if job.get("status") not in {"closed", "explicitly-closed"}:
            opportunities.append(entry)
    result = {"schemaVersion": 1, "generatedAt": state.get("updated_at", utc_now()), "opportunities": sorted(opportunities, key=lambda x: (x["studioId"] or "", x["title"] or "", x["id"] or ""))}
    validate_public_projection(result)
    return result


def validate_public_projection(value: dict[str, Any]) -> None:
    if set(value) != {"schemaVersion", "generatedAt", "opportunities"} or value.get("schemaVersion") != 1 or not isinstance(value.get("opportunities"), list):
        raise ValueError("Public discovery projection has an unsupported shape.")
    for item in value["opportunities"]:
        if not isinstance(item, dict) or set(item) != PUBLIC_FIELDS:
            raise ValueError("Public opportunity contains missing or unsupported fields.")
        for key in item:
            if any(part in key.lower().replace("_", "") for part in _PRIVATE_KEY_PARTS):
                raise ValueError(f"Public projection contains a prohibited field: {key}")
        if item.get("status") not in {"announced", "last-seen", "stale", "needs-review", "unavailable"}:
            raise ValueError("Public projection has an unsupported public opportunity status.")
        for key in ("url", "sourceUrl"):
            if not canonical_url(item.get(key, "")):
                raise ValueError(f"Public opportunity has an invalid {key}.")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)
