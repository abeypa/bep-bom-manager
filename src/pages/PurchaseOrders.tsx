import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { purchaseOrdersApi } from '@/api/purchase-orders'
import { Search, Plus, FileText, ShoppingCart, Calendar, Factory, DollarSign, ExternalLink } from 'lucide-react'

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: purchaseOrders, isLoading } = useQuery<any[]>({
    queryKey: ['purchase-orders'],
    queryFn: () => purchaseOrdersApi.getPurchaseOrders()
  })

  const filteredPOs = (purchaseOrders || []).filter(po => {
    const s = searchTerm.toLowerCase()
    return (
      (po.po_number?.toLowerCase() || '').includes(s) ||
      (po.suppliers?.name?.toLowerCase() || '').includes(s) ||
      (po.projects?.project_name?.toLowerCase() || '').includes(s) ||
      (po.projects?.project_number?.toLowerCase() || '').includes(s)
    )
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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Purchase Orders</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium font-mono">
            Track and manage project procurement cycles.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => {
              // Redirect to projects to create PO from BOM (Standard Workflow)
              // Or in future, open a global PO wizard
              window.location.hash = '#/projects'
            }}
            className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-lg shadow-primary-100 text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Create PO
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 text-sm border-gray-200 rounded-xl py-3 px-4 border outline-none bg-white shadow-sm transition-all"
            placeholder="Search POs by number, supplier, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
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
                filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600 font-mono">
                      {po.po_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Factory className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{(po as any).suppliers?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm text-gray-900">
                        <span className="font-medium">{(po as any).projects?.project_name || 'N/A'}</span>
                        <span className="text-xs text-gray-500 font-mono">{(po as any).projects?.project_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900 font-bold tabular-nums">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: po.currency }).format(po.grand_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1.5" />
                        {new Date(po.po_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 bg-primary-50 p-1.5 rounded transition-all">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PurchaseOrders