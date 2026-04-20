-- Migration: Create Incidents Table -> 001_create_incidents.sql

CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  raw_text TEXT NOT NULL,
  parsed_type TEXT,
  parsed_intent TEXT,
  parsed_location TEXT,
  parsed_severity TEXT CHECK (parsed_severity IN ('critical', 'high', 'medium', 'low', 'unknown')),
  parsed_summary TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'dispatched', 'resolved')),
  needs_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT,
  sender_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_incidents_severity ON incidents(parsed_severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);

-- Publication for Realtime Support
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;

-- Assuming there is a standard service role, allow full access for edge functions/backend
-- For complete lockdown based on auth, you would activate RLS:
-- ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable Insert for backend proxy" on incidents for insert with check (true);
-- CREATE POLICY "Enable Select for dashboard" on incidents for select using (true);
-- CREATE POLICY "Enable Update for dashboard" on incidents for update using (true);
