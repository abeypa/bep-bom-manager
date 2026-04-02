import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type PartCategory = 
  | 'mechanical_manufacture' 
  | 'mechanical_bought_out' 
  | 'electrical_manufacture' 
  | 'electrical_bought_out' 
  | 'pneumatic_bought_out'

export const partsApi = {
  // Get all parts for a specific category
  getParts: async (category: PartCategory) => {
    const { data, error } = await supabase
      .from(category)
      .select(`
        *,
        suppliers:supplier_id (
          name
        )
      `)
      .order('created_date', { ascending: false })
      
    if (error) throw error
    return data
  },
  
  // Delete a part
  deletePart: async (category: PartCategory, id: number) => {
    const { error } = await supabase
      .from(category)
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Create a new part
  createPart: async (category: PartCategory, payload: any) => {
    const { data, error } = await supabase
      .from(category as any)
      // @ts-expect-error - TypeScript struggles with union table names in Supabase
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update an existing part
  updatePart: async (category: PartCategory, id: number, payload: any) => {
    const { data, error } = await supabase
      .from(category as any)
      // @ts-expect-error - TypeScript struggles with union table names in Supabase
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}

