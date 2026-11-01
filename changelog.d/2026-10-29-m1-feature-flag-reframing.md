# M1 — feature flag and product reframing

- Added the single immutable feature config with `FEATURES.roleExplorer = false`; retained standard-role components, logic, data and tests.
- Hid the old role/opportunity explorer, Overview opportunity count, generic careers-route links and careers-source detail links in the default UI. A test-only injected config exercises the enabled state.
- Renamed the directory navigation item to “Speculative applications” and updated the Overview copy to describe official evidence and manual applications.
- Reframed README, product specifications, architecture, implementation plan and handoff around the M0–M8 route-directory roadmap.
- Added tests for both flag states and the default UI boundary.
- Updated browser acceptance to validate the default-off speculative directory and its hidden legacy explorer, with loopback-only DevTools readiness checks. The updated browser run passed 27/27 synthetic-data steps. Discovery remains manual-only; no schedules or publishing were enabled.
