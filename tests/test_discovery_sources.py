from __future__ import annotations

import re
import unittest

from discovery_test_support import FIXTURES, REGISTRY, empty_state, run_scan


class OfficialSourceFixtureTests(unittest.TestCase):
    def test_naughty_dog_uses_the_official_openings_page_and_narrow_allowlist(self):
        source = next(item for item in REGISTRY["sources"] if item["id"] == "naughty-dog-careers")
        self.assertEqual(source["url"], "https://www.naughtydog.com/openings")
        self.assertEqual(source["allowed_job_hosts"], ["www.naughtydog.com"])

        pattern = re.compile(source["job_url_regex"])
        self.assertIsNotNone(pattern.search("/greenhouse/job/6099780004"))
        self.assertIsNone(pattern.search("/careers"))
        self.assertIsNone(pattern.search("/greenhouse/job/not-a-number"))

    def test_synthetic_sources_filter_duplicates_and_distractors_without_claiming_completeness(self):
        state, report = run_scan(REGISTRY, "fixture", FIXTURES, empty_state())
        by_source = {item["source_id"]: item for item in report["sources"]}

        self.assertEqual(by_source["cd-projekt-red-careers"]["status"], "success")
        self.assertEqual(by_source["cd-projekt-red-careers"]["jobs_found"], 1)
        self.assertFalse(by_source["cd-projekt-red-careers"]["listing_complete"])

        self.assertEqual(by_source["naughty-dog-careers"]["status"], "success")
        self.assertEqual(by_source["naughty-dog-careers"]["jobs_found"], 1)
        self.assertFalse(by_source["naughty-dog-careers"]["listing_complete"])

        self.assertEqual(by_source["riot-games-careers"]["status"], "success")
        self.assertFalse(by_source["riot-games-careers"]["listing_complete"])
        self.assertEqual(by_source["riot-games-careers"]["jobs_found"], 1)

        self.assertEqual(by_source["santa-monica-studio-careers"]["status"], "needs-review")
        self.assertEqual(by_source["santa-monica-studio-careers"]["error_category"], "adapter-required")
        self.assertEqual(by_source["santa-monica-studio-careers"]["jobs_found"], 0)

        self.assertEqual(report["opportunityCount"], 3)
        self.assertEqual(len(state["opportunities"]), 3)
        self.assertTrue(all("fixture" in role["title"].lower() for role in state["opportunities"].values()))
        self.assertTrue(all(role["status"] == "last-seen" for role in state["opportunities"].values()))


if __name__ == "__main__":
    unittest.main()
