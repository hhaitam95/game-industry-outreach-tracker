import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

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
        self.assertEqual(discovery.base_domain("www.team.itch.io"), "team.itch.io")
        self.assertTrue(discovery.same_site("https://www.team.itch.io", "https://team.itch.io/careers"))
        self.assertFalse(discovery.same_site("https://team.itch.io", "https://another-team.itch.io"))
        self.assertEqual(discovery.base_domain("www.team.github.io"), "team.github.io")
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

    def test_plain_text_robots_policy_is_parsed_and_respected(self):
        discovery.ROBOTS_CACHE.clear()
        robots_body = "User-agent: *" + chr(10) + "Disallow: /private" + chr(10) + "Allow: /careers"
        result = discovery.FetchResult(
            True,
            "https://example-studio.example/robots.txt",
            200,
            robots_body,
        )
        with patch.object(discovery, "fetch_url", return_value=result) as fetch:
            self.assertTrue(discovery.robots_allowed("https://example-studio.example/careers"))
            self.assertFalse(discovery.robots_allowed("https://example-studio.example/private"))
            fetch.assert_called_once_with(
                "https://example-studio.example/robots.txt",
                check_robots=False,
                timeout=10,
                max_bytes=250_000,
                allow_plain_text=True,
            )
        discovery.ROBOTS_CACHE.clear()

    def test_positive_route_language_is_detected(self):
        cases = [
            "We welcome speculative applications from talented developers.",
            "Please send unsolicited applications to our studio.",
            "We accept spontaneous applications.",
            "Our open application form is available here.",
            "Submit a general application even if there is no suitable role.",
            "We would love to hear from you even if you do not see a matching position.",
            "Candidatura espontánea",
            "Open sollicitatie",
            "Avoin hakemus",
            "Uopfordret ansøgning",
            "Åpen søknad",
        ]
        for text in cases:
            with self.subTest(text=text):
                self.assertIsNotNone(discovery.positive_route_match(text))
        for phrase in ["Candidatura espontánea", "Open sollicitatie", "Avoin hakemus", "Uopfordret ansøgning", "Åpen søknad"]:
            with self.subTest(route_type=phrase):
                self.assertEqual(discovery.route_type_for(phrase), "spontaneous")

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

    def test_spaqrl_query_uses_qid_cursor_and_separate_candidate_feeds(self):
        cursor = "Q500"
        developer_query = discovery.sparql_query("class", cursor, 120)
        credit_query = discovery.sparql_query("developer_credit", cursor, 120)
        self.assertIn("wd:Q210167", developer_query)
        self.assertIn("wdt:P856", developer_query)
        self.assertIn('STRAFTER(STR(?company), "/entity/") > "Q500"', developer_query)
        self.assertNotIn("https://www.wikidata.org/entity/Q500", developer_query)
        self.assertIn("wdt:P178", credit_query)
        self.assertIn("wd:Q7889", credit_query)
        self.assertIn("LIMIT 120", credit_query)

    def test_wikidata_entity_uri_is_normalized_to_qid_and_https_source(self):
        self.assertEqual(
            discovery.normalize_wikidata_entity_uri("http://www.wikidata.org/entity/Q123"),
            ("Q123", "https://www.wikidata.org/entity/Q123"),
        )
        self.assertEqual(
            discovery.normalize_wikidata_entity_uri("https://www.wikidata.org/entity/Q456"),
            ("Q456", "https://www.wikidata.org/entity/Q456"),
        )
        self.assertIsNone(
            discovery.normalize_wikidata_entity_uri("https://example.org/entity/Q789")
        )


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

    def test_production_fetcher_uses_the_verifier_two_argument_interface(self):
        bodies = {
            "https://example-studio.example/": '<a href="/careers">Careers</a>',
            "https://example-studio.example/careers": (
                "<p>We welcome speculative applications from game developers.</p>"
                "<form action='/submit'></form>"
            ),
        }

        class FakeResponse:
            status = 200

            def __init__(self, url, body):
                self.url = url
                self.body = body.encode("utf-8")
                self.headers = {"Content-Type": "text/html; charset=utf-8"}

            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc_value, traceback):
                return False

            def geturl(self):
                return self.url

            def read(self, limit):
                return self.body[:limit]

        class FakeOpener:
            def open(self, request, timeout):
                url = request.full_url
                return FakeResponse(url, bodies[url])

        with (
            patch.object(discovery, "validate_public_host", return_value=True),
            patch.object(discovery, "robots_allowed", return_value=True),
            patch.object(discovery, "wait_for_host"),
            patch.object(discovery.urllib.request, "build_opener", return_value=FakeOpener()),
        ):
            result = discovery.verify_candidate_pages(self.candidate(), discovery.fetch_url)

        self.assertEqual(result["status"], "verified")
        self.assertEqual(result["route_type"], "speculative")
        self.assertEqual(result["submission_methods"], ["website_form"])

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

    def test_route_text_without_submission_method_is_held_for_review(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True, "https://example-studio.example/", 200,
                '<a href="/careers">Careers</a>',
            ),
            "https://example-studio.example/careers": discovery.FetchResult(
                True, "https://example-studio.example/careers", 200,
                "<p>We welcome speculative applications from game developers.</p>",
            ),
        }
        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: pages.get(url, discovery.FetchResult(False, url, 404, "", "not-found")),
        )
        self.assertEqual(result["status"], "needs_review")
        self.assertEqual(
            result["reason"],
            "explicit_route_text_without_a_detectable_submission_method",
        )

    def test_relevant_vice_content_is_excluded(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True, "https://example-studio.example/", 200,
                "<p>We are a social casino game studio.</p><a href='/careers'>Careers</a>",
            ),
        }
        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: pages.get(url, discovery.FetchResult(False, url, 404, "", "not-found")),
        )
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

    def test_candidate_queue_stops_before_starting_a_check_after_deadline(self):
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
        studios = []
        profiles = {}
        checked, published = discovery.process_candidate_queue(
            state,
            studios,
            profiles,
            10,
            lambda url, allowed: self.fail("The page fetcher must not run after the deadline."),
            deadline=0,
        )
        self.assertEqual((checked, published), (0, 0))
        self.assertEqual(state["candidates"]["Q123"]["attempts"], 0)
        self.assertEqual(state["candidates"]["Q123"]["status"], "queued")

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

    def test_conflicting_official_route_pages_do_not_trigger_closure(self):
        studio = {
            "name": "Example Game Studio",
            "websiteUrl": "https://example-studio.example/",
            "applicationUrl": "https://example-studio.example/apply",
            "evidenceUrl": "https://example-studio.example/careers",
        }
        pages = {
            "https://example-studio.example/careers": discovery.FetchResult(
                True,
                "https://example-studio.example/careers",
                200,
                "<p>We welcome speculative applications.</p>",
            ),
            "https://example-studio.example/apply": discovery.FetchResult(
                True,
                "https://example-studio.example/apply",
                200,
                "<p>We are not currently accepting speculative applications.</p>",
            ),
        }
        result = discovery.route_page_check(studio, lambda url, allowed: pages[url])
        self.assertEqual(result, "unknown")

    def test_live_evidence_page_with_missing_submission_page_is_unknown(self):
        studio = {
            "name": "Example Game Studio",
            "websiteUrl": "https://example-studio.example/",
            "applicationUrl": "https://example-studio.example/apply",
            "evidenceUrl": "https://example-studio.example/careers",
        }
        pages = {
            "https://example-studio.example/careers": discovery.FetchResult(
                True,
                "https://example-studio.example/careers",
                200,
                "<p>We welcome speculative applications.</p>",
            ),
            "https://example-studio.example/apply": discovery.FetchResult(
                False,
                "https://example-studio.example/apply",
                404,
                "",
                "http-status",
            ),
        }
        result = discovery.route_page_check(
            studio,
            lambda url, allowed: pages[url],
        )
        self.assertEqual(result, "unknown")

        tracked = {
            **studio,
            "notes": "Verified route.",
            "checkedAt": "2026-10-30",
            "applicationResearch": {
                "routeStatus": "active",
                "nextReviewAt": "2027-01-28",
            },
        }
        state = discovery.empty_state()
        discovery.maintain_existing_routes(
            state,
            [tracked],
            1,
            lambda url, allowed: pages[url],
        )
        self.assertEqual(tracked["applicationResearch"]["routeStatus"], "active")
        self.assertEqual(state["route_checks"]["Example Game Studio"]["last_result"], "unknown")

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

    def test_future_retry_does_not_block_completion_of_a_discovery_cycle(self):
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
        candidate = state["candidates"]["Q123"]
        candidate["status"] = "retry"
        candidate["next_check_at"] = "2099-01-01"
        for feed in discovery.FEEDS:
            state["feed_done"][feed["id"]] = True

        self.assertTrue(discovery.finish_cycle_if_complete(state))
        self.assertEqual(state["cycle"], 2)
        self.assertEqual(candidate["status"], "retry")

    def test_due_retry_keeps_its_current_discovery_cycle_open(self):
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
        candidate = state["candidates"]["Q123"]
        candidate["status"] = "retry"
        candidate["next_check_at"] = discovery.iso_date()
        for feed in discovery.FEEDS:
            state["feed_done"][feed["id"]] = True

        self.assertFalse(discovery.finish_cycle_if_complete(state))
        self.assertEqual(state["cycle"], 1)

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
