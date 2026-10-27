from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from email.message import Message
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request

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


class UrlAndParserTests(unittest.TestCase):
    def test_canonical_url_removes_tracking_and_fragment(self):
        self.assertEqual(
            canonical_url("https://Jobs.Example.com/role/1?utm_source=abc&gh_jid=2&id=2#top"),
            "https://jobs.example.com/role/1?id=2",
        )

    def test_url_rejects_non_https_and_credentials(self):
        self.assertIsNone(canonical_url("http://jobs.example.com/role/1"))
        self.assertIsNone(canonical_url("https://user:pass@jobs.example.com/role/1"))
        self.assertIsNone(canonical_url("javascript:alert(1)"))

    def test_link_adapter_obeys_host_and_path_allowlists_and_deduplicates(self):
        body = """<a href="https://jobs.example.com/greenhouse/job/123?gh_jid=123">Fixture Tools Engineer</a>
        <a href="https://evil.example/greenhouse/job/124">Do not trust this host</a>
        <a href="https://jobs.example.com/careers">Do not treat navigation as a job</a>
        <a href="https://jobs.example.com/greenhouse/job/123?gh_jid=123">Duplicate role</a>"""
        jobs = extract_job_links(body, "https://jobs.example.com/openings", "test-studio", "Test Studio", r"^/greenhouse/job/\d+/?$", ["jobs.example.com"], NOW)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0]["title"], "Fixture Tools Engineer")
        self.assertEqual(jobs[0]["url"], "https://jobs.example.com/greenhouse/job/123")

    def test_extracts_schema_jobposting_from_itemlist(self):
        jobs, complete, has_jsonld = extract_job_postings(html_posting(), "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(len(jobs), 1)
        self.assertEqual(jobs[0]["title"], "Example Engineer")
        self.assertTrue(complete)
        self.assertTrue(has_jsonld)
        self.assertEqual(jobs[0]["locations"], [])

    def test_jsonld_job_urls_must_use_the_configured_host_allowlist(self):
        jobs, complete, has_jsonld = extract_job_postings(
            html_posting(url="https://unexpected.example/role/1"),
            "https://careers.example.com/",
            "test-studio",
            "Test Studio",
            NOW,
            allowed_job_hosts=["jobs.example.com"],
        )
        self.assertEqual(jobs, [])
        self.assertFalse(complete)
        self.assertTrue(has_jsonld)

    def test_detail_page_without_itemlist_is_not_a_complete_listing(self):
        jobs, complete, has_jsonld = extract_job_postings(html_posting(include_item_list=False), "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(len(jobs), 1)
        self.assertFalse(complete)
        self.assertTrue(has_jsonld)

    def test_source_explicit_job_status_is_preserved(self):
        body = html_posting().replace('"validThrough": "2027-01-30",', '"validThrough": "2027-01-30", "jobStatus": "Closed",')
        jobs, _, _ = extract_job_postings(body, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertTrue(jobs[0]["sourceClosed"])

    def test_unrelated_jsonld_itemlist_is_not_proof_of_complete_job_listing(self):
        html_body = '<script type="application/ld+json">' + json.dumps({"@type": "ItemList", "name": "Featured games", "itemListElement": [{"@type": "ListItem", "name": "Game A"}]}) + '</script>'
        jobs, complete, has_jsonld = extract_job_postings(html_body, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(jobs, [])
        self.assertFalse(complete)
        self.assertTrue(has_jsonld)

    def test_paginated_job_itemlist_is_not_complete(self):
        html_body = '<link rel="next" href="?page=2">' + html_posting()
        jobs, complete, _ = extract_job_postings(html_body, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(len(jobs), 1)
        self.assertFalse(complete)

    def test_invalid_jsonld_is_not_interpreted_as_empty_successful_listing(self):
        jobs, complete, has_jsonld = extract_job_postings('<script type="application/ld+json">{oops</script>', "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(jobs, [])
        self.assertFalse(complete)
        self.assertFalse(has_jsonld)

    def test_duplicate_job_ids_are_deduplicated(self):
        one = json.loads(html_posting().split(">", 1)[1].split("</script>", 1)[0])
        body = f'<script type="application/ld+json">{json.dumps({"@graph": [one, one]})}</script>'
        jobs, _, _ = extract_job_postings(body, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertEqual(len(jobs), 1)


class ChangeDetectionTests(unittest.TestCase):
    def test_first_seen_and_unchanged_observation_have_stable_identity(self):
        job = parsed_job()
        first = scan_once(empty_state(), source_observation([job]), NOW)
        self.assertEqual(len(first["opportunities"]), 1)
        second = scan_once(first, source_observation([job]), "2026-10-27T12:00:00Z")
        self.assertEqual(list(first["opportunities"]), list(second["opportunities"]))
        self.assertEqual(second["opportunities"][job["id"]]["first_seen_at"], NOW)
        self.assertEqual(second["opportunities"][job["id"]]["status"], "announced")
        self.assertEqual(len([e for e in second["events"] if e["type"] == "created"]), 1)

    def test_link_only_role_is_projected_as_last_seen_not_announced(self):
        registry = link_only_registry()
        job = parsed_job()
        state = apply_scan(empty_state(), registry, {"test-careers": source_observation([job])}, NOW)
        stored = state["opportunities"][job["id"]]
        self.assertEqual(stored["status"], "last-seen")
        self.assertEqual(stored["last_seen_at"], NOW)

        projection = public_projection(state)
        self.assertEqual(len(projection["opportunities"]), 1)
        self.assertEqual(projection["opportunities"][0]["status"], "last-seen")
        self.assertEqual(projection["opportunities"][0]["lastSeenAt"], NOW)
        validate_public_projection(projection)

    def test_link_only_incomplete_listing_uses_last_seen_without_repeat_events(self):
        registry = link_only_registry()
        job = parsed_job()
        state = apply_scan(empty_state(), registry, {"test-careers": source_observation([job])}, NOW)
        first_absence = apply_scan(
            state,
            registry,
            {"test-careers": source_observation([], complete=False)},
            "2026-10-27T12:00:00Z",
        )
        self.assertEqual(first_absence["opportunities"][job["id"]]["status"], "last-seen")
        transition_events = len(first_absence["events"])

        second_absence = apply_scan(
            first_absence,
            registry,
            {"test-careers": source_observation([], complete=False)},
            "2026-10-28T12:00:00Z",
        )
        self.assertEqual(second_absence["opportunities"][job["id"]]["status"], "last-seen")
        self.assertEqual(len(second_absence["events"]), transition_events)
        self.assertEqual(second_absence["opportunities"][job["id"]]["last_seen_at"], NOW)

    def test_link_only_role_never_closes_from_complete_listing_absence(self):
        registry = link_only_registry()
        job = parsed_job()
        state = apply_scan(empty_state(), registry, {"test-careers": source_observation([job])}, NOW)

        for day in range(27, 33):
            state = apply_scan(
                state,
                registry,
                {"test-careers": source_observation([], complete=True)},
                f"2026-10-{day:02d}T12:00:00Z",
            )

        stored = state["opportunities"][job["id"]]
        self.assertEqual(stored["status"], "last-seen")
        self.assertEqual(stored["last_seen_at"], NOW)
        self.assertEqual(stored["missing_successful_scans"], 0)
        projection = public_projection(state)
        self.assertEqual(len(projection["opportunities"]), 1)
        self.assertEqual(projection["opportunities"][0]["status"], "last-seen")
        self.assertEqual(projection["opportunities"][0]["lastSeenAt"], NOW)

    def test_link_only_role_can_only_close_with_explicit_or_expiry_evidence(self):
        registry = link_only_registry()
        explicit_close = parsed_job()
        explicit_close["sourceClosed"] = True
        closed = apply_scan(empty_state(), registry, {"test-careers": source_observation([explicit_close])}, NOW)
        self.assertEqual(closed["opportunities"][explicit_close["id"]]["status"], "explicitly-closed")
        self.assertEqual(public_projection(closed)["opportunities"], [])

        expired = parsed_job(url="https://jobs.example.com/role/2")
        expired["validThrough"] = "2026-01-30"
        expired_state = apply_scan(empty_state(), registry, {"test-careers": source_observation([expired])}, NOW)
        self.assertEqual(expired_state["opportunities"][expired["id"]]["status"], "closed")
        self.assertEqual(public_projection(expired_state)["opportunities"], [])

    def test_material_change_emits_update_event(self):
        first_job = parsed_job()
        state = scan_once(empty_state(), source_observation([first_job]), NOW)
        changed_job = parsed_job(title="Senior Example Engineer")
        state = scan_once(state, source_observation([changed_job]), "2026-10-27T12:00:00Z")
        self.assertEqual(state["opportunities"][changed_job["id"]]["title"], "Senior Example Engineer")
        self.assertTrue(any(event["type"] == "updated" for event in state["events"]))

    def test_source_error_preserves_role_and_never_closes_it(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        state = scan_once(state, source_observation([], complete=False, status="unavailable"), "2026-10-27T12:00:00Z")
        stored = state["opportunities"][job["id"]]
        self.assertNotEqual(stored["status"], "closed")
        self.assertNotEqual(stored["status"], "explicitly-closed")
        self.assertEqual(stored["status"], "stale")
        self.assertEqual(stored["title"], "Example Engineer")
        self.assertEqual(
            set(stored),
            {
                "id", "source_id", "studio_id", "studio_name", "title", "url", "locations",
                "employment_type", "date_posted", "valid_through", "source_url", "first_seen_at",
                "last_seen_at", "last_changed_at", "observed_at", "content_hash", "status",
                "missing_successful_scans",
            },
        )

    def test_repeated_identical_source_failure_emits_only_one_event(self):
        state = scan_once(empty_state(), source_observation([], complete=False, status="unavailable"), NOW)
        state = scan_once(
            state,
            source_observation([], complete=False, status="unavailable"),
            "2026-10-27T12:00:00Z",
        )
        failures = [
            event for event in state["events"]
            if event["source_id"] == "test-careers" and event["type"] in {"blocked", "unavailable", "needs-review"}
        ]
        self.assertEqual([event["type"] for event in failures], ["unavailable"])

    def test_changed_source_failure_state_emits_a_new_event(self):
        state = scan_once(empty_state(), source_observation([], complete=False, status="unavailable"), NOW)
        changed_failure = source_observation([], complete=False, status="blocked")
        changed_failure["error_category"] = "robots-denied"
        state = scan_once(state, changed_failure, "2026-10-27T12:00:00Z")
        failures = [
            event for event in state["events"]
            if event["source_id"] == "test-careers" and event["type"] in {"blocked", "unavailable", "needs-review"}
        ]
        self.assertEqual([event["type"] for event in failures], ["unavailable", "blocked"])

    def test_truncated_event_history_emits_runtime_warning(self):
        state = empty_state()
        state["sources"]["test-careers"] = {
            "source_id": "test-careers",
            "status": "unavailable",
            "error_category": "timeout-or-network-error",
        }
        state["events"] = [{"id": str(index)} for index in range(1_001)]
        with self.assertWarnsRegex(RuntimeWarning, "truncat"):
            result = scan_once(
                state,
                source_observation([], complete=False, status="unavailable"),
                "2026-10-27T12:00:00Z",
            )
        self.assertEqual(len(result["events"]), 1_000)
        self.assertEqual(result["events"][0]["id"], "1")
        self.assertEqual(result["events"][-1]["id"], "1000")

    def test_incomplete_listing_does_not_increment_absence_counter(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        state = scan_once(state, source_observation([], complete=False), "2026-10-27T12:00:00Z")
        self.assertEqual(state["opportunities"][job["id"]]["missing_successful_scans"], 0)
        self.assertEqual(state["opportunities"][job["id"]]["status"], "needs-review")

    def test_only_three_consecutive_complete_absences_close_a_role(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        for count in range(1, CLOSURE_ABSENCE_THRESHOLD):
            state = scan_once(state, source_observation([], complete=True), f"2026-10-{26 + count:02d}T12:00:00Z")
            self.assertNotEqual(state["opportunities"][job["id"]]["status"], "closed")
        state = scan_once(state, source_observation([], complete=True), "2026-10-30T12:00:00Z")
        self.assertEqual(state["opportunities"][job["id"]]["status"], "closed")

    def test_incomplete_scan_breaks_absence_streak(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        state = scan_once(state, source_observation([], complete=True), "2026-10-27T12:00:00Z")
        self.assertEqual(state["opportunities"][job["id"]]["missing_successful_scans"], 1)
        state = scan_once(state, source_observation([], complete=False), "2026-10-28T12:00:00Z")
        self.assertEqual(state["opportunities"][job["id"]]["missing_successful_scans"], 0)

    def test_explicit_closed_source_flag_is_not_projected_as_open(self):
        closed_html = html_posting().replace('"validThrough": "2027-01-30",', '"validThrough": "2027-01-30", "jobStatus": "Closed",')
        jobs, complete, _ = extract_job_postings(closed_html, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        state = scan_once(empty_state(), source_observation(jobs, complete), NOW)
        self.assertEqual(next(iter(state["opportunities"].values()))["status"], "explicitly-closed")
        self.assertEqual(public_projection(state)["opportunities"], [])

    def test_expired_valid_through_is_not_published_as_open(self):
        expired = html_posting().replace("2027-01-30", "2026-01-30")
        jobs, complete, _ = extract_job_postings(expired, "https://careers.example.com/", "test-studio", "Test Studio", NOW)
        self.assertTrue(complete)
        state = scan_once(empty_state(), source_observation(jobs), NOW)
        self.assertEqual(next(iter(state["opportunities"].values()))["status"], "closed")
        self.assertEqual(public_projection(state)["opportunities"], [])


class BoundaryAndWorkflowTests(unittest.TestCase):
    def test_shared_schema_accepts_historical_public_golden_records(self):
        golden_path = ROOT / "tests" / "fixtures" / "public-opportunities" / "real-snapshot-golden.json"
        golden = json.loads(golden_path.read_text(encoding="utf-8"))
        validate_public_projection(golden)
        self.assertEqual(len(golden["opportunities"]), 5)
        self.assertTrue(all(role["status"] == "last-seen" for role in golden["opportunities"]))
        self.assertTrue(any("DevOps" in role["title"] for role in golden["opportunities"]))

    def test_python_rejects_the_same_invalid_contract_fixture_as_javascript(self):
        invalid_path = ROOT / "tests" / "fixtures" / "public-opportunities" / "invalid-status.json"
        invalid = json.loads(invalid_path.read_text(encoding="utf-8"))
        with self.assertRaisesRegex(ValueError, "unsupported value"):
            validate_public_projection(invalid)

    def test_shared_schema_rejects_bad_timestamps_types_and_extra_fields(self):
        golden_path = ROOT / "tests" / "fixtures" / "public-opportunities" / "real-snapshot-golden.json"
        golden = json.loads(golden_path.read_text(encoding="utf-8"))

        bad_timestamp = json.loads(json.dumps(golden))
        bad_timestamp["opportunities"][0]["lastSeenAt"] = "not-a-date"
        with self.assertRaisesRegex(ValueError, "RFC 3339"):
            validate_public_projection(bad_timestamp)

        bad_type = json.loads(json.dumps(golden))
        bad_type["opportunities"][0]["locations"] = "not-an-array"
        with self.assertRaisesRegex(ValueError, "invalid type"):
            validate_public_projection(bad_type)

        extra_field = json.loads(json.dumps(golden))
        extra_field["opportunities"][0]["candidateNotes"] = "must never publish"
        with self.assertRaisesRegex(ValueError, "missing or unsupported fields"):
            validate_public_projection(extra_field)

    def test_public_projection_is_allowlisted_and_has_no_private_state(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        projection = public_projection(state)
        self.assertEqual(set(projection), {"schemaVersion", "generatedAt", "opportunities"})
        self.assertEqual(len(projection["opportunities"]), 1)
        self.assertNotIn("descriptionExcerpt", json.dumps(projection))
        self.assertNotIn("source_id", json.dumps(projection))
        validate_public_projection(projection)

    def test_public_projection_rejects_unexpected_private_fields(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        projection = public_projection(state)
        projection["opportunities"][0]["candidateNotes"] = "must not publish"
        with self.assertRaises(ValueError):
            validate_public_projection(projection)

    def test_unreadable_existing_state_is_not_silently_reset(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "state.json"
            path.write_text("{bad json", encoding="utf-8")
            with self.assertRaises(ValueError):
                load_state(path)

    def test_fixture_runner_processes_all_four_sources_offline(self):
        state, report = run_scan(REGISTRY, "fixture", FIXTURES, empty_state())
        self.assertEqual(report["sourceCount"], 4)
        self.assertEqual(report["opportunityCount"], 3)
        self.assertEqual(sum(source["status"] == "success" for source in report["sources"]), 3)
        self.assertEqual(sum(source["status"] == "needs-review" for source in report["sources"]), 1)
        self.assertEqual(len(state["opportunities"]), 3)
        self.assertTrue(all("fixture" in job["title"].lower() for job in state["opportunities"].values()))
        self.assertTrue(all(not job["missing_successful_scans"] for job in state["opportunities"].values()))

    def test_cli_writes_outputs_without_persisting_fixture_state(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = Path(tmp) / "outputs"
            state_file = Path(tmp) / "state.json"
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "discover_studios.py"), "--mode", "fixture", "--output-dir", str(output), "--state-file", str(state_file)],
                cwd=ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(result.returncode, 0, msg=result.stderr)
            self.assertTrue((output / "scan-report.json").is_file())
            self.assertTrue((output / "public-opportunities.json").is_file())
            self.assertFalse(state_file.exists())

    def test_fetch_rejects_redirects_that_leave_https(self):
        class Response:
            status = 200
            headers = {"Content-Type": "text/html; charset=utf-8"}
            def __enter__(self): return self
            def __exit__(self, *_): return False
            def geturl(self): return "http://careers.example.com/redirected"
            def read(self, _limit): return b"<html></html>"
        result = fetch_source("https://careers.example.com/", retries=0, opener=lambda *_args, **_kwargs: Response())
        self.assertEqual(result.status, "needs-review")
        self.assertEqual(result.error_category, "unsafe-redirect")

    def test_redirect_handler_rejects_http_downgrade_and_cross_host_before_following(self):
        handler = SameHostHTTPSRedirectHandler()
        request = Request("https://careers.example.com/openings")
        headers = Message()
        with self.assertRaises(HTTPError) as downgrade:
            handler.redirect_request(request, None, 302, "Found", headers, "http://careers.example.com/openings")
        self.assertEqual(downgrade.exception.reason, "Unsafe redirect rejected")
        with self.assertRaises(HTTPError) as cross_host:
            handler.redirect_request(request, None, 302, "Found", headers, "https://third-party.example/openings")
        self.assertEqual(cross_host.exception.reason, "Unsafe redirect rejected")

    def test_live_registry_jsonld_sources_require_job_host_allowlists(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "registry.json"
            path.write_text(json.dumps(single_registry() | {"sources": [{k: v for k, v in single_registry()["sources"][0].items() if k != "allowed_job_hosts"}]}), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "allowed_job_hosts"):
                load_registry(path)

    def test_state_keys_match_the_private_persistence_contract(self):
        job = parsed_job()
        state = scan_once(empty_state(), source_observation([job]), NOW)
        state.pop("sources_summary", None)
        self.assertEqual(set(state), {"schema_version", "updated_at", "sources", "opportunities", "events"})
        source_keys = {"source_id", "studio_id", "source_url", "last_checked_at", "last_success_at", "status", "http_status", "error_category", "listing_complete", "job_ids", "page_hash"}
        role_keys = {"id", "source_id", "studio_id", "studio_name", "title", "url", "locations", "employment_type", "date_posted", "valid_through", "source_url", "first_seen_at", "last_seen_at", "last_changed_at", "observed_at", "content_hash", "status", "missing_successful_scans"}
        event_keys = {"id", "source_id", "entity_id", "type", "observed_at", "summary", "fields_changed"}
        self.assertTrue(all(set(item) == source_keys for item in state["sources"].values()))
        self.assertTrue(all(set(item) == role_keys for item in state["opportunities"].values()))
        self.assertTrue(all(set(item) == event_keys for item in state["events"]))

    def test_fetch_classifies_access_restriction_without_retrying(self):
        calls = []
        def opener(request, timeout):
            calls.append(request.full_url)
            raise HTTPError(request.full_url, 403, "Forbidden", {}, None)
        result = fetch_source("https://careers.example.com/", retries=2, opener=opener, sleep_fn=lambda _: None)
        self.assertEqual(result.status, "blocked")
        self.assertEqual(result.error_category, "access-restricted")
        self.assertEqual(len(calls), 1)


if __name__ == "__main__":
    unittest.main()
