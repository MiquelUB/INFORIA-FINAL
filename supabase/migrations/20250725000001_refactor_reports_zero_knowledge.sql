-- Refactor reports table for Zero-Knowledge principle
-- Remove content column and add Google Drive integration

-- First, create a backup of existing data (if any)
CREATE TABLE IF NOT EXISTS reports_backup AS 
SELECT * FROM reports;

-- Drop the existing table
DROP TABLE IF EXISTS reports;

-- Recreate the table with Zero-Knowledge structure
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL, -- Will reference patients table when created
    gdrive_file_url TEXT NOT NULL, -- URL to Google Doc in user's Drive
    gdrive_file_id TEXT, -- Google Drive file ID for additional operations
    file_name TEXT, -- Human-readable name of the file
    file_size INTEGER, -- Size in bytes
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Recreate indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_patient_id ON public.reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_gdrive_file_id ON public.reports(gdrive_file_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reports" ON public.reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.reports
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_reports_updated_at 
    BEFORE UPDATE ON public.reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.reports IS 'Reports table implementing Zero-Knowledge principle - content stored in Google Drive, only metadata stored here';
COMMENT ON COLUMN public.reports.gdrive_file_url IS 'URL to the Google Doc in the user''s Google Drive';
COMMENT ON COLUMN public.reports.gdrive_file_id IS 'Google Drive file ID for API operations';
COMMENT ON COLUMN public.reports.file_name IS 'Human-readable name of the file';
COMMENT ON COLUMN public.reports.file_size IS 'Size of the file in bytes'; 