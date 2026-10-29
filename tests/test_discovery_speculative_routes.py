from __future__ import annotations

import copy
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from discovery.speculative_routes import (  # noqa: E402
    load_speculative_route_directory,
    validate_speculative_route_directory,
)


class SpeculativeRouteContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.curated_path = ROOT / "src" / "data" / "speculative-route-directory.json"
        cls.sample_path = ROOT / "src" / "data" / "sample-speculative-route-directory.json"
        cls.curated = json.loads(cls.curated_path.read_text(encoding="utf-8"))
        cls.sample = json.loads(cls.sample_path.read_text(encoding="utf-8"))

    def test_shared_schema_accepts_curated_routes_and_synthetic_sample(self):
        curated = load_speculative_route_directory(self.curated_path)
        sample = load_speculative_route_directory(self.sample_path)
        self.assertEqual(curated["schemaVersion"], 1)
        self.assertGreaterEqual(len(curated["routes"]), 10)
        self.assertIn("Supermassive Games", {studio["name"] for studio in curated["studios"]})
        self.assertIn("Kinetic Games", {studio["name"] for studio in curated["studios"]})
        self.assertTrue(all(route["status"] == "verified" for route in curated["routes"]))
        self.assertTrue(all(route["routeUrl"].startswith("https://") for route in curated["routes"]))
        self.assertEqual(len({route["id"] for route in curated["routes"]}), len(curated["routes"]))
        self.assertEqual(len(sample["routes"]), 1)
        self.assertEqual(sample["routes"][0]["status"], "candidate")
        self.assertIn("Synthetic", sample["studios"][0]["name"])

    def test_rejects_dangling_studio_reference_and_duplicate_route_id(self):
        dangling = copy.deepcopy(self.sample)
        dangling["routes"][0]["studioId"] = "missing-studio"
        with self.assertRaisesRegex(ValueError, "unknown studio"):
            validate_speculative_route_directory(dangling)

        duplicate = copy.deepcopy(self.sample)
        duplicate["routes"].append(copy.deepcopy(duplicate["routes"][0]))
        with self.assertRaisesRegex(ValueError, "Duplicate ID"):
            validate_speculative_route_directory(duplicate)

    def test_rejects_unsafe_urls_and_credential_bearing_evidence(self):
        unsafe = copy.deepcopy(self.sample)
        unsafe["routes"][0]["routeUrl"] = "http://example.com/not-https"
        with self.assertRaisesRegex(ValueError, "required pattern"):
            validate_speculative_route_directory(unsafe)

        credentials = copy.deepcopy(self.sample)
        credentials["routes"][0]["evidenceUrl"] = "https://user:password@example.com/evidence"
        with self.assertRaisesRegex(ValueError, "without embedded credentials"):
            validate_speculative_route_directory(credentials)

    def test_rejects_incomplete_or_private_fields_and_bad_hashes(self):
        missing_evidence = copy.deepcopy(self.sample)
        del missing_evidence["routes"][0]["evidenceSummary"]
        with self.assertRaisesRegex(ValueError, "missing or unsupported fields"):
            validate_speculative_route_directory(missing_evidence)

        private = copy.deepcopy(self.sample)
        private["routes"][0]["candidateNotes"] = "must not be public"
        with self.assertRaisesRegex(ValueError, "missing or unsupported fields"):
            validate_speculative_route_directory(private)

        bad_hash = copy.deepcopy(self.sample)
        bad_hash["routes"][0]["contentHash"] = "not-a-sha256"
        with self.assertRaisesRegex(ValueError, "required pattern"):
            validate_speculative_route_directory(bad_hash)

    def test_verified_and_stale_records_require_previous_verification(self):
        verified = copy.deepcopy(self.sample)
        verified["routes"][0]["status"] = "verified"
        with self.assertRaisesRegex(ValueError, "require lastVerifiedAt"):
            validate_speculative_route_directory(verified)

        candidate = copy.deepcopy(self.sample)
        candidate["routes"][0]["lastVerifiedAt"] = "2000-01-02T00:00:00.000Z"
        with self.assertRaisesRegex(ValueError, "cannot claim a previous verification"):
            validate_speculative_route_directory(candidate)

        stale = copy.deepcopy(self.sample)
        stale["routes"][0]["status"] = "stale"
        with self.assertRaisesRegex(ValueError, "require a previous verification"):
            validate_speculative_route_directory(stale)

    def test_country_scope_and_talent_pool_are_consistent(self):
        no_country = copy.deepcopy(self.sample)
        no_country["routes"][0]["countryScope"] = "country-limited"
        with self.assertRaisesRegex(ValueError, "list at least one country code"):
            validate_speculative_route_directory(no_country)

        talent_community = copy.deepcopy(self.sample)
        talent_community["routes"][0]["routeType"] = "talent-community"
        with self.assertRaisesRegex(ValueError, "labelled separately"):
            validate_speculative_route_directory(talent_community)

    def test_timestamps_are_chronological_and_country_codes_are_unique(self):
        bad_time = copy.deepcopy(self.sample)
        bad_time["routes"][0]["lastCheckedAt"] = "1999-12-31T00:00:00.000Z"
        with self.assertRaisesRegex(ValueError, "cannot be earlier"):
            validate_speculative_route_directory(bad_time)

        duplicate_countries = copy.deepcopy(self.sample)
        duplicate_countries["routes"][0]["countryScope"] = "country-limited"
        duplicate_countries["routes"][0]["countryCodes"] = ["US", "US"]
        with self.assertRaisesRegex(ValueError, "duplicate items"):
            validate_speculative_route_directory(duplicate_countries)


if __name__ == "__main__":
    unittest.main()
