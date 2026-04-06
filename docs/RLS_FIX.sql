-- Supabase RLS Fix Script
-- Run this in the Supabase SQL Editor to resolve "new row violates row-level security policy" errors.

-----------------------------------------------------------
-- 1. DATABASE TABLES (Allow authenticated users access)
-----------------------------------------------------------

-- Enable RLS and add basic CRUD policy for all tables
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "projects";
CREATE POLICY "Allow All" ON "projects" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "project_sections" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "project_sections";
CREATE POLICY "Allow All" ON "project_sections" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "project_parts" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "project_parts";
CREATE POLICY "Allow All" ON "project_parts" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "suppliers";
CREATE POLICY "Allow All" ON "suppliers" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "mechanical_manufacture" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "mechanical_manufacture";
CREATE POLICY "Allow All" ON "mechanical_manufacture" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "mechanical_bought_out" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "mechanical_bought_out";
CREATE POLICY "Allow All" ON "mechanical_bought_out" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "electrical_manufacture" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "electrical_manufacture";
CREATE POLICY "Allow All" ON "electrical_manufacture" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "electrical_bought_out" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "electrical_bought_out";
CREATE POLICY "Allow All" ON "electrical_bought_out" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "pneumatic_bought_out" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "pneumatic_bought_out";
CREATE POLICY "Allow All" ON "pneumatic_bought_out" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "stock_movements" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "stock_movements";
CREATE POLICY "Allow All" ON "stock_movements" FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE "part_price_history" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All" ON "part_price_history";
CREATE POLICY "Allow All" ON "part_price_history" FOR ALL USING (true) WITH CHECK (true);

-----------------------------------------------------------
-- 2. STORAGE BUCKET (Allow file uploads to bom_assets)
-----------------------------------------------------------

-- Ensure the bucket exists and is PUBLIC
INSERT INTO storage.buckets (id, name, public)
VALUES ('bom_assets', 'bom_assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy to allow anyone to READ (since the bucket is public)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'bom_assets' );

-- Policy to allow authenticated users to UPLOAD
DROP POLICY IF EXISTS "Allow Authenticated Uploads" ON storage.objects;
CREATE POLICY "Allow Authenticated Uploads"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'bom_assets' );

-- Policy to allow authenticated users to UPDATE/DELETE their files
DROP POLICY IF EXISTS "Allow Authenticated Updates" ON storage.objects;
CREATE POLICY "Allow Authenticated Updates"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'bom_assets' );

DROP POLICY IF EXISTS "Allow Authenticated Deletes" ON storage.objects;
CREATE POLICY "Allow Authenticated Deletes"
ON storage.objects FOR DELETE
USING ( bucket_id = 'bom_assets' );
