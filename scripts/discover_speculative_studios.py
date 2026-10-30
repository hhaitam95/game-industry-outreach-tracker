#!/usr/bin/env python3
"""Discover game studios and verify speculative applications on official sites.

Candidate sources are discovery hints only. A studio enters the public directory only
when its own website or a linked, studio-controlled ATS explicitly invites speculative,
unsolicited, spontaneous, open or general applications.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
from html.parser import HTMLParser
import ipaddress
import json
import re
import socket
import sys
import time
import urllib.error
import urllib.parse
import urllib.robotparser
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY_PATH = ROOT / "src/data/speculative-route-directory.json"
PROFILES_PATH = ROOT / "src/data/studio-profiles.json"
STATE_PATH = ROOT / "state/studio-discovery-state.json"

USER_AGENT = (
    "StudioScoutDiscovery/1.0 "
    "(https://github.com/hhaitam95/game-industry-outreach-tracker/issues; "
    "purpose: verify public game-studio speculative application pages)"
)
WDQS_ENDPOINT = "https://query.wikidata.org/sparql"
REQUEST_TIMEOUT_SECONDS = 18
WDQS_TIMEOUT_SECONDS = 55
MAX_RESPONSE_BYTES = 2_500_000
PER_HOST_DELAY_SECONDS = 1.2
REVIEW_DAYS = 90
MAX_SITE_PAGES = 7
ROUTE_CHECK_STATUSES = {"active", "paused"}

FEEDS = (
    {
        "id": "wikidata_video_game_developers",
        "label": "Wikidata: video game developer entities",
        "kind": "class",
    },
    {
        "id": "wikidata_game_developer_credits",
        "label": "Wikidata: organizations credited as video-game developers",
        "kind": "developer_credit",
    },
    {
        "id": "wikidata_video_game_companies",
        "label": "Wikidata: video-game company entities",
        "kind": "company_class",
    },
)

ATS_HOSTS = (
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "workable.com",
    "smartrecruiters.com",
    "teamtailor.com",
    "recruitee.com",
    "personio.com",
    "myworkdayjobs.com",
    "workday.com",
    "jobvite.com",
    "icims.com",
    "bamboohr.com",
    "breezy.hr",
    "applytojob.com",
    "successfactors.com",
)

CAREER_LINK_HINT = re.compile(
    r"(career|karriere|stellenangebot|bewerbung|job|vacanc|opportunit|join|"
    r"work[-_ ]?with[-_ ]?us|apply|application|recruit|talent|contact|people|"
    r"team|emploi|carri[eè]re|recrut|postuler|nous rejoindre|vacature|werken bij|"
    r"contacto|empleo|trabaja con|candidatura|lavoro|lavora con noi|offerte di lavoro|"
    r"karri[aä]r|lediga jobb|spontanans[oö]k|ty[oö]paikka|arbet)",
    re.I,
)

POSITIVE_ROUTE_PATTERNS = (
    re.compile(r"\bunsolicited\s+(?:job\s+)?applications?\b", re.I),
    re.compile(r"\bspeculative\s+applications?\b", re.I),
    re.compile(r"\bspontaneous\s+applications?\b", re.I),
    re.compile(r"\bopen\s+applications?\b", re.I),
    re.compile(r"\bgeneral\s+applications?\b", re.I),
    re.compile(r"\bunsolicited\s+(?:cv|résumé|resume)\b", re.I),
    re.compile(r"\bwe\s+welcome\s+(?:unsolicited|speculative|spontaneous)\b", re.I),
    re.compile(
        r"\b(?:don't|do not|no longer|even if you)\s+(?:see|have)\s+"
        r"(?:a\s+)?(?:suitable|matching|relevant)\s+"
        r"(?:role|job|position|vacanc(?:y|ies))\b.{0,180}"
        r"\b(?:send|submit|share|apply|application|cv|résumé|resume)\b",
        re.I | re.S,
    ),
    re.compile(
        r"\b(?:send|submit)\s+(?:us\s+)?(?:your\s+)?(?:cv|résumé|resume|portfolio)\b"
        r".{0,160}\b(?:future\s+(?:opportunit|roles?|positions?)|upcoming\s+(?:roles?|positions?)|"
        r"even\s+if\s+(?:there\s+are\s+)?no\s+(?:open\s+)?(?:roles?|positions?|vacancies))\b",
        re.I | re.S,
    ),
    re.compile(r"\bexpression\s+of\s+interest\b", re.I),
    re.compile(r"\bcandidature\s+spontan[ée]e?s?\b", re.I),
    re.compile(r"\bcandidature\s+libre\b", re.I),
    re.compile(r"\binitiativbewerbung(?:en)?\b", re.I),
    re.compile(r"\bspontanbewerbung(?:en)?\b", re.I),
    re.compile(r"\bcandidatura\s+espont[aâ]nea\b", re.I),
    re.compile(r"\bcandidatura\s+spontanea\b", re.I),
    re.compile(r"\bspontane\s+sollicitatie\b", re.I),
    re.compile(r"\bspontanansök(?:an|ningar)\b", re.I),
    re.compile(r"\bspontanansøgning\b", re.I),
    re.compile(r"\bspontan\s+jelentkez[eé]s\b", re.I),
    re.compile(r"\bspontaniczna\s+aplikacja\b", re.I),
    re.compile(
        r"\bwe\s+(?:would\s+)?love\s+to\s+hear\s+from\s+you\s+even\s+if\s+"
        r"(?:you\s+)?(?:do\s+not|don't)\s+see\s+(?:a\s+)?"
        r"(?:suitable|matching|relevant)\s+(?:role|job|position|vacanc(?:y|ies))\b",
        re.I,
    ),
)

NEGATIVE_ROUTE_PATTERNS = (
    re.compile(r"\bnot\s+(?:currently\s+)?accepting\s+(?:any\s+)?(?:speculative|unsolicited|spontaneous)\s+applications?\b", re.I),
    re.compile(r"\bdo\s+not\s+accept\s+(?:any\s+)?(?:speculative|unsolicited|spontaneous)\s+applications?\b", re.I),
    re.compile(r"\bwe\s+don't\s+accept\s+(?:any\s+)?(?:speculative|unsolicited|spontaneous)\s+applications?\b", re.I),
    re.compile(r"\bno\s+(?:speculative|unsolicited|spontaneous)\s+applications?\b", re.I),
    re.compile(r"\bunsolicited\s+applications?\s+(?:will\s+not|won't)\s+be\s+(?:considered|reviewed|accepted)\b", re.I),
    re.compile(r"\bonly\s+(?:consider|accept|review)\s+applications?\s+for\s+(?:advertised|posted|listed|open)\s+(?:roles|jobs|positions|vacancies)\b", re.I),
    re.compile(r"\b(?:aucune|pas de)\s+candidatures?\s+spontan[ée]e?s?\b", re.I),
    re.compile(r"\bne\s+(?:nous\s+)?(?:acceptons|traitons)\s+pas\s+les?\s+candidatures?\s+spontan[ée]e?s?\b", re.I),
    re.compile(r"\bkeine\s+(?:Initiativbewerbungen|Spontanbewerbungen)\b", re.I),
    re.compile(r"\bno\s+aceptamos\s+candidaturas?\s+espont[aâ]neas?\b", re.I),
)

EXCLUSION_PATTERNS = (
    re.compile(r"\b(?:pornograph(?:y|ic)|adult[- ]only sexual games?|erotic game studio|explicit sexual entertainment)\b", re.I),
    re.compile(r"\b(?:online casino|social casino|real[- ]money gambling|sportsbook|sports betting|wagering platform)\b", re.I),
    re.compile(r"\b(?:cannabis game studio|marijuana game studio|recreational drug games?)\b", re.I),
    re.compile(r"\b(?:tobacco|nicotine|vaping)\s+(?:game|gaming|entertainment)\s+(?:studio|company|business)\b", re.I),
    re.compile(r"\b(?:alcohol|liquor)\s+(?:game|gaming|entertainment)\s+(?:studio|company|business)\b", re.I),
)

POSITIVE_ROUTE_TYPE = (
    ("unsolicited", re.compile(r"\bunsolicited\b", re.I)),
    ("spontaneous", re.compile(r"\bspontaneous\b", re.I)),
    ("speculative", re.compile(r"\bspeculative\b", re.I)),
    ("discipline_specific", re.compile(r"\b(?:expression of interest|talent pool)\b", re.I)),
    ("open", re.compile(r"\bopen applications?\b", re.I)),
    ("general", re.compile(r"\bgeneral applications?\b", re.I)),
    ("spontaneous", re.compile(r"\b(?:candidature\s+spontan[ée]e?s?|initiativbewerbung|spontanbewerbung|candidatura\s+espont[aâ]nea|spontane\s+sollicitatie|spontanansök(?:an|ningar)|spontanansøgning|spontan\s+jelentkez[eé]s|spontaniczna\s+aplikacja)\b", re.I)),
)

COUNTRY_CODE_RE = re.compile(r"^[A-Z]{2}$")
DOMAIN_SUFFIXES = {
    "co.uk", "org.uk", "ac.uk", "com.au", "net.au", "org.au", "co.nz",
    "co.jp", "co.kr", "com.br", "com.mx", "com.tr", "co.in", "co.za",
    "com.sg", "com.hk", "com.tw", "com.cn", "com.ar", "com.pl",
}

ROBOTS_CACHE: dict[str, urllib.robotparser.RobotFileParser] = {}
PUBLIC_HOST_CACHE: dict[str, bool] = {}
LAST_REQUEST_BY_HOST: dict[str, float] = {}


@dataclass
class FetchResult:
    ok: bool
    url: str
    status_code: int | None
    body: str
    error: str | None = None


@dataclass
class Page:
    url: str
    title: str
    text: str
    links: list[tuple[str, str]]
    has_form: bool


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.links: list[tuple[str, str]] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.anchor_href: str | None = None
        self.anchor_parts: list[str] = []
        self.has_form = False
        self._skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag in {"script", "style", "noscript", "svg"}:
            self._skip_depth += 1
        if tag == "title":
            self.in_title = True
        if tag == "form":
            self.has_form = True
        if tag == "a" and values.get("href"):
            self.anchor_href = values["href"]
            self.anchor_parts = []
        if tag in {"p", "li", "h1", "h2", "h3", "h4", "br", "div"}:
            self.parts.append(" ")

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"} and self._skip_depth:
            self._skip_depth -= 1
        if tag == "title":
            self.in_title = False
        if tag == "a" and self.anchor_href:
            label = " ".join(" ".join(self.anchor_parts).split())
            self.links.append((self.anchor_href, label))
            self.anchor_href = None
            self.anchor_parts = []
        if tag in {"p", "li", "h1", "h2", "h3", "h4", "br", "div"}:
            self.parts.append(" ")

    def handle_data(self, data: str) -> None:
        if self._skip_depth:
            return
        clean = " ".join(data.split())
        if not clean:
            return
        self.parts.append(clean)
        if self.in_title:
            self.title_parts.append(clean)
        if self.anchor_href:
            self.anchor_parts.append(clean)


def utc_now() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def iso_date(value: dt.datetime | None = None) -> str:
    return (value or utc_now()).date().isoformat()


def plus_days(date_text: str, days: int) -> str:
    return (dt.date.fromisoformat(date_text) + dt.timedelta(days=days)).isoformat()


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json_atomic(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def canonical_url(value: str) -> str | None:
    try:
        parsed = urllib.parse.urlsplit(html.unescape(value.strip()))
        if parsed.scheme not in {"https", "http"} or not parsed.hostname:
            return None
        if parsed.username or parsed.password or parsed.port not in {None, 80, 443}:
            return None
        host = parsed.hostname.lower().rstrip(".")
        if host in {"localhost", "localhost.localdomain"} or host.endswith((".local", ".internal", ".invalid", ".test")):
            return None
        try:
            ip = ipaddress.ip_address(host)
            if not ip.is_global:
                return None
        except ValueError:
            pass
        scheme = "https"
        netloc = host
        path = parsed.path or "/"
        return urllib.parse.urlunsplit((scheme, netloc, path, parsed.query, ""))
    except (ValueError, AttributeError):
        return None


def base_domain(host: str) -> str:
    labels = host.lower().strip(".").split(".")
    if len(labels) <= 2:
        return host.lower().strip(".")
    suffix = ".".join(labels[-2:])
    compound = ".".join(labels[-3:])
    if suffix in DOMAIN_SUFFIXES and len(labels) >= 3:
        return compound
    return suffix


def domain_key(url: str) -> str:
    parsed = urllib.parse.urlsplit(url)
    return base_domain(parsed.hostname or "")


def same_site(left: str, right: str) -> bool:
    left_host = urllib.parse.urlsplit(left).hostname or ""
    right_host = urllib.parse.urlsplit(right).hostname or ""
    return bool(left_host and right_host and base_domain(left_host) == base_domain(right_host))


def is_ats_host(host: str) -> bool:
    host = host.lower().strip(".")
    return any(host == suffix or host.endswith("." + suffix) for suffix in ATS_HOSTS)


def validate_public_host(host: str) -> bool:
    host = host.lower().strip(".")
    if not host or host == "localhost" or host.endswith((".local", ".internal", ".invalid", ".test")):
        return False
    if host in PUBLIC_HOST_CACHE:
        return PUBLIC_HOST_CACHE[host]
    try:
        address = ipaddress.ip_address(host)
        allowed = address.is_global
    except ValueError:
        try:
            addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
            allowed = bool(addresses) and all(
                ipaddress.ip_address(entry[4][0]).is_global for entry in addresses
            )
        except (OSError, ValueError):
            allowed = False
    PUBLIC_HOST_CACHE[host] = allowed
    return allowed


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    def __init__(self, initial_url: str, allowed_external: bool = False) -> None:
        super().__init__()
        self.initial_url = initial_url
        self.allowed_external = allowed_external

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Any:
        target = canonical_url(urllib.parse.urljoin(req.full_url, newurl))
        if not target:
            raise urllib.error.HTTPError(req.full_url, code, "Unsafe redirect rejected", headers, fp)
        target_host = urllib.parse.urlsplit(target).hostname or ""
        if not validate_public_host(target_host):
            raise urllib.error.HTTPError(req.full_url, code, "Non-public redirect target rejected", headers, fp)
        if not same_site(self.initial_url, target):
            if not (self.allowed_external and is_ats_host(target_host)):
                raise urllib.error.HTTPError(req.full_url, code, "Cross-site redirect rejected", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, target)


def wait_for_host(host: str) -> None:
    previous = LAST_REQUEST_BY_HOST.get(host, 0.0)
    delay = PER_HOST_DELAY_SECONDS - (time.monotonic() - previous)
    if delay > 0:
        time.sleep(delay)
    LAST_REQUEST_BY_HOST[host] = time.monotonic()


def robots_allowed(url: str) -> bool:
    parsed = urllib.parse.urlsplit(url)
    host = parsed.hostname or ""
    cache_key = host.lower()
    if cache_key not in ROBOTS_CACHE:
        robots_url = urllib.parse.urlunsplit(("https", host, "/robots.txt", "", ""))
        parser = urllib.robotparser.RobotFileParser()
        parser.set_url(robots_url)
        result = fetch_url(robots_url, check_robots=False, timeout=10, max_bytes=250_000)
        if result.ok:
            parser.parse(result.body.splitlines())
        elif result.status_code == 404:
            parser.parse([])
        else:
            # A robots policy that cannot be retrieved is treated conservatively.
            parser.parse(["User-agent: *", "Disallow: /"])
        ROBOTS_CACHE[cache_key] = parser
    return ROBOTS_CACHE[cache_key].can_fetch(USER_AGENT, url)


def fetch_url(
    url: str,
    *,
    check_robots: bool = True,
    allowed_external: bool = False,
    timeout: int = REQUEST_TIMEOUT_SECONDS,
    max_bytes: int = MAX_RESPONSE_BYTES,
) -> FetchResult:
    safe_url = canonical_url(url)
    if not safe_url:
        return FetchResult(False, url, None, "", "invalid-or-unsafe-url")
    host = urllib.parse.urlsplit(safe_url).hostname or ""
    if not validate_public_host(host):
        return FetchResult(False, safe_url, None, "", "non-public-host-or-dns-failure")
    if check_robots and not robots_allowed(safe_url):
        return FetchResult(False, safe_url, None, "", "robots-disallowed")
    wait_for_host(host)
    request = urllib.request.Request(
        safe_url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
            "Accept-Encoding": "identity",
        },
    )
    opener = urllib.request.build_opener(SafeRedirectHandler(safe_url, allowed_external))
    try:
        with opener.open(request, timeout=timeout) as response:
            status = getattr(response, "status", 200)
            final_url = canonical_url(response.geturl()) or safe_url
            if not 200 <= status < 300:
                return FetchResult(False, final_url, status, "", "http-status")
            content_type = response.headers.get("Content-Type", "text/html").lower()
            if not any(kind in content_type for kind in ("html", "xhtml")):
                return FetchResult(False, final_url, status, "", "not-html")
            body_bytes = response.read(max_bytes + 1)
            if len(body_bytes) > max_bytes:
                return FetchResult(False, final_url, status, "", "response-too-large")
            charset_match = re.search(r"charset=([\w.-]+)", content_type)
            charset = charset_match.group(1) if charset_match else "utf-8"
            try:
                body = body_bytes.decode(charset, errors="replace")
            except LookupError:
                body = body_bytes.decode("utf-8", errors="replace")
            return FetchResult(True, final_url, status, body)
    except urllib.error.HTTPError as exc:
        return FetchResult(False, safe_url, exc.code, "", "http-status")
    except urllib.error.URLError as exc:
        return FetchResult(False, safe_url, None, "", "network-error:" + type(exc.reason).__name__)
    except (TimeoutError, OSError) as exc:
        return FetchResult(False, safe_url, None, "", "network-error:" + type(exc).__name__)


def parse_page(url: str, body: str) -> Page:
    parser = PageParser()
    try:
        parser.feed(body)
    except Exception:
        pass
    text = " ".join(" ".join(parser.parts).split())
    title = " ".join(" ".join(parser.title_parts).split())
    return Page(url, title, text[:80_000], parser.links, parser.has_form)


def relevant_page_urls(home_url: str, home_page: Page) -> list[str]:
    found: list[str] = []
    seen: set[str] = {home_url}
    for href, label in home_page.links:
        absolute = canonical_url(urllib.parse.urljoin(home_url, href))
        if not absolute or absolute in seen:
            continue
        host = urllib.parse.urlsplit(absolute).hostname or ""
        if not same_site(home_url, absolute) and not is_ats_host(host):
            continue
        if not CAREER_LINK_HINT.search(absolute + " " + label):
            continue
        seen.add(absolute)
        found.append(absolute)
        if len(found) >= MAX_SITE_PAGES - 1:
            break
    return found


def positive_route_match(text: str) -> re.Match[str] | None:
    for pattern in POSITIVE_ROUTE_PATTERNS:
        match = pattern.search(text)
        if match:
            return match
    return None


def negative_route_match(text: str) -> re.Match[str] | None:
    for pattern in NEGATIVE_ROUTE_PATTERNS:
        match = pattern.search(text)
        if match:
            return match
    return None


def exclusion_match(text: str) -> re.Match[str] | None:
    for pattern in EXCLUSION_PATTERNS:
        match = pattern.search(text)
        if match:
            return match
    return None


def route_type_for(text: str) -> str:
    for route_type, pattern in POSITIVE_ROUTE_TYPE:
        if pattern.search(text):
            return route_type
    return "general"


def choose_application_url(page: Page, site_url: str) -> str:
    choices: list[tuple[int, str]] = []
    for href, label in page.links:
        absolute = canonical_url(urllib.parse.urljoin(page.url, href))
        if not absolute:
            continue
        host = urllib.parse.urlsplit(absolute).hostname or ""
        if not same_site(site_url, absolute) and not is_ats_host(host):
            continue
        score = 0
        combined = (absolute + " " + label).lower()
        if re.search(r"\b(apply|application|submit|speculative|unsolicited|careers?)\b", combined):
            score += 3
        if is_ats_host(host):
            score += 2
        if score:
            choices.append((score, absolute))
    if choices:
        choices.sort(key=lambda item: (-item[0], item[1]))
        return choices[0][1]
    return page.url


def verify_candidate_pages(
    candidate: dict[str, Any],
    page_fetcher: Callable[[str, bool], FetchResult],
) -> dict[str, Any]:
    website = canonical_url(str(candidate.get("website") or ""))
    if not website:
        return {"status": "needs_review", "reason": "missing_or_unsafe_official_website"}
    homepage_result = page_fetcher(website, False)
    if not homepage_result.ok:
        return {"status": "retry", "reason": homepage_result.error or "homepage_unavailable"}
    homepage = parse_page(homepage_result.url, homepage_result.body)
    pages = [homepage]
    for page_url in relevant_page_urls(website, homepage):
        result = page_fetcher(page_url, not same_site(website, page_url))
        if result.ok:
            pages.append(parse_page(result.url, result.body))
    all_text = " ".join(page.text for page in pages)
    excluded = exclusion_match(all_text)
    if excluded:
        return {"status": "excluded", "reason": "portfolio_or_company_content_exclusion"}
    matches: list[tuple[Page, re.Match[str]]] = []
    negatives: list[tuple[Page, re.Match[str]]] = []
    for page in pages:
        negative = negative_route_match(page.text)
        match = positive_route_match(page.text)
        if negative:
            negatives.append((page, negative))
        elif match:
            matches.append((page, match))
    if negatives:
        if matches:
            return {"status": "needs_review", "reason": "conflicting_positive_and_negative_route_evidence"}
        return {"status": "no_route", "reason": "official_site_explicitly_rejects_speculative_applications"}
    if not matches:
        return {"status": "no_route", "reason": "no_explicit_speculative_route_found"}
    matches.sort(key=lambda item: (0 if CAREER_LINK_HINT.search(item[0].url) else 1, len(item[0].text)))
    evidence_page, match = matches[0]
    application_url = choose_application_url(evidence_page, website)
    application_host = urllib.parse.urlsplit(application_url).hostname or ""
    external_ats = not same_site(website, application_url) and is_ats_host(application_host)
    methods: list[str] = []
    if evidence_page.has_form or application_url == evidence_page.url:
        methods.append("website_form")
    if any(href.lower().startswith("mailto:") for href, _ in evidence_page.links):
        methods.append("email")
    if external_ats:
        methods.append("ats")
    if not methods:
        methods.append("website_form")
    matched_text = " ".join(match.group(0).split())[:180]
    return {
        "status": "verified",
        "application_url": application_url,
        "evidence_url": evidence_page.url,
        "route_type": route_type_for(match.group(0) + " " + evidence_page.text),
        "submission_methods": sorted(set(methods)),
        "source_type": "employer_managed_career_platform" if external_ats else "official_company_site",
        "evidence_excerpt": matched_text,
        "work_model": infer_work_model(evidence_page.text),
    }


def infer_work_model(text: str) -> str:
    lowered = text.lower()
    if re.search(r"\bfully remote\b|\bremote[- ]first\b|\bwork from anywhere\b", lowered):
        return "remote"
    if re.search(r"\bhybrid (?:working|work|role|position|model)\b", lowered):
        return "hybrid"
    if re.search(r"\bon[- ]site (?:working|work|role|position)\b|\bin[- ]office role\b", lowered):
        return "on_site"
    return "not_stated"


def sparql_query(feed_kind: str, cursor: str, limit: int) -> str:
    safe_cursor = cursor if cursor.startswith("https://www.wikidata.org/entity/Q") else "https://www.wikidata.org/entity/Q0"
    if feed_kind == "class":
        source_pattern = "?company wdt:P31 wd:Q210167."
    elif feed_kind == "developer_credit":
        source_pattern = "?game wdt:P31 wd:Q7889; wdt:P178 ?company."
    elif feed_kind == "company_class":
        source_pattern = "?company wdt:P31 wd:Q112042224."
    else:
        raise ValueError("Unknown Wikidata feed kind: " + feed_kind)
    return f"""
SELECT ?company ?companyLabel
       (SAMPLE(?website) AS ?website)
       (SAMPLE(?countryLabel) AS ?countryLabel)
       (SAMPLE(?hqLabel) AS ?hqLabel)
       (SAMPLE(?countryCode) AS ?countryCode)
WHERE {{
  {source_pattern}
  ?company wdt:P856 ?website.
  OPTIONAL {{ ?company wdt:P17 ?country. }}
  OPTIONAL {{ ?company wdt:P159 ?hq. }}
  OPTIONAL {{ ?country wdt:P297 ?countryCode. }}
  FILTER(STR(?company) > "{safe_cursor}")
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en". }}
}}
GROUP BY ?company ?companyLabel
ORDER BY ?company
LIMIT {int(limit)}
""".strip()


def fetch_wikidata_batch(feed_kind: str, cursor: str, limit: int) -> list[dict[str, str]]:
    query = sparql_query(feed_kind, cursor, limit)
    data = urllib.parse.urlencode({"query": query, "format": "json"}).encode("utf-8")
    request = urllib.request.Request(
        WDQS_ENDPOINT,
        data=data,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/sparql-results+json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=WDQS_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read(MAX_RESPONSE_BYTES).decode("utf-8"))
    except urllib.error.HTTPError as exc:
        retry_after = exc.headers.get("Retry-After", "")
        raise RuntimeError("Wikidata returned HTTP " + str(exc.code) + ("; Retry-After " + retry_after if retry_after else "")) from exc
    except (urllib.error.URLError, TimeoutError, OSError, json.JSONDecodeError) as exc:
        raise RuntimeError("Wikidata batch failed safely: " + type(exc).__name__) from exc

    rows: list[dict[str, str]] = []
    for binding in payload.get("results", {}).get("bindings", []):
        def value(key: str) -> str:
            return str(binding.get(key, {}).get("value", "")).strip()
        uri = value("company")
        name = value("companyLabel")
        website = value("website")
        if not uri or not name or not website:
            continue
        rows.append({
            "qid": uri.rsplit("/", 1)[-1],
            "entity_url": uri,
            "name": name,
            "website": website,
            "country": value("countryLabel") or "Not stated",
            "hq_city": value("hqLabel"),
            "country_code": value("countryCode").upper(),
            "company_type": "Game industry company" if feed_kind == "company_class" else "Developer",
        })
    return rows


def empty_state() -> dict[str, Any]:
    return {
        "schema_version": 1,
        "updated_at": utc_now().isoformat(),
        "feed_cursors": {feed["id"]: "" for feed in FEEDS},
        "feed_done": {feed["id"]: False for feed in FEEDS},
        "feed_index": 0,
        "cycle": 1,
        "cycle_additions": 0,
        "empty_cycles": 0,
        "saturated": False,
        "bootstrap_started": False,
        "candidates": {},
        "route_checks": {},
        "route_check_index": 0,
        "stats": {"candidates_seen": 0, "routes_verified": 0, "excluded": 0, "no_route": 0, "needs_review": 0},
    }


def load_state(path: Path = STATE_PATH) -> dict[str, Any]:
    state = read_json(path, empty_state())
    if not isinstance(state, dict) or state.get("schema_version") != 1:
        raise ValueError("Discovery state has an unsupported schema; refusing to overwrite it.")
    for field in ("feed_cursors", "feed_done", "candidates", "route_checks", "stats"):
        if not isinstance(state.get(field), dict):
            raise ValueError("Discovery state field is invalid: " + field)
    return state


def name_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def existing_indexes(studios: list[dict[str, Any]]) -> tuple[set[str], set[str]]:
    names = {name_key(str(item.get("name", ""))) for item in studios}
    domains = {
        domain_key(str(item.get("websiteUrl", "")))
        for item in studios if canonical_url(str(item.get("websiteUrl", "")))
    }
    return names, domains


def add_candidates(state: dict[str, Any], rows: list[dict[str, str]]) -> int:
    added = 0
    for row in rows:
        qid = row["qid"]
        if qid in state["candidates"]:
            continue
        website = canonical_url(row["website"])
        if not website:
            continue
        state["candidates"][qid] = {
            **row,
            "website": website,
            "status": "queued",
            "discovered_at": utc_now().isoformat(),
            "checked_at": None,
            "next_check_at": None,
            "attempts": 0,
            "cycle": state["cycle"],
            "reason": None,
        }
        state["stats"]["candidates_seen"] += 1
        added += 1
    return added


def ingest_source_pages(state: dict[str, Any], max_pages: int, batch_size: int) -> tuple[int, int]:
    pages_processed = 0
    candidates_added = 0
    for _ in range(max_pages):
        available = [feed for feed in FEEDS if not state["feed_done"].get(feed["id"], False)]
        if not available:
            break
        feed = FEEDS[state["feed_index"] % len(FEEDS)]
        state["feed_index"] = (state["feed_index"] + 1) % len(FEEDS)
        if state["feed_done"].get(feed["id"], False):
            # Look for the next source that is not exhausted in this cycle.
            feed = available[0]
        rows = fetch_wikidata_batch(
            feed["kind"],
            state["feed_cursors"].get(feed["id"], ""),
            batch_size,
        )
        pages_processed += 1
        if rows:
            state["feed_cursors"][feed["id"]] = max(row["entity_url"] for row in rows)
            candidates_added += add_candidates(state, rows)
        if len(rows) < batch_size:
            state["feed_done"][feed["id"]] = True
    return pages_processed, candidates_added


def profile_for(candidate: dict[str, Any]) -> dict[str, Any]:
    country = candidate.get("country") or "Not disclosed"
    city = candidate.get("hq_city") or None
    country_code = candidate.get("country_code") or ""
    entity_url = candidate["entity_url"]
    website = candidate["website"]
    return {
        "description": "Not yet researched. The studio was identified through public game-industry data and has an application route verified on its official site.",
        "headquarters": {
            "city": city,
            "country": country,
            "countryCode": country_code,
            "label": "HQ · Wikidata" if city else ("Country · Wikidata" if country != "Not disclosed" else "Not disclosed"),
        },
        "otherLocations": [],
        "companyType": [candidate.get("company_type") or "Developer"],
        "ownership": "Not yet researched",
        "parentCompany": None,
        "industryScale": "Mixed / Unclassified",
        "teamSize": "Not disclosed",
        "teamSizeAsOf": None,
        "focus": [],
        "popularGames": [],
        "profileSources": [entity_url, website],
        "applicationLocation": "Not specified · HQ shown as reference",
    }


def studio_record_for(candidate: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    today = iso_date()
    notes = (
        "Official studio-controlled page explicitly invites "
        + route["route_type"].replace("_", " ")
        + " applications. Evidence: "
        + route["evidence_excerpt"]
        + ". Hiring geography is not inferred from headquarters."
    )
    return {
        "name": candidate["name"],
        "country": candidate.get("country") or "Not stated",
        "websiteUrl": candidate["website"],
        "applicationUrl": route["application_url"],
        "evidenceUrl": route["evidence_url"],
        "notes": notes,
        "checkedAt": today,
        "applicationResearch": {
            "routeType": route["route_type"],
            "submissionMethods": route["submission_methods"],
            "workModel": route["work_model"],
            "eligibleLocations": [],
            "disciplineScope": [],
            "relatedApplicationUrls": [],
            "routeStatus": "active",
            "sourceType": route["source_type"],
            "nextReviewAt": plus_days(today, REVIEW_DAYS),
        },
    }


def process_candidate_queue(
    state: dict[str, Any],
    studios: list[dict[str, Any]],
    profiles: dict[str, Any],
    limit: int,
    page_fetcher: Callable[[str, bool], FetchResult] = fetch_url,
    deadline: float | None = None,
) -> tuple[int, int]:
    names, domains = existing_indexes(studios)
    pending = [
        candidate for candidate in state["candidates"].values()
        if candidate.get("status") in {"queued", "retry", "no_route", "needs_review"}
        and (not candidate.get("next_check_at") or candidate["next_check_at"] <= iso_date())
    ]
    pending.sort(key=lambda candidate: candidate.get("discovered_at") or "")
    checked = 0
    published = 0
    for candidate in pending[:limit]:
        worst_case_candidate_seconds = (
            MAX_SITE_PAGES * (REQUEST_TIMEOUT_SECONDS + PER_HOST_DELAY_SECONDS) + 30
        )
        if deadline is not None and time.monotonic() + worst_case_candidate_seconds >= deadline:
            break
        checked += 1
        candidate["attempts"] = int(candidate.get("attempts", 0)) + 1
        candidate["checked_at"] = utc_now().isoformat()
        name = candidate["name"]
        normalized_name = name_key(name)
        domain = domain_key(candidate["website"])
        if normalized_name in names or domain in domains:
            candidate["status"] = "duplicate"
            candidate["reason"] = "name_or_official_domain_already_in_directory"
            continue
        result = verify_candidate_pages(candidate, page_fetcher)
        candidate["status"] = result["status"]
        candidate["reason"] = result.get("reason")
        if result["status"] == "verified":
            studio = studio_record_for(candidate, result)
            studios.append(studio)
            profiles[name] = profile_for(candidate)
            names.add(normalized_name)
            domains.add(domain)
            candidate["status"] = "published"
            candidate["route"] = result
            candidate["next_check_at"] = plus_days(iso_date(), REVIEW_DAYS)
            state["stats"]["routes_verified"] += 1
            state["cycle_additions"] += 1
            published += 1
        elif result["status"] == "retry":
            candidate["status"] = "retry"
            candidate["next_check_at"] = plus_days(iso_date(), 7)
        elif result["status"] == "no_route":
            candidate["next_check_at"] = plus_days(iso_date(), REVIEW_DAYS)
            state["stats"]["no_route"] += 1
        elif result["status"] == "excluded":
            candidate["next_check_at"] = None
            state["stats"]["excluded"] += 1
        else:
            candidate["next_check_at"] = plus_days(iso_date(), 30)
            state["stats"]["needs_review"] += 1
    return checked, published


def route_page_check(studio: dict[str, Any], page_fetcher: Callable[[str, bool], FetchResult]) -> str:
    urls = []
    for key in ("evidenceUrl", "applicationUrl"):
        url = canonical_url(str(studio.get(key, "")))
        if url and url not in urls:
            urls.append(url)
    if not urls:
        return "unknown"
    results: list[FetchResult] = []
    positive_pages = 0
    negative_pages = 0
    for url in urls:
        result = page_fetcher(url, not same_site(studio["websiteUrl"], url))
        results.append(result)
        if result.ok:
            page = parse_page(result.url, result.body)
            if negative_route_match(page.text):
                negative_pages += 1
            elif positive_route_match(page.text):
                positive_pages += 1
    if results and all(result.status_code in {404, 410} for result in results):
        return "gone"
    if positive_pages and negative_pages:
        return "unknown"
    if negative_pages:
        return "negative"
    # A live evidence page does not make a missing submission URL healthy. Keep the
    # record active while uncertain, but do not reset its closure counters either.
    if positive_pages and all(result.ok for result in results):
        return "active"
    return "unknown"


def maintain_existing_routes(
    state: dict[str, Any],
    studios: list[dict[str, Any]],
    batch_size: int,
    page_fetcher: Callable[[str, bool], FetchResult] = fetch_url,
    deadline: float | None = None,
) -> int:
    active = [
        studio for studio in studios
        if studio.get("applicationResearch", {}).get("routeStatus") in ROUTE_CHECK_STATUSES
    ]
    if not active or batch_size <= 0:
        return 0
    start = int(state.get("route_check_index", 0)) % len(active)
    selected = [active[(start + index) % len(active)] for index in range(min(batch_size, len(active)))]
    today = iso_date()
    checked = 0
    for studio in selected:
        urls = {
            url for key in ("evidenceUrl", "applicationUrl")
            if (url := canonical_url(str(studio.get(key, ""))))
        }
        worst_case_route_seconds = (
            len(urls) * (REQUEST_TIMEOUT_SECONDS + PER_HOST_DELAY_SECONDS) + 10
        )
        if deadline is not None and time.monotonic() + worst_case_route_seconds >= deadline:
            break
        name = studio["name"]
        result = route_page_check(studio, page_fetcher)
        checked += 1
        check = state["route_checks"].setdefault(name, {"negative_count": 0, "gone_count": 0, "last_result": None})
        check["last_checked_at"] = utc_now().isoformat()
        check["last_result"] = result
        if result == "active":
            check["negative_count"] = 0
            check["gone_count"] = 0
            studio["checkedAt"] = today
            studio["applicationResearch"]["nextReviewAt"] = plus_days(today, REVIEW_DAYS)
        elif result == "negative":
            check["negative_count"] = int(check.get("negative_count", 0)) + 1
            check["gone_count"] = 0
        elif result == "gone":
            check["gone_count"] = int(check.get("gone_count", 0)) + 1
            check["negative_count"] = 0
        else:
            # Network errors, robots restrictions, blocked requests and ambiguous pages
            # never change public route status.
            continue
        if check["negative_count"] >= 2 or check["gone_count"] >= 2:
            research = studio["applicationResearch"]
            if research.get("routeStatus") != "closed":
                evidence = "two consecutive official-site checks rejected speculative applications" if check["negative_count"] >= 2 else "both official application/evidence URLs returned 404/410 on two consecutive checks"
                studio["notes"] = str(studio.get("notes", "")).rstrip() + " Automated route review: marked closed after " + evidence + "."
                research["routeStatus"] = "closed"
                studio["checkedAt"] = today
                research["nextReviewAt"] = today
    state["route_check_index"] = (start + checked) % len(active)
    return checked


def finish_cycle_if_complete(state: dict[str, Any]) -> bool:
    if not all(state["feed_done"].get(feed["id"], False) for feed in FEEDS):
        return False
    queued = any(
        candidate.get("cycle") == state["cycle"]
        and candidate.get("status") in {"queued", "retry"}
        for candidate in state["candidates"].values()
    )
    if queued:
        return False
    if int(state.get("cycle_additions", 0)) == 0:
        state["empty_cycles"] = int(state.get("empty_cycles", 0)) + 1
    else:
        state["empty_cycles"] = 0
    state["cycle"] = int(state.get("cycle", 1)) + 1
    state["cycle_additions"] = 0
    state["feed_cursors"] = {feed["id"]: "" for feed in FEEDS}
    state["feed_done"] = {feed["id"]: False for feed in FEEDS}
    if state["empty_cycles"] >= 3:
        state["saturated"] = True
    return True


def run_pipeline(
    *,
    mode: str,
    batch_size: int,
    max_source_pages: int,
    max_candidate_checks: int,
    route_check_count: int,
    max_run_seconds: int = 1200,
    root: Path = ROOT,
    state_path: Path | None = None,
    page_fetcher: Callable[[str, bool], FetchResult] = fetch_url,
    source_fetcher: Callable[[str, str, int], list[dict[str, str]]] = fetch_wikidata_batch,
) -> dict[str, Any]:
    studios_path = root / "src/data/speculative-route-directory.json"
    profiles_path = root / "src/data/studio-profiles.json"
    state_path = state_path or (root / "state/studio-discovery-state.json")
    studios = read_json(studios_path, [])
    profiles = read_json(profiles_path, {})
    state = load_state(state_path) if state_path.exists() else empty_state()
    if mode == "bootstrap":
        state["bootstrap_started"] = True
    if not isinstance(studios, list) or not isinstance(profiles, dict):
        raise ValueError("Public studio datasets have an invalid shape.")

    deadline = time.monotonic() + max_run_seconds
    source_pages = 0
    source_candidates = 0
    # Use an injectable source fetcher in tests. Production requests are spaced out to
    # stay well below WDQS's documented per-client processing budget.
    for _ in range(max_source_pages):
        available = [feed for feed in FEEDS if not state["feed_done"].get(feed["id"], False)]
        if not available:
            break
        feed = FEEDS[state["feed_index"] % len(FEEDS)]
        if state["feed_done"].get(feed["id"], False):
            feed = available[0]
        cursor = state["feed_cursors"].get(feed["id"], "")
        rows = source_fetcher(feed["kind"], cursor, batch_size)
        source_pages += 1
        if rows:
            state["feed_cursors"][feed["id"]] = max(row["entity_url"] for row in rows)
            source_candidates += add_candidates(state, rows)
        if len(rows) < batch_size:
            state["feed_done"][feed["id"]] = True
        state["feed_index"] = (FEEDS.index(feed) + 1) % len(FEEDS)
        if source_pages < max_source_pages and time.monotonic() + 65 < deadline:
            time.sleep(65)
        elif source_pages < max_source_pages:
            break

    checked, published = process_candidate_queue(
        state, studios, profiles, max_candidate_checks, page_fetcher, deadline
    )
    routes_checked = maintain_existing_routes(
        state, studios, route_check_count, page_fetcher, deadline
    )
    cycle_completed = finish_cycle_if_complete(state)
    state["updated_at"] = utc_now().isoformat()

    # Sort only by display name. Existing verified records and profiles are otherwise
    # preserved; additions are append-only and route closure is a status update.
    studios.sort(key=lambda studio: str(studio.get("name", "")).casefold())
    result = {
        "mode": mode,
        "source_pages": source_pages,
        "source_candidates": source_candidates,
        "candidate_checks": checked,
        "verified_added": published,
        "routes_checked": routes_checked,
        "time_budget_exhausted": time.monotonic() >= deadline,
        "cycle_completed": cycle_completed,
        "cycle": state["cycle"],
        "empty_cycles": state["empty_cycles"],
        "saturated": state["saturated"],
        "studio_count": len(studios),
        "candidate_queue": sum(1 for item in state["candidates"].values() if item.get("status") in {"queued", "retry"}),
        "stats": state["stats"],
    }
    write_json_atomic(studios_path, studios)
    write_json_atomic(profiles_path, profiles)
    write_json_atomic(state_path, state)
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("bootstrap", "hourly"), default="hourly")
    parser.add_argument("--batch-size", type=int, default=150)
    parser.add_argument("--max-source-pages", type=int, default=None)
    parser.add_argument("--max-candidate-checks", type=int, default=None)
    parser.add_argument("--route-check-count", type=int, default=8)
    parser.add_argument("--max-run-seconds", type=int, default=1200, help="Stop starting new website checks when the bounded runtime budget is exhausted.")
    parser.add_argument("--state-file", type=Path, default=None, help="Optional durable state file outside the public website branch.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if not 1 <= args.batch_size <= 250:
        raise ValueError("--batch-size must be between 1 and 250.")
    if args.mode == "bootstrap":
        pages = args.max_source_pages if args.max_source_pages is not None else 6
        checks = args.max_candidate_checks if args.max_candidate_checks is not None else 80
    else:
        pages = args.max_source_pages if args.max_source_pages is not None else 1
        checks = args.max_candidate_checks if args.max_candidate_checks is not None else 20
    if pages < 0 or checks < 0 or args.route_check_count < 0:
        raise ValueError("Batch limits cannot be negative.")
    if not 60 <= args.max_run_seconds <= 1500:
        raise ValueError("--max-run-seconds must be between 60 and 1500.")
    result = run_pipeline(
        mode=args.mode,
        batch_size=args.batch_size,
        max_source_pages=pages,
        max_candidate_checks=checks,
        route_check_count=args.route_check_count,
        max_run_seconds=args.max_run_seconds,
        state_path=args.state_file,
    )
    print("StudioScout speculative-route discovery")
    for key, value in result.items():
        print(f"{key}: {json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else value}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print("Discovery stopped safely: " + type(exc).__name__ + ": " + str(exc), file=sys.stderr)
        raise SystemExit(2)
