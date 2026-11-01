import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from merge_discovery_datasets import merge_datasets


def studio(name, domain, checked, application_url):
    return {
        "name": name,
        "country": "United Kingdom",
        "websiteUrl": f"https://{domain}/",
        "applicationUrl": application_url,
        "evidenceUrl": application_url,
        "notes": "Official speculative application.",
        "checkedAt": checked,
        "applicationResearch": {
            "routeType": "speculative",
            "submissionMethods": ["email"],
            "workModel": "not_stated",
            "eligibleLocations": [],
            "disciplineScope": [],
            "relatedApplicationUrls": [],
            "routeStatus": "active",
            "sourceType": "official_company_site",
            "nextReviewAt": "2027-01-28",
        },
    }


def profile(description, source):
    return {
        "description": description,
        "headquarters": {"city": "London", "country": "United Kingdom", "countryCode": "GB", "label": "HQ"},
        "otherLocations": [],
        "companyType": ["Developer"],
        "ownership": "Independent",
        "parentCompany": None,
        "industryScale": "Not disclosed",
        "teamSize": "Not publicly disclosed",
        "teamSizeAsOf": None,
        "focus": [],
        "popularGames": [],
        "profileSources": [source],
    }


class DiscoveryDatasetMergeTests(unittest.TestCase):
    def test_adds_new_verified_records_and_their_profiles(self):
        base = [studio("Existing Studio", "existing.example", "2026-10-30", "https://existing.example/apply")]
        incoming = base + [studio("New Studio", "new.example", "2026-10-30", "https://new.example/open")]
        base_profiles = {"Existing Studio": profile("Existing", "https://existing.example/about")}
        incoming_profiles = {
            **base_profiles,
            "New Studio": profile("New", "https://new.example/about"),
        }

        rows, profiles, summary = merge_datasets(base, incoming, base_profiles, incoming_profiles)

        self.assertEqual([row["name"] for row in rows], ["Existing Studio", "New Studio"])
        self.assertIn("New Studio", profiles)
        self.assertEqual(summary["added"], 1)
        self.assertEqual(summary["total_studios"], 2)

    def test_newer_main_record_wins_over_stale_discovery_snapshot(self):
        remote = studio("Existing Studio", "existing.example", "2026-10-30", "https://existing.example/new-route")
        stale = studio("Existing Studio", "existing.example", "2026-10-29", "https://existing.example/old-route")
        profiles = {"Existing Studio": profile("Main description", "https://existing.example/about")}

        rows, _profiles, summary = merge_datasets([remote], [stale], profiles, profiles)

        self.assertEqual(rows[0]["applicationUrl"], "https://existing.example/new-route")
        self.assertEqual(summary["updated_routes"], 0)
        self.assertEqual(summary["unchanged"], 1)

    def test_newer_verified_route_updates_route_but_preserves_main_profile_research(self):
        remote = studio("Existing Studio", "existing.example", "2026-10-29", "https://existing.example/old-route")
        incoming = studio("Existing Studio", "existing.example", "2026-10-30", "https://existing.example/current-route")
        remote_profile = profile("Manually researched profile", "https://existing.example/about")
        incoming_profile = profile("Minimal discovery profile", "https://existing.example/")
        incoming_profile["teamSize"] = "Not publicly disclosed"

        rows, profiles, summary = merge_datasets(
            [remote], [incoming], {"Existing Studio": remote_profile}, {"Existing Studio": incoming_profile}
        )

        self.assertEqual(rows[0]["applicationUrl"], "https://existing.example/current-route")
        self.assertEqual(profiles["Existing Studio"]["description"], "Manually researched profile")
        self.assertIn("https://existing.example/", profiles["Existing Studio"]["profileSources"])
        self.assertEqual(summary["updated_routes"], 1)

    def test_same_name_on_different_domain_is_held_for_manual_review(self):
        remote = studio("Example Studio", "example-one.test", "2026-10-30", "https://example-one.test/apply")
        incoming = studio("Example Studio", "example-two.test", "2026-10-30", "https://example-two.test/apply")
        profiles = {"Example Studio": profile("Main profile", "https://example-one.test/about")}

        rows, _profiles, summary = merge_datasets([remote], [incoming], profiles, profiles)

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["websiteUrl"], "https://example-one.test/")
        self.assertEqual(summary["identity_conflicts"], ["Example Studio"])


if __name__ == "__main__":
    unittest.main()
