# Scrappy P01: data-backed city facets and autocomplete — 2026-11-01

**Parent:** 643d88092bf626a2825f46ed8fa022969d1170fa (last verified main before branch).
**Scope:** UI city filtering, typed address suggestions, one-shot Vancouver snapshot preload. No payments, new municipal feeds, location tracking, shared database, photo uploads, Android package or public launch.

### Changed
- Keep bundled Vancouver choice and show another city only if usable imported records have an address; empty unsupported municipalities stay hidden.
- Filter suggestions by the exact chosen city and checked permit years; require >=3 characters; deduplicate and cap at 20, preferring prefix matches.
- Load Vancouver snapshot on choosing its city, sharing one fetch task with Search and allowing retry on error.
- Refresh city choices/autocomplete after CSV import or refreshed city snapshot; keep current selection when valid.
- Match city labels case-insensitively, including imported capitalization differences.
- Populate options via DOM text/value, not unsanitized HTML.
- Automated JS syntax and 10 new targeted tests performed in Node 22 locally. Historical route tests are NOT represented as freshly passed until CI finishes.

### Limitations and next task
No municipal dataset for New Westminster has been connected. The existing bundled Vancouver snapshot is a permit-derived candidate list, not a site-progress inspection. Need verify hosted beta on an actual mobile browser; native Android is not built. Next: data source scope/attribution review, New Westminster source discovery, and permission-safe status/photo workflow with shared persistence; verify all 20 regression tests on CI before promoting.
