-- "Show what you built": projects that people submit without an account.
-- Every entry starts as 'pending' and appears on /showcase only after an
-- admin approves it in the dashboard. The email is optional and never shown.
--
-- Additive only. To reverse:
--   drop table public.showcase_entries;

create table if not exists public.showcase_entries (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  url           text not null,
  blurb         text not null,
  builder_name  text,
  email         text,
  status        text not null default 'pending' check (status in ('pending', 'approved', 'hidden')),
  created_at    timestamptz not null default now(),
  reviewed_at   timestamptz
);

-- RLS on with no client-facing policies: only the API route, which uses the
-- service_role key, can read or write this table.
alter table public.showcase_entries enable row level security;
