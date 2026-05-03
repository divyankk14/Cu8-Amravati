-- ============================================================
-- CUE8 — Pool & Snooker Club | Supabase schema
-- Run this in Supabase SQL editor on a fresh project.
-- ============================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- TABLES (snooker / pool tables)
-- ------------------------------------------------------------
create table if not exists public.tables (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null check (type in ('pool','mini_snooker')),
  price_per_hour  numeric(10,2) not null check (price_per_hour >= 0),
  is_available    boolean not null default true,
  created_at      timestamptz not null default now()
);

create index if not exists idx_tables_type on public.tables(type);

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------
create table if not exists public.bookings (
  id                uuid primary key default gen_random_uuid(),
  table_id          uuid not null references public.tables(id) on delete cascade,
  customer_name     text not null,
  phone             text not null,
  date              date not null,
  start_time        time not null,
  duration_minutes  int  not null check (duration_minutes between 10 and 600),
  status            text not null default 'confirmed'
                    check (status in ('confirmed','completed','cancelled')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_bookings_table_date on public.bookings(table_id, date);
create index if not exists idx_bookings_date       on public.bookings(date);
create index if not exists idx_bookings_status     on public.bookings(status);

-- Helper: end-time for an interval-based no-overlap constraint (Postgres EXCLUDE)
-- Block double-booking the same table on the same date when slots overlap.
-- We use an EXCLUDE constraint with tsrange built from (date + start_time, date + start_time + duration).
alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    table_id with =,
    tsrange(
      (date::timestamp + start_time),
      (date::timestamp + start_time + (duration_minutes || ' minutes')::interval)
    ) with &&
  )
  where (status <> 'cancelled');

-- gist requires btree_gist for the equality on uuid
create extension if not exists btree_gist;

-- ------------------------------------------------------------
-- LEADERBOARD
-- ------------------------------------------------------------
create table if not exists public.leaderboard (
  id            uuid primary key default gen_random_uuid(),
  player_name   text not null,
  hours_played  numeric(10,1) not null default 0,
  tier          text not null default 'bronze' check (tier in ('bronze','silver','gold')),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_leaderboard_hours on public.leaderboard(hours_played desc);

-- ------------------------------------------------------------
-- ADMIN SETTINGS  (key/value)
-- ------------------------------------------------------------
create table if not exists public.admin_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  value       text,
  updated_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public can READ everything (for the homepage),
-- only authenticated users (admins) can WRITE.
-- For booking creation by anonymous visitors, we allow INSERT on bookings.
-- ------------------------------------------------------------
alter table public.tables          enable row level security;
alter table public.bookings        enable row level security;
alter table public.leaderboard     enable row level security;
alter table public.admin_settings  enable row level security;

-- TABLES: anyone can read, only authed can write
drop policy if exists "tables_read_all"  on public.tables;
drop policy if exists "tables_write_auth" on public.tables;
create policy "tables_read_all"   on public.tables for select using (true);
create policy "tables_write_auth" on public.tables for all
  to authenticated using (true) with check (true);

-- BOOKINGS: anyone can read + insert; only authed can update/delete
drop policy if exists "bookings_read_all"      on public.bookings;
drop policy if exists "bookings_insert_anyone" on public.bookings;
drop policy if exists "bookings_update_auth"   on public.bookings;
drop policy if exists "bookings_delete_auth"   on public.bookings;
create policy "bookings_read_all"      on public.bookings for select using (true);
create policy "bookings_insert_anyone" on public.bookings for insert with check (true);
create policy "bookings_update_auth"   on public.bookings for update to authenticated using (true) with check (true);
create policy "bookings_delete_auth"   on public.bookings for delete to authenticated using (true);

-- LEADERBOARD: read public, write admins
drop policy if exists "leaderboard_read_all"  on public.leaderboard;
drop policy if exists "leaderboard_write_auth" on public.leaderboard;
create policy "leaderboard_read_all"   on public.leaderboard for select using (true);
create policy "leaderboard_write_auth" on public.leaderboard for all
  to authenticated using (true) with check (true);

-- SETTINGS: read public, write admins
drop policy if exists "settings_read_all"  on public.admin_settings;
drop policy if exists "settings_write_auth" on public.admin_settings;
create policy "settings_read_all"   on public.admin_settings for select using (true);
create policy "settings_write_auth" on public.admin_settings for all
  to authenticated using (true) with check (true);

-- ------------------------------------------------------------
-- SEED DATA (initial 5 tables + a few leaderboard entries + settings)
-- ------------------------------------------------------------
insert into public.tables (name, type, price_per_hour, is_available)
values
  ('ASGUARD', 'mini_snooker', 250, true),
  ('TITAN',   'mini_snooker', 250, true),
  ('NYRO',    'pool',         150, true),
  ('ORION',   'pool',         150, true),
  ('VELAR',   'pool',         150, true)
on conflict do nothing;

insert into public.leaderboard (player_name, hours_played, tier) values
  ('Aarav Mehta',    142, 'gold'),
  ('Rohan Kapoor',   128, 'gold'),
  ('Vikram Iyer',    119, 'gold'),
  ('Sneha Verma',     96, 'silver'),
  ('Arjun Singh',     88, 'silver'),
  ('Priya Nair',      74, 'silver'),
  ('Karan Malhotra',  61, 'bronze'),
  ('Ishita Roy',      52, 'bronze'),
  ('Devansh Patel',   44, 'bronze'),
  ('Meera Joshi',     37, 'bronze')
on conflict do nothing;

insert into public.admin_settings (key, value) values
  ('club_name',     'CUE8'),
  ('tagline',       'Pool & Snooker Club'),
  ('hours',         '12 PM – 12 AM'),
  ('contact_phone', '+91 98765 43210'),
  ('contact_email', 'hello@cue8.in'),
  ('address',       'CUE8 Pool & Snooker Club, India'),
  ('maps_embed',    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.123!2d77.5946!3d12.9716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1')
on conflict (key) do nothing;

-- ------------------------------------------------------------
-- REALTIME (optional): enable realtime broadcast for these tables
-- so the homepage table-status updates instantly when bookings change.
-- ------------------------------------------------------------
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.tables;
alter publication supabase_realtime add table public.leaderboard;
