-- Meeting attendance confirmations
-- RLS is enabled with no client-facing policies. All access goes through API routes
-- that use the service_role key, which bypasses RLS by design. Direct client
-- access (anon or authenticated roles) is blocked at the database level.
CREATE TABLE IF NOT EXISTS meeting_confirmations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rsvp_id BIGINT NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  meeting_id INT NOT NULL DEFAULT 1,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rsvp_id, meeting_id)
);
ALTER TABLE meeting_confirmations ENABLE ROW LEVEL SECURITY;

-- Resource library
-- Public SELECT via RLS (anon + authenticated can read).
-- Writes go through API routes using service_role key.
CREATE TABLE IF NOT EXISTS resources (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other' CHECK (category IN ('article', 'tool', 'video', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read resources" ON resources FOR SELECT TO anon, authenticated USING (true);
