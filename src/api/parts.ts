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
    const { data, error } = await (supabase.from(category) as any)
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
    const { error } = await (supabase.from(category as any) as any)
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Create a new part
  createPart: async (category: PartCategory, payload: any) => {
    const { data, error } = await (supabase.from(category as any) as any)
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update an existing part
  updatePart: async (category: PartCategory, id: number, payload: any) => {
    const { data, error } = await (supabase.from(category as any) as any)
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Import parts from JSON array
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
        const { data: existing } = await (supabase.from(category) as any)
          .select('id')
          .eq('part_number', part.PartNumber)
          .single()

        if (existing) {
          // Update
          const { error: upError } = await (supabase.from(category) as any)
            .update(payload)
            .eq('id', (existing as any).id)
          
          if (upError) throw upError
          partsUpdated++
        } else {
          // Insert
          const { error: inError } = await (supabase.from(category) as any)
            .insert([payload])
          
          if (inError) throw inError
          partsAdded++
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
  }
}

