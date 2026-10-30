import json
import sys
import tempfile
import unittest
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
