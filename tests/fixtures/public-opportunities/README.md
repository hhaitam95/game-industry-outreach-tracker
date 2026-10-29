# Public opportunity contract fixtures

`real-snapshot-golden.json` contains five public role records selected from an owner-reviewed public discovery projection captured on 2026-10-27. Only the public 16-field projection is retained; private monitoring state, page bodies and operational metadata are excluded. It is a partial historical test fixture, not a complete scan or a current job feed.

`invalid-status.json` reuses one public record with an intentionally unsupported status. Both JavaScript and Python contract tests must reject it.

All tests load these fixtures from disk and do not fetch the network.
