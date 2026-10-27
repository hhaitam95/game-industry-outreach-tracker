from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from discovery.pipeline import (  # noqa: E402
    CLOSURE_ABSENCE_THRESHOLD,
    SameHostHTTPSRedirectHandler,
    apply_scan,
    canonical_url,
    empty_state,
    extract_job_links,
    extract_job_postings,
    fetch_source,
    load_state,
    public_projection,
    validate_public_projection,
)
from discover_studios import load_registry, run_scan  # noqa: E402

NOW = "2026-10-26T12:00:00Z"
REGISTRY = load_registry(ROOT / "config" / "studio-registry.json")
FIXTURES = ROOT / "tests" / "fixtures" / "discovery"


def html_posting(title: str = "Example Engineer", url: str = "https://jobs.example.com/role/1", include_item_list: bool = True) -> str:
    posting = {
        "@type": "JobPosting",
        "identifier": "job-1",
        "title": title,
        "url": url,
        "datePosted": "2026-10-26",
        "validThrough": "2027-01-30",
        "employmentType": "FULL_TIME",
        "description": "A public role description.",
    }
    content = posting if not include_item_list else {"@type": "ItemList", "itemListElement": [{"@type": "ListItem", "item": posting}]}
    return f'<script type="application/ld+json">{json.dumps(content)}</script>'


def source_observation(jobs: list[dict], complete: bool = True, status: str = "success") -> dict:
    return {"status": status, "http_status": 200 if status == "success" else 503, "jobs": jobs, "listing_complete": complete, "page_hash": "fixture-hash", "error_category": None if status == "success" else "timeout-or-network-error"}


def parsed_job(title: str = "Example Engineer", url: str = "https://jobs.example.com/role/1") -> dict:
    jobs, _, _ = extract_job_postings(html_posting(title, url), "https://careers.example.com/", "test-studio", "Test Studio", NOW)
    assert len(jobs) == 1
    return jobs[0]


def single_registry() -> dict:
    return {"schema_version": 1, "sources": [{"id": "test-careers", "studio_id": "test-studio", "studio_name": "Test Studio", "url": "https://careers.example.com/", "source_type": "official-careers", "adapter": "jsonld-career-listing", "allowed_job_hosts": ["jobs.example.com"], "enabled": True}]}


def link_only_registry() -> dict:
    return {
        "schema_version": 1,
        "sources": [
            {
                "id": "test-careers",
                "studio_id": "test-studio",
                "studio_name": "Test Studio",
                "url": "https://careers.example.com/",
                "source_type": "official-careers",
                "adapter": "official-job-links",
                "job_url_regex": r"^/role/\d+$",
                "allowed_job_hosts": ["careers.example.com", "jobs.example.com"],
                "enabled": True,
            }
        ],
    }


def scan_once(state: dict, observation: dict, now: str) -> dict:
    return apply_scan(state, single_registry(), {"test-careers": observation}, now)

