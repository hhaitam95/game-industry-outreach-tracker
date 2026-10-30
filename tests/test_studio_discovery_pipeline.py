import sys
import tempfile
import threading
import time
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

    def test_canonical_url_percent_encodes_spaces_and_unicode_in_path_and_query(self):
        self.assertEqual(
            discovery.canonical_url("https://studio.example/images/clients/croteam logo.png"),
            "https://studio.example/images/clients/croteam%20logo.png",
        )
        self.assertEqual(
            discovery.canonical_url("https://studio.example/search?q=game studio"),
            "https://studio.example/search?q=game%20studio",
        )
        self.assertEqual(
            discovery.canonical_url("https://studio.example/café"),
            "https://studio.example/caf%C3%A9",
        )

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

    def test_same_host_requests_are_serialized_by_per_host_lock(self):
        host = "serialization-test.example"
        discovery.LAST_REQUEST_BY_HOST.pop(host, None)
        discovery.HOST_LOCKS.pop(host, None)
        first_sleep = threading.Event()
        second_sleep = threading.Event()
        release_first = threading.Event()
        sleep_count = 0
        sleep_count_lock = threading.Lock()

        def controlled_sleep(_delay):
            nonlocal sleep_count
            with sleep_count_lock:
                sleep_count += 1
                current_call = sleep_count
            if current_call == 1:
                first_sleep.set()
                release_first.wait(timeout=2)
            elif current_call == 2:
                second_sleep.set()

        def request_host():
            discovery.wait_for_host(host)

        first = threading.Thread(target=request_host, daemon=True)
        second = threading.Thread(target=request_host, daemon=True)
        try:
            with (
                patch.object(discovery, "PER_HOST_DELAY_SECONDS", 1.2),
                patch.object(discovery.time, "monotonic", return_value=0.0),
                patch.object(discovery.time, "sleep", side_effect=controlled_sleep),
            ):
                first.start()
                self.assertTrue(first_sleep.wait(timeout=1))
                second.start()
                self.assertFalse(
                    second_sleep.wait(timeout=0.05),
                    "a second request for the same host entered the delay concurrently",
                )
                release_first.set()
                first.join(timeout=1)
                second.join(timeout=1)
            self.assertFalse(first.is_alive())
            self.assertFalse(second.is_alive())
            self.assertTrue(second_sleep.is_set())
            self.assertEqual(sleep_count, 2)
        finally:
            release_first.set()
            first.join(timeout=2)
            second.join(timeout=2)
            discovery.LAST_REQUEST_BY_HOST.pop(host, None)
            discovery.HOST_LOCKS.pop(host, None)

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

    def test_staffing_platform_screen_requires_multiple_independent_indicators(self):
        self.assertIsNotNone(
            discovery.staffing_platform_match(
                "Staffing support for studios. Freelancers and consultants can join our network."
            )
        )
        self.assertIsNone(
            discovery.staffing_platform_match(
                "Our game studio sometimes hires freelancers and consultants for production."
            )
        )
        self.assertIsNone(
            discovery.staffing_platform_match(
                "We are a staffing agency supporting game studios."
            )
        )

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

    def test_staffing_marketplace_candidate_is_held_for_manual_review(self):
        pages = {
            "https://example-studio.example/": discovery.FetchResult(
                True,
                "https://example-studio.example/",
                200,
                """
                <title>Game Boost</title>
                <p>Staffing support for game studios.</p>
                <p>Freelancers and consultants can register for upcoming gigs.</p>
                <a href="/jobs">Jobs</a>
                """,
            ),
            "https://example-studio.example/jobs": discovery.FetchResult(
                True,
                "https://example-studio.example/jobs",
                200,
                "<p>Find upcoming gigs and contract gigs with studios.</p>",
            ),
        }
        result = discovery.verify_candidate_pages(
            self.candidate(),
            lambda url, allowed: pages.get(
                url, discovery.FetchResult(False, url, 404, "", "not-found")
            ),
        )
        self.assertEqual(result["status"], "needs_review")
        self.assertEqual(
            result["reason"],
            "likely_staffing_or_talent_platform_not_a_game_studio",
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

    def test_run_pipeline_persists_qid_cursor_not_entity_url(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "src/data").mkdir(parents=True)
            (root / "src/data/speculative-route-directory.json").write_text("[]", encoding="utf-8")
            (root / "src/data/studio-profiles.json").write_text("{}", encoding="utf-8")
            state_path = root / "state/discovery.json"

            row = {
                "qid": "Q123",
                "entity_url": "https://www.wikidata.org/entity/Q123",
                "name": "Example Game Studio",
                "website": "https://example-studio.example/",
                "country": "Canada",
                "hq_city": "Montreal",
                "country_code": "CA",
                "company_type": "Developer",
            }
            result = discovery.run_pipeline(
                mode="hourly",
                batch_size=1,
                max_source_pages=1,
                max_candidate_checks=0,
                route_check_count=0,
                root=root,
                state_path=state_path,
                page_fetcher=lambda url, allowed: self.fail("No candidate checks expected."),
                source_fetcher=lambda kind, cursor, limit: [row],
            )

            saved = discovery.read_json(state_path, {})
            first_feed_id = discovery.FEEDS[0]["id"]
            self.assertEqual(result["source_pages"], 1)
            self.assertEqual(saved["feed_cursors"][first_feed_id], "Q123")
            self.assertNotIn("https://www.wikidata.org/entity/", saved["feed_cursors"][first_feed_id])

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


class GameDevMapDiscoveryTests(unittest.TestCase):
    def test_parser_reads_studio_rows_and_ignores_non_studio_categories(self):
        body = """
        <table>
          <tr><th>Company</th><th>Social</th><th>Type</th><th>City</th><th>State</th><th>Country</th></tr>
          <tr><td><a href="https://example-studio.com/">Example Studio</a></td><td></td><td>Developer</td><td>Montreal</td><td>Quebec</td><td>Canada</td></tr>
          <tr><td><a href="https://example-studio.com/">Example Studio</a></td><td></td><td>Developer</td><td>Toronto</td><td>Ontario</td><td>Canada</td></tr>
          <tr><td><a href="https://investments.com/">Game Fund</a></td><td></td><td>Investment</td><td>London</td><td>England</td><td>United Kingdom</td></tr>
          <tr><td>Missing Website</td><td></td><td>Developer</td><td>Paris</td><td>Ile-de-France</td><td>France</td></tr>
        </table>
        """
        rows = discovery.parse_gamedevmap_page(
            body,
            "https://www.gamedevmap.com/index.php?start=1&count=100",
            1,
        )
        self.assertEqual(len(rows), 2)
        self.assertTrue(rows[0]["qid"].startswith("GDM:"))
        self.assertEqual(rows[0]["source_id"], "gamedevmap")
        self.assertEqual(rows[0]["name"], "Example Studio")
        self.assertEqual(rows[0]["website"], "https://example-studio.com/")
        self.assertEqual(rows[0]["country"], "Canada")
        self.assertEqual(rows[0]["hq_city"], "Montreal, Quebec")
        self.assertEqual(rows[0]["company_type"], "Developer")

    def test_candidate_pool_deduplicates_same_studio_across_sources_and_offices(self):
        state = discovery.empty_state()
        wikidata_row = {
            "qid": "Q100",
            "entity_url": "https://www.wikidata.org/entity/Q100",
            "name": "Example Studio",
            "website": "https://example-studio.com/",
            "country": "Canada",
            "hq_city": "Montreal",
            "country_code": "CA",
            "company_type": "Developer",
        }
        map_row = {
            "qid": "GDM:abc",
            "entity_url": "https://www.gamedevmap.com/index.php?start=1",
            "name": "Example Studio",
            "website": "https://example-studio.com/contact",
            "country": "Canada",
            "hq_city": "Toronto",
            "country_code": "",
            "company_type": "Developer",
            "source_id": "gamedevmap",
        }
        self.assertEqual(discovery.add_candidates(state, [wikidata_row]), 1)
        self.assertEqual(discovery.add_candidates(state, [map_row]), 0)
        self.assertEqual(len(state["candidates"]), 1)

    def test_bulk_mode_saves_and_resumes_game_dev_map_offset(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "src/data").mkdir(parents=True)
            (root / "src/data/speculative-route-directory.json").write_text("[]", encoding="utf-8")
            (root / "src/data/studio-profiles.json").write_text("{}", encoding="utf-8")
            state_path = root / "state/state.json"
            state = discovery.empty_state()
            state_path.parent.mkdir(parents=True)
            state_path.write_text(__import__("json").dumps(state), encoding="utf-8")

            def row(qid, name, website):
                return {
                    "qid": qid,
                    "entity_url": "https://www.gamedevmap.com/index.php?start=1",
                    "source_id": "gamedevmap",
                    "name": name,
                    "website": website,
                    "country": "Canada",
                    "hq_city": "Montreal",
                    "country_code": "",
                    "company_type": "Developer",
                }

            calls = []
            def first_page(kind, cursor, limit):
                calls.append((kind, cursor, limit))
                return [
                    row("GDM:a", "Alpha Studio", "https://alpha-studio.com/"),
                    row("GDM:b", "Beta Studio", "https://beta-studio.com/"),
                ]

            discovery.run_pipeline(
                mode="bulk",
                batch_size=2,
                max_source_pages=1,
                max_candidate_checks=0,
                route_check_count=0,
                max_run_seconds=60,
                root=root,
                state_path=state_path,
                source_fetcher=first_page,
            )
            saved = discovery.load_state(state_path)
            self.assertEqual(calls, [("gamedevmap", "1", 2)])
            self.assertEqual(saved["feed_cursors"]["gamedevmap"], "3")
            self.assertFalse(saved["feed_done"]["gamedevmap"])

            def second_page(kind, cursor, limit):
                calls.append((kind, cursor, limit))
                return [row("GDM:c", "Gamma Studio", "https://gamma-studio.com/")]

            discovery.run_pipeline(
                mode="bulk",
                batch_size=2,
                max_source_pages=1,
                max_candidate_checks=0,
                route_check_count=0,
                max_run_seconds=60,
                root=root,
                state_path=state_path,
                source_fetcher=second_page,
            )
            saved = discovery.load_state(state_path)
            self.assertEqual(calls[-1], ("gamedevmap", "3", 2))
            self.assertEqual(saved["feed_cursors"]["gamedevmap"], "5")
            self.assertTrue(saved["feed_done"]["gamedevmap"])
            self.assertEqual(len(saved["candidates"]), 3)

    def test_completed_wikidata_cycle_does_not_reset_game_dev_map_catalogue_cursor(self):
        state = discovery.empty_state()
        state["feed_cursors"]["gamedevmap"] = "10501"
        state["feed_done"]["gamedevmap"] = True
        for feed in discovery.FEEDS:
            if feed["kind"] != "gamedevmap":
                state["feed_done"][feed["id"]] = True

        self.assertTrue(discovery.finish_cycle_if_complete(state))
        self.assertEqual(state["feed_cursors"]["gamedevmap"], "10501")
        self.assertTrue(state["feed_done"]["gamedevmap"])
        self.assertEqual(state["feed_cursors"]["wikidata_video_game_developers"], "")
        self.assertFalse(state["feed_done"]["wikidata_video_game_developers"])


    def test_candidate_verification_runs_concurrently_across_distinct_studio_domains(self):
        state = discovery.empty_state()
        rows = [
            {
                "qid": f"Q{index}",
                "entity_url": f"https://www.wikidata.org/entity/Q{index}",
                "name": f"Example Studio {index}",
                "website": f"https://studio-{index}.example/",
                "country": "Canada",
                "hq_city": "Montreal",
                "country_code": "CA",
            }
            for index in range(1, 7)
        ]
        self.assertEqual(discovery.add_candidates(state, rows), 6)
        active = 0
        max_active = 0
        guard = threading.Lock()

        def parallel_fetch(url, _allowed_external):
            nonlocal active, max_active
            with guard:
                active += 1
                max_active = max(max_active, active)
            time.sleep(0.03)
            with guard:
                active -= 1
            body = (
                "<html><body><p>We welcome speculative applications.</p>"
                "<form action='/apply'></form></body></html>"
            )
            return discovery.FetchResult(True, url, 200, body)

        checked, published = discovery.process_candidate_queue(
            state,
            [],
            {},
            limit=6,
            page_fetcher=parallel_fetch,
        )
        self.assertEqual(checked, 6)
        self.assertEqual(published, 6)
        self.assertGreater(max_active, 1)
        self.assertLessEqual(max_active, discovery.MAX_CONCURRENT_SITE_CHECKS)

    def test_same_name_different_domains_are_retained_for_verification(self):
        state = discovery.empty_state()
        rows = [
            {
                "qid": "Q101",
                "entity_url": "https://www.wikidata.org/entity/Q101",
                "name": "The Game Studio",
                "website": "https://the-game-studio.example/",
                "country": "Canada",
                "hq_city": "Montreal",
                "country_code": "CA",
            },
            {
                "qid": "Q102",
                "entity_url": "https://www.wikidata.org/entity/Q102",
                "name": "The Game Studio",
                "website": "https://thegamestudio.example/",
                "country": "France",
                "hq_city": "Paris",
                "country_code": "FR",
            },
        ]
        self.assertEqual(discovery.add_candidates(state, rows), 2)
        self.assertEqual(len(state["candidates"]), 2)

    def test_gamedevmap_location_is_not_mislabelled_as_headquarters(self):
        profile = discovery.profile_for({
            "name": "Example Studio",
            "website": "https://example-studio.com/",
            "entity_url": "https://www.gamedevmap.com/index.php?start=1",
            "source_id": "gamedevmap",
            "country": "Canada",
            "hq_city": "Montreal, Quebec",
            "country_code": "",
            "company_type": "Developer",
        })
        self.assertEqual(profile["headquarters"]["label"], "Listed location · GameDevMap")


    def test_parser_reports_raw_rows_separately_from_filtered_studio_candidates(self):
        body = """
        <table>
          <tr><th>Company</th><th>Social</th><th>Type</th><th>City</th><th>State</th><th>Country</th></tr>
          <tr><td><a href="https://developer.example/">Developer</a></td><td></td><td>Developer</td><td>Montreal</td><td>Quebec</td><td>Canada</td></tr>
          <tr><td><a href="https://fund.example/">Fund</a></td><td></td><td>Investment</td><td>London</td><td>England</td><td>United Kingdom</td></tr>
          <tr><td><a href="https://publisher.example/">Publisher</a></td><td></td><td>Publisher</td><td>Paris</td><td></td><td>France</td></tr>
        </table>
        """
        candidates, raw_row_count = discovery.parse_gamedevmap_page_with_count(
            body,
            "https://www.gamedevmap.com/index.php?start=1&count=3",
            1,
        )
        self.assertEqual(len(candidates), 2)
        self.assertEqual(raw_row_count, 4)

    def test_bulk_mode_does_not_finish_page_when_filtering_reduces_candidate_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "src/data").mkdir(parents=True)
            (root / "src/data/speculative-route-directory.json").write_text("[]", encoding="utf-8")
            (root / "src/data/studio-profiles.json").write_text("{}", encoding="utf-8")
            state_path = root / "state/state.json"
            state_path.parent.mkdir(parents=True)
            state_path.write_text(__import__("json").dumps(discovery.empty_state()), encoding="utf-8")
            candidate = {
                "qid": "GDM:developer",
                "entity_url": "https://www.gamedevmap.com/index.php?start=1",
                "source_id": "gamedevmap",
                "name": "Developer Studio",
                "website": "https://developer-studio.example/",
                "country": "Canada",
                "hq_city": "Montreal",
                "country_code": "",
                "company_type": "Developer",
            }
            # The raw page had two result rows, but only one survived category filtering.
            # The source still has another page and must not be marked complete.
            with patch.object(
                discovery,
                "fetch_gamedevmap_page",
                return_value=([candidate], 2),
            ) as fetch_page:
                discovery.run_pipeline(
                    mode="bulk",
                    batch_size=2,
                    max_source_pages=1,
                    max_candidate_checks=0,
                    route_check_count=0,
                    max_run_seconds=60,
                    root=root,
                    state_path=state_path,
                )
            fetch_page.assert_called_once_with("1", 2)
            saved = discovery.load_state(state_path)
            self.assertEqual(saved["feed_cursors"]["gamedevmap"], "3")
            self.assertFalse(saved["feed_done"]["gamedevmap"])
            self.assertEqual(len(saved["candidates"]), 1)


if __name__ == "__main__":
    unittest.main()
