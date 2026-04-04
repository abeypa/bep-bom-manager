import { supabase } from '../lib/supabase';

export const adminApi = {
  /**
   * Get all user profiles (with their associated auth info where possible)
   */
  getProfiles: async () => {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('*')
      .order('email');

    if (error) throw error;
    return data;
  },

  /**
   * Update a user's role
   */
  updateUserRole: async (userId: string, role: 'admin' | 'user') => {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get system-wide statistics for the admin dashboard
   */
  getSystemStats: async () => {
    // This is a placeholder for more advanced system metrics
    const [
      { count: projectsCount },
      { count: partsCount },
      { count: usersCount }
    ] = await Promise.all([
      (supabase as any).from('projects').select('*', { count: 'exact', head: true }),
      (supabase as any).from('parts_all').select('*', { count: 'exact', head: true }), // Assuming parts_all or similar exists
      (supabase as any).from('profiles').select('*', { count: 'exact', head: true })
    ]);

    return {
      projects: projectsCount || 0,
      parts: partsCount || 0,
      users: usersCount || 0
    };
  }
};

export default adminApi;
