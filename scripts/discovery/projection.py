"""Allowlisted public projection and JSON output for discovery state."""
from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any

from .state import utc_now

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "schemas" / "public-opportunity-snapshot.schema.json"
PUBLIC_CONTRACT_SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
PUBLIC_FIELDS = frozenset(PUBLIC_CONTRACT_SCHEMA["$defs"]["publicOpportunity"]["properties"])
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


def _resolve_schema_reference(reference: str) -> dict[str, Any]:
    if not reference.startswith("#/"):
        raise ValueError("Unsupported public snapshot schema reference.")
    result: Any = PUBLIC_CONTRACT_SCHEMA
    for part in reference[2:].split("/"):
        result = result[part.replace("~1", "/").replace("~0", "~")]
    if not isinstance(result, dict):
        raise ValueError("Public snapshot schema reference must resolve to an object.")
    return result


def _matches_type(value: Any, expected: str) -> bool:
    if expected == "object":
        return isinstance(value, dict)
    if expected == "array":
        return isinstance(value, list)
    if expected == "string":
        return isinstance(value, str)
    if expected == "integer":
        return isinstance(value, int) and not isinstance(value, bool)
    if expected == "number":
        return isinstance(value, (int, float)) and not isinstance(value, bool)
    if expected == "boolean":
        return isinstance(value, bool)
    if expected == "null":
        return value is None
    raise ValueError(f"Unsupported public schema type: {expected}")


def _validate_format(value: str, format_name: str, label: str) -> None:
    if format_name == "date-time":
        pattern = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
        if not re.fullmatch(pattern, value):
            raise ValueError(f"{label} must be an RFC 3339 date-time with a timezone.")
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError(f"{label} must be a valid date-time.") from exc
        if parsed.tzinfo is None:
            raise ValueError(f"{label} must include a timezone.")
    elif format_name == "date":
        try:
            parsed_date = date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError(f"{label} must be a valid ISO date.") from exc
        if parsed_date.isoformat() != value:
            raise ValueError(f"{label} must be an ISO date.")
    elif format_name == "uri":
        from urllib.parse import urlsplit

        parsed = urlsplit(value)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError(f"{label} must be an HTTPS URL without embedded credentials.")


def _validate_against_schema(value: Any, schema: dict[str, Any], label: str) -> None:
    reference = schema.get("$ref")
    if reference:
        _validate_against_schema(value, _resolve_schema_reference(reference), label)
        return

    expected = schema.get("type")
    if expected:
        choices = expected if isinstance(expected, list) else [expected]
        if not any(_matches_type(value, choice) for choice in choices):
            raise ValueError(f"{label} has an invalid type.")
    if "const" in schema and value != schema["const"]:
        raise ValueError(f"{label} has an unsupported constant value.")
    if "enum" in schema and value not in schema["enum"]:
        raise ValueError(f"{label} has an unsupported value.")

    if isinstance(value, str):
        if "minLength" in schema and len(value) < schema["minLength"]:
            raise ValueError(f"{label} must not be empty.")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            raise ValueError(f"{label} does not match its required pattern.")
        if "format" in schema:
            _validate_format(value, schema["format"], label)

    if isinstance(value, list) and "items" in schema:
        for index, item in enumerate(value):
            _validate_against_schema(item, schema["items"], f"{label}[{index}]")
        unique_key = schema.get("x-uniqueBy")
        if unique_key:
            values = [item.get(unique_key) for item in value if isinstance(item, dict)]
            if len(values) != len(set(values)):
                raise ValueError("Duplicate public opportunity ID.")

    if isinstance(value, dict) and "properties" in schema:
        if any(key not in value for key in schema.get("required", [])):
            raise ValueError(f"{label} has missing or unsupported fields.")
        properties = schema["properties"]
        if schema.get("additionalProperties") is False and any(key not in properties for key in value):
            raise ValueError(f"{label} has missing or unsupported fields.")
        for key, child in value.items():
            if key in properties:
                _validate_against_schema(child, properties[key], f"{label}.{key}")


def validate_public_projection(value: dict[str, Any]) -> None:
    """Validate public data by the shared versioned JSON Schema contract."""
    _validate_against_schema(value, PUBLIC_CONTRACT_SCHEMA, "Public discovery projection")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)
