# AutoJobHunter Android development staging

This is an isolated development branch in `scrappy-app`, **not** a dedicated AutoJobHunter repository. Existing main branch is untouched. A separate repository cannot currently be created through the connected GitHub actions.

## Milestone (2026-11-05)
- Android app source prototype packaged separately in the downloadable ZIP shared in chat.
- Verified local tests: deduplication, receipt-gated send status, input URL/source validation.
- The Cloudflare `autojobhunter-beta` Worker is deployed but is reviewer-only, with **no live job scan, no direct employer submissions**.
- No Android APK exists yet; Android SDK and Gradle were unavailable in the build environment.

## Strict rules
No Craigslist scraping, automatic outreach to Craigslist posters, fabricated credentials, automatic claims of sent emails, unsupported driving-abstract or background-check claims. No Replit, no paid services. Do not put personally identifying applicant data or API keys in public source.

## Next work
1. Create dedicated private GitHub AutoJobHunter repository and migrate this isolated branch.
2. Add Android Studio build and test workflow; build and device-test debug APK.
3. Connect permitted public job sources with provenance, duplicate suppression and fresh status.
4. Add secure Gmail authorization and verified send receipt audit before activating any auto-apply feature.
5. Produce signed Android App Bundle and review Play policy requirements.
