import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import discover_speculative_studios as discovery


class DiscoveryParsingTests(unittest.TestCase):
    def test_canonical_url_enforces_https_and_rejects_credentials_and_private_ips(self):
        self.assertEqual(
            discovery.canonical_url("http://www.example.com/careers#roles"),
            "https://www.example.com/careers",
        )
        self.assertIsNone(discovery.canonical_url("https://user:pass@example.com/"))
        self.assertIsNone(discovery.canonical_url("https://127.0.0.1/careers"))
        self.assertIsNone(discovery.canonical_url("javascript:alert(1)"))

    def test_base_domain_handles_common_compound_suffix(self):
        self.assertEqual(discovery.base_domain("jobs.studio.co.uk"), "studio.co.uk")
        self.assertEqual(discovery.base_domain("careers.studio.com"), "studio.com")
        self.assertTrue(discovery.same_site("https://www.studio.co.uk", "https://jobs.studio.co.uk"))

    def test_page_parser_extracts_visible_text_links_and_forms(self):
        page = discovery.parse_page(
            "https://studio.example/careers",
            """
            <html><head><title>Careers</title><script>ignore this</script></head>
            <body><h1>Join the team</h1><p>We welcome speculative applications.</p>
            <a href="/apply">Apply here</a><form action="/submit"></form></body></html>
            """,
        )
        self.assertEqual(page.title, "Careers")
        self.assertIn("We welcome speculative applications.", page.text)
        self.assertEqual(page.links[0], ("/apply", "Apply here"))
        self.assertTrue(page.has_form)
        self.assertNotIn("ignore this", page.text)

    def test_relevant_links_include_careers_and_employer_linked_ats_only(self):
        page = discovery.Page(
            "https://studio.example/",
            "Home",
            "",
            [
                ("/careers", "Careers"),
                ("https://boards.greenhouse.io/studio", "Apply"),
                ("https://facebook.com/studio", "Social"),
                ("/news", "News"),
            ],
            False,
        )
        urls = discovery.relevant_page_urls("https://studio.example/", page)
        self.assertEqual(urls, [
            "https://studio.example/careers",
            "https://boards.greenhouse.io/studio",
        ])

    def test_positive_route_language_is_detected(self):
        cases = [
            "We welcome speculative applications from talented developers.",
            "Please send unsolicited applications to our studio.",
            "We accept spontaneous applications.",
            "Our open application form is available here.",
            "Submit a general application even if there is no suitable role.",
            "We would love to hear from you even if you do not see a matching position.",
        ]
        for text in cases:
            with self.subTest(text=text):
                self.assertIsNotNone(discovery.positive_route_match(text))

    def test_negative_route_language_overrides_positive_ambiguity(self):
        text = (
            "Our jobs page welcomes applicants. We are not currently accepting "
            "speculative applications."
        )
        self.assertIsNotNone(discovery.positive_route_match(text))
        self.assertIsNotNone(discovery.negative_route_match(text))

    def test_ambiguous_generic_careers_language_is_not_a_speculative_route(self):
        for text in [
            "View our open positions.",
            "We are hiring game artists.",
            "Join our talent community.",
            "Send us your CV for a currently advertised role.",
        ]:
            with self.subTest(text=text):
                self.assertIsNone(discovery.positive_route_match(text))

    def test_exclusion_screen_flags_explicit_vice_business_descriptions(self):
        self.assertIsNotNone(discovery.exclusion_match("A leading social casino games developer."))
        self.assertIsNotNone(discovery.exclusion_match("A studio making pornographic adult games."))
        self.assertIsNone(discovery.exclusion_match("We build fantasy adventure games with tavern scenes."))

    def test_spaqrl_query_uses_cursor_and_separate_candidate_feeds(self):
        cursor = "https://www.wikidata.org/entity/Q500"
        developer_query = discovery.sparql_query("class", cursor, 120)
        credit_query = discovery.sparql_query("developer_credit", cursor, 120)
        self.assertIn("wd:Q210167", developer_query)
        self.assertIn("wdt:P856", developer_query)
        self.assertIn(cursor, developer_query)
        self.assertIn("wdt:P178", credit_query)
        self.assertIn("wd:Q7889", credit_query)
        self.assertIn("LIMIT 120", credit_query)


class CandidateVerificationTests(unittest.TestCase):
    def setUp(self):
        discovery.LAST_REQUEST_BY_HOST.clear()

    def candidate(self):
        return {
            "qid": "Q123",
            "entity_url": "https://www.wikidata.org/entity/Q123",
            "name": "Example Game Studio",
            "website": "https://example-studio.example/",
            "country": "Canada",
            "hq_city": "Montreal",
            "country_code": "CA",
        }

    def test_candidate_is_verified_only_from_official_positive_evidence(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True,
                "https://example-studio.example/",
                200,
                """
                <title>Example Studio</title>
                <a href="/careers">Careers</a>
                <a href="https://boards.greenhouse.io/example-studio">Apply</a>
                """,
            ),
            "https://example-studio.example/careers": discovery.FetchResult(
                True,
                "https://example-studio.example/careers",
                200,
                """
                <title>Careers</title>
                <h1>Join us</h1>
                <p>We welcome speculative applications from game developers.</p>
                <form action="/submit"></form>
                <a href="https://boards.greenhouse.io/example-studio">Apply here</a>
                """,
            ),
            "https://boards.greenhouse.io/example-studio": discovery.FetchResult(
                False,
                "https://boards.greenhouse.io/example-studio",
                403,
                "",
                "access-restricted",
            ),
        }

        def page_fetcher(url, allowed_external):
            return pages.get(url, discovery.FetchResult(False, url, 404, "", "not-found"))

        result = discovery.verify_candidate_pages(self.candidate(), page_fetcher)
        self.assertEqual(result["status"], "verified")
        self.assertEqual(result["route_type"], "speculative")
        self.assertEqual(result["application_url"], "https://boards.greenhouse.io/example-studio")
        self.assertEqual(result["evidence_url"], "https://example-studio.example/careers")
        self.assertIn("ats", result["submission_methods"])
        self.assertEqual(result["source_type"], "employer_managed_career_platform")

    def test_explicit_rejection_means_no_route_even_if_page_has_careers_links(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True, "https://example-studio.example/", 200,
                '<a href="/careers">Careers</a>',
            ),
            "https://example-studio.example/careers": discovery.FetchResult(
                True, "https://example-studio.example/careers", 200,
                "<p>We are not currently accepting speculative applications.</p>",
            ),
        }

        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: pages.get(url, discovery.FetchResult(False, url, 404, "", "not-found")),
        )
        self.assertEqual(result["status"], "no_route")
        self.assertEqual(result["reason"], "official_site_explicitly_rejects_speculative_applications")

    def test_ambiguous_page_is_not_published(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True, "https://example-studio.example/", 200,
                "<h1>Careers</h1><p>View our open positions and apply online.</p>",
            ),
        }
        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: pages.get(url, discovery.FetchResult(False, url, 404, "", "not-found")),
        )
        self.assertEqual(result["status"], "no_route")

    def test_relevant_vice_content_is_excluded(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True, "https://example-studio.example/", 200,
                "<p>We are a social casino game studio.</p><a href='/careers'>Careers</a>",
            ),
        }
        result = discovery.verify_candidate_pages(self.candidate(), lambda url, allowed: pages[url])
        self.assertEqual(result["status"], "excluded")

    def test_temporary_homepage_failure_is_retry_not_closure(self):
        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: discovery.FetchResult(False, url, 503, "", "http-status"),
        )
        self.assertEqual(result["status"], "retry")


class DatasetUpdateTests(unittest.TestCase):
    def setUp(self):
        discovery.LAST_REQUEST_BY_HOST.clear()

    def test_verified_candidate_adds_directory_and_minimal_profile_once(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "src/data").mkdir(parents=True)
            (root / "state").mkdir()
            (root / "src/data/speculative-route-directory.json").write_text("[]", encoding="utf-8")
            (root / "src/data/studio-profiles.json").write_text("{}", encoding="utf-8")
            state_path = root / "state/discovery.json"
            state = discovery.empty_state()
            discovery.add_candidates(state, [{
                "qid": "Q123",
                "entity_url": "https://www.wikidata.org/entity/Q123",
                "name": "Example Game Studio",
                "website": "https://example-studio.example/",
                "country": "Canada",
                "hq_city": "Montreal",
                "country_code": "CA",
            }])
            discovery.write_json_atomic(state_path, state)
            pages = {
                "https://example-studio.example/": discovery.FetchResult(
                    True, "https://example-studio.example/", 200,
                    '<a href="/careers">Careers</a>',
                ),
                "https://example-studio.example/careers": discovery.FetchResult(
                    True, "https://example-studio.example/careers", 200,
                    "<p>We welcome speculative applications.</p><form></form>",
                ),
            }
            result = discovery.run_pipeline(
                mode="hourly",
                batch_size=5,
                max_source_pages=0,
                max_candidate_checks=5,
                route_check_count=0,
                root=root,
                state_path=state_path,
                page_fetcher=lambda url, allowed: pages.get(
                    url, discovery.FetchResult(False, url, 404, "", "not-found")
                ),
                source_fetcher=lambda kind, cursor, limit: [],
            )
            studios = discovery.read_json(root / "src/data/speculative-route-directory.json", [])
            profiles = discovery.read_json(root / "src/data/studio-profiles.json", {})
            self.assertEqual(result["verified_added"], 1)
            self.assertEqual(len(studios), 1)
            self.assertEqual(studios[0]["applicationResearch"]["routeStatus"], "active")
            self.assertEqual(studios[0]["applicationResearch"]["routeType"], "speculative")
            self.assertEqual(profiles["Example Game Studio"]["headquarters"]["city"], "Montreal")
            self.assertEqual(profiles["Example Game Studio"]["headquarters"]["country"], "Canada")
            self.assertTrue(state_path.exists())

    def test_existing_studio_name_or_domain_is_deduplicated(self):
        state = discovery.empty_state()
        discovery.add_candidates(state, [{
            "qid": "Q123",
            "entity_url": "https://www.wikidata.org/entity/Q123",
            "name": "Example Game Studio",
            "website": "https://www.example-studio.example/",
            "country": "Canada",
            "hq_city": "",
            "country_code": "CA",
        }])
        studios = [{
            "name": "Example Game Studio",
            "websiteUrl": "https://example-studio.example/",
        }]
        profiles = {}
        checked, published = discovery.process_candidate_queue(
            state, studios, profiles, 1,
            lambda url, allowed: discovery.FetchResult(True, url, 200, "<p>speculative applications</p>"),
        )
        self.assertEqual(checked, 1)
        self.assertEqual(published, 0)
        self.assertEqual(state["candidates"]["Q123"]["status"], "duplicate")

    def test_transient_route_checks_never_close_a_studio(self):
        studio = {
            "name": "Example Game Studio",
            "websiteUrl": "https://example-studio.example/",
            "applicationUrl": "https://example-studio.example/apply",
            "evidenceUrl": "https://example-studio.example/careers",
            "notes": "Verified route.",
            "checkedAt": "2026-10-30",
            "applicationResearch": {
                "routeStatus": "active",
                "nextReviewAt": "2027-01-28",
            },
        }
        state = discovery.empty_state()
        failure = lambda url, allowed: discovery.FetchResult(False, url, 403, "", "blocked")
        discovery.maintain_existing_routes(state, [studio], 1, failure)
        discovery.maintain_existing_routes(state, [studio], 1, failure)
        self.assertEqual(studio["applicationResearch"]["routeStatus"], "active")

    def test_two_consecutive_confirmed_missing_checks_close_route_but_preserve_record(self):
        studio = {
            "name": "Example Game Studio",
            "websiteUrl": "https://example-studio.example/",
            "applicationUrl": "https://example-studio.example/apply",
            "evidenceUrl": "https://example-studio.example/careers",
            "notes": "Verified route.",
            "checkedAt": "2026-10-30",
            "applicationResearch": {
                "routeStatus": "active",
                "nextReviewAt": "2027-01-28",
            },
        }
        state = discovery.empty_state()
        missing = lambda url, allowed: discovery.FetchResult(False, url, 404, "", "http-status")
        discovery.maintain_existing_routes(state, [studio], 1, missing)
        self.assertEqual(studio["applicationResearch"]["routeStatus"], "active")
        discovery.maintain_existing_routes(state, [studio], 1, missing)
        self.assertEqual(studio["applicationResearch"]["routeStatus"], "closed")
        self.assertEqual(studio["name"], "Example Game Studio")
        self.assertIn("two consecutive", studio["notes"])

    def test_three_complete_empty_cycles_mark_initial_discovery_saturated(self):
        state = discovery.empty_state()
        for _ in range(3):
            for feed in discovery.FEEDS:
                state["feed_done"][feed["id"]] = True
            self.assertTrue(discovery.finish_cycle_if_complete(state))
        self.assertTrue(state["saturated"])
        self.assertEqual(state["empty_cycles"], 3)


if __name__ == "__main__":
    unittest.main()
