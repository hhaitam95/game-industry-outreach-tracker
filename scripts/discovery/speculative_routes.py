"""Strict validator for the versioned speculative-route public contract."""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

SCHEMA_PATH = Path(__file__).resolve().parents[2] / "schemas" / "speculative-route-directory.schema.json"
SPECULATIVE_ROUTE_SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))


def _resolve_schema_reference(reference: str) -> dict[str, Any]:
    if not reference.startswith("#/"):
        raise ValueError("Unsupported speculative-route schema reference.")
    result: Any = SPECULATIVE_ROUTE_SCHEMA
    for part in reference[2:].split("/"):
        result = result[part.replace("~1", "/").replace("~0", "~")]
    if not isinstance(result, dict):
        raise ValueError("Speculative-route schema reference did not resolve to an object.")
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
    raise ValueError("Unsupported speculative-route schema type: " + expected)


def _validate_format(value: str, format_name: str, label: str) -> None:
    if format_name == "date-time":
        pattern = r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$"
        if not re.fullmatch(pattern, value):
            raise ValueError(label + " must be an RFC 3339 date-time with a timezone.")
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError(label + " must be a valid date-time.") from exc
        if parsed.tzinfo is None:
            raise ValueError(label + " must include a timezone.")
    elif format_name == "uri":
        parsed = urlsplit(value)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError(label + " must be an HTTPS URL without embedded credentials.")
        try:
            parsed.port
        except ValueError as exc:
            raise ValueError(label + " must be a valid HTTPS URL.") from exc


def _validate_against_schema(value: Any, schema: dict[str, Any], label: str) -> None:
    reference = schema.get("$ref")
    if reference:
        _validate_against_schema(value, _resolve_schema_reference(reference), label)
        return

    expected = schema.get("type")
    if expected:
        choices = expected if isinstance(expected, list) else [expected]
        if not any(_matches_type(value, choice) for choice in choices):
            raise ValueError(label + " has an invalid type.")
    if "const" in schema and value != schema["const"]:
        raise ValueError(label + " has an unsupported constant value.")
    if "enum" in schema and value not in schema["enum"]:
        raise ValueError(label + " has an unsupported value.")

    if isinstance(value, str):
        if "minLength" in schema and len(value.strip()) < schema["minLength"]:
            raise ValueError(label + " must not be empty.")
        if "maxLength" in schema and len(value) > schema["maxLength"]:
            raise ValueError(label + " is too long.")
        if "pattern" in schema and not re.search(schema["pattern"], value):
            raise ValueError(label + " does not match its required pattern.")
        if "format" in schema:
            _validate_format(value, schema["format"], label)

    if isinstance(value, list):
        if "minItems" in schema and len(value) < schema["minItems"]:
            raise ValueError(label + " has too few items.")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            raise ValueError(label + " has too many items.")
        if schema.get("items"):
            for index, item in enumerate(value):
                _validate_against_schema(item, schema["items"], label + "[" + str(index) + "]")
        if schema.get("uniqueItems") is True:
            encoded = [json.dumps(item, sort_keys=True, separators=(",", ":")) for item in value]
            if len(encoded) != len(set(encoded)):
                raise ValueError(label + " must not contain duplicate items.")
        unique_key = schema.get("x-uniqueBy")
        if unique_key:
            values = [item.get(unique_key) for item in value if isinstance(item, dict)]
            if len(values) != len(set(values)):
                raise ValueError("Duplicate ID in speculative-route directory.")

    if isinstance(value, dict) and "properties" in schema:
        if any(key not in value for key in schema.get("required", [])):
            raise ValueError(label + " has missing or unsupported fields.")
        properties = schema["properties"]
        if schema.get("additionalProperties") is False and any(key not in properties for key in value):
            raise ValueError(label + " has missing or unsupported fields.")
        for key, child in value.items():
            if key in properties:
                _validate_against_schema(child, properties[key], label + "." + key)


def _parse_timestamp(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValueError("Speculative-route timestamp is invalid.") from exc
    if parsed.tzinfo is None:
        raise ValueError("Speculative-route timestamp must include a timezone.")
    return parsed


def validate_speculative_route_directory(value: Any) -> dict[str, Any]:
    """Validate shape using the shared schema plus cross-record invariants."""
    _validate_against_schema(value, SPECULATIVE_ROUTE_SCHEMA, "Speculative-route directory")
    studio_ids = {studio["id"] for studio in value["studios"]}

    for studio in value["studios"]:
        if not studio["name"].strip():
            raise ValueError("Studio name must not be empty.")

    for route in value["routes"]:
        if not route["evidenceSummary"].strip():
            raise ValueError("Route evidence summary must not be empty.")
        if route["studioId"] not in studio_ids:
            raise ValueError("Speculative route references an unknown studio.")
        if route["countryScope"] == "country-limited" and not route["countryCodes"]:
            raise ValueError("Country-limited routes must list at least one country code.")
        if route["countryScope"] != "country-limited" and route["countryCodes"]:
            raise ValueError("Only country-limited routes may list country codes.")

        is_talent_community = route["routeType"] == "talent-community"
        is_talent_pool_phrase = route["matchedPhraseCategory"] == "talent-pool-invitation"
        if is_talent_community != is_talent_pool_phrase:
            raise ValueError("Talent-community routes must be labelled separately from direct speculative routes.")

        first_seen = _parse_timestamp(route["firstSeenAt"])
        last_checked = _parse_timestamp(route["lastCheckedAt"])
        if last_checked < first_seen:
            raise ValueError("Route lastCheckedAt cannot be earlier than firstSeenAt.")
        verified_at = route["lastVerifiedAt"]
        if route["status"] == "verified" and verified_at is None:
            raise ValueError("Verified routes require lastVerifiedAt.")
        if route["status"] == "candidate" and verified_at is not None:
            raise ValueError("Candidate routes cannot claim a previous verification date.")
        if route["status"] == "stale" and verified_at is None:
            raise ValueError("Stale routes require a previous verification date.")
        if verified_at is not None:
            last_verified = _parse_timestamp(verified_at)
            if last_verified < first_seen or last_verified > last_checked:
                raise ValueError("Route lastVerifiedAt must be between firstSeenAt and lastCheckedAt.")

    return value


def load_speculative_route_directory(path: Path) -> dict[str, Any]:
    """Read and validate a route directory from a UTF-8 JSON file."""
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Unable to read speculative-route JSON: " + str(exc)) from exc
    return validate_speculative_route_directory(value)
