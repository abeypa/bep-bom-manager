import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type PartCategory = 
  | 'mechanical_manufacture' 
  | 'mechanical_bought_out' 
  | 'electrical_manufacture' 
  | 'electrical_bought_out' 
  | 'pneumatic_bought_out';

const logPriceHistory = async (
  partTable: PartCategory,
  partId: number,
  partNumber: string,
  oldData: any,
  newData: any,
  reason: string = 'manual_edit'
) => {
  const oldPrice = oldData?.base_price;
  const newPrice = newData?.base_price;
  const oldCurrency = oldData?.currency;
  const newCurrency = newData?.currency || 'INR';
  const oldDiscount = oldData?.discount_percent;
  const newDiscount = newData?.discount_percent;

  // Only log if price, currency or discount actually changed
  if (
    oldPrice !== newPrice ||
    oldCurrency !== newCurrency ||
    oldDiscount !== newDiscount
  ) {
    await (supabase as any).from('part_price_history').insert({
      part_table_name: partTable,
      part_id: partId,
      part_number: partNumber,
      old_price: oldPrice,
      new_price: newPrice,
      old_currency: oldCurrency,
      new_currency: newCurrency,
      old_discount_percent: oldDiscount,
      new_discount_percent: newDiscount,
      change_reason: reason,
      changed_by: (await supabase.auth.getUser()).data.user?.email || 'system',
    });
  }
};

export const partsApi = {
  // Get parts by category
  getPartsByCategory: async (category: PartCategory) => {
    const { data, error } = await supabase
      .from(category)
      .select(`
        *,
        suppliers:supplier_id (
          name
        )
      `)
      .order('part_number');
    if (error) throw error;
    return data;
  },

  // Backward compatibility alias for 'getParts'
  getParts: async (category: PartCategory) => {
    return partsApi.getPartsByCategory(category);
  },

  // Create a new part
  createPart: async (category: PartCategory, payload: any) => {
    const { data, error } = await supabase
      .from(category)
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    
    // Log initial price
    if (data) {
      await logPriceHistory(category, data.id, data.part_number, null, data, 'manual_edit');
    }
    
    return data
  },

  // Updated: now logs price history automatically
  updatePart: async (category: PartCategory, id: number, updates: any) => {
    // 1. Fetch current values for comparison
    const { data: current } = await supabase
      .from(category)
      .select('base_price, currency, discount_percent, part_number')
      .eq('id', id)
      .single();

    // 2. Perform the update
    const { data: updated, error } = await supabase
      .from(category)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // 3. Log price history if price fields changed
    if (current && updated) {
      await logPriceHistory(category, id, current.part_number, current, updated, 'manual_edit');
    }

    return updated;
  },

  // Updated: bulk import now also logs price history
  importParts: async (parts: any[]) => {
    let partsProcessed = 0
    let partsAdded = 0
    let partsUpdated = 0
    let errors = 0
    const errorMessages: string[] = []

    const getTableFromType = (type: string): PartCategory | null => {
      const t = type.toLowerCase().replace(/[\s_-]/g, '')
      if (t.includes('mechanicalmanufacture')) return 'mechanical_manufacture'
      if (t.includes('mechanicalboughtout')) return 'mechanical_bought_out'
      if (t.includes('electricalmanufacture')) return 'electrical_manufacture'
      if (t.includes('electricalboughtout')) return 'electrical_bought_out'
      if (t.includes('pneumaticboughtout')) return 'pneumatic_bought_out'
      return null
    }

    const fieldMap: Record<string, string> = {
      'PartNumber': 'part_number',
      'Description': 'description',
      'SupplierId': 'supplier_id',
      'BasePrice': 'base_price',
      'Currency': 'currency',
      'DiscountPercent': 'discount_percent',
      'StockQuantity': 'stock_quantity',
      'MinStockLevel': 'min_stock_level',
      'OrderQty': 'order_qty',
      'ReceivedQty': 'received_qty',
      'LeadTime': 'lead_time',
      'Specifications': 'specifications',
      'Manufacturer': 'manufacturer',
      'ManufacturerPartNumber': 'manufacturer_part_number',
      'Material': 'material',
      'Finish': 'finish',
      'Weight': 'weight',
      'VendorPartNumber': 'vendor_part_number',
      'PONumber': 'po_number',
      'PortSize': 'port_size',
      'OperatingPressure': 'operating_pressure'
    }

    for (const part of parts) {
      partsProcessed++
      try {
        const category = getTableFromType(part.PartType || '')
        if (!category) {
          throw new Error(`Invalid PartType: ${part.PartType}`)
        }

        if (!part.PartNumber) {
          throw new Error('PartNumber is required')
        }

        // Map fields to snake_case
        const payload: any = {}
        Object.entries(part).forEach(([key, value]) => {
          const targetKey = fieldMap[key] || key.toLowerCase()
          if (key !== 'PartType') {
            payload[targetKey] = value
          }
        })

        // Check if part exists
        const { data: existing } = await supabase
          .from(category)
          .select('id, base_price, currency, discount_percent, part_number')
          .eq('part_number', part.PartNumber)
          .single()

        const { data: result, error } = await supabase
          .from(category)
          .upsert(payload, { onConflict: 'part_number' })
          .select()
          .single()

        if (error) throw error

        if (existing) {
          partsUpdated++
          await logPriceHistory(category, existing.id, part.PartNumber, existing, result, 'json_import');
        } else {
          partsAdded++
          if (result) {
            await logPriceHistory(category, result.id, part.PartNumber, null, result, 'json_import');
          }
        }
      } catch (err: any) {
        errors++
        errorMessages.push(`Part ${part.PartNumber || 'unknown'}: ${err.message}`)
      }
    }

    return {
      success: errors === 0,
      message: errors === 0 
        ? `Successfully imported ${partsAdded} new and updated ${partsUpdated} parts.`
        : `Import completed with ${errors} error(s).`,
      partsProcessed,
      partsAdded,
      partsUpdated,
      errors,
      errorMessages
    }
  },

  // New: Get price history for a specific part
  getPriceHistory: async (category: PartCategory, partId: number) => {
    const { data, error } = await supabase
      .from('part_price_history')
      .select('*')
      .eq('part_table_name', category)
      .eq('part_id', partId)
      .order('changed_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  deletePart: async (category: PartCategory, id: number) => {
    const { error } = await (supabase as any).from(category).delete().eq('id', id);
    if (error) throw error;
  },
};
