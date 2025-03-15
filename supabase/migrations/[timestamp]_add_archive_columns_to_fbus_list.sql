-- Add archive-related columns to fbus_list table
ALTER TABLE public.fbus_list
ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());

-- Create an index for faster queries on archived status
CREATE INDEX IF NOT EXISTS idx_fbus_list_is_archived ON public.fbus_list(is_archived);

-- Add RLS (Row Level Security) policies for archive operations
ALTER TABLE public.fbus_list ENABLE ROW LEVEL SECURITY;

-- Policy for viewing bonds (both archived and non-archived)
CREATE POLICY "View bonds" ON public.fbus_list
FOR SELECT USING (true);

-- Policy for archiving/unarchiving bonds
CREATE POLICY "Archive bonds" ON public.fbus_list
FOR UPDATE USING (
    auth.role() = 'authenticated'
) WITH CHECK (
    auth.role() = 'authenticated'
);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.fbus_list
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 