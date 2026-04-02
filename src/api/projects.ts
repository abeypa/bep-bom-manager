import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectSection = Database['public']['Tables']['project_sections']['Row']
export type ProjectSectionInsert = Database['public']['Tables']['project_sections']['Insert']

export const projectsApi = {
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false })
      
    if (error) throw error
    return data
  },
  
  getProject: async (id: number) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        sections:project_sections (
          *,
          parts:project_parts (
            *
          )
        )
      `)
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  },
  
  createProject: async (project: ProjectInsert) => {
    const { data, error } = await (supabase.from('projects') as any)
      .insert([project])
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  updateProject: async (id: number, project: ProjectUpdate) => {
    const { data, error } = await (supabase.from('projects') as any)
      .update(project)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  deleteProject: async (id: number) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Sections
  getSections: async (projectId: number) => {
    const { data, error } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      
    if (error) throw error
    return data
  },

  createSection: async (section: ProjectSectionInsert) => {
    const { data, error } = await (supabase.from('project_sections') as any)
      .insert([section])
      .select()
      .single()
      
    if (error) throw error
    return data
  }
}
