import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert']
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']

export const purchaseOrdersApi = {
  getPurchaseOrders: async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        projects (project_name, project_number),
        suppliers (name)
      `)
      .order('po_date', { ascending: false })
      
    if (error) throw error
    return data as (PurchaseOrder & { projects: { project_name: string, project_number: string }, suppliers: { name: string } })[]
  },
  
  getPurchaseOrder: async (id: number) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        items:purchase_order_items (*),
        projects (*),
        suppliers (*)
      `)
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data
  },
  
  createPurchaseOrder: async (po: PurchaseOrderInsert) => {
    const { data, error } = await (supabase.from('purchase_orders') as any)
      .insert([po])
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  updatePurchaseOrder: async (id: number, po: PurchaseOrderUpdate) => {
    const { data, error } = await (supabase.from('purchase_orders') as any)
      .update(po)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  }
}
