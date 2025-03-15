-- Create bond history table
CREATE TABLE IF NOT EXISTS fbus_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  bond_id UUID REFERENCES fbus_list(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  middle_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  unit_office TEXT NOT NULL,
  rank TEXT NOT NULL,
  designation TEXT NOT NULL,
  mca NUMERIC(15,2) NOT NULL,
  amount_of_bond NUMERIC(15,2) NOT NULL,
  bond_premium NUMERIC(15,2) NOT NULL,
  risk_no TEXT NOT NULL,
  effective_date TEXT NOT NULL,
  date_of_cancellation TEXT NOT NULL,
  contact_no TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('CREATE', 'UPDATE', 'DELETE', 'RENEW')),
  changed_fields TEXT[],
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index on bond_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_fbus_history_bond_id ON fbus_history(bond_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_fbus_history_created_at ON fbus_history(created_at);

-- Enable Row Level Security
ALTER TABLE fbus_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all users to view history
DROP POLICY IF EXISTS "Allow all users to view history" ON fbus_history;
CREATE POLICY "Allow all users to view history" ON fbus_history
  FOR SELECT USING (true);

-- Create policy to allow authenticated users to insert history
DROP POLICY IF EXISTS "Allow authenticated users to insert history" ON fbus_history;
CREATE POLICY "Allow authenticated users to insert history" ON fbus_history
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update history
DROP POLICY IF EXISTS "Allow authenticated users to update history" ON fbus_history;
CREATE POLICY "Allow authenticated users to update history" ON fbus_history
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated'); 