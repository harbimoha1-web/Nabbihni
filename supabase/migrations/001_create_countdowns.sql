-- Kam Baqi: Countdowns table for cloud sync
-- This schema matches lib/cloudSync.ts toCloudRow/fromCloudRow exactly

CREATE TABLE IF NOT EXISTS countdowns (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_date TIMESTAMPTZ NOT NULL,
  icon TEXT NOT NULL DEFAULT '🎯',
  theme TEXT NOT NULL DEFAULT 'default',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  recurrence JSONB,
  reminder_timing JSONB,
  background_image TEXT,
  note TEXT,
  tasks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  device_id TEXT
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_countdowns_user_id ON countdowns(user_id);
CREATE INDEX IF NOT EXISTS idx_countdowns_user_updated ON countdowns(user_id, updated_at);

-- Auto-update updated_at on row modifications
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS countdowns_updated_at ON countdowns;
CREATE TRIGGER countdowns_updated_at
  BEFORE UPDATE ON countdowns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: users can only access their own countdowns
ALTER TABLE countdowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own countdowns" ON countdowns;
CREATE POLICY "Users manage own countdowns" ON countdowns
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
