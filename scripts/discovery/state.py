"""Discovery state transitions, change events, and state-file persistence."""
from __future__ import annotations

import hashlib
import json
import warnings
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
MAX_EVENTS = 1000
CLOSURE_ABSENCE_THRESHOLD = 3

def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def empty_state() -> dict[str, Any]:
    return {"schema_version": SCHEMA_VERSION, "updated_at": utc_now(), "sources": {}, "opportunities": {}, "events": []}


def load_state(path: Path | None) -> dict[str, Any]:
    if path is None or not path.exists():
        return empty_state()
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError("Existing discovery state is unreadable; refusing to replace it with empty state.") from exc
    if not isinstance(value, dict) or value.get("schema_version") != SCHEMA_VERSION or not isinstance(value.get("sources"), dict) or not isinstance(value.get("opportunities"), dict) or not isinstance(value.get("events"), list):
        raise ValueError("Existing discovery state has an unsupported schema; refusing to overwrite it.")
    return value


def _event(source_id: str, entity_id: str, event_type: str, now: str, summary: str, fields_changed: list[str] | None = None) -> dict[str, Any]:
    return {"id": hashlib.sha256(f"{source_id}|{entity_id}|{event_type}|{now}".encode()).hexdigest()[:24], "source_id": source_id, "entity_id": entity_id, "type": event_type, "observed_at": now, "summary": summary[:240], "fields_changed": fields_changed or []}


