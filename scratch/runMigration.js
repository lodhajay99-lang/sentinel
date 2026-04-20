const q = `
CREATE TABLE IF NOT EXISTS incidents (
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

-- We wrap the indexes in anonymous code block catching duplicate errors, or use IF NOT EXISTS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_incidents_severity') THEN
        CREATE INDEX idx_incidents_severity ON incidents(parsed_severity);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_incidents_status') THEN
        CREATE INDEX idx_incidents_status ON incidents(status);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_incidents_created') THEN
        CREATE INDEX idx_incidents_created ON incidents(created_at DESC);
    END IF;
END $$;

DO $$ 
BEGIN
  -- Check if incidents is already in the publication
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'incidents'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE incidents;
  END IF;
END $$;
`;

fetch('https://api.supabase.com/v1/projects/gxcylvqvwsibomnnmbgu/database/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sbp_fa1016ec58ce06860a86b626a7cc2ad6177517e4',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query: q })
})
.then(res => res.text())
.then(data => console.log('Response:', data))
.catch(err => console.error(err));
