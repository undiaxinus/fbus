-- Create documents table for storing uploaded files
CREATE TABLE IF NOT EXISTS public.fbus_documents (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bond_id uuid REFERENCES public.fbus_list(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('profile', 'designation', 'risk')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255) NOT NULL,
    uploaded_by uuid REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_fbus_documents_bond_id ON public.fbus_documents(bond_id);
CREATE INDEX IF NOT EXISTS idx_fbus_documents_document_type ON public.fbus_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_fbus_documents_deleted_at ON public.fbus_documents(deleted_at);

-- Enable Row Level Security
ALTER TABLE public.fbus_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document access
CREATE POLICY "View documents" ON public.fbus_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Insert documents" ON public.fbus_documents
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Update documents" ON public.fbus_documents
    FOR UPDATE USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Delete documents" ON public.fbus_documents
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER set_fbus_documents_updated_at
    BEFORE UPDATE ON public.fbus_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION column_exists(target_table text, target_column text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = target_table
        AND column_name = target_column
    );
END;
$$ LANGUAGE plpgsql;

-- Function to migrate existing documents
CREATE OR REPLACE FUNCTION migrate_existing_documents()
RETURNS void AS $$
BEGIN
    -- Only migrate if the old columns exist
    IF column_exists('fbus_list', 'profile_image_url') THEN
        -- Migrate profile images
        INSERT INTO public.fbus_documents (
            bond_id,
            document_type,
            file_name,
            file_url,
            file_size,
            mime_type,
            uploaded_by,
            created_at,
            updated_at
        )
        SELECT 
            id as bond_id,
            'profile' as document_type,
            split_part(profile_image_url, '/', -1) as file_name,
            profile_image_url as file_url,
            0 as file_size,
            'image/*' as mime_type,
            NULL as uploaded_by,
            created_at,
            updated_at
        FROM public.fbus_list
        WHERE profile_image_url IS NOT NULL;
    END IF;

    IF column_exists('fbus_list', 'designation_image_url') THEN
        -- Migrate designation images
        INSERT INTO public.fbus_documents (
            bond_id,
            document_type,
            file_name,
            file_url,
            file_size,
            mime_type,
            uploaded_by,
            created_at,
            updated_at
        )
        SELECT 
            id as bond_id,
            'designation' as document_type,
            split_part(designation_image_url, '/', -1) as file_name,
            designation_image_url as file_url,
            0 as file_size,
            'image/*' as mime_type,
            NULL as uploaded_by,
            created_at,
            updated_at
        FROM public.fbus_list
        WHERE designation_image_url IS NOT NULL;
    END IF;

    IF column_exists('fbus_list', 'risk_image_url') THEN
        -- Migrate risk images
        INSERT INTO public.fbus_documents (
            bond_id,
            document_type,
            file_name,
            file_url,
            file_size,
            mime_type,
            uploaded_by,
            created_at,
            updated_at
        )
        SELECT 
            id as bond_id,
            'risk' as document_type,
            split_part(risk_image_url, '/', -1) as file_name,
            risk_image_url as file_url,
            0 as file_size,
            'image/*' as mime_type,
            NULL as uploaded_by,
            created_at,
            updated_at
        FROM public.fbus_list
        WHERE risk_image_url IS NOT NULL;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute migration function
SELECT migrate_existing_documents();

-- Drop helper functions after use
DROP FUNCTION migrate_existing_documents();
DROP FUNCTION column_exists(text, text);

-- Remove old columns one by one
ALTER TABLE IF EXISTS public.fbus_list DROP COLUMN IF EXISTS profile_image_url;
ALTER TABLE IF EXISTS public.fbus_list DROP COLUMN IF EXISTS designation_image_url;
ALTER TABLE IF EXISTS public.fbus_list DROP COLUMN IF EXISTS risk_image_url; 