-- 1. Lets a member stop reminder emails (the unsubscribe link in each reminder).
-- 2. A short-lived log used to limit sign-in link requests and failed admin
--    logins. It stores a one-way hash of the email or network address, never
--    the value itself, and rows older than a day are deleted by the API.
--
-- Additive only. To reverse:
--   alter table public.rsvps drop column email_opt_out;
--   drop table public.request_log;

alter table public.rsvps
  add column if not exists email_opt_out boolean not null default false;

create table if not exists public.request_log (
  id         bigint generated always as identity primary key,
  kind       text not null,
  key_hash   text not null,
  created_at timestamptz not null default now()
);

create index if not exists request_log_lookup
  on public.request_log (kind, key_hash, created_at);

-- RLS on with no client-facing policies: only the API routes, which use the
-- service_role key, can read or write this table.
alter table public.request_log enable row level security;
