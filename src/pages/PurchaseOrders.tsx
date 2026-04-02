import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { purchaseOrdersApi, POStatus } from '@/api/purchase-orders'
import { Search, Plus, FileText, ShoppingCart, Calendar, Factory, ExternalLink, Trash2, ChevronDown } from 'lucide-react'
import PODetailModal from '@/components/purchase-orders/PODetailModal'

const PurchaseOrders = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedPOId, setSelectedPOId] = useState<number | null>(null)

  const { data: purchaseOrders, isLoading } = useQuery<any[]>({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrdersApi.getPurchaseOrders()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    }
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: POStatus }) =>
      purchaseOrdersApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    },
    onError: (err: any) => alert(err.message)
  })

  const filteredPOs = (purchaseOrders || []).filter(po => {
    const s = searchTerm.toLowerCase()
    const matchesSearch = (
      (po.po_number?.toLowerCase() || '').includes(s) ||
      (po.suppliers?.name?.toLowerCase() || '').includes(s) ||
      (po.projects?.project_name?.toLowerCase() || '').includes(s) ||
      (po.projects?.project_number?.toLowerCase() || '').includes(s)
    )
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      Sent: 'bg-blue-100 text-blue-800 border border-blue-200',
      Confirmed: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      Partial: 'bg-orange-100 text-orange-800 border border-orange-200',
      Received: 'bg-green-100 text-green-800 border border-green-200',
      Cancelled: 'bg-red-100 text-red-800 border border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
  }

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

  const handleQuickStatus = (e: React.MouseEvent, id: number, newStatus: POStatus) => {
    e.stopPropagation()
    statusMutation.mutate({ id, status: newStatus })
  }

  // Status counts for filter badges
  const statusCounts = (purchaseOrders || []).reduce((acc: Record<string, number>, po: any) => {
    acc[po.status] = (acc[po.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Track and manage project procurement cycles.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => { window.location.hash = '#/projects' }}
            className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-lg shadow-primary-100 text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all uppercase tracking-widest"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create PO
          </button>
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="mb-4 flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 text-sm border-gray-200 rounded-xl py-3 px-4 border outline-none bg-white shadow-sm"
            placeholder="Search POs by number, supplier, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          {['all', 'Pending', 'Sent', 'Confirmed', 'Partial', 'Received', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 text-xs font-bold rounded-lg border transition-all ${
                statusFilter === status
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status}
              {status !== 'all' && statusCounts[status] ? (
                <span className="ml-1.5 text-[10px]">({statusCounts[status]})</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg border border-gray-200">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-4 h-16">
                      <div className="h-4 bg-gray-100 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                    No purchase orders found
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po) => {
                  const transitions = purchaseOrdersApi.getValidTransitions(po.status as POStatus)
                  return (
                    <tr
                      key={po.id}
                      onClick={() => setSelectedPOId(po.id)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600 font-mono">
                        {po.po_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Factory className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{po.suppliers?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-sm text-gray-900">
                          <span className="font-medium">{po.projects?.project_name || 'N/A'}</span>
                          <span className="text-xs text-gray-500 font-mono">{po.projects?.project_number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 font-bold tabular-nums">
                        {po.currency} {po.grand_total?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          {new Date(po.po_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1" onClick={(e) => e.stopPropagation()}>
                          {/* Quick status change for common transitions */}
                          {transitions.length > 0 && transitions[0] !== 'Cancelled' && (
                            <button
                              onClick={(e) => handleQuickStatus(e, po.id, transitions[0])}
                              disabled={statusMutation.isPending}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-2 py-1 rounded transition-colors"
                              title={`Mark as ${transitions[0]}`}
                            >
                              → {transitions[0]}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedPOId(po.id)}
                            className="text-primary-600 hover:text-primary-900 bg-primary-50 p-1.5 rounded transition-all"
                            title="View Details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          {(po.status === 'Pending' || po.status === 'Cancelled') && (
                            <button
                              onClick={(e) => handleDelete(e, po.id, po.status)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded transition-all"
                              title="Delete PO"
                            >
                              <Trash2 className="h-4 w-4" />
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
