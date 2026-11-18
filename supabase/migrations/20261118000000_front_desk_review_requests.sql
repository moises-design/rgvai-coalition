-- "Book your front desk review" requests from /ai-for-healthcare.
-- Holds business contact details for clinics; no patient data belongs here.
-- RLS is enabled with no client-facing policies: all access goes through
-- api/front-desk-review.js using the service_role key.
-- Additive only. To reverse: drop table public.front_desk_review_requests;
create table if not exists public.front_desk_review_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  clinic      text not null,
  email       text not null,
  phone       text,
  workflow    text,
  message     text,
  created_at  timestamptz not null default now()
);

alter table public.front_desk_review_requests enable row level security;
