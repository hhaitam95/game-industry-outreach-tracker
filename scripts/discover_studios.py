#!/usr/bin/env python3
"""Run a fixture-only or live official-career-source discovery scan."""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY_ROOT = ROOT
sys.path.insert(0, str(ROOT))

from discovery.pipeline import (  # noqa: E402
    apply_scan,
    empty_state,
    extract_job_links,
    extract_job_postings,
    fetch_source,
    load_state,
    public_projection,
    utc_now,
    write_json,
)


def load_registry(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict) or value.get("schema_version") != 1 or not isinstance(value.get("sources"), list):
        raise ValueError("Registry has an unsupported schema.")
    seen: set[str] = set()
    for source in value["sources"]:
        if not isinstance(source, dict) or not {"id", "studio_id", "studio_name", "url", "adapter", "enabled"}.issubset(source):
            raise ValueError("Registry source is missing required fields.")
        if source["id"] in seen:
            raise ValueError("Registry source IDs must be unique.")
        seen.add(source["id"])
        if source["adapter"] not in {"jsonld-career-listing", "official-job-links", "manual-review"}:
            raise ValueError(f"Unsupported adapter: {source['adapter']}")
        if source["adapter"] == "official-job-links":
            if not isinstance(source.get("job_url_regex"), str) or not isinstance(source.get("allowed_job_hosts"), list) or not source["allowed_job_hosts"]:
                raise ValueError("Link adapter requires job_url_regex and allowed_job_hosts allowlist.")
            import re
            try:
                re.compile(source["job_url_regex"])
            except re.error as exc:
                raise ValueError("Registry job_url_regex is invalid.") from exc
        if source["adapter"] == "jsonld-career-listing" and (not isinstance(source.get("allowed_job_hosts"), list) or not source["allowed_job_hosts"]):
            raise ValueError("JSON-LD adapter requires an allowed_job_hosts allowlist for posting URLs.")
        if source["adapter"] == "manual-review" and not isinstance(source.get("review_reason"), str):
            raise ValueError("Manual-review sources must explain why an adapter is not enabled.")
        if not isinstance(source["enabled"], bool):
            raise ValueError("Registry enabled flag must be a boolean.")
    return value


def run_scan(registry: dict[str, Any], mode: str, fixture_dir: Path | None = None, state: dict[str, Any] | None = None) -> tuple[dict[str, Any], dict[str, Any]]:
    now = utc_now()
    observations: dict[str, dict[str, Any]] = {}
    source_summaries = []
    for source in (s for s in registry["sources"] if s.get("enabled", True)):
        source_id = source["id"]
        if source["adapter"] == "manual-review":
            if mode == "live":
                fetched = fetch_source(source["url"])
                status = "needs-review" if fetched.status == "success" else fetched.status
                http_status = fetched.http_status
                error_category = "adapter-required" if fetched.status == "success" else fetched.error_category
                error_message = source.get("review_reason") if fetched.status == "success" else fetched.error_message
            else:
                status = "needs-review"
                http_status = None
                error_category = "adapter-required"
                error_message = source.get("review_reason")
            observations[source_id] = {"status": status, "http_status": http_status, "error_category": error_category, "error_message": error_message, "jobs": [], "listing_complete": False}
            source_summaries.append({"source_id": source_id, "status": status, "jobs_found": 0, "listing_complete": False, "error_category": error_category})
            continue
        if mode == "fixture":
            assert fixture_dir is not None
            fixture_path = fixture_dir / f"{source_id}.html"
            if not fixture_path.exists():
                observations[source_id] = {"status": "needs-review", "error_category": "fixture-missing", "error_message": "Expected fixture is missing.", "jobs": [], "listing_complete": False}
                source_summaries.append({"source_id": source_id, "status": "needs-review", "jobs_found": 0, "listing_complete": False})
                continue
            body = fixture_path.read_text(encoding="utf-8")
            effective_url = source["url"]
            http_status = 200
            status = "success"
            error_category = None
            error_message = None
        else:
            fetched = fetch_source(source["url"])
            body = fetched.body or ""
            effective_url = fetched.final_url or source["url"]
            http_status = fetched.http_status
            status = fetched.status
            error_category = fetched.error_category
            error_message = fetched.error_message
        jobs: list[dict[str, Any]] = []
        complete = False
        page_hash = None
        if status == "success":
            if source["adapter"] == "official-job-links":
                jobs = extract_job_links(body, effective_url, source["studio_id"], source["studio_name"], source["job_url_regex"], source["allowed_job_hosts"], now)
                # Link-only pages cannot prove that all pages of results were observed.
                complete = False
                if not jobs:
                    status = "needs-review"
                    error_category = "no-matching-role-links"
                    error_message = "No configured official job links were found; existing roles are not closed."
            else:
                jobs, complete, has_jsonld = extract_job_postings(
                    body,
                    effective_url,
                    source["studio_id"],
                    source["studio_name"],
                    now,
                    allowed_job_hosts=source.get("allowed_job_hosts"),
                )
                if not has_jsonld or (not jobs and not complete):
                    status = "needs-review"
                    error_category = "no-usable-job-listing"
                    error_message = "No usable job listing evidence found; page was not treated as an empty job listing."
            page_hash = hashlib.sha256(body.encode("utf-8")).hexdigest()
        if status == "success":
            observations[source_id] = {"status": status, "http_status": http_status, "error_category": error_category, "error_message": error_message, "jobs": jobs, "listing_complete": complete, "page_hash": page_hash}
        else:
            observations[source_id] = {"status": status, "http_status": http_status, "error_category": error_category, "error_message": error_message, "jobs": [], "listing_complete": False}
        source_summaries.append({"source_id": source_id, "status": status, "jobs_found": len(jobs) if status == "success" else 0, "listing_complete": complete if status == "success" else False, "error_category": error_category})
    state = state or empty_state()
    next_state = apply_scan(state, registry, observations, now=now)
    next_state["sources_summary"] = source_summaries
    report = {
        "schemaVersion": 1,
        "mode": mode,
        "startedAt": now,
        "completedAt": utc_now(),
        "sourceCount": len(source_summaries),
        "sources": source_summaries,
        "opportunityCount": len(next_state["opportunities"]),
        "publicProjection": public_projection(next_state),
    }
    return next_state, report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("fixture", "live"), default="fixture", help="Fixture mode is offline and safe; live mode fetches only configured public career URLs.")
    parser.add_argument("--registry", type=Path, default=REPOSITORY_ROOT / "config" / "studio-registry.json")
    parser.add_argument("--fixture-dir", type=Path, default=REPOSITORY_ROOT / "tests" / "fixtures" / "discovery")
    parser.add_argument("--state-file", type=Path, default=None, help="Optional durable state JSON path. Existing invalid state is never overwritten.")
    parser.add_argument("--output-dir", type=Path, default=REPOSITORY_ROOT / "outputs" / "discovery")
    args = parser.parse_args()

    registry = load_registry(args.registry)
    if args.mode == "fixture":
        # Fixture mode is isolated from any durable state file, including unreadable real state.
        source_state = empty_state()
    else:
        source_state = load_state(args.state_file)
    next_state, report = run_scan(registry, args.mode, args.fixture_dir if args.mode == "fixture" else None, source_state)
    write_json(args.output_dir / "scan-report.json", report)
    write_json(args.output_dir / "public-opportunities.json", report["publicProjection"])
    if args.state_file is not None and args.mode == "live":
        # Strip output-only summaries; the operational branch stores only the durable state contract.
        next_state.pop("sources_summary", None)
        write_json(args.state_file, next_state)
    print(f"Mode: {args.mode}")
    print(f"Sources checked: {report['sourceCount']}")
    for source in report["sources"]:
        suffix = f"; jobs={source['jobs_found']}" if source.get("status") == "success" else f"; category={source.get('error_category')}"
        print(f"- {source['source_id']}: {source['status']}{suffix}")
    print(f"Known opportunities in state: {report['opportunityCount']}")
    print(f"Artifacts written to: {args.output_dir}")
    # Source failures are reported but nonfatal: preserve prior state and require review.
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"Discovery stopped safely: {exc}", file=sys.stderr)
        raise SystemExit(2)
