-- Modify existing activities table
ALTER TABLE public.fbus_activities
  ALTER COLUMN action SET NOT NULL,
  ALTER COLUMN user_name SET NOT NULL,
  DROP COLUMN IF EXISTS fbus_activities;

-- Create index on created_at for faster sorting if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_fbus_activities_created_at ON fbus_activities(created_at);

-- Enable Row Level Security
ALTER TABLE fbus_activities ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view activities
DROP POLICY IF EXISTS "Allow all users to view activities" ON fbus_activities;
CREATE POLICY "Allow all users to view activities" ON fbus_activities
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert activities
DROP POLICY IF EXISTS "Allow authenticated users to insert activities" ON fbus_activities;
CREATE POLICY "Allow authenticated users to insert activities" ON fbus_activities
  FOR INSERT WITH CHECK (auth.role() = 'authenticated'); 