-- ============================================================
-- Dashboard Stats RPC Function
-- Run this in Supabase SQL Editor to enable fast dashboard loading
-- If not run, the frontend will fallback to individual queries (slower)
-- ============================================================

CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  mm_count INT;
  mbo_count INT;
  em_count INT;
  ebo_count INT;
  pbo_count INT;
  low_stock INT;
  total_projects INT;
  active_projects INT;
  completed_projects INT;
  on_hold_projects INT;
  total_suppliers INT;
  pending_pos INT;
  total_pos INT;
BEGIN
  SELECT COUNT(*) INTO mm_count FROM mechanical_manufacture;
  SELECT COUNT(*) INTO mbo_count FROM mechanical_bought_out;
  SELECT COUNT(*) INTO em_count FROM electrical_manufacture;
  SELECT COUNT(*) INTO ebo_count FROM electrical_bought_out;
  SELECT COUNT(*) INTO pbo_count FROM pneumatic_bought_out;

  -- Low stock: parts where stock_quantity <= min_stock_level AND min_stock_level > 0
  SELECT COUNT(*) INTO low_stock FROM (
    SELECT id FROM mechanical_manufacture WHERE min_stock_level > 0 AND stock_quantity <= min_stock_level
    UNION ALL
    SELECT id FROM mechanical_bought_out WHERE min_stock_level > 0 AND stock_quantity <= min_stock_level
    UNION ALL
    SELECT id FROM electrical_manufacture WHERE min_stock_level > 0 AND stock_quantity <= min_stock_level
    UNION ALL
    SELECT id FROM electrical_bought_out WHERE min_stock_level > 0 AND stock_quantity <= min_stock_level
    UNION ALL
    SELECT id FROM pneumatic_bought_out WHERE min_stock_level > 0 AND stock_quantity <= min_stock_level
  ) AS low_stock_parts;

  SELECT COUNT(*) INTO total_projects FROM projects;
  SELECT COUNT(*) INTO active_projects FROM projects WHERE status IN ('planning', 'design', 'build', 'testing');
  SELECT COUNT(*) INTO completed_projects FROM projects WHERE status = 'completed';
  SELECT COUNT(*) INTO on_hold_projects FROM projects WHERE status = 'on_hold';
  SELECT COUNT(*) INTO total_suppliers FROM suppliers;
  SELECT COUNT(*) INTO pending_pos FROM purchase_orders WHERE status = 'Pending';
  SELECT COUNT(*) INTO total_pos FROM purchase_orders;

  result := json_build_object(
    'total_parts', mm_count + mbo_count + em_count + ebo_count + pbo_count,
    'mechanical_manufacture', mm_count,
    'mechanical_bought_out', mbo_count,
    'electrical_manufacture', em_count,
    'electrical_bought_out', ebo_count,
    'pneumatic_bought_out', pbo_count,
    'low_stock_alerts', low_stock,
    'total_projects', total_projects,
    'active_projects', active_projects,
    'completed_projects', completed_projects,
    'on_hold_projects', on_hold_projects,
    'total_suppliers', total_suppliers,
    'pending_pos', pending_pos,
    'total_pos', total_pos
  );

  RETURN result;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
