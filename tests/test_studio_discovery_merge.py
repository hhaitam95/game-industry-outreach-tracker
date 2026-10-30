import sys
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
