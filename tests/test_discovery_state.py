from __future__ import annotations

import unittest
from datetime import datetime, timedelta

from discovery_test_support import (
    CLOSURE_ABSENCE_THRESHOLD,
    apply_scan,
    empty_state,
    extract_job_postings,
    html_posting,
    link_only_registry,
    NOW,
    parsed_job,
    public_projection,
    scan_once,
    source_observation,
)


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

        first_scan = datetime.fromisoformat(NOW.replace("Z", "+00:00"))
        for offset in range(1, 7):
            scan_time = first_scan + timedelta(days=offset)
            state = apply_scan(
                state,
                registry,
                {"test-careers": source_observation([], complete=True)},
                scan_time.strftime("%Y-%m-%dT%H:%M:%SZ"),
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
