from __future__ import annotations

import json
import unittest

from discovery_test_support import NOW, canonical_url, extract_job_links, extract_job_postings, html_posting


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
