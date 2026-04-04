-- ============================================================
-- STOCK NON-NEGATIVE CONSTRAINTS
-- Prevents stock_quantity from going below zero
-- Acts as a database-level safety net (frontend also validates)
-- Run in Supabase SQL Editor
-- ============================================================

-- Mechanical Manufacture
DO $$ BEGIN
  ALTER TABLE mechanical_manufacture ADD CONSTRAINT chk_mm_stock_nonneg CHECK (stock_quantity >= 0);
  RAISE NOTICE 'Added constraint to mechanical_manufacture';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint already exists on mechanical_manufacture';
END $$;

-- Mechanical Bought Out
DO $$ BEGIN
  ALTER TABLE mechanical_bought_out ADD CONSTRAINT chk_mbo_stock_nonneg CHECK (stock_quantity >= 0);
  RAISE NOTICE 'Added constraint to mechanical_bought_out';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint already exists on mechanical_bought_out';
END $$;

-- Electrical Manufacture
DO $$ BEGIN
  ALTER TABLE electrical_manufacture ADD CONSTRAINT chk_em_stock_nonneg CHECK (stock_quantity >= 0);
  RAISE NOTICE 'Added constraint to electrical_manufacture';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint already exists on electrical_manufacture';
END $$;

-- Electrical Bought Out
DO $$ BEGIN
  ALTER TABLE electrical_bought_out ADD CONSTRAINT chk_ebo_stock_nonneg CHECK (stock_quantity >= 0);
  RAISE NOTICE 'Added constraint to electrical_bought_out';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint already exists on electrical_bought_out';
END $$;

-- Pneumatic Bought Out
DO $$ BEGIN
  ALTER TABLE pneumatic_bought_out ADD CONSTRAINT chk_pbo_stock_nonneg CHECK (stock_quantity >= 0);
  RAISE NOTICE 'Added constraint to pneumatic_bought_out';
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'Constraint already exists on pneumatic_bought_out';
END $$;

-- Verify constraints
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname LIKE 'chk_%_stock_nonneg'
ORDER BY conrelid::regclass::text;
