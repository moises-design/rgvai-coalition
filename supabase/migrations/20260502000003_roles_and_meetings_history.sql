-- Add role column to rsvps
ALTER TABLE rsvps
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'member'
  CHECK (role IN ('member', 'admin', 'super_admin'));

-- Meeting history log
CREATE TABLE IF NOT EXISTS meetings_history (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_date TEXT NOT NULL,
  event_time TEXT NOT NULL,
  location   TEXT NOT NULL,
  notes      TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE meetings_history ENABLE ROW LEVEL SECURITY;
