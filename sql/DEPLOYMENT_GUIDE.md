# BOM Manager Database Deployment Guide

## Overview
This guide explains how to deploy the BOM Manager database to Supabase.

## Prerequisites
1. Supabase account with a project created (TASK-02)
2. Access to Supabase SQL Editor

## Deployment Steps

### Step 1: Create All Tables
**Method A: Single Script (Recommended)**
1. Open Supabase SQL Editor
2. Copy entire content of `all_tables_combined.sql`
3. Paste and click "Run"

**Method B: Individual Scripts**
Run these in order:
1. `01_suppliers.sql`
2. `02_projects.sql`
3. `03_project_sections.sql`
4. `04_parts_tables.sql`
5. `05_project_parts.sql`
6. `06_purchase_orders.sql`
7. `07_part_usage_and_upload.sql`

### Step 2: Enable Row Level Security (RLS)
1. Run the script in `rls/01_enable_rls_policies.sql`
2. This enables RLS on all tables and creates auth-only policies

### Step 3: Create Storage Bucket
1. Go to Supabase Dashboard → Storage
2. Create new bucket named `drawings`
3. Set to Private (not public)

### Step 4: Configure Auth
1. Go to Supabase Dashboard → Authentication → Providers
2. Disable all social providers
3. Ensure Email provider is enabled
4. Set "Disable signup" to ON (only admin creates users)
5. Go to Authentication → Users → Add User to create login accounts

### Step 5: Verify Installation
Run `verify_tables.sql` to confirm all 13 tables were created correctly.

## Expected Outcome
After successful deployment:
- ✅ 13 tables created with proper schema
- ✅ RLS enabled with auth-only policies
- ✅ Storage bucket "drawings" exists
- ✅ Auth configured for email/password only
- ✅ Can create users via Supabase dashboard

## Troubleshooting

### Issue: Tables not appearing
- Check SQL Editor for error messages
- Verify you're in the correct database/schema
- Run verification script to see what was created

### Issue: RLS policies not working
- Ensure `auth.role() = 'authenticated'` policies are created
- Check that RLS is enabled on each table
- Test with authenticated vs unauthenticated requests

### Issue: Foreign key errors
- Verify tables were created in correct order
- Check that referenced tables exist
- Ensure data types match between foreign key and primary key

## Next Steps
After database setup, proceed to:
1. TASK-07: Initialize Vite + React + TypeScript + Tailwind
2. TASK-08: Build Supabase Client + Auth Context
3. TASK-09: Build Login Page

## Support
Refer to `bom-deployment.md` for complete deployment plan and troubleshooting.

