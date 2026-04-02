import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert']
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']

export type POStatus = 'Pending' | 'Sent' | 'Confirmed' | 'Partial' | 'Received' | 'Cancelled'

// Valid status transitions
const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  'Pending':   ['Sent', 'Cancelled'],
  'Sent':      ['Confirmed', 'Cancelled'],
  'Confirmed': ['Partial', 'Received', 'Cancelled'],
  'Partial':   ['Received', 'Cancelled'],
  'Received':  [], // terminal state
  'Cancelled': [], // terminal state
}

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
  },

  deletePurchaseOrder: async (id: number) => {
    // Items cascade delete due to FK ON DELETE CASCADE
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Get valid next statuses for a PO
  getValidTransitions: (currentStatus: POStatus): POStatus[] => {
    return STATUS_TRANSITIONS[currentStatus] || []
  },

  // Change PO status with validation
  changeStatus: async (id: number, newStatus: POStatus) => {
    // 1. Get current PO
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const currentStatus = (po as any).status as POStatus
    const validTransitions = STATUS_TRANSITIONS[currentStatus]
    
    if (!validTransitions?.includes(newStatus)) {
      throw new Error(`Cannot change status from "${currentStatus}" to "${newStatus}". Valid transitions: ${validTransitions?.join(', ') || 'none'}`)
    }

    // 2. Update status
    const { data, error } = await (supabase.from('purchase_orders') as any)
      .update({ status: newStatus, updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Receive PO items - updates stock quantities on master part tables
  receiveItems: async (poId: number, receivedItems: { itemId: number; receivedQty: number }[]) => {
    // 1. Get PO and items
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select(`*, items:purchase_order_items(*)`)
      .eq('id', poId)
      .single()

    if (poError) throw poError

    let allFullyReceived = true

    for (const received of receivedItems) {
      const item = (po as any).items?.find((i: any) => i.id === received.itemId)
      if (!item) continue

      if (received.receivedQty <= 0) {
        allFullyReceived = false
        continue
      }

      // Determine which master table to update
      const partType = item.part_type
      const partNumber = item.part_number

      if (partType && partNumber) {
        // Get master part
        const { data: masterPart } = await (supabase.from(partType) as any)
          .select('id, stock_quantity, received_qty')
          .eq('part_number', partNumber)
          .single()

        if (masterPart) {
          // Update master stock
          await (supabase.from(partType) as any)
            .update({
              stock_quantity: (masterPart.stock_quantity || 0) + received.receivedQty,
              received_qty: (masterPart.received_qty || 0) + received.receivedQty,
              updated_date: new Date().toISOString()
            })
            .eq('id', masterPart.id)
        }
      }

      // Check if this item is partially received
      if (received.receivedQty < item.quantity) {
        allFullyReceived = false
      }
    }

    // 3. Update PO status
    const newStatus: POStatus = allFullyReceived ? 'Received' : 'Partial'
    await (supabase.from('purchase_orders') as any)
      .update({ status: newStatus, updated_date: new Date().toISOString() })
      .eq('id', poId)

    return { success: true, status: newStatus }
  },

  // Update a single PO item
  updateItem: async (itemId: number, updates: { quantity?: number; unit_price?: number; discount_percent?: number }) => {
    const payload: any = { ...updates }
    if (updates.quantity !== undefined && updates.unit_price !== undefined) {
      const discount = updates.discount_percent ?? 0
      payload.total_amount = updates.quantity * updates.unit_price * (1 - discount / 100)
    }

    const { data, error } = await (supabase.from('purchase_order_items') as any)
      .update(payload)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a single PO item
  deleteItem: async (itemId: number) => {
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
  }
}