def apply_scan(state: dict[str, Any], registry: dict[str, Any], observations: dict[str, dict[str, Any]], now: str | None = None) -> dict[str, Any]:
    """Merge source observations into state; source errors never close roles."""
    now = now or utc_now()
    current = {key: dict(value) for key, value in state.get("opportunities", {}).items()}
    source_state = {key: dict(value) for key, value in state.get("sources", {}).items()}
    events = list(state.get("events", []))
    enabled_sources = [src for src in registry["sources"] if src.get("enabled", True)]
    for source in enabled_sources:
        source_id = source["id"]
        observation = observations.get(source_id, {"status": "unavailable", "error_category": "missing-observation", "jobs": [], "listing_complete": False})
        status = observation.get("status", "unavailable")
        previous_source = source_state.get(source_id, {})
        source_ok = status == "success"
        source_state[source_id] = {
            "source_id": source_id,
            "studio_id": source["studio_id"],
            "source_url": source["url"],
            "last_checked_at": now,
            "last_success_at": now if source_ok else previous_source.get("last_success_at"),
            "status": status,
            "http_status": observation.get("http_status"),
            "error_category": observation.get("error_category"),
            "listing_complete": bool(observation.get("listing_complete")) if source_ok else False,
            "job_ids": sorted(j["id"] for j in observation.get("jobs", []) if isinstance(j.get("id"), str)) if source_ok else previous_source.get("job_ids", []),
            "page_hash": observation.get("page_hash") if source_ok else previous_source.get("page_hash"),
        }
        if not source_ok:
            # A failed scan breaks a consecutive-complete-listing absence streak.
            for job in current.values():
                if job.get("source_id") == source_id:
                    job["missing_successful_scans"] = 0
            # Mark records stale/unavailable for visibility but preserve identity and content.
            for job in current.values():
                if job.get("source_id") == source_id and job.get("status") not in {"closed", "explicitly-closed"}:
                    job["status"] = "stale" if status in {"blocked", "unavailable"} else "needs-review"
            error_category = observation.get("error_category")
            failure_state_changed = (
                previous_source.get("status") != status or previous_source.get("error_category") != error_category
            )
            if failure_state_changed:
                events.append(
                    _event(
                        source_id,
                        source_id,
                        status if status in {"blocked", "unavailable"} else "needs-review",
                        now,
                        observation.get("error_message") or f"Source status: {status}",
                    )
                )
            continue
        seen_ids: set[str] = set()
        for incoming in observation.get("jobs", []):
            job_id = incoming["id"]
            seen_ids.add(job_id)
            previous = current.get(job_id)
            explicit_close = incoming.get("sourceClosed") is True
            normalized = {
                "id": job_id,
                "source_id": source_id,
                "studio_id": source["studio_id"],
                "studio_name": source["studio_name"],
                "title": incoming["title"],
                "url": incoming["url"],
                "locations": incoming.get("locations", []),
                "employment_type": incoming.get("employmentType", []),
                "date_posted": incoming.get("datePosted"),
                "valid_through": incoming.get("validThrough"),
                "source_url": source["url"],
                "first_seen_at": previous.get("first_seen_at", now) if previous else now,
                "last_seen_at": now,
                "last_changed_at": now if previous and previous.get("content_hash") != incoming["contentHash"] else previous.get("last_changed_at", now) if previous else now,
                "observed_at": now,
                "content_hash": incoming["contentHash"],
                "status": (
                    "explicitly-closed"
                    if explicit_close
                    else "closed"
                    if incoming.get("validThrough") and incoming["validThrough"] < now[:10]
                    else "last-seen"
                    if source.get("adapter") == "official-job-links"
                    else "announced"
                ),
                "missing_successful_scans": 0,
            }
            if previous:
                comparable = ("title", "url", "locations", "employment_type", "date_posted", "valid_through", "content_hash", "status")
                changed = [field for field in comparable if previous.get(field) != normalized.get(field)]
                if changed:
                    normalized["last_changed_at"] = now
                    events.append(_event(source_id, job_id, "updated", now, f"Observed change to {normalized['title']}.", changed))
                if previous.get("status") in {"stale", "needs-review", "unavailable"} and normalized["status"] == "announced":
                    events.append(_event(source_id, job_id, "updated", now, f"Source recovered; {normalized['title']} observed again.", ["status"]))
            else:
                events.append(_event(source_id, job_id, "created", now, f"New role observed: {normalized['title']}"))
            if normalized["status"] in {"closed", "explicitly-closed"} and (not previous or previous.get("status") not in {"closed", "explicitly-closed"}):
                events.append(_event(source_id, job_id, "explicitly-closed", now, f"Source indicates role is closed/expired: {normalized['title']}"))
            current[job_id] = normalized
        if not observation.get("listing_complete"):
            # Incomplete/ambiguous pages cannot advance absence-based closure evidence.
            # Records not seen on such a page need review, but are never marked closed.
            for job_id, job in current.items():
                if job.get("source_id") != source_id:
                    continue
                job["missing_successful_scans"] = 0
                if job_id not in seen_ids and job.get("status") not in {"closed", "explicitly-closed"}:
                    if source.get("adapter") == "official-job-links":
                        if job.get("status") != "last-seen":
                            job["status"] = "last-seen"
                            events.append(
                                _event(
                                    source_id,
                                    job_id,
                                    "needs-review",
                                    now,
                                    "Role was not present on a link-only listing; closure is not verified.",
                                    ["status"],
                                )
                            )
                    elif job.get("status") != "needs-review":
                        job["status"] = "needs-review"
                        events.append(_event(source_id, job_id, "needs-review", now, f"Role was not present on an incomplete listing: {job.get('title', 'Untitled role')}"))
        if observation.get("listing_complete"):
            for job_id, job in list(current.items()):
                if job.get("source_id") != source_id or job_id in seen_ids or job.get("status") in {"closed", "explicitly-closed"}:
                    continue
                if source.get("adapter") == "official-job-links":
                    if job.get("status") != "last-seen":
                        job["status"] = "last-seen"
                        events.append(
                            _event(
                                source_id,
                                job_id,
                                "needs-review",
                                now,
                                "Role is absent from a link-only listing; closure is not verified.",
                                ["status"],
                            )
                        )
                    job["missing_successful_scans"] = 0
                    continue
                count = int(job.get("missing_successful_scans", 0)) + 1
                job["missing_successful_scans"] = count
                if count >= CLOSURE_ABSENCE_THRESHOLD:
                    if job.get("status") != "closed":
                        job["status"] = "closed"
                        events.append(_event(source_id, job_id, "closed-after-confirmed-absence", now, f"Role absent from {count} consecutive successful complete listings: {job.get('title', 'Untitled role')}"))
                else:
                    job["status"] = "needs-review"
                    events.append(_event(source_id, job_id, "needs-review", now, f"Role missing from a complete listing ({count}/{CLOSURE_ABSENCE_THRESHOLD}); not closed."))
    # Bound append-only in-memory history; full run logs remain available in Actions.
    if len(events) > MAX_EVENTS:
        warnings.warn(
            f"Discovery event history exceeded {MAX_EVENTS} entries; truncating the oldest events.",
            RuntimeWarning,
            stacklevel=2,
        )
        events = events[-MAX_EVENTS:]
    state["schema_version"] = SCHEMA_VERSION
    state["updated_at"] = now
    state["sources"] = source_state
    state["opportunities"] = current
    state["events"] = events
    return state
