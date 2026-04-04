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
      (supabase as any).from('parts_all').select('*', { count: 'exact', head: true }),
      (supabase as any).from('profiles').select('*', { count: 'exact', head: true })
    ]);

    return {
      projects: projectsCount || 0,
      parts: partsCount || 0,
      users: usersCount || 0
    };
  },

  /**
   * Create a new user without logging out the current admin
   */
  createUser: async (email: string, password: string, fullName: string) => {
    // Create a NEW Supabase client instance that doesn't persist session
    // This is crucial to avoid logging out the current admin
    const { createClient } = await import('@supabase/supabase-js');
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );

    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create profile record (usually handled by triggers, but explicit is safer
      // if the trigger hasn't finished or if logic is custom)
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .insert([{
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: 'user'
        }]);
      
      // If profile exists, it might be the trigger. We can ignore 23505 (unique)
      if (profileError && (profileError as any).code !== '23505') {
        throw profileError;
      }
    }

    return authData.user;
  }
};

export default adminApi;
