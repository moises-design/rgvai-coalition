-- An optional ticket link for the next meeting (for example a Valley Tickets
-- page). When set, the home page and reminder emails show a "Get tickets"
-- button that opens it.
--
-- Additive only. To reverse:
--   alter table public.meeting_details drop column ticket_url;

alter table public.meeting_details
  add column if not exists ticket_url text;
