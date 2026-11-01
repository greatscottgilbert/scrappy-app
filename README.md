# Scrappy

Mobile-first Vancouver scrap-metal price tracker. Record prices from receipts, compare yards by metal type and date, and export observations.

## Start
Open `index.html` in a browser. Data stays in your browser (localStorage); export CSV regularly. This is a starter prototype, not yet a shared database or Play Store app.

## Next
Add receipt image upload with human-verified extraction, shared database, authentication, and Android packaging.

## Demolition site search (private/beta)
The city selector lists **Vancouver** because a snapshot is bundled, plus any city with valid address records imported on this device. Empty city choices are hidden rather than implying municipal coverage. On selecting Vancouver, the saved snapshot loads and enables address suggestions scoped by chosen year and city; no paid geocoding is used. Other cities are **not** connected to a municipal feed merely because they appear after a local CSV import.

Suggestions and saved shortlists remain in this browser. Permit issuance does **not** prove that demolition has occurred, scrap is accessible, or the public may enter a site. The route order is approximate, and public Google Maps may impose waypoint limits. No subscriptions are charged; Android/Play and shared authenticated persistence are not complete.

Run UI/regression tests with `node --test scripts/*.test.cjs` (Node 22 or later).

## Private field status (beta)
Choose one of seven field stages for a demolition site, or `Not observed`. This is **your unverified observation**, not a municipal inspection or a verified public report. Entries live in this browser only, under `scrappy-field-observations-v1`, keyed by municipality plus permit number (or site ID). A timestamp and private/manual source are saved locally and survive Vancouver source refresh. Older untimestamped statuses remain labelled unverified.

**Scope:** no account sync, photo upload, shared status moderation, independent confirmation or public publishing. Site discovery never establishes legal entry or scrap-removal rights. Clearing this browser's site data erases local records; exporting a CSV does not export these observations. Test: `node --test scripts/*.test.cjs`.
