import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row']
export type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert']
export type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update']
export type PurchaseOrderItem = Database['public']['Tables']['purchase_order_items']['Row']

// Updated status with Draft as initial state
export type POStatus = 'Draft' | 'Released' | 'Pending' | 'Sent' | 'Confirmed' | 'Partial' | 'Received' | 'Cancelled';

export const purchaseOrdersApi = {
  // Get all POs
  getAll: async () => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (name),
        project:projects (project_name)
      `)
      .order('created_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  getPurchaseOrders: async () => {
    return purchaseOrdersApi.getAll();
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

  // Get single PO with full details
  getById: async (poId: number) => {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (*),
        project:projects (project_name),
        purchase_order_items (*)
      `)
      .eq('id', poId)
      .single();
    if (error) throw error;
    return data;
  },

  getPurchaseOrder: async (id: number) => {
    return purchaseOrdersApi.getById(id);
  },

  // Create new PO
  create: async (poData: PurchaseOrderInsert) => {
    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .insert([poData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updatePurchaseOrder: async (poId: number, updateData: any) => {
    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update(updateData)
      .eq('id', poId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  createPurchaseOrderWithItems: async (po: PurchaseOrderInsert, items: any[]) => {
    const { data: newPO, error: poError } = await (supabase as any).from('purchase_orders')
      .insert([po])
      .select()
      .single();

    if (poError) throw poError;

    const itemsWithPOId = items.map(item => ({
      ...item,
      purchase_order_id: newPO.id
    }));

    const { error: itemsError } = await ((supabase as any).from('purchase_order_items') as any)
      .insert(itemsWithPOId);

    if (itemsError) {
      await (supabase as any).from('purchase_orders').delete().eq('id', newPO.id);
      throw itemsError;
    }

    return newPO;
  },

  // Transition from Draft to Released (requires PDF)
  releasePO: async (poId: number) => {
    const { data: po, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('status, bep_po_pdf_url')
      .eq('id', poId)
      .single();

    if (fetchError) throw fetchError;
    if (!po) throw new Error('PO not found');

    if ((po as any).status !== 'Draft') {
      throw new Error('Only Draft POs can be released');
    }

    if (!(po as any).bep_po_pdf_url) {
      throw new Error('Cannot release PO. Please attach BEP PO PDF document first.');
    }

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update({ 
        status: 'Released', 
        updated_date: new Date().toISOString() 
      })
      .eq('id', poId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update PO status with validation
  updateStatus: async (poId: number, newStatus: POStatus) => {
    const { data: current } = await supabase
      .from('purchase_orders')
      .select('status, bep_po_pdf_url')
      .eq('id', poId)
      .single();

    if (!current) throw new Error('PO not found');
    const currentStatus = (current as any).status || 'Draft';

    // Transition rules
    const validTransitions: Record<string, POStatus[]> = {
      'Draft':     ['Released', 'Cancelled'],
      'Released':  ['Sent', 'Cancelled'],
      'Pending':   ['Sent', 'Cancelled'],
      'Sent':      ['Confirmed', 'Cancelled'],
      'Confirmed': ['Partial', 'Received', 'Cancelled'],
      'Partial':   ['Received', 'Cancelled'],
    };

    if (validTransitions[currentStatus] && !validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }

    // Special rule for release
    if (newStatus === 'Released' && !(current as any).bep_po_pdf_url) {
      throw new Error('Cannot release PO without attaching BEP PO PDF');
    }

    const { data, error } = await (supabase as any)
      .from('purchase_orders')
      .update({ 
        status: newStatus, 
        updated_date: new Date().toISOString() 
      })
      .eq('id', poId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Receive items (CRITICAL: updates stock + logs movement)
  receiveItems: async (poId: number, receivedItems: Array<{ id: number; received_qty: number }>) => {
    const userEmail = (await supabase.auth.getUser()).data.user?.email || 'system';
    
    for (const itemRequest of receivedItems) {
      if (itemRequest.received_qty <= 0) continue;

      // Get current PO item to find its master part
      const { data: poItem } = await supabase
        .from('purchase_order_items')
        .select(`*, po:purchase_orders(id, po_number)`)
        .eq('id', itemRequest.id)
        .single();

      if (!poItem) continue;

      const partTableName = (poItem as any).part_type;
      const partId = (poItem as any).part_id;
      const po_number = (poItem as any).po?.po_number;

      if (!partTableName || !partId) continue;

      // 1. Get current master stock
      const { data: part } = await (supabase as any)
        .from(partTableName)
        .select('stock_quantity, part_number')
        .eq('id', partId)
        .single();

      if (!part) continue;

      const stockBefore = part.stock_quantity || 0;
      const newStock = stockBefore + itemRequest.received_qty;

      // 2. Update master stock and log movement
      await Promise.all([
        (supabase as any).from(partTableName).update({ 
          stock_quantity: newStock,
          received_qty: ((part as any).received_qty || 0) + itemRequest.received_qty,
          updated_date: new Date().toISOString()
        }).eq('id', partId),
        
        (supabase as any).from('stock_movements').insert({
          movement_type: 'IN',
          part_table_name: partTableName,
          part_id: partId,
          part_number: part.part_number,
          quantity: itemRequest.received_qty,
          stock_before: stockBefore,
          stock_after: newStock,
          po_number: po_number,
          moved_by: userEmail
        })
      ]);

      // 3. Update received qty in PO item
      await (supabase as any)
        .from('purchase_order_items')
        .update({ 
          received_qty: ((poItem as any).received_qty || 0) + itemRequest.received_qty 
          // Note: we accumulate receipt qty
        })
        .eq('id', itemRequest.id);
    }

    return { success: true };
  },

  // Delete PO (only if Draft or Cancelled)
  deletePO: async (poId: number) => {
    const { data: po } = await supabase
      .from('purchase_orders')
      .select('status')
      .eq('id', poId)
      .single();

    if (!['Draft', 'Cancelled'].includes((po as any)?.status)) {
      throw new Error('Only Draft or Cancelled POs can be deleted');
    }

    const { error } = await (supabase as any).from('purchase_orders').delete().eq('id', poId);
    if (error) throw error;
  },

  deletePurchaseOrder: async (id: number) => {
    return purchaseOrdersApi.deletePO(id);
  },

  getPendingParts: async () => {
    // This fetches all project_parts joined with their sections and projects
    // to identify items that need to be purchased
    const { data: projectParts, error } = await supabase
      .from('project_parts')
      .select(`
        *,
        section:project_sections (
          id,
          section_name,
          project:projects (id, project_name)
        ),
        mechanical_manufacture (*, suppliers(name)),
        mechanical_bought_out (*, suppliers(name)),
        electrical_manufacture (*, suppliers(name)),
        electrical_bought_out (*, suppliers(name)),
        pneumatic_bought_out (*, suppliers(name))
      `);

    if (error) throw error;

    // Also get all IDs that are already in a PO to filter them out
    const { data: orderedItems } = await supabase
      .from('purchase_order_items')
      .select('project_part_id')
      .not('project_part_id', 'is', null);

    const orderedIds = new Set((orderedItems as any[])?.map(i => i.project_part_id));

    return ((projectParts as any[]) || []).filter(p => !orderedIds.has(p.id));
  },

  // Delete single PO line item
  deletePOItem: async (itemId: number) => {
    const { error } = await supabase
      .from('purchase_order_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  }
};

export default purchaseOrdersApi;