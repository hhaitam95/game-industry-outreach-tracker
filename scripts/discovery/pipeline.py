"""Conservative, fixture-testable studio discovery primitives (stdlib only)."""
from __future__ import annotations

import hashlib
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import UTC, date, datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
PUBLIC_FIELDS = {
    "id", "studioId", "studioName", "title", "url", "locations", "employmentType",
    "datePosted", "validThrough", "status", "sourceUrl", "firstSeenAt", "lastSeenAt",
    "lastChangedAt", "observedAt", "contentHash",
}
_PRIVATE_KEY_PARTS = ("resume", "candidate", "profile", "draft", "applicationstatus", "personal", "email", "notes")
USER_AGENT = "GameIndustryOutreachTrackerDiscovery/0.1 (+manual official-source monitor; contact repository owner)"
MAX_RESPONSE_BYTES = 3 * 1024 * 1024
DEFAULT_TIMEOUT_SECONDS = 15
DEFAULT_RETRIES = 2
CLOSURE_ABSENCE_THRESHOLD = 3


def utc_now() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_iso_date(value: Any) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip()[:10]).isoformat()
    except ValueError:
        return None


def canonical_url(value: str, base_url: str | None = None) -> str | None:
    """Resolve and normalize an HTTPS URL; reject credentials and other schemes."""
    if not isinstance(value, str) or not value.strip():
        return None
    resolved = urllib.parse.urljoin(base_url or "", html.unescape(value.strip()))
    try:
        parsed = urllib.parse.urlsplit(resolved)
        if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.username or parsed.password:
            return None
        host = parsed.hostname.lower()
        port = f":{parsed.port}" if parsed.port and parsed.port != 443 else ""
        path = re.sub(r"/{2,}", "/", parsed.path or "/")
        # Remove common tracking parameters without changing role identity for ordinary query keys.
        tracking = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "source", "gh_jid"}
        query = urllib.parse.urlencode(
            [(k, v) for k, v in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True) if k.lower() not in tracking]
        )
        return urllib.parse.urlunsplit(("https", host + port, path, query, ""))
    except ValueError:
        return None


def _types(value: Any) -> set[str]:
    values = value if isinstance(value, list) else [value]
    return {str(x).rsplit("/", 1)[-1].lower() for x in values if isinstance(x, (str, int))}


def _walk_json(value: Any):
    """Yield dictionaries nested in JSON-LD graphs/list items without trusting their shape."""
    if isinstance(value, dict):
        yield value
        for child in value.values():
            if isinstance(child, (dict, list)):
                yield from _walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_json(child)


class JsonLdScriptParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._in_jsonld = False
        self._parts: list[str] = []
        self.documents: list[str] = []
        self.has_next_page = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = {k.lower(): v for k, v in attrs}
        if tag.lower() == "link" and "next" in {x.lower() for x in (attr.get("rel") or "").split()}:
            self.has_next_page = True
        if tag.lower() != "script":
            return
        content_type = (attr.get("type") or "").split(";", 1)[0].strip().lower()
        self._in_jsonld = content_type == "application/ld+json"
        if self._in_jsonld:
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._in_jsonld:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "script" and self._in_jsonld:
            self.documents.append("".join(self._parts))
            self._parts = []
            self._in_jsonld = False


def extract_jsonld(html_text: str) -> list[Any]:
    parser = JsonLdScriptParser()
    parser.feed(html_text)
    result = []
    for source in parser.documents:
        try:
            result.append(json.loads(source))
        except (json.JSONDecodeError, RecursionError):
            # Malformed JSON-LD is a parse warning, not an empty successful listing.
            continue
    return result


def extract_job_postings(
    html_text: str,
    source_url: str,
    studio_id: str,
    studio_name: str,
    observed_at: str | None = None,
    allowed_job_hosts: list[str] | None = None,
) -> tuple[list[dict[str, Any]], bool, bool]:
    """Return (normalized jobs, listing_complete, has_jsonld). Completeness needs ItemList evidence."""
    observed_at = observed_at or utc_now()
    parser = JsonLdScriptParser()
    parser.feed(html_text)
    docs = []
    for source in parser.documents:
        try:
            docs.append(json.loads(source))
        except (json.JSONDecodeError, RecursionError):
            continue
    has_next_page = parser.has_next_page
    normalized: dict[str, dict[str, Any]] = {}
    has_job_item_list = False
    explicit_empty_job_list = False
    seen_jobposting_node = False
    rejected_jobposting_node = False
    for document in docs:
        for node in _walk_json(document):
            types = _types(node.get("@type"))
            if "itemlist" in types and isinstance(node.get("itemListElement"), list):
                list_nodes = list(_walk_json(node.get("itemListElement")))
                contains_job_posting = any("jobposting" in _types(item.get("@type")) for item in list_nodes)
                item_list_name = str(node.get("name", "")).lower()
                count = node.get("numberOfItems")
                if contains_job_posting:
                    has_job_item_list = True
                elif count == 0 and any(word in item_list_name for word in ("job", "career", "vacanc", "opening", "position")):
                    explicit_empty_job_list = True
            if "jobposting" not in types:
                continue
            seen_jobposting_node = True
            title = node.get("title") or node.get("name")
            raw_url = node.get("url") or node.get("mainEntityOfPage")
            if isinstance(raw_url, dict):
                raw_url = raw_url.get("@id") or raw_url.get("url")
            job_url = canonical_url(raw_url, source_url)
            if not isinstance(title, str) or not title.strip() or not job_url:
                rejected_jobposting_node = True
                continue
            if allowed_job_hosts is not None and urllib.parse.urlsplit(job_url).hostname not in {host.lower() for host in allowed_job_hosts}:
                # A rejected role URL makes the listing incomplete; do not use it as evidence of absence.
                rejected_jobposting_node = True
                continue
            description = node.get("description", "")
            if isinstance(description, str):
                # Never retain full HTML/page bodies; only a small stripped public excerpt is normalized.
                description = re.sub(r"<[^>]+>", " ", html.unescape(description))
                description = re.sub(r"\s+", " ", description).strip()[:500]
            else:
                description = ""
            location_values = []
            raw_locations = node.get("jobLocation", [])
            raw_locations = raw_locations if isinstance(raw_locations, list) else [raw_locations]
            for loc in raw_locations:
                if not isinstance(loc, dict):
                    continue
                address = loc.get("address", {})
                if isinstance(address, str):
                    label = address
                elif isinstance(address, dict):
                    label = ", ".join(str(address.get(k)).strip() for k in ("addressLocality", "addressRegion", "addressCountry") if address.get(k))
                else:
                    label = ""
                if label and label not in location_values:
                    location_values.append(label[:160])
            employment = node.get("employmentType", [])
            if isinstance(employment, str):
                employment = [employment]
            employment = sorted({str(x)[:80] for x in employment if isinstance(x, str)}) if isinstance(employment, list) else []
            valid_through = parse_iso_date(node.get("validThrough"))
            job_status = node.get("jobStatus")
            status_text = str(job_status).strip().lower() if isinstance(job_status, (str, int)) else ""
            source_closed = status_text in {"closed", "cancelled", "canceled", "expired", "inactive"} or node.get("isActive") is False
            normalized_job = {
                "studioId": studio_id,
                "studioName": studio_name,
                "title": " ".join(title.split())[:220],
                "url": job_url,
                "locations": location_values,
                "employmentType": employment,
                "datePosted": parse_iso_date(node.get("datePosted")),
                "validThrough": valid_through,
                "sourceUrl": source_url,
                "observedAt": observed_at,
                "descriptionExcerpt": description,
                "sourceClosed": source_closed,
            }
            digest_content = {k: normalized_job[k] for k in ("title", "url", "locations", "employmentType", "datePosted", "validThrough", "descriptionExcerpt")}
            normalized_job["contentHash"] = hashlib.sha256(json.dumps(digest_content, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
            job_id_raw = node.get("identifier")
            if isinstance(job_id_raw, dict):
                job_id_raw = job_id_raw.get("value") or job_id_raw.get("@id")
            if isinstance(job_id_raw, (str, int)) and str(job_id_raw).strip():
                stable_key = f"{studio_id}:{str(job_id_raw).strip()}"
            else:
                stable_key = f"{studio_id}:{job_url}"
            normalized_job["id"] = hashlib.sha256(stable_key.encode()).hexdigest()[:24]
            normalized[normalized_job["id"]] = normalized_job
    # A JobPosting node alone might be a single role detail page, not a complete listing.
    # We only increment missing-job counters when an explicit schema.org ItemList was found.
    listing_complete = (has_job_item_list or explicit_empty_job_list) and not has_next_page and not rejected_jobposting_node
    # Broken/non-JSON-LD pages never count as an empty successful listing.
    has_jsonld = bool(docs)
    return sorted(normalized.values(), key=lambda x: (x["studioName"].lower(), x["title"].lower(), x["id"])), listing_complete, has_jsonld or seen_jobposting_node


class JobAnchorParser(HTMLParser):
    """Collect only anchor metadata/text; extraction applies a registry-owned URL allowlist."""
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._anchor: dict[str, str] | None = None
        self._parts: list[str] = []
        self.links: list[tuple[dict[str, str], str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() == "a" and self._anchor is None:
            self._anchor = {key.lower(): value or "" for key, value in attrs}
            self._parts = []

    def handle_data(self, data: str) -> None:
        if self._anchor is not None:
            self._parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "a" and self._anchor is not None:
            self.links.append((self._anchor, " ".join(" ".join(self._parts).split())))
            self._anchor = None
            self._parts = []


def extract_job_links(
    html_text: str,
    source_url: str,
    studio_id: str,
    studio_name: str,
    url_pattern: str,
    allowed_hosts: list[str],
    observed_at: str | None = None,
) -> list[dict[str, Any]]:
    """Extract roles only from preconfigured role-detail URL patterns on approved HTTPS hosts.

    Link-only adapters deliberately do not assert the listing is complete; absence can never close a role.
    """
    observed_at = observed_at or utc_now()
    try:
        pattern = re.compile(url_pattern)
    except re.error as exc:
        raise ValueError("Registry contains an invalid job URL pattern.") from exc
    parser = JobAnchorParser()
    parser.feed(html_text)
    allowed = {host.lower() for host in allowed_hosts}
    normalized: dict[str, dict[str, Any]] = {}
    for attrs, link_text in parser.links:
        raw_url = attrs.get("href", "")
        job_url = canonical_url(raw_url, source_url)
        if not job_url:
            continue
        parsed = urllib.parse.urlsplit(job_url)
        if parsed.hostname not in allowed or not pattern.search(parsed.path):
            continue
        title = attrs.get("data-job-title") or attrs.get("aria-label") or attrs.get("title") or link_text
        title = re.sub(r"\s+", " ", html.unescape(title)).strip()
        if not title or title.lower() in {"apply", "apply now", "see more", "view details", "learn more"}:
            continue
        title = title[:220]
        content = {"title": title, "url": job_url, "locations": [], "employmentType": []}
        content_hash = hashlib.sha256(json.dumps(content, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
        stable_key = f"{studio_id}:{job_url}"
        job_id = hashlib.sha256(stable_key.encode()).hexdigest()[:24]
        normalized.setdefault(job_id, {
            "id": job_id,
            "studioId": studio_id,
            "studioName": studio_name,
            "title": title,
            "url": job_url,
            "locations": [],
            "employmentType": [],
            "datePosted": None,
            "validThrough": None,
            "sourceUrl": source_url,
            "observedAt": observed_at,
            "descriptionExcerpt": "",
            "sourceClosed": False,
            "contentHash": content_hash,
        })
    return sorted(normalized.values(), key=lambda x: (x["studioName"].lower(), x["title"].lower(), x["id"]))


@dataclass(frozen=True)
class FetchResult:
    status: str
    source_url: str
    final_url: str | None
    http_status: int | None
    body: str | None
    error_category: str | None
    error_message: str | None


class SameHostHTTPSRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Reject HTTP downgrades and cross-host redirects before following them."""

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Any:
        target_url = urllib.parse.urljoin(req.full_url, newurl)
        safe_target = canonical_url(target_url)
        source_host = urllib.parse.urlsplit(req.full_url).hostname
        target_host = urllib.parse.urlsplit(safe_target).hostname if safe_target else None
        if safe_target is None or target_host != source_host:
            raise urllib.error.HTTPError(req.full_url, code, "Unsafe redirect rejected", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, safe_target)


def fetch_source(url: str, timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS, retries: int = DEFAULT_RETRIES, opener: Any | None = None, sleep_fn: Any = time.sleep) -> FetchResult:
    """Fetch only the configured public URL. Never bypass challenges or access controls."""
    safe_url = canonical_url(url)
    if not safe_url:
        return FetchResult("needs-review", url, None, None, None, "invalid-source-url", "Source URL must be HTTPS without credentials.")
    if opener is None:
        opener = urllib.request.build_opener(SameHostHTTPSRedirectHandler()).open
    last_error: FetchResult | None = None
    for attempt in range(max(0, retries) + 1):
        request = urllib.request.Request(safe_url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
        try:
            with opener(request, timeout=timeout_seconds) as response:
                status = getattr(response, "status", 200)
                final_url = canonical_url(response.geturl())
                source_host = urllib.parse.urlsplit(safe_url).hostname
                final_host = urllib.parse.urlsplit(final_url).hostname if final_url else None
                if final_url is None or final_host != source_host:
                    return FetchResult(
                        "needs-review",
                        safe_url,
                        None,
                        status,
                        None,
                        "unsafe-redirect",
                        "The source redirected away from the configured HTTPS host.",
                    )
                if status in {403, 429, 451}:
                    return FetchResult("blocked", safe_url, final_url, status, None, "access-restricted", f"Source returned HTTP {status}; no bypass attempted.")
                if not 200 <= status < 300:
                    return FetchResult("unavailable", safe_url, final_url, status, None, "http-error", f"Source returned HTTP {status}; existing observations preserved.")
                content_type = response.headers.get("Content-Type", "text/html").lower()
                if "html" not in content_type and "xhtml" not in content_type:
                    return FetchResult("needs-review", safe_url, final_url, status, None, "unexpected-content-type", "Source did not return HTML; manual adapter review required.")
                body_bytes = response.read(MAX_RESPONSE_BYTES + 1)
                if len(body_bytes) > MAX_RESPONSE_BYTES:
                    return FetchResult("needs-review", safe_url, final_url, status, None, "response-too-large", "Response exceeds 3 MiB safety limit.")
                charset_match = re.search(r"charset=([\w.-]+)", content_type)
                charset = charset_match.group(1) if charset_match else "utf-8"
                try:
                    body = body_bytes.decode(charset, errors="replace")
                except LookupError:
                    body = body_bytes.decode("utf-8", errors="replace")
                return FetchResult("success", safe_url, final_url, status, body, None, None)
        except urllib.error.HTTPError as exc:
            if exc.reason == "Unsafe redirect rejected":
                return FetchResult("needs-review", safe_url, None, exc.code, None, "unsafe-redirect", "Cross-host redirects and HTTP downgrades are rejected before following them.")
            if exc.code in {403, 429, 451}:
                return FetchResult("blocked", safe_url, exc.geturl(), exc.code, None, "access-restricted", f"Source returned HTTP {exc.code}; no bypass attempted.")
            last_error = FetchResult("unavailable", safe_url, exc.geturl(), exc.code, None, "http-error", f"Source returned HTTP {exc.code}; existing observations preserved.")
            if exc.code < 500 or attempt >= retries:
                return last_error
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            category = "timeout-or-network-error"
            last_error = FetchResult("unavailable", safe_url, None, None, None, category, f"Source fetch failed ({type(exc).__name__}); existing observations preserved.")
            if attempt >= retries:
                return last_error
        if attempt < retries:
            sleep_fn(min(2 ** attempt, 4))
    return last_error or FetchResult("unavailable", safe_url, None, None, None, "unknown-error", "Source fetch failed.")


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
            events.append(_event(source_id, source_id, status if status in {"blocked", "unavailable"} else "needs-review", now, observation.get("error_message") or f"Source status: {status}"))
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
                "status": "explicitly-closed" if explicit_close else ("closed" if incoming.get("validThrough") and incoming["validThrough"] < now[:10] else "announced"),
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
                if job_id not in seen_ids and job.get("status") not in {"closed", "explicitly-closed", "needs-review"}:
                    job["status"] = "needs-review"
                    events.append(_event(source_id, job_id, "needs-review", now, f"Role was not present on an incomplete listing: {job.get('title', 'Untitled role')}"))
        if observation.get("listing_complete"):
            for job_id, job in list(current.items()):
                if job.get("source_id") != source_id or job_id in seen_ids or job.get("status") in {"closed", "explicitly-closed"}:
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
    state["schema_version"] = SCHEMA_VERSION
    state["updated_at"] = now
    state["sources"] = source_state
    state["opportunities"] = current
    state["events"] = events[-1000:]
    return state


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
        if item.get("status") not in {"announced", "stale", "needs-review", "unavailable"}:
            raise ValueError("Public projection has an unsupported public opportunity status.")
        for key in ("url", "sourceUrl"):
            if not canonical_url(item.get(key, "")):
                raise ValueError(f"Public opportunity has an invalid {key}.")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temp.replace(path)
