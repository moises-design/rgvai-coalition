-- The no-login "Learn or teach" board: one row per person who answers, with
-- the topics they want to learn, the topics they could teach, and (only if
-- they give it) an email so we can reach them.
--
-- voter_key is a one-way hash that lets a person change their answers without
-- an account. It is built from a random id kept in their browser, or from
-- their email when they answer from a link in a reminder email.
--
-- Additive only. To reverse:
--   drop table public.topic_interest;

create table if not exists public.topic_interest (
  voter_key   text primary key,
  learn       text[] not null default '{}',
  teach       text[] not null default '{}',
  teach_note  text,
  suggestion  text,
  email       text,
  source      text not null default 'web',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS on with no client-facing policies: only the API route, which uses the
-- service_role key, can read or write this table. The public sees totals only.
alter table public.topic_interest enable row level security;
