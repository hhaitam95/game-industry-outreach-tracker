"""Conservative HTTPS fetching and URL normalization for official career sources."""
from __future__ import annotations

import html
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any

USER_AGENT = "GameIndustryOutreachTrackerDiscovery/0.1 (+manual official-source monitor; contact repository owner)"
MAX_RESPONSE_BYTES = 3 * 1024 * 1024
DEFAULT_TIMEOUT_SECONDS = 15
DEFAULT_RETRIES = 2

def canonical_url(value: str, base_url: str | None = None) -> str | None:
    """Resolve and normalize an HTTPS URL; reject credentials and other schemes."""
    if not isinstance(value, str) or not value.strip():
        return None
    resolved = urllib.parse.urljoin(base_url or "", html.unescape(value.strip()))
    try:
        parsed = urllib.parse.urlsplit(resolved)
        if parsed.scheme.lower() != "https" or not parsed.hostname or parsed.username or parsed.password:
            return None
        host = parsed.hostname.lower()
        port = f":{parsed.port}" if parsed.port and parsed.port != 443 else ""
        path = re.sub(r"/{2,}", "/", parsed.path or "/")
        # Remove common tracking parameters without changing role identity for ordinary query keys.
        tracking = {"utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref", "source", "gh_jid"}
        query = urllib.parse.urlencode(
            [(k, v) for k, v in urllib.parse.parse_qsl(parsed.query, keep_blank_values=True) if k.lower() not in tracking]
        )
        return urllib.parse.urlunsplit(("https", host + port, path, query, ""))
    except ValueError:
        return None
@dataclass(frozen=True)
class FetchResult:
    status: str
    source_url: str
    final_url: str | None
    http_status: int | None
    body: str | None
    error_category: str | None
    error_message: str | None


class SameHostHTTPSRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Reject HTTP downgrades and cross-host redirects before following them."""

    def redirect_request(self, req: Any, fp: Any, code: int, msg: str, headers: Any, newurl: str) -> Any:
        target_url = urllib.parse.urljoin(req.full_url, newurl)
        safe_target = canonical_url(target_url)
        source_host = urllib.parse.urlsplit(req.full_url).hostname
        target_host = urllib.parse.urlsplit(safe_target).hostname if safe_target else None
        if safe_target is None or target_host != source_host:
            raise urllib.error.HTTPError(req.full_url, code, "Unsafe redirect rejected", headers, fp)
        return super().redirect_request(req, fp, code, msg, headers, safe_target)


def fetch_source(url: str, timeout_seconds: int = DEFAULT_TIMEOUT_SECONDS, retries: int = DEFAULT_RETRIES, opener: Any | None = None, sleep_fn: Any = time.sleep) -> FetchResult:
    """Fetch only the configured public URL. Never bypass challenges or access controls."""
    safe_url = canonical_url(url)
    if not safe_url:
        return FetchResult("needs-review", url, None, None, None, "invalid-source-url", "Source URL must be HTTPS without credentials.")
    if opener is None:
        opener = urllib.request.build_opener(SameHostHTTPSRedirectHandler()).open
    last_error: FetchResult | None = None
    for attempt in range(max(0, retries) + 1):
        request = urllib.request.Request(safe_url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
        try:
            with opener(request, timeout=timeout_seconds) as response:
                status = getattr(response, "status", 200)
                final_url = canonical_url(response.geturl())
                source_host = urllib.parse.urlsplit(safe_url).hostname
                final_host = urllib.parse.urlsplit(final_url).hostname if final_url else None
                if final_url is None or final_host != source_host:
                    return FetchResult(
                        "needs-review",
                        safe_url,
                        None,
                        status,
                        None,
                        "unsafe-redirect",
                        "The source redirected away from the configured HTTPS host.",
                    )
                if status in {403, 429, 451}:
                    return FetchResult("blocked", safe_url, final_url, status, None, "access-restricted", f"Source returned HTTP {status}; no bypass attempted.")
                if not 200 <= status < 300:
                    return FetchResult("unavailable", safe_url, final_url, status, None, "http-error", f"Source returned HTTP {status}; existing observations preserved.")
                content_type = response.headers.get("Content-Type", "text/html").lower()
                if "html" not in content_type and "xhtml" not in content_type:
                    return FetchResult("needs-review", safe_url, final_url, status, None, "unexpected-content-type", "Source did not return HTML; manual adapter review required.")
                body_bytes = response.read(MAX_RESPONSE_BYTES + 1)
                if len(body_bytes) > MAX_RESPONSE_BYTES:
                    return FetchResult("needs-review", safe_url, final_url, status, None, "response-too-large", "Response exceeds 3 MiB safety limit.")
                charset_match = re.search(r"charset=([\w.-]+)", content_type)
                charset = charset_match.group(1) if charset_match else "utf-8"
                try:
                    body = body_bytes.decode(charset, errors="replace")
                except LookupError:
                    body = body_bytes.decode("utf-8", errors="replace")
                return FetchResult("success", safe_url, final_url, status, body, None, None)
        except urllib.error.HTTPError as exc:
            if exc.reason == "Unsafe redirect rejected":
                return FetchResult("needs-review", safe_url, None, exc.code, None, "unsafe-redirect", "Cross-host redirects and HTTP downgrades are rejected before following them.")
            if exc.code in {403, 429, 451}:
                return FetchResult("blocked", safe_url, exc.geturl(), exc.code, None, "access-restricted", f"Source returned HTTP {exc.code}; no bypass attempted.")
            last_error = FetchResult("unavailable", safe_url, exc.geturl(), exc.code, None, "http-error", f"Source returned HTTP {exc.code}; existing observations preserved.")
            if exc.code < 500 or attempt >= retries:
                return last_error
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            category = "timeout-or-network-error"
            last_error = FetchResult("unavailable", safe_url, None, None, None, category, f"Source fetch failed ({type(exc).__name__}); existing observations preserved.")
            if attempt >= retries:
                return last_error
        if attempt < retries:
            sleep_fn(min(2 ** attempt, 4))
    return last_error or FetchResult("unavailable", safe_url, None, None, None, "unknown-error", "Source fetch failed.")
