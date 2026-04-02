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
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data, error } = await supabase.rpc('get_dashboard_stats')
    
    if (error) throw error
    return data as unknown as DashboardStats
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

