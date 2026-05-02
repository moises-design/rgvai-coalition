-- Announcements
create table public.announcements (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "Public can read announcements"
  on public.announcements for select
  to anon, authenticated
  using (true);

-- Meeting details (single-row config, id always 1)
create table public.meeting_details (
  id          integer primary key default 1,
  event_date  text not null default 'Wednesday, May 20, 2026',
  event_time  text not null default '7:00 PM',
  location    text not null default 'McAllen, TX · Location TBD',
  notes       text,
  updated_at  timestamptz not null default now()
);

alter table public.meeting_details enable row level security;

create policy "Public can read meeting details"
  on public.meeting_details for select
  to anon, authenticated
  using (true);

insert into public.meeting_details (id, event_date, event_time, location)
values (1, 'Wednesday, May 20, 2026', '7:00 PM', 'McAllen, TX · Location TBD')
on conflict (id) do nothing;

-- Members can read their own RSVP
create policy "Members can read own RSVP"
  on public.rsvps for select
  to authenticated
  using (auth.email() = email);
