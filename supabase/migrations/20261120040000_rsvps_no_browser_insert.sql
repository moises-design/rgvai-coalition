-- Sign-ups now go through the API (api/join.js), which checks and limits
-- them. This removes the rule that let any browser insert into rsvps
-- directly, so the limit cannot be skipped.
--
-- Apply only after the site version that uses /api/join is live; the older
-- join form stops working once this is applied.
--
-- To reverse:
--   create policy "Allow public inserts" on public.rsvps
--     for insert to anon with check (true);

drop policy if exists "Allow public inserts" on public.rsvps;
