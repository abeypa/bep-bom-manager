-- ============================================================
-- BOM MANAGER - COMPLETE DATABASE SETUP
-- Run this script in Supabase SQL Editor to create all 13 tables
-- Steps 2a-2g from bom-deployment.md
-- ============================================================

-- Note: Run these scripts in order
-- 1. Run this script to create all tables
-- 2. Run RLS scripts to enable Row Level Security
-- 3. Run seed data scripts if needed

-- ============================================================
-- SUPPLIERS TABLE (Step 2a)
-- ============================================================
\i 01_suppliers.sql

-- ============================================================
-- PROJECTS TABLE (Step 2b)
-- ============================================================
\i 02_projects.sql

-- ============================================================
-- PROJECT SECTIONS TABLE (Step 2c)
-- ============================================================
\i 03_project_sections.sql

-- ============================================================
-- PARTS TABLES (5 types) (Step 2d)
-- ============================================================
\i 04_parts_tables.sql

-- ============================================================
-- PROJECT PARTS JUNCTION TABLE (Step 2e)
-- ============================================================
\i 05_project_parts.sql

-- ============================================================
-- PURCHASE ORDERS TABLES (Step 2f)
-- ============================================================
\i 06_purchase_orders.sql

-- ============================================================
-- PART USAGE LOGS & UPLOAD HISTORY (Step 2g)
-- ============================================================
\i 07_part_usage_and_upload.sql

-- ============================================================
-- VERIFICATION: List all created tables
-- ============================================================
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name IN (
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
GROUP BY table_name
ORDER BY table_name;

