import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Search, CheckCircle2, AlertCircle, ShoppingCart } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers'
import { purchaseOrdersApi } from '@/api/purchase-orders'

interface Props {
  isOpen: boolean
  onClose: () => void
  project: any
  selectedPartIds: number[]
}

const CreatePOFromBOMModal = ({ isOpen, onClose, project, selectedPartIds }: Props) => {
  const queryClient = useQueryClient()
  const [supplierId, setSupplierId] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getSuppliers()
  })

  // Flat list of selected parts with their catalog data
  const selectedParts = useMemo(() => {
    const list: any[] = []
    project.sections?.forEach((section: any) => {
      section.parts?.forEach((part: any) => {
        if (selectedPartIds.includes(part.id)) {
          // Resolve catalog data
          let catalogItem = null
          let tableName = ''
          if (part.mechanical_manufacture_id) {
            catalogItem = part.mechanical_manufacture
            tableName = 'mechanical_manufacture'
          } else if (part.mechanical_bought_out_part_id) {
            catalogItem = part.mechanical_bought_out
            tableName = 'mechanical_bought_out'
          } else if (part.electrical_manufacture_id) {
            catalogItem = part.electrical_manufacture
            tableName = 'electrical_manufacture'
          } else if (part.electrical_bought_out_part_id) {
            catalogItem = part.electrical_bought_out
            tableName = 'electrical_bought_out'
          } else if (part.pneumatic_bought_out_part_id) {
            catalogItem = part.pneumatic_bought_out
            tableName = 'pneumatic_bought_out'
          }

          list.push({
            ...part,
            catalogItem,
            tableName
          })
        }
      })
    })
    return list
  }, [project.sections, selectedPartIds])

  // Total calculation
  const totalAmount = useMemo(() => {
    return selectedParts.reduce((acc, p) => acc + (p.quantity * (p.unit_price || 0)), 0)
  }, [selectedParts])

  // Recommended supplier/currency from selected parts (Legacy Logic: prefer consistency)
  useMemo(() => {
    if (selectedParts.length > 0 && !supplierId) {
      const firstSupplierId = selectedParts[0].catalogItem?.supplier_id
      if (firstSupplierId) setSupplierId(firstSupplierId.toString())
      
      const firstCurrency = selectedParts[0].currency
      if (firstCurrency) setCurrency(firstCurrency)
    }
  }, [selectedParts, supplierId])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error('Please select a supplier')

      const poData = {
        project_id: project.id,
        supplier_id: parseInt(supplierId),
        po_number: `PO-${Date.now().toString().slice(-6)}`, // Temporary PO number generation
        po_date: new Date().toISOString(),
        currency: currency,
        sub_total: totalAmount,
        tax_amount: 0,
        shipping_amount: 0,
        grand_total: totalAmount,
        status: 'Pending',
        notes: notes,
        created_date: new Date().toISOString()
      }

      const items = selectedParts.map(p => ({
        part_number: p.catalogItem?.part_number,
        description: p.catalogItem?.description,
        quantity: p.quantity,
        unit_price: p.unit_price,
        total_price: p.quantity * (p.unit_price || 0),
        part_table_name: p.tableName,
        part_id: p.mechanical_manufacture_id || p.mechanical_bought_out_part_id || p.electrical_manufacture_id || p.electrical_bought_out_part_id || p.pneumatic_bought_out_part_id
      }))

      return purchaseOrdersApi.createPurchaseOrderWithItems(poData as any, items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      alert('Purchase Order created successfully!')
      onClose()
    },
    onError: (error: any) => {
      alert(`Failed to create PO: ${error.message}`)
    }
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-3xl">
          <div className="bg-primary-900 px-6 py-6 flex items-center justify-between text-white relative h-32">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShoppingCart className="h-24 w-24" />
             </div>
             <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tight">Generate Purchase Order</h3>
                <p className="text-primary-200 text-xs font-bold uppercase tracking-widest mt-1">Project: {project.project_name}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors relative z-10">
                <X className="h-6 w-6" />
             </button>
          </div>

          <div className="p-8 space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</p>
                <p className="text-xl font-black text-gray-900">{selectedParts.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Value</p>
                <p className="text-xl font-black text-primary-600 tabular-nums">{currency} {totalAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Project</p>
                <p className="text-xs font-black text-gray-900 truncate">{project.project_number}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Supplier</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    <option value="">Choose a supplier...</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 italic mt-1">* Recommended based on selected parts</p>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Currency</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
               </div>
            </div>

            {/* Selected Parts List Preview */}
            <div className="space-y-3">
               <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Selected Items Preview</label>
               <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {selectedParts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                       <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white border border-gray-200 rounded flex items-center justify-center text-[10px] font-black text-gray-400">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900">{p.catalogItem?.part_number}</p>
                            <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{p.catalogItem?.description}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-gray-900 tabular-nums">x{p.quantity}</p>
                          <p className="text-[10px] text-gray-500 tabular-nums">{currency} {(p.quantity * (p.unit_price || 0)).toFixed(2)}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">PO Notes (Optional)</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all min-h-[80px]"
                  placeholder="Shipping instructions, terms, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-4 text-sm font-black text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                disabled={mutation.isPending || !supplierId}
                onClick={() => mutation.mutate()}
                className="flex-[2] inline-flex items-center justify-center px-4 py-4 border border-transparent shadow-lg shadow-primary-200 text-sm font-black rounded-2xl text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-widest"
              >
                {mutation.isPending ? 'Processing...' : 'Confirm & Create PO'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePOFromBOMModal
