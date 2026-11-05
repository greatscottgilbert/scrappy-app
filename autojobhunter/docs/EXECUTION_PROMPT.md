# MASTER EXECUTION PROMPT — AutoJobHunter / JobPilot Canada

You are executing development, not only describing it. Work to the next verified deliverable on every run. Do not tell the owner to wait and do not invent completed actions. Continue in phases, checkpoint after each. Respect existing approvals; ask only when a truly required account authorization, payment, Play release, or permission decision is missing.

## Mission
Make the existing AutoJobHunter reviewer beta a verified, usable, free Android job-helper app and then prepare it for Google Play. The immediate deliverable is a dedicated GitHub source repository and a real locally runnable web beta; the next deliverable is a compiled/debug-tested Android APK. Preserve the original cloud deployment and source provenance. DO NOT USE REPLIT, incur costs, use unauthorized job-board scraping, or auto-send job applications.

## Recovery checkpoint — read this FIRST
GitHub staging source: https://github.com/greatscottgilbert/scrappy-app/tree/autojobhunter-source-import-2026-11-05/autojobhunter
Git branch: autojobhunter-source-import-2026-11-05 (do not merge into scrappy-app main).
Cloudflare Worker: autojobhunter-beta on account `68b46665466d6e58e8ea681b8d545ca5`; account subdomain greatscott-monitor; route /beta/. Snapshot modified 2026-11-03. Source: `autojobhunter/src/deployed-worker-2026-11-03.js` (65,597 characters); extracted assets: `autojobhunter/web/`. Check `README.md`, `ROADMAP.md`, and `web/reviewer-guide.txt`.
Earlier JobPilot v0.2 package reportedly contained matching tests and Cloudflare/D1 source, but exact original ZIP and repository were not recovered in this run. Search current user files and connected Drive for it before deleting or replacing logic.

## User defaults (configurable in UI)
Location Vancouver/Metro Vancouver; hands-on work including building maintenance, janitorial, handyman, caregiver, pest control, pressure washing, apprenticeships, Class 5 driving. Part-time preferred, target >= CAD $25/hour. Initial match threshold 80%; refresh every 60 minutes; employer research enabled. Save every candidate with exact source and timestamp. Do not claim tickets, certifications, or qualifications not confirmed. Applications remain REVIEW-BEFORE-SEND.

## PHASE A — source repository and baseline (execute now)
1. Verify GitHub access and whether a dedicated `greatscottgilbert/autojobhunter` repository exists. If absent and you can create repositories, create it, preferably private until security review. If repository creation is unavailable in tools, use GitHub's interactive web UI in Work mode; do not create a substitute under an unrelated repo's main branch. Use the staging branch as immutable import provenance.
2. Import the `autojobhunter` subtree to the dedicated repo root, preserving worker snapshot, extracted assets, README, roadmap, and this prompt. Never put API keys, contact lists, ID images, or personal job applications into the public repo.
3. Audit deployed-beta functionality by reading actual code. Separate `implemented`, `demo only`, `partial`, and `absent` for discovery, matching, storage, resume, letters, review, tracking, Gmail, employer research, alerts, offline, Android, Play.
4. Make the app runnable from fresh clone using pinned dependencies and a one-command local server. Extract bundled functions into maintainable modules where feasible without altering production until compatibility tests pass.
5. Add automated tests, build/test scripts, issue tracker and provenance release tag. Commit. Publish exact repo URL and commit SHA.
**Gate A:** clone, run, and inspect web UI; tests actually executed with counts; source history and deployed-worker snapshot cross-checked.

## PHASE B — correct the core reviewer beta
6. Fix saving and erasing: write failures, quota exceeded, browser restriction and corrupted local data must never give false-success messages. Confirm persisted data by readback and tests; keep one-way backups, schema migration and export/import. Fictional fixture data clearly marked DEMO.
7. Add robust score explanations and hard eligibility exclusions. Unknown wage/qualifications must remain unknown. Show live-source link, application date, pay, travel/location, and employer research evidence. Honor 80% threshold and settings.
8. Test mobile layout, back navigation, offline/PWA behavior, keyboard, screen reader semantics, privacy warnings and clear-data behavior. Collect screenshots/smoke-test evidence with date.
**Gate B:** real Android Chrome browser user test; pass/fail log and reproducible local tests.

## PHASE C — real job discovery every hour (permitted sources only)
9. Build ingestion adapters for explicitly permitted public sources: official employer ATS public job endpoints/feeds (Greenhouse, Lever, Ashby where allowed), Job Bank/other authorized alert imports, manually pasted job URLs, and Gmail-based job-alert ingestion only if connected/authorized. Check current terms before automating each source. NO Craigslist scraping, CAPTCHA bypass, guessed submission addresses or unauthorized portal automation.
10. Store jobs in Cloudflare D1 or another verified no-extra-cost datastore, with canonical source IDs, source type, checked_at, last_seen, dedupe, expiry, employer, location, wage, employment type and mandatory qualifications. Do not invent job records.
11. Run the 60-minute schedule within verified free limits, alert only on >=80% matches, log failed scans, show last successful run and data freshness, and retain enough provenance to check each job independently.
12. Add employer research from citeable public pages with confidence indicators. Include manual review path for Craigslist opportunities rather than bots.
**Gate C:** 10 independently opened real postings with URLs, timestamps and test results; a verified hourly run log; no unpermitted source use or charges.

## PHASE D — applications and interview workflow
13. Generate factual resume and letter drafts with a document template. Review employer/job facts and supporting evidence. Never submit automatically.
14. Integrate authorized Gmail as DRAFT-FIRST. For actual sends, require explicit per-application approval and proof from Sent; record failures. For external portals, guide the user to complete manually and track as incomplete until a receipt exists.
15. Tracking: found, shortlisted, drafting, awaiting owner approval, submitted with receipt, interview, rejected, closed. Interview reminders by authorized scheduling only.
**Gate D:** synthetic end-to-end tests plus at least one separately authorized real trial with receipt, or report real trials untested.

## PHASE E — Android debug APK, then Google Play
16. Use a minimal Android wrapper around the tested web UI or native components with secure app origin (Android WebViewAssetLoader or validated Capacitor), external-link handling, Android back handling, DOM persistence and no unnecessary permissions. Android package name must be agreed/checked before Play enrollment.
17. Pin Android SDK/Gradle/JDK versions, create reproducible Android project, source-level CI tests with explicit no-paid-runner limits, and perform actual `assembleDebug`. Do not present source or web PWA as an APK. Verify APK SHA-256, size, package, launch activity, signature, on-device startup and Android version compatibility.
18. Test installed APK physically: real jobs, offline, export/import, application review, job links, notification permissions, accessibility, store/erase failure paths. Keep signed screenshots or logs.
19. Create privacy policy, Data Safety answers, screenshots, store description, age and permissions declarations; verify *current* Google Play requirements. Build a release AAB only with securely held signing credentials and owner approval. Internal test upload requires an authorized Play account and explicit release approval. Do not claim publication until Play receipt and verified listing.
**Gate E:** verified installable APK link+SHA; AAB and Play receipt if legitimately published.

## PHASE F — WorkBC funding and research scope
20. Preserve the pre-existing prototype as baseline (no retroactive cost reimbursement). Confirm CEP/R&I eligibility, application deadline, eligible proponent and partnered pilot with CEP in writing; proposal is NOT submitted until owner approval.
21. Separate app's general job assistance from any funded research participant incentives, ethics approvals, private data collection, and independent evaluation. An optional CAD $10 Save-On-Foods card must be specifically approved under program rules.

## Hard rules
- Never use Replit, create spending obligations or trigger paid build/AI API capacity without explicit authorization.
- Never fabricate an APK, code commit, Play status, job listing, test result, employer contact or sent application.
- Never expose personal ID, phone, credentials, applicant files, or private research in public GitHub.
- Every durable run ends with a concrete checkpoint: GitHub URL and commit; changed files; test commands/results; true features vs demos; deployment/Android artifacts; blockers; EXACT next step.
- If repo creation or Android compilation is blocked by unavailable capability, do whatever else can be safely completed and specify ONE precise unblock step. Do not stop at another planning memo.
