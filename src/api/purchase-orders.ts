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

  getProjectPurchaseOrders: async (projectId: number) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (name)
      `)
      .eq('project_id', projectId)
      .order('po_date', { ascending: false })
      
    if (error) throw error
    return data
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

  createPurchaseOrderWithItems: async (po: PurchaseOrderInsert, items: any[]) => {
    // 1. Create the PO
    const { data: newPO, error: poError } = await (supabase.from('purchase_orders') as any)
      .insert([po])
      .select()
      .single();

    if (poError) throw poError;

    // 2. Create the Items
    const itemsWithPOId = items.map(item => ({
      ...item,
      purchase_order_id: newPO.id
    }));

    const { error: itemsError } = await (supabase.from('purchase_order_items') as any)
      .insert(itemsWithPOId);

    if (itemsError) {
      // Rollback PO if items fail (Supabase doesn't have multi-table transactions in JS easily, 
      // but we should at least try to delete the PO or notify the user)
      await supabase.from('purchase_orders').delete().eq('id', newPO.id);
      throw itemsError;
    }

    return newPO;
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
