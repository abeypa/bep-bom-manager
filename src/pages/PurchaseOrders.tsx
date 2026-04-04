import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersApi, POStatus } from '@/api/parts-api/purchase-orders'
import { 
  Search, Plus, FileText, ShoppingCart, Calendar, Factory, 
  ExternalLink, Trash2, ChevronDown, Filter, Package, AlertCircle, 
  CheckCircle, Clock, Truck, Ban, Archive
} from 'lucide-react'
import PODetailModal from '@/components/purchase-orders/PODetailModal'

const STATUS_CONFIG: Record<string, { color: string; icon: any }> = {
  Pending: { color: 'text-amber-700 bg-amber-50 border-amber-100', icon: Clock },
  Sent: { color: 'text-blue-700 bg-blue-50 border-blue-100', icon: FileText },
  Confirmed: { color: 'text-indigo-700 bg-indigo-50 border-indigo-100', icon: CheckCircle },
  Partial: { color: 'text-orange-700 bg-orange-50 border-orange-100', icon: Package },
  Received: { color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: Truck },
  Cancelled: { color: 'text-red-700 bg-red-50 border-red-100', icon: Ban }
}

const PurchaseOrders = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPOId, setSelectedPOId] = useState<number | null>(null)

  const { data: purchaseOrders, isLoading } = useQuery<any[]>({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrdersApi.getAll()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.deletePO(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    }
  })

  const filteredPOs = (purchaseOrders || []).filter(po => {
    const s = searchTerm.toLowerCase()
    const matchesSearch = (
      (po.po_number?.toLowerCase() || '').includes(s) ||
      (po.suppliers?.name?.toLowerCase() || '').includes(s) ||
      (po.project?.project_name?.toLowerCase() || '').includes(s) ||
      (po.project_number?.toLowerCase() || '').includes(s)
    )
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = (e: React.MouseEvent, id: number, status: string) => {
    e.stopPropagation()
    if (status !== 'Pending' && status !== 'Cancelled') {
      alert('Only Pending or Cancelled POs can be deleted.')
      return
    }
    if (confirm('Are you sure you want to delete this Purchase Order?')) {
      deleteMutation.mutate(id)
    }
  }

  // Status counts for filter badges
  const statusCounts = (purchaseOrders || []).reduce((acc: Record<string, number>, po: any) => {
    acc[po.status] = (acc[po.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6 text-gray-900">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Procurement</h1>
          <p className="text-gray-500 font-bold text-xs mt-1 uppercase tracking-widest flex items-center gap-2">
            <Archive className="w-3 h-3" />
            Purchase Order Lifecycle & Stock Intake
          </p>
        </div>
        <button 
          onClick={() => { window.location.hash = '#/projects' }}
          className="flex items-center gap-2 bg-gray-900 text-white px-7 py-3.5 rounded-2xl font-black text-xs shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus className="w-4 h-4" />
          Create Order
        </button>
      </div>

      {/* Modern Filter Bar */}
      <div className="bg-white p-2.5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-[2] relative group">
          <Search className="w-4 h-4 absolute left-5 top-4 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
          <input
            type="text"
            className="w-full bg-gray-50/50 border-transparent rounded-[1.5rem] py-3.5 pl-12 pr-4 text-xs font-bold outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 focus:border-gray-200 transition-all placeholder:text-gray-400"
            placeholder="Search by PO #, Supplier, or Project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex-1 flex gap-1.5 p-1 bg-gray-50 rounded-[1.5rem] overflow-x-auto no-scrollbar">
          {['all', 'Pending', 'Sent', 'Confirmed', 'Partial', 'Received', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2.5 text-[10px] font-black rounded-2xl whitespace-nowrap transition-all uppercase tracking-widest ${
                statusFilter === status
                  ? 'bg-white text-gray-900 shadow-md scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {status}
              {status !== 'all' && statusCounts[status] !== undefined && (
                <span className="ml-2 py-0.5 px-1.5 rounded-md bg-gray-100 text-gray-400">
                   {statusCounts[status]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">Order Reference</th>
                <th className="px-8 py-5">Partner / Project</th>
                <th className="px-8 py-5">Lifecycle Status</th>
                <th className="px-8 py-5 text-right">Commitment</th>
                <th className="px-8 py-5">Issue Date</th>
                <th className="px-8 py-5 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                 Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded-full w-full"></div></td>
                  </tr>
                 ))
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center opacity-10">
                      <ShoppingCart className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">Empty Procurement Record</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const config = STATUS_CONFIG[po.status] || STATUS_CONFIG.Pending;
                  const Icon = config.icon;
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPOId(po.id)}
                      className="group hover:bg-gray-50/50 transition-all cursor-pointer"
                    >
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-gray-900 font-mono tracking-tight group-hover:text-primary-600 transition-colors">
                          #{po.po_number}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">PO ARCHIVE ID: {po.id}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-300">
                             {po.suppliers?.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-gray-800 tracking-tight">{po.suppliers?.name}</div>
                            <div className="text-[10px] text-gray-400 font-medium tracking-tight">
                               {po.project?.project_name || 'N/A'} &middot; <span className="font-mono">{po.project_number}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[10px] font-black rounded-xl border transition-all ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {po.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="text-sm font-black text-gray-900 tabular-nums">
                          {po.currency} {po.grand_total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                           Total Payables
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          {new Date(po.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <button className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:text-gray-900 group-hover:bg-white group-hover:shadow-sm transition-all shadow-gray-100">
                              <ExternalLink className="w-4 h-4" />
                           </button>
                           {(po.status === 'Pending' || po.status === 'Cancelled') && (
                             <button
                               onClick={(e) => handleDelete(e, po.id, po.status)}
                               disabled={deleteMutation.isPending}
                               className="p-2.5 bg-red-50/50 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PODetailModal
        isOpen={selectedPOId !== null}
        onClose={() => setSelectedPOId(null)}
        poId={selectedPOId}
      />
    </div>
  )
}

export default PurchaseOrders
