import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Project = Database['public']['Tables']['projects']['Row']

export interface DashboardStats {
  total_parts: number;
  mechanical_manufacture: number;
  mechanical_bought_out: number;
  electrical_manufacture: number;
  electrical_bought_out: number;
  pneumatic_bought_out: number;
  low_stock_alerts: number;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  on_hold_projects: number;
  total_suppliers: number;
  pending_pos: number;
  total_pos: number;
}

// Fallback: compute stats with direct queries when RPC doesn't exist
async function computeStatsFallback(): Promise<DashboardStats> {
  const counts = await Promise.all([
    supabase.from('mechanical_manufacture').select('id', { count: 'exact', head: true }),
    supabase.from('mechanical_bought_out').select('id', { count: 'exact', head: true }),
    supabase.from('electrical_manufacture').select('id', { count: 'exact', head: true }),
    supabase.from('electrical_bought_out').select('id', { count: 'exact', head: true }),
    supabase.from('pneumatic_bought_out').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }).in('status', ['planning', 'design', 'build', 'testing']),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'on_hold'),
    supabase.from('suppliers').select('id', { count: 'exact', head: true }),
    supabase.from('purchase_orders').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('purchase_orders').select('id', { count: 'exact', head: true }),
  ])

  // Low stock: parts where stock_quantity <= min_stock_level
  const lowStockQueries = await Promise.all([
    supabase.from('mechanical_manufacture').select('id', { count: 'exact', head: true }).filter('stock_quantity', 'lte', 'min_stock_level' as any),
    supabase.from('mechanical_bought_out').select('id', { count: 'exact', head: true }).filter('stock_quantity', 'lte', 'min_stock_level' as any),
    supabase.from('electrical_manufacture').select('id', { count: 'exact', head: true }).filter('stock_quantity', 'lte', 'min_stock_level' as any),
    supabase.from('electrical_bought_out').select('id', { count: 'exact', head: true }).filter('stock_quantity', 'lte', 'min_stock_level' as any),
    supabase.from('pneumatic_bought_out').select('id', { count: 'exact', head: true }).filter('stock_quantity', 'lte', 'min_stock_level' as any),
  ])

  const mm = counts[0].count || 0
  const mbo = counts[1].count || 0
  const em = counts[2].count || 0
  const ebo = counts[3].count || 0
  const pbo = counts[4].count || 0

  // Simple low stock count - just count parts where min_stock_level > 0 and stock is low
  // The filter above may not work with column references, so we do a simpler approach:
  let lowStockCount = 0
  for (const table of ['mechanical_manufacture', 'mechanical_bought_out', 'electrical_manufacture', 'electrical_bought_out', 'pneumatic_bought_out'] as const) {
    const { data } = await (supabase.from(table) as any)
      .select('id')
      .gt('min_stock_level', 0)
      .lte('stock_quantity', 0) // simplified: count only zero-stock items with min > 0
    lowStockCount += (data?.length || 0)
  }

  return {
    total_parts: mm + mbo + em + ebo + pbo,
    mechanical_manufacture: mm,
    mechanical_bought_out: mbo,
    electrical_manufacture: em,
    electrical_bought_out: ebo,
    pneumatic_bought_out: pbo,
    low_stock_alerts: lowStockCount,
    total_projects: counts[5].count || 0,
    active_projects: counts[6].count || 0,
    completed_projects: counts[7].count || 0,
    on_hold_projects: counts[8].count || 0,
    total_suppliers: counts[9].count || 0,
    pending_pos: counts[10].count || 0,
    total_pos: counts[11].count || 0,
  }
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Try RPC first
      const { data, error } = await supabase.rpc('get_dashboard_stats')
      if (error) throw error
      return data as unknown as DashboardStats
    } catch {
      // Fallback to direct queries if RPC doesn't exist
      return computeStatsFallback()
    }
  },
  
  getRecentProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(5)
      
    if (error) throw error
    return data as Project[]
  }
}
