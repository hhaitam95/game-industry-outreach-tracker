#!/usr/bin/env python3
"""Safely merge a discovery run's public datasets with the latest main-branch data.

A discovery run can last long enough for a manual PR to update main. This module
keeps the latest published directory as the base, adds newly verified records,
and only applies route maintenance when the run's verification date is newer.
"""
from __future__ import annotations

import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY_PATH = "src/data/speculative-route-directory.json"
PROFILES_PATH = "src/data/studio-profiles.json"
PROFILE_ARRAY_FIELDS = ("companyType", "otherLocations", "focus", "popularGames", "profileSources")
PLACEHOLDER_TEXT = {
    "",
    "not disclosed",
    "not publicly disclosed",
    "not publicly stated",
    "not researched",
    "not yet researched",
    "not stated",
    "not classified",
    "unknown",
}


def name_key(value: str) -> str:
    return "".join(character for character in value.casefold() if character.isalnum())


def domain_key(value: str) -> str:
    try:
        host = (urlsplit(value).hostname or "").casefold().strip(".")
    except ValueError:
        return ""
    if host.startswith("www."):
        host = host[4:]
    return host


def is_placeholder(value: object) -> bool:
    if value is None or value == "":
        return True
    if isinstance(value, list):
        return len(value) == 0
    if isinstance(value, str):
        return value.strip().casefold() in PLACEHOLDER_TEXT
    return False


def exclude_records_removed_from_latest_main(
    initial_rows: list[dict],
    latest_main_rows: list[dict],
    incoming_rows: list[dict],
) -> tuple[list[dict], list[str]]:
    """Do not resurrect a studio that main removed while discovery was running.

    A rename keeps the same official domain and is therefore not considered a
    deletion. A domain present in the run's initial checkout but absent from the
    latest main snapshot is treated as an intentional removal.
    """
    initial_domains = {
        domain_key(str(record.get("websiteUrl", "")))
        for record in initial_rows
        if domain_key(str(record.get("websiteUrl", "")))
    }
    latest_domains = {
        domain_key(str(record.get("websiteUrl", "")))
        for record in latest_main_rows
        if domain_key(str(record.get("websiteUrl", "")))
    }
    removed_domains = initial_domains - latest_domains
    if not removed_domains:
        return copy.deepcopy(incoming_rows), []

    kept: list[dict] = []
    skipped: list[str] = []
    for record in incoming_rows:
        domain = domain_key(str(record.get("websiteUrl", "")))
        if domain in removed_domains:
            skipped.append(str(record.get("name", "")).strip())
            continue
        kept.append(record)
    return kept, sorted(set(name for name in skipped if name), key=str.casefold)


def merge_profiles(base: dict, incoming: dict) -> dict:
    """Fill gaps and union sourced arrays without replacing researched main data."""
    merged = copy.deepcopy(base)
    for key, value in incoming.items():
        if key in PROFILE_ARRAY_FIELDS and isinstance(value, list):
            current = merged.get(key)
            if not isinstance(current, list):
                current = []
            combined = list(current)
            for item in value:
                if item not in combined:
                    combined.append(copy.deepcopy(item))
            merged[key] = combined
        elif is_placeholder(merged.get(key)) and not is_placeholder(value):
            merged[key] = copy.deepcopy(value)
    return merged


def merge_datasets(
    base_rows: list[dict],
    incoming_rows: list[dict],
    base_profiles: dict,
    incoming_profiles: dict,
) -> tuple[list[dict], dict, dict[str, object]]:
    """Merge local discovery output into the latest main-branch snapshot.

    Main wins identity conflicts and same-day concurrent edits. A locally checked
    route replaces an existing route only when its checkedAt date is strictly newer.
    New records are appended only when both their normalized name and website domain
    are not already represented.
    """
    if not isinstance(base_rows, list) or not isinstance(incoming_rows, list):
        raise ValueError("Studio datasets must be arrays.")
    if not isinstance(base_profiles, dict) or not isinstance(incoming_profiles, dict):
        raise ValueError("Studio profile datasets must be objects.")

    rows = copy.deepcopy(base_rows)
    profiles = copy.deepcopy(base_profiles)
    by_name: dict[str, int] = {}
    by_domain: dict[str, int] = {}

    for index, record in enumerate(rows):
        key = name_key(str(record.get("name", "")))
        domain = domain_key(str(record.get("websiteUrl", "")))
        if key:
            by_name[key] = index
        if domain:
            by_domain[domain] = index

    added = 0
    updated = 0
    unchanged = 0
    conflicts: list[str] = []
    missing_profiles: list[str] = []

    route_fields = (
        "country",
        "websiteUrl",
        "applicationUrl",
        "evidenceUrl",
        "notes",
        "checkedAt",
        "applicationResearch",
    )

    for incoming in incoming_rows:
        if not isinstance(incoming, dict):
            continue
        name = str(incoming.get("name", "")).strip()
        name_id = name_key(name)
        domain_id = domain_key(str(incoming.get("websiteUrl", "")))
        if not name_id or not domain_id:
            continue

        name_match = by_name.get(name_id)
        domain_match = by_domain.get(domain_id)

        if name_match is not None and domain_match is not None and name_match != domain_match:
            conflicts.append(name)
            continue
        if name_match is not None:
            match_index = name_match
            existing_domain = domain_key(str(rows[match_index].get("websiteUrl", "")))
            if existing_domain != domain_id:
                # Same display name on a different site is ambiguous. Preserve main.
                conflicts.append(name)
                continue
        elif domain_match is not None:
            match_index = domain_match
        else:
            profile = incoming_profiles.get(name)
            if not isinstance(profile, dict):
                missing_profiles.append(name)
                continue
            rows.append(copy.deepcopy(incoming))
            new_index = len(rows) - 1
            by_name[name_id] = new_index
            by_domain[domain_id] = new_index
            profiles[name] = copy.deepcopy(profile)
            added += 1
            continue

        existing = rows[match_index]
        incoming_date = str(incoming.get("checkedAt", ""))
        existing_date = str(existing.get("checkedAt", ""))
        existing_name = str(existing.get("name", ""))

        if incoming_date > existing_date:
            for field in route_fields:
                if field in incoming:
                    existing[field] = copy.deepcopy(incoming[field])
            updated += 1
        else:
            unchanged += 1

        incoming_profile = incoming_profiles.get(name)
        existing_profile = profiles.get(existing_name)
        if isinstance(incoming_profile, dict):
            if isinstance(existing_profile, dict):
                profiles[existing_name] = merge_profiles(existing_profile, incoming_profile)
            elif existing_name == name:
                profiles[existing_name] = copy.deepcopy(incoming_profile)

    rows.sort(key=lambda record: str(record.get("name", "")).casefold())
    profiles = {
        name: profiles[name]
        for name in sorted(profiles, key=str.casefold)
        if any(str(record.get("name", "")).casefold() == name.casefold() for record in rows)
    }
    summary = {
        "added": added,
        "updated_routes": updated,
        "unchanged": unchanged,
        "identity_conflicts": conflicts,
        "missing_profiles": missing_profiles,
        "total_studios": len(rows),
    }
    return rows, profiles, summary


def git_show(ref: str, path: str) -> str:
    result = subprocess.run(
        ["git", "show", f"{ref}:{path}"],
        check=True,
        capture_output=True,
        text=True,
        encoding="utf-8",
    )
    return result.stdout


def merge_from_git(
    root: Path,
    base_ref: str,
    initial_ref: str | None = None,
) -> dict[str, object]:
    directory_path = root / DIRECTORY_PATH
    profiles_path = root / PROFILES_PATH
    base_rows = json.loads(git_show(base_ref, DIRECTORY_PATH))
    base_profiles = json.loads(git_show(base_ref, PROFILES_PATH))
    incoming_rows = json.loads(directory_path.read_text(encoding="utf-8"))
    incoming_profiles = json.loads(profiles_path.read_text(encoding="utf-8"))

    concurrently_removed: list[str] = []
    if initial_ref:
        initial_rows = json.loads(git_show(initial_ref, DIRECTORY_PATH))
        incoming_rows, concurrently_removed = exclude_records_removed_from_latest_main(
            initial_rows,
            base_rows,
            incoming_rows,
        )

    merged_rows, merged_profiles, summary = merge_datasets(
        base_rows, incoming_rows, base_profiles, incoming_profiles
    )
    summary["concurrent_main_removals_respected"] = concurrently_removed
    directory_path.write_text(
        json.dumps(merged_rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    profiles_path.write_text(
        json.dumps(merged_profiles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-ref", required=True, help="Fetched latest Git ref, e.g. origin/main")
    parser.add_argument(
        "--initial-ref",
        help="Run-start commit ref used to detect records intentionally removed from main while discovery ran.",
    )
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    summary = merge_from_git(args.root, args.base_ref, args.initial_ref)
    print("Merged discovery dataset with latest main:", json.dumps(summary, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
