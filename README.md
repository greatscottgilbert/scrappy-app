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

## Private field photos — unmerged candidate

The proposed on-device photo feature adds an optional camera/file picker to each site's card. Selected JPEG, PNG or WebP photos are decoded and re-encoded at a maximum 1280-pixel edge as JPEG before being saved to the origin's IndexedDB. It does **not** contact a server or change city permit records. A preview and an explicit local delete action are available. Photos are marked **private and unverified**; their source permit/city key survives feed-ID changes when the permit number is stable.

**Privacy and limits:** IndexedDB photos are unencrypted and visible to anyone with access to the same browser profile. Browsers may evict stored photos, private mode may reject storage, and clearing this site's data deletes them. The app does not export, back up or share photos. It does not remove screenshots/images previously saved elsewhere on a device. Camera permission denial or unsupported HEIC, decoding, canvas, quota or IndexedDB returns an error rather than claiming a save. Avoid capturing people, private property interiors or restricted areas. Re-encoding is intended to discard original image metadata, but actual browser/phone metadata behaviour remains unverified.

Run `node --test scripts/*.test.cjs` and `node --check field-photos.js`. No phone acceptance, shared status verification, encrypted storage, Android build or Play release is established by these unit tests.
