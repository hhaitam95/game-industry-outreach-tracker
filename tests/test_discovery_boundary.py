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

from discovery_test_support import (
    FIXTURES,
    REGISTRY,
    ROOT,
    SameHostHTTPSRedirectHandler,
    empty_state,
    fetch_source,
    html_posting,
    load_registry,
    load_state,
    parsed_job,
    public_projection,
    run_scan,
    scan_once,
    single_registry,
    source_observation,
    validate_public_projection,
)


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

        bad_generated_at = json.loads(json.dumps(golden))
        bad_generated_at["generatedAt"] = "2026-10-32T12:00:00Z"
        with self.assertRaisesRegex(ValueError, "valid date-time"):
            validate_public_projection(bad_generated_at)

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
