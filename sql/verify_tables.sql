-- ============================================================
-- VERIFICATION SCRIPT
-- Run this after creating all tables to verify setup
-- ============================================================

-- Count total tables created
SELECT 
    COUNT(*) as total_tables_created,
    STRING_AGG(table_name, ', ') as tables_list
FROM information_schema.tables 
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
    );

-- Check indexes on each table
SELECT 
    t.table_name,
    COUNT(i.indexname) as index_count,
    STRING_AGG(i.indexname, ', ') as indexes
FROM information_schema.tables t
LEFT JOIN pg_indexes i ON t.table_name = i.tablename AND i.schemaname = 'public'
WHERE t.table_schema = 'public'
    AND t.table_name IN (
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
GROUP BY t.table_name
ORDER BY t.table_name;

-- Check foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name IN (
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
ORDER BY tc.table_name, kcu.column_name;

-- Check triggers
SELECT 
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND event_object_table IN (
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
ORDER BY event_object_table, trigger_name;

