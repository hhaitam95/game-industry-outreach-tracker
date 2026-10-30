import json
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import merge_discovery_datasets as merge


class ConcurrentDirectoryRemovalTests(unittest.TestCase):
    def test_removed_official_domain_is_not_resurrected_from_stale_run(self):
        initial = [
            {
                "name": "Capcom Pictures",
                "websiteUrl": "https://capcomusa.com/",
            }
        ]
        latest_main = []
        incoming = [
            {
                "name": "Capcom Pictures",
                "websiteUrl": "https://capcomusa.com/",
            },
            {
                "name": "New Verified Studio",
                "websiteUrl": "https://new-studio.example/",
            },
        ]

        kept, removed = merge.exclude_records_removed_from_latest_main(
            initial, latest_main, incoming
        )

        self.assertEqual([item["name"] for item in kept], ["New Verified Studio"])
        self.assertEqual(removed, ["Capcom Pictures"])

    def test_manual_directory_removals_are_excluded_in_discovery_checkpoint(self):
        with tempfile.TemporaryDirectory() as directory:
            state_path = Path(directory) / "state.json"
            state = {
                "schema_version": 1,
                "updated_at": "2026-10-30T00:00:00+00:00",
                "candidates": {
                    "QCAPCOM": {
                        "name": "Capcom Pictures",
                        "website": "https://capcomusa.com/",
                        "status": "published",
                        "reason": None,
                        "next_check_at": "2027-01-28",
                    },
                    "GDM:GAMEBOOST": {
                        "name": "Game Boost Sweden",
                        "website": "https://www.gameboost.se/",
                        "status": "queued",
                        "reason": None,
                        "next_check_at": None,
                    },
                    "GDM:VALID": {
                        "name": "Valid Studio",
                        "website": "https://valid-studio.example/",
                        "status": "queued",
                        "reason": None,
                        "next_check_at": None,
                    },
                },
                "stats": {"excluded": 13},
            }
            state_path.write_text(json.dumps(state), encoding="utf-8")
            removed_domains = {
                "capcomusa.com",
                "gameboost.se",
            }

            excluded = merge.exclude_removed_candidates_from_discovery_state(
                state_path, removed_domains
            )

            updated = json.loads(state_path.read_text(encoding="utf-8"))
            self.assertEqual(excluded, ["Capcom Pictures", "Game Boost Sweden"])
            self.assertEqual(updated["candidates"]["QCAPCOM"]["status"], "excluded")
            self.assertEqual(
                updated["candidates"]["QCAPCOM"]["reason"],
                "manually_removed_from_public_directory",
            )
            self.assertIsNone(updated["candidates"]["QCAPCOM"]["next_check_at"])
            self.assertEqual(updated["candidates"]["GDM:GAMEBOOST"]["status"], "excluded")
            self.assertEqual(updated["candidates"]["GDM:VALID"]["status"], "queued")
            self.assertEqual(updated["stats"]["excluded"], 15)
            self.assertNotEqual(updated["updated_at"], state["updated_at"])

    def test_persistent_exclusion_registry_filters_public_merge_and_candidate_state(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "config").mkdir(parents=True)
            (root / "src/data").mkdir(parents=True)
            (root / ".discovery-state").mkdir(parents=True)

            registry = {
                "schema_version": 1,
                "excluded_domains": [
                    {
                        "domain": "capcomusa.com",
                        "name": "Capcom Pictures",
                        "reason": "Film-production subsidiary, not a game studio.",
                        "reviewed_at": "2026-10-30",
                    },
                    {
                        "domain": "gameboost.se",
                        "name": "Game Boost Sweden",
                        "reason": "Staffing and freelancer marketplace, not a game studio.",
                        "reviewed_at": "2026-10-30",
                    },
                ],
            }
            (root / "config/manual-studio-exclusions.json").write_text(
                json.dumps(registry), encoding="utf-8"
            )

            base_rows = [
                {
                    "name": "Valid Studio",
                    "websiteUrl": "https://valid-studio.example/",
                    "country": "Canada",
                    "applicationUrl": "https://valid-studio.example/careers",
                    "evidenceUrl": "https://valid-studio.example/careers",
                    "checkedAt": "2026-10-30",
                },
                {
                    "name": "Capcom Pictures",
                    "websiteUrl": "https://capcomusa.com/",
                    "applicationUrl": "https://app.jobvite.com/",
                    "evidenceUrl": "https://jobs.jobvite.com/capcomusa",
                    "checkedAt": "2026-10-30",
                },
                {
                    "name": "Game Boost Sweden",
                    "websiteUrl": "https://www.gameboost.se/",
                    "applicationUrl": "https://www.teamtailor.com/",
                    "evidenceUrl": "https://www.gameboost.se/jobs",
                    "checkedAt": "2026-10-30",
                },
            ]
            base_profiles = {
                "Valid Studio": {"description": "Existing studio"},
                "Capcom Pictures": {"description": "Film production"},
                "Game Boost Sweden": {"description": "Staffing marketplace"},
            }
            # Both the latest main base and the in-flight run contain the two
            # manually excluded records. The persistent registry must remove them.
            incoming_rows = list(base_rows)
            incoming_profiles = dict(base_profiles)
            directory_path = root / "src/data/speculative-route-directory.json"
            profiles_path = root / "src/data/studio-profiles.json"
            directory_path.write_text(json.dumps(incoming_rows), encoding="utf-8")
            profiles_path.write_text(json.dumps(incoming_profiles), encoding="utf-8")

            state_path = root / ".discovery-state/state.json"
            state = {
                "schema_version": 1,
                "updated_at": "2026-10-30T00:00:00+00:00",
                "candidates": {
                    "QCAPCOM": {
                        "name": "Capcom Pictures",
                        "website": "https://capcomusa.com/",
                        "status": "published",
                        "reason": None,
                        "next_check_at": "2027-01-28",
                    },
                    "GDM:GAMEBOOST": {
                        "name": "Game Boost Sweden",
                        "website": "https://www.gameboost.se/",
                        "status": "queued",
                        "reason": None,
                        "next_check_at": None,
                    },
                    "GDM:VALID": {
                        "name": "Valid Studio",
                        "website": "https://valid-studio.example/",
                        "status": "queued",
                        "reason": None,
                        "next_check_at": None,
                    },
                },
                "stats": {"excluded": 13},
            }
            state_path.write_text(json.dumps(state), encoding="utf-8")

            def fake_git_show(_ref, path):
                if path == merge.DIRECTORY_PATH:
                    return json.dumps(base_rows)
                if path == merge.PROFILES_PATH:
                    return json.dumps(base_profiles)
                raise AssertionError("Unexpected git show path: " + path)

            with patch.object(merge, "git_show", side_effect=fake_git_show):
                summary = merge.merge_from_git(
                    root,
                    "origin/main",
                    initial_ref="initial-main",
                    candidate_state=Path(".discovery-state/state.json"),
                )

            merged_rows = json.loads(directory_path.read_text(encoding="utf-8"))
            merged_profiles = json.loads(profiles_path.read_text(encoding="utf-8"))
            saved_state = json.loads(state_path.read_text(encoding="utf-8"))

            self.assertEqual([row["name"] for row in merged_rows], ["Valid Studio"])
            self.assertEqual(list(merged_profiles), ["Valid Studio"])
            self.assertEqual(
                saved_state["candidates"]["QCAPCOM"]["status"], "excluded"
            )
            self.assertEqual(
                saved_state["candidates"]["GDM:GAMEBOOST"]["status"], "excluded"
            )
            self.assertEqual(
                saved_state["candidates"]["GDM:VALID"]["status"], "queued"
            )
            self.assertEqual(saved_state["stats"]["excluded"], 15)
            self.assertEqual(
                summary["persistent_manual_exclusions"],
                ["Capcom Pictures", "Game Boost Sweden"],
            )
            self.assertEqual(
                summary["discovery_candidates_excluded_for_manual_removals"],
                ["Capcom Pictures", "Game Boost Sweden"],
            )

    def test_studio_rename_with_same_official_domain_is_not_a_deletion(self):
        initial = [
            {
                "name": "Campfire Cabal (THQ Nordic)",
                "websiteUrl": "https://campfirecabal.com/",
            }
        ]
        latest_main = [
            {
                "name": "Campfire Cabal",
                "websiteUrl": "https://campfirecabal.com/",
            }
        ]
        stale_incoming = [
            {
                "name": "Campfire Cabal (THQ Nordic)",
                "websiteUrl": "https://campfirecabal.com/",
            }
        ]

        kept, removed = merge.exclude_records_removed_from_latest_main(
            initial, latest_main, stale_incoming
        )

        self.assertEqual(kept, stale_incoming)
        self.assertEqual(removed, [])

        rows, _profiles, summary = merge.merge_datasets(
            latest_main,
            kept,
            {"Campfire Cabal": {"description": "Updated profile"}},
            {"Campfire Cabal (THQ Nordic)": {"description": "Older profile"}},
        )
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["name"], "Campfire Cabal")
        self.assertEqual(summary["added"], 0)


if __name__ == "__main__":
    unittest.main()
