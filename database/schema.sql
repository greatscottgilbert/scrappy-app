-- Scrappy private backend. Run after Supabase project is ACTIVE.
create table if not exists public.scrappy_sites (
 id uuid primary key default gen_random_uuid(),
 municipality text not null,
 address text not null,
 building_type text,
 source_record_id text,
 source_url text,
 scope_evidence text,
 eligibility text not null default 'needs_review' check (eligibility in ('verified_full','needs_review','excluded')),
 current_stage smallint not null default 0 check(current_stage between 0 and 6),
 status_updated_at timestamptz,
 completed_at timestamptz,
 archive_after timestamptz,
 archived_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(municipality,source_record_id)
);
create index if not exists scrappy_sites_city_idx on public.scrappy_sites(municipality,building_type,eligibility);
create table if not exists public.scrappy_source_feeds (
 id uuid primary key default gen_random_uuid(),
 municipality text not null,
 source_url text not null,
 format text not null,
 enabled boolean not null default true,
 last_success_at timestamptz,
 last_error text,
 unique(municipality,source_url)
);
create table if not exists public.scrappy_import_runs (
 id bigint generated always as identity primary key,
 feed_id uuid references public.scrappy_source_feeds(id),
 started_at timestamptz default now(),
 completed_at timestamptz,
 records_seen integer,
 records_added integer,
 records_updated integer,
 error text
);
create table if not exists public.scrappy_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 is_admin boolean not null default false,
 verified_at timestamptz
);
create table if not exists public.scrappy_subscriptions (
 user_id uuid primary key references auth.users(id) on delete cascade,
 provider_customer_id text,
 provider_subscription_id text unique,
 status text not null default 'inactive',
 paid_until timestamptz
);
create table if not exists public.scrappy_site_reports (
 id uuid primary key default gen_random_uuid(),
 site_id uuid not null references public.scrappy_sites(id),
 user_id uuid not null references auth.users(id),
 proposed_stage smallint not null check(proposed_stage between 0 and 6),
 photo_path text not null,
 photo_taken_at timestamptz,
 submitted_at timestamptz not null default now(),
 moderation_status text not null default 'pending' check(moderation_status in ('pending','approved','rejected'))
);
create table if not exists public.scrappy_yard_prices (
 id uuid primary key default gen_random_uuid(),
 yard text not null,
 metal_type text not null,
 price_per_lb numeric(12,4) not null check(price_per_lb>=0),
 observed_on date not null,
 updated_at timestamptz default now(),
 unique(yard,metal_type)
);
alter table public.scrappy_sites enable row level security;
alter table public.scrappy_source_feeds enable row level security;
alter table public.scrappy_import_runs enable row level security;
alter table public.scrappy_profiles enable row level security;
alter table public.scrappy_subscriptions enable row level security;
alter table public.scrappy_site_reports enable row level security;
alter table public.scrappy_yard_prices enable row level security;
create policy scrappy_public_yard_prices on public.scrappy_yard_prices for select to anon,authenticated using(true);
create policy scrappy_own_profile on public.scrappy_profiles for select to authenticated using(user_id=(select auth.uid()));
create policy scrappy_own_subscription on public.scrappy_subscriptions for select to authenticated using(user_id=(select auth.uid()));
create policy scrappy_paid_sites on public.scrappy_sites for select to authenticated using(
 eligibility='verified_full' and archived_at is null and exists(
 select 1 from public.scrappy_subscriptions s where s.user_id=(select auth.uid())
 and s.status='active' and s.paid_until>now()
 ));
create policy scrappy_own_reports on public.scrappy_site_reports for select to authenticated using(user_id=(select auth.uid()));
create policy scrappy_submit_reports on public.scrappy_site_reports for insert to authenticated with check(
 user_id=(select auth.uid()) and exists(
 select 1 from public.scrappy_subscriptions s where s.user_id=(select auth.uid())
 and s.status='active' and s.paid_until>now()
 ));
