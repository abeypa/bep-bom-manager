-- ============================================================
-- Storage Setup for BOM Manager - TASK-05
-- ============================================================
--
-- This SQL script creates the "drawings" storage bucket
-- and sets up Row Level Security (RLS) policies for it.
-- 
-- Instructions:
-- 1. First create the "drawings" bucket in Supabase Dashboard:
--    - Go to Storage → New Bucket
--    - Name: drawings
--    - Public: OFF (private - requires auth)
--    - Click "Create Bucket"
--
-- 2. Then run this SQL script in Supabase SQL Editor
--

-- ============================================================
-- Storage RLS Policies for "drawings" bucket
-- ============================================================

-- Enable RLS on storage.objects table (if not already enabled)
-- Note: RLS is usually enabled by default on storage.objects

-- Policy 1: Authenticated users can upload files
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

-- Policy 2: Authenticated users can view files
CREATE POLICY "Authenticated users can view" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

-- Policy 3: Authenticated users can update files
CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

-- Policy 4: Authenticated users can delete files
CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

-- ============================================================
-- Optional: Create helper functions for file management
-- ============================================================

-- Function to get public URL for a file in drawings bucket
-- Usage: SELECT get_drawing_url('mechanical_manufacture/123/image.jpg');
CREATE OR REPLACE FUNCTION get_drawing_url(file_path TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT concat(
    -- Replace with your actual Supabase project URL
    'https://your-project-id.supabase.co/storage/v1/object/public/drawings/',
    file_path
  );
$$;

-- Function to check if file exists in drawings bucket
CREATE OR REPLACE FUNCTION drawing_exists(file_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO exists_count
  FROM storage.objects
  WHERE bucket_id = 'drawings'
    AND name = file_path;
  
  RETURN exists_count > 0;
END;
$$;

-- ============================================================
-- Test the setup (run after creating bucket and policies)
-- ============================================================

-- To test file upload from SQL (optional):
-- SELECT storage.upload_object('drawings', 'test.txt', 'text/plain', 'This is a test file');

-- To list files in bucket (requires admin role):
-- SELECT * FROM storage.objects WHERE bucket_id = 'drawings';

-- To get signed URL for private file (requires authentication in app):
-- SELECT storage.get_signed_url('drawings', 'test.txt', 3600);
