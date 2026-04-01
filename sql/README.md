# BOM Manager SQL Scripts

This directory contains SQL scripts for creating the 13 database tables required for the BOM Manager application as specified in `bom-deployment.md` Steps 2a-2g.

## Files Overview

| File | Description | Tables Created |
|------|-------------|----------------|
| `all_tables_combined.sql` | **RECOMMENDED** - Single file with all 13 tables. Copy entire content into Supabase SQL Editor | All 13 tables |
| `00_all_tables.sql` | Master file that references individual scripts (requires PostgreSQL `\i` command) | All 13 tables |
| `01_suppliers.sql` | Suppliers table only | 1 table |
| `02_projects.sql` | Projects table only | 1 table |
| `03_project_sections.sql` | Project sections table only | 1 table |
| `04_parts_tables.sql` | All 5 parts tables | 5 tables |
| `05_project_parts.sql` | Project parts junction table | 1 table |
| `06_purchase_orders.sql` | Purchase orders and items tables | 2 tables |
| `07_part_usage_and_upload.sql` | Part usage logs and upload history tables | 2 tables |

## Recommended Usage

### Option 1: Quick Setup (Recommended)
1. Open Supabase SQL Editor
2. Copy the **entire content** of `all_tables_combined.sql`
3. Paste into SQL Editor and click "Run"

### Option 2: Individual Execution
Run these scripts in order in Supabase SQL Editor:
1. `01_suppliers.sql`
2. `02_projects.sql`
3. `03_project_sections.sql`
4. `04_parts_tables.sql`
5. `05_project_parts.sql`
6. `06_purchase_orders.sql`
7. `07_part_usage_and_upload.sql`

## Table Summary

The scripts create the following 13 tables:

1. **suppliers** - Supplier information for procurement
2. **projects** - Project information and tracking
3. **project_sections** - Sections/divisions within projects
4. **mechanical_manufacture** - Mechanical parts manufactured in-house
5. **mechanical_bought_out** - Mechanical parts purchased from suppliers
6. **electrical_manufacture** - Electrical/electronic parts manufactured in-house
7. **electrical_bought_out** - Electrical/electronic parts purchased from suppliers
8. **pneumatic_bought_out** - Pneumatic parts purchased from suppliers
9. **project_parts** - Junction table linking project sections to parts
10. **purchase_orders** - Purchase order header information
11. **purchase_order_items** - Line items for purchase orders
12. **part_usage_logs** - Audit trail for part usage across projects
13. **json_excel_file_uploaded** - History of JSON/Excel file uploads for bulk imports

## Features Included

Each script includes:
- Table definitions with proper data types
- Primary keys and foreign key constraints
- Indexes for performance optimization
- Default values for common fields
- Check constraints where applicable
- Automatic timestamp triggers (`created_date`, `updated_date`)
- Column comments for documentation

## Advanced Features

The scripts also implement:
1. **Automatic calculations**: 
   - `total_amount` = `base_price * order_qty * (1 - discount_percent/100)`
   - `total_stock` = `stock_quantity + received_qty`
2. **Referential integrity**: Foreign keys with proper cascade/set null behavior
3. **Business logic triggers**:
   - Update part stock when PO status changes to 'Received'
   - Log part usage automatically when parts are assigned to projects
   - Recalculate PO totals when line items change

## Next Steps

After creating tables, you should:
1. Enable Row Level Security (RLS) - See `rls/` directory
2. Create storage bucket "drawings" in Supabase Storage
3. Configure Auth (email/password only)
4. Run seed data if needed

## Verification

After running the scripts, verify all 13 tables are created by checking the Supabase Table Editor or running:

```sql
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'suppliers', 'projects', 'project_sections', 
  'mechanical_manufacture', 'mechanical_bought_out',
  'electrical_manufacture', 'electrical_bought_out',
  'pneumatic_bought_out', 'project_parts',
  'purchase_orders', 'purchase_order_items',
  'part_usage_logs', 'json_excel_file_uploaded'
);
```

Expected result: `table_count = 13`

