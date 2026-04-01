-- ============================================================
-- BOM Manager - Row Level Security (RLS) Configuration
-- ============================================================
-- This script enables RLS on all tables and creates policies
-- for authenticated users to have full access.
-- 
-- IMPORTANT: Run this AFTER creating all tables (Step 2 in bom-deployment.md)
-- ============================================================

-- ============================================================
-- STEP 1: Enable Row Level Security on ALL tables
-- ============================================================

-- Suppliers table
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Projects table  
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Project sections table
ALTER TABLE project_sections ENABLE ROW LEVEL SECURITY;

-- Parts tables (5 types)
ALTER TABLE mechanical_manufacture ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanical_bought_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE electrical_manufacture ENABLE ROW LEVEL SECURITY;
ALTER TABLE electrical_bought_out ENABLE ROW LEVEL SECURITY;
ALTER TABLE pneumatic_bought_out ENABLE ROW LEVEL SECURITY;

-- Project parts junction table
ALTER TABLE project_parts ENABLE ROW LEVEL SECURITY;

-- Purchase orders tables
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Audit/log tables
ALTER TABLE part_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE json_excel_file_uploaded ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Create "Authenticated users full access" policies
-- ============================================================
-- These policies allow ALL authenticated users to perform ALL operations
-- This is appropriate for an internal tool where all users share the same data

-- Suppliers policy
CREATE POLICY "Authenticated users full access" ON suppliers
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Projects policy
CREATE POLICY "Authenticated users full access" ON projects
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project sections policy
CREATE POLICY "Authenticated users full access" ON project_sections
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Mechanical manufacture parts policy
CREATE POLICY "Authenticated users full access" ON mechanical_manufacture
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Mechanical bought out parts policy
CREATE POLICY "Authenticated users full access" ON mechanical_bought_out
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Electrical manufacture parts policy
CREATE POLICY "Authenticated users full access" ON electrical_manufacture
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Electrical bought out parts policy
CREATE POLICY "Authenticated users full access" ON electrical_bought_out
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Pneumatic bought out parts policy
CREATE POLICY "Authenticated users full access" ON pneumatic_bought_out
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Project parts junction policy
CREATE POLICY "Authenticated users full access" ON project_parts
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Purchase orders policy
CREATE POLICY "Authenticated users full access" ON purchase_orders
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Purchase order items policy
CREATE POLICY "Authenticated users full access" ON purchase_order_items
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Part usage logs policy
CREATE POLICY "Authenticated users full access" ON part_usage_logs
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- JSON/Excel upload history policy
CREATE POLICY "Authenticated users full access" ON json_excel_file_uploaded
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- STEP 3: Create storage bucket policies (for drawings bucket)
-- ============================================================
-- Note: This assumes the 'drawings' bucket has already been created
-- If the bucket doesn't exist yet, create it first in the Supabase dashboard

-- Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can view" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'drawings' AND auth.role() = 'authenticated'
  );

-- ============================================================
-- STEP 4: Verification queries (optional)
-- ============================================================

-- Check which tables have RLS enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'suppliers',
    'projects',
    'project_sections',
    'mechanical_manufacture',
    'mechanical_bought_out',
    'electrical_manufacture',
    'electrical_bought_out',
    'pneumatic_bought_out',
    'project_parts',
    'purchase_orders',
    'purchase_order_items',
    'part_usage_logs',
    'json_excel_file_uploaded'
  )
ORDER BY tablename;

-- Check policies on a sample table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'suppliers';
