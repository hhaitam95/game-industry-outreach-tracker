"""Bounded HTML/JSON-LD parsing and registry-constrained career link adapters."""
from __future__ import annotations

import hashlib
import html
import json
import re
import urllib.parse
from datetime import date
from html.parser import HTMLParser
from typing import Any

from .fetch import canonical_url
from .state import utc_now

def parse_iso_date(value: Any) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    try:
        return date.fromisoformat(value.strip()[:10]).isoformat()
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
