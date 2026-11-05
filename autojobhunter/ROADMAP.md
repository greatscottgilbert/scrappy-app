# AutoJobHunter — completion roadmap and proof gates
**Checkpoint:** 2026-11-05. No release dates or functionality should be claimed without artifacts.

## Baseline inventory: verified, unverified and absent
**Verified:** Cloudflare Worker named `autojobhunter-beta` modified 2026-11-03; complete 65,597-character Worker source retrieved from connected account; five de-bundled static assets checked into a dedicated Git branch; reviewer guide describes local demo/review flows, PWA install and no automatic sending.

**Not verified:** externally opening the beta on a physical device; correctness of score calculations; offline/storage durability; full browser security and accessibility tests; current database and live job feeds; original development source history.

**Absent as proven artifacts:** native Android Gradle project, signed/debug APK, Play AAB/Play upload receipt, hourly discovery pipeline, review-approved Gmail integration.

## Phase 0: preserve baseline and establish canonical repository
- [x] Recover deployed Worker source with provenance and unchanged snapshot.
- [x] Separate app assets and record existing limitations.
- [x] Stage on isolated GitHub branch without touching `scrappy-app/main`.
- [ ] Create dedicated `greatscottgilbert/autojobhunter` repository and transfer code to root, preferably private until content/security reviewed.
- [ ] Add source hashes, reproducible build script, pinned dependencies, CI cost controls, versioned tags and GitHub issue board.
**Gate:** independent clone runs web app locally; source and deployed snapshot provenance documented; no secrets.

## Phase 1: reliable working browser beta
- [ ] Fix local persistence: catch quota/security failures, never report a save/erase as successful before verified readback, handle private mode and corrupted entries.
- [ ] Add export/import with checksummed JSON, schema version and deduplication.
- [ ] Tests: matching, filter, storage failure, approval state, mobile navigation, keyboard and accessibility; synthetic records only.
- [ ] Clearly label demos vs real jobs, provenance and timestamps; preserve review decisions across reload/offline.
- [ ] Keep the current beta accessible while testing changes on a separate preview route.
**Gate:** browser test run succeeds; actual Android phone and desktop smoke test recorded; no false-success storage messages.

## Phase 2: live, legal, auditable job discovery
- [ ] Implement an allowlisted connector for publicly permitted employer ATS endpoints (e.g. Greenhouse, Lever, Ashby), official feeds and authorized Job Bank/email alert imports, plus a manual paste/URL import.
- [ ] Do not scrape Craigslist, bypass bot checks/CAPTCHAs, fabricate postings or automate unauthorized portals.
- [ ] Cloudflare Worker + D1 or compatible inexpensive storage; secrets server-side, never in public GitHub or JS.
- [ ] Scheduled 60-minute ingestion (only after connector/quotas confirmed); dedupe canonical employer/job ID/url; store actual scan timestamps and source references.
- [ ] Matching rules: Vancouver/Metro Vancouver, part-time preferred, $25+/hour target, hands-on building maintenance/caregiving/janitorial/pest control/pressure washing/handyman/driving/apprenticeship, Class 5 and own tools where relevant. No unearned tickets or qualifications.
- [ ] 80% minimum match alert configurable; pay unknown distinctly labeled; explain scoring and hard disqualifiers; record employer research evidence.
**Gate:** at least 10 independently opened real postings from permitted sources, true jobs not sample data; deterministic tests and 60-minute scan observed with logs.

## Phase 3: review and application workflow
- [ ] Resume + cover-letter drafts based only on validated user qualifications.
- [ ] User must confirm job, recipient, content and method before any application is submitted.
- [ ] Gmail draft with consent; user-approved send only, with a sent-mail receipt or explicit failure.
- [ ] For portal-only applications, open original portal and record assisted/incomplete status; never claim submission without receipt.
- [ ] Tracker states: found, saved, drafting, awaiting approval, submitted/verified, interview, declined, expired.
**Gate:** 5 end-to-end synthetic tests; one consented real application with receipt, or clearly state not yet tested.

## Phase 4: Android APK and Play internal testing
- [ ] Create Android shell/native project using tested WebViewAssetLoader or Capacitor; ensure secure navigation, app origin, back button and downloads.
- [ ] Pin JDK, Gradle, Android SDK, package ID and manifest; reproducible debug builds with lock files and no paid CI.
- [ ] Produce a real **debug APK**; verify checksum, package, launch activity, signature and install on physical Android.
- [ ] Test offline behavior, link opening, failed-storage handling, notifications/permissions, accessibility and privacy.
- [ ] Create privacy policy, data safety disclosure, screenshots, age/permissions declarations and required app signing.
- [ ] Build signed **AAB** after owner authorizes release credentials; register Play Console application and run internal test. Public release only after review approval.
**Gate:** downloadable debug APK with SHA-256 + installation evidence; Play upload receipt for an actual AAB; then live Play link after publication.

## Phase 5: WorkBC research-pilot additions (separate from existing app)
- [ ] Confirm written CEP funding eligibility, applicant/partner, intake deadlines, eligible incremental scope and intellectual property arrangements.
- [ ] Define study ethics/consent, voluntary participation, accessibility, evaluation and data minimization.
- [ ] Evaluate optional $10 Save-On-Foods gift cards only if program rules allow; avoid coerced participation or benefit impacts.
- [ ] Distinguish historical source/app work from new research, with a budget, outcomes and milestones.
**Gate:** funder-approved eligible study scope before any funded intervention or reimbursement claim.

## Definition of done and reporting
Each checkpoint must report exact Git commit, changed paths, tests run (with actual pass/fail counts), demo vs live feature status, APK path/checksum if built, deployed URL if verified, blockers and next action. No vague \"it's running\" statements. No fake APK/download links, phantom GitHub repository, claim of Google Play listing or promises of automatic submissions.

**Owner constraints:** No Replit; no paid services without explicit approval; review-before-send; matching ≥80% preferred; hourly scanning target; employer research; verify physical job ads; keep personal data and credentials out of source.
