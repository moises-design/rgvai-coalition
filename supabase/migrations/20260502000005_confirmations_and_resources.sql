-- Meeting attendance confirmations
CREATE TABLE IF NOT EXISTS meeting_confirmations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rsvp_id BIGINT NOT NULL REFERENCES rsvps(id) ON DELETE CASCADE,
  meeting_id INT NOT NULL DEFAULT 1,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rsvp_id, meeting_id)
);
ALTER TABLE meeting_confirmations ENABLE ROW LEVEL SECURITY;

-- Resource library
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
