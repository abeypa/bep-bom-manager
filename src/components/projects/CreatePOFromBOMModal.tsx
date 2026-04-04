import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Search, CheckCircle2, AlertCircle, ShoppingCart, Info, TrendingDown, DollarSign } from 'lucide-react'
import { suppliersApi } from '@/api/parts-api/suppliers'
import { purchaseOrdersApi } from '@/api/parts-api/purchase-orders'

interface Props {
  isOpen: boolean
  onClose: () => void
  project: any
  selectedPartIds: number[]
}

const CreatePOFromBOMModal = ({ isOpen, onClose, project, selectedPartIds }: Props) => {
  const queryClient = useQueryClient()
  const [supplierId, setSupplierId] = useState<string>('')
  const [currency, setCurrency] = useState<string>('INR')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getSuppliers()
  })

  // Flat list of selected parts utilizing V3 Snapshot Data
  const selectedParts = useMemo(() => {
    const list: any[] = []
    project.sections?.forEach((section: any) => {
      section.parts?.forEach((part: any) => {
        if (selectedPartIds.includes(part.id)) {
          // Resolve catalog data for part identity
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
            tableName,
            // CRITICAL: Pulling snapshot values for PO generation
            finalUnitPrice: part.base_price_at_assignment || part.unit_price || 0,
            finalCurrency: part.currency_at_assignment || part.currency || 'INR',
            finalDiscount: part.discount_percent_at_assignment || part.discount_percent || 0,
            snapshotSupplier: part.supplier_name_at_assignment || catalogItem?.suppliers?.name || 'Unknown'
          })
        }
      })
    })
    return list
  }, [project.sections, selectedPartIds])

  const { uniqueSuppliers, uniqueCurrencies } = useMemo(() => {
    const suppliers = new Set<string>()
    const currencies = new Set<string>()
    selectedParts.forEach(p => {
      if (p.snapshotSupplier) suppliers.add(p.snapshotSupplier)
      if (p.finalCurrency) currencies.add(p.finalCurrency)
    })
    return { 
      uniqueSuppliers: Array.from(suppliers), 
      uniqueCurrencies: Array.from(currencies) 
    }
  }, [selectedParts])

  // Total calculation using Snapshot Prices
  const totalAmount = useMemo(() => {
    return selectedParts.reduce((acc, p) => {
      return acc + (p.quantity * p.finalUnitPrice * (1 - (p.finalDiscount / 100)))
    }, 0)
  }, [selectedParts])

  // Auto-set currency if all parts match
  useEffect(() => {
    if (uniqueCurrencies.length === 1 && currency !== uniqueCurrencies[0]) {
      setCurrency(uniqueCurrencies[0])
    }
  }, [uniqueCurrencies, currency])

  const mutation = useMutation({
    mutationFn: async () => {
      if (!supplierId) throw new Error('Please select a supplier')

      const nowStr = new Date().toISOString().replace(/\D/g, '').slice(0, 14)

      const poData = {
        project_id: project.id,
        supplier_id: parseInt(supplierId),
        po_number: `PO-${nowStr}`,
        po_date: new Date().toISOString(),
        currency: currency,
        grand_total: totalAmount,
        total_items: selectedParts.length,
        total_quantity: selectedParts.reduce((acc, p) => acc + (p.quantity || 0), 0),
        status: 'Pending',
        notes: notes,
        terms: 'Locked BOM Snapshot Pricing applied. Payment: Net 30.',
        created_date: new Date().toISOString()
      }

      const items = selectedParts.map(p => ({
        purchase_order_id: 0, 
        part_type: p.tableName,
        part_number: p.catalogItem?.part_number || 'N/A',
        description: p.catalogItem?.description || '',
        quantity: p.quantity,
        unit_price: p.finalUnitPrice, // Snapshot Price
        discount_percent: p.finalDiscount, // Snapshot Discount
        total_amount: p.quantity * p.finalUnitPrice * (1 - (p.finalDiscount / 100)),
        project_part_id: p.id
      }))

      return purchaseOrdersApi.createPurchaseOrderWithItems(poData as any, items)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['project-pos', project.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      alert('Purchase Order created successfully with Snapshot Pricing!')
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
        <div className="fixed inset-0 transition-opacity bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="inline-block w-full max-w-2xl px-10 pt-10 pb-10 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-[3rem]">
          <div className="flex justify-between items-start mb-8">
             <div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">Procure from BOM</h3>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Generating Purchase Order for {project.project_name}</p>
             </div>
             <button onClick={onClose} className="p-2.5 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all">
                <X className="h-6 w-6" />
             </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
             <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Items</p>
                <div className="flex items-center gap-2">
                   <Package className="w-4 h-4 text-gray-300" />
                   <p className="text-2xl font-black text-gray-900 tabular-nums">{selectedParts.length}</p>
                </div>
             </div>
             <div className="bg-gray-900 p-5 rounded-3xl shadow-xl shadow-gray-200 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-widest mb-1 leading-none">Locked Value</p>
                <div className="flex items-center gap-2">
                   <DollarSign className="w-4 h-4 text-gray-500" />
                   <p className="text-2xl font-black text-white tabular-nums">{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 1 })}</p>
                </div>
             </div>
             <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Currency</p>
                <div className="px-3 py-1 bg-white rounded-lg border border-gray-100 text-sm font-black text-gray-900">{currency}</div>
             </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-5 flex items-start gap-4 mb-8">
             <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
               <Info className="w-4 h-4" />
             </div>
             <div>
               <h4 className="text-xs font-black text-blue-800 uppercase tracking-[0.1em]">Snapshot Pricing Enforcement</h4>
               <p className="text-xs text-blue-600 font-medium mt-1 leading-relaxed">
                  This PO is using prices **snapshot at the time of BOM assignment**. It bypasses the current master catalog prices to ensure budget compliance.
               </p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Target Supplier</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none transition-all appearance-none cursor-pointer"
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                  >
                    <option value="">-- SELECT PARTNER --</option>
                    {suppliers?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">PO Currency</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-gray-900 outline-none transition-all appearance-none cursor-pointer"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR - Indian Rupee (₹)</option>
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                  </select>
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">BOM Item Preview</label>
               <div className="max-h-52 overflow-y-auto pr-3 space-y-2 custom-scrollbar">
                  {selectedParts.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/30 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-900 transition-all group">
                       <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-[10px] font-black text-gray-300 group-hover:text-gray-900 transition-colors">
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate tracking-tight">{p.catalogItem?.part_number}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest truncate max-w-[250px]">{p.catalogItem?.description || 'N/A'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-gray-900 tabular-nums">x{p.quantity}</p>
                          <div className="flex items-center gap-1.5 text-[10px] justify-end">
                             <span className="font-bold text-gray-400 tabular-nums">{currency}</span>
                             <span className="font-black text-gray-900 tabular-nums">{(p.finalUnitPrice * (1 - (p.finalDiscount / 100))).toFixed(1)}</span>
                             {p.finalDiscount > 0 && <span className="bg-emerald-100 text-emerald-700 px-1.5 rounded-lg border border-emerald-200">-{p.finalDiscount}%</span>}
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Internal Procurement Notes</label>
                <textarea 
                  className="w-full bg-gray-50 border border-gray-200 rounded-3xl px-6 py-4 text-xs font-medium focus:ring-2 focus:ring-gray-900 outline-none transition-all min-h-[100px] resize-none"
                  placeholder="Payment terms, shipping instructions, or department-specific notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-4 text-xs font-black text-gray-400 hover:text-gray-900 uppercase tracking-[0.2em] transition-all"
              >
                Discard
              </button>
              <button
                disabled={mutation.isPending || !supplierId}
                onClick={() => mutation.mutate()}
                className="flex-[2] inline-flex items-center justify-center px-4 py-4 border border-transparent shadow-[0_20px_50px_rgba(31,41,55,0.1)] text-xs font-black rounded-[1.5rem] text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-95 uppercase tracking-[0.2em]"
              >
                {mutation.isPending ? 'Syncing...' : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-3" />
                    Authorize PO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePOFromBOMModal
