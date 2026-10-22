# Scrappy backend implementation plan

## Product
- Free forever: scrap-yard prices and receipt OCR. Discard image and raw OCR after extracting and verifying latest price.
- Subscription: city-first demolition site discovery, building filters, maps, routing, progress and photo reports.
- Public UI should not display the data-ingestion process. Maintain source provenance internally and comply with licensing/attribution.

## Suggested tables (PostgreSQL)
municipalities(id, name, slug)
source_feeds(id, municipality_id, source_url, format, last_success_at, etag, enabled, license_notes)
sites(id, municipality_id, source_record_id, address, latitude, longitude, building_type, imported_status, current_stage, stage_updated_at, completed_at, archive_after, archived_at, created_at, updated_at)
site_import_snapshots(id, source_feed_id, run_at, checksum, records_seen, inserted, updated, error)
users(id, role, verified_at, created_at)
site_reports(id, site_id, user_id, proposed_stage, photo_object_key, photo_taken_at, submitted_at, moderation_status, reviewed_by)
stage_confirmations(id, site_id, stage, user_id, report_id, confirmed_at)
subscriptions(user_id, provider_customer_id, provider_subscription_id, status, current_period_end)
yard_prices(id, yard_id, metal_category, price_per_lb_cad, observed_at, submitted_by, updated_at)

## Stage progression
0 No action yet
1 Boarded up
2 Fenced off
3 Demolition underway
4 Excavators on site
5 Cleanup
6 Nothing left

- A user report needs an image and authenticated account. Strip GPS EXIF before public display.
- Advance when admin approves or >=2 independent verified user reports with qualifying photographs.
- A stage may be skipped with sufficient evidence; skipped stages must not be shown as observed.
- Completion requires >=3 independent verified users, different photos, and moderation checks. Set archive_after = third confirmation timestamp + 14 days.
- Archive, do not permanently delete, sites after grace period. Allow admin overrides and appeals.
- Protect against Sybil accounts, replayed photos, and reports from the same device/account.
- Photos of interiors require contributor confirmation of lawful access.

## Weekly importer
- Schedule once weekly for each municipality with an accessible feed.
- Download using source-specific adapter; validate schema and freshness; deduplicate on municipality + source ID or normalized address + source event.
- Upsert records; never overwrite crowdsourced progress with municipal status.
- Log counts and failures; alert admin on unexpected zero rows or dramatic changes.
- Admin-only manual CSV import fallback for unsupported municipalities.
- Do not infer a building has been demolished merely because it disappears from the source feed.

## Security and deployment
- GitHub Pages is a static frontend, not a secure subscription backend.
- Add authenticated backend (e.g. Supabase) with row-level security and server-side paid entitlement checks before offering subscriptions.
- Store feed credentials and payment secrets server-side, never in public GitHub Pages JavaScript.
- Receipt OCR should run client-side and discard image buffers; shared price updates require authenticated writes and moderation.
- No paid feature is currently enforced and no weekly municipal feeds are connected yet.
