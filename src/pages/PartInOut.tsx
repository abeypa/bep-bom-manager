import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partInOutApi, PartInEntry } from '@/api/part-inout'
import { suppliersApi } from '@/api/suppliers'
import {
  ArrowDownToLine, ArrowUpFromLine, Search, Plus, Package, Calendar,
  Factory, Briefcase, MapPin, CheckCircle, AlertCircle, ChevronDown,
  ChevronRight, Box
} from 'lucide-react'

const PartInOut = () => {
  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in')

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Stock Movement</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track parts coming in from suppliers and going out to projects.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('in')}
          className={`flex items-center px-6 py-3.5 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'in'
              ? 'border-green-600 text-green-700 bg-green-50/50'
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ArrowDownToLine className="h-4 w-4 mr-2" />
          Part In
          <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black">Stock Receipt</span>
        </button>
        <button
          onClick={() => setActiveTab('out')}
          className={`flex items-center px-6 py-3.5 text-sm font-bold uppercase tracking-widest border-b-2 transition-all ${
            activeTab === 'out'
              ? 'border-orange-600 text-orange-700 bg-orange-50/50'
              : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
        >
          <ArrowUpFromLine className="h-4 w-4 mr-2" />
          Part Out
          <span className="ml-2 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-black">Project Usage</span>
        </button>
      </div>

      {activeTab === 'in' ? <PartInTab /> : <PartOutTab />}
    </div>
  )
}

// ─── PART IN TAB ───

const PartInTab = () => {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [selectedPartStr, setSelectedPartStr] = useState('')
  const [supplierId, setSupplierId] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [poNumber, setPoNumber] = useState('')
  const [notes, setNotes] = useState('')
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0])

  const { data: partInHistory, isLoading } = useQuery({
    queryKey: ['part-in-history'],
    queryFn: () => partInOutApi.getPartInHistory()
  })

  const { data: allParts, isLoading: partsLoading } = useQuery({
    queryKey: ['all-parts-flat'],
    queryFn: () => partInOutApi.getAllPartsFlat(),
    enabled: showForm
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getSuppliers(),
    enabled: showForm
  })

  const receiveMutation = useMutation({
    mutationFn: (entry: PartInEntry) => partInOutApi.receivePartIn(entry),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['part-in-history'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['all-parts-flat'] })
      alert(`Stock updated! New stock quantity: ${result.newStock}`)
      resetForm()
    },
    onError: (err: any) => alert(`Failed: ${err.message}`)
  })

  const resetForm = () => {
    setSelectedPartStr('')
    setSupplierId('')
    setQuantity(1)
    setPoNumber('')
    setNotes('')
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartStr || !supplierId) return

    const [partType, partIdStr] = selectedPartStr.split('::')
    const partId = parseInt(partIdStr)
    const selectedPart = allParts?.find((p: any) => p.part_type === partType && p.id === partId)
    const selectedSupplier = suppliers?.find(s => s.id === parseInt(supplierId))

    if (!selectedPart || !selectedSupplier) return

    receiveMutation.mutate({
      part_type: partType as any,
      part_number: selectedPart.part_number,
      part_id: partId,
      supplier_name: selectedSupplier.name,
      supplier_id: parseInt(supplierId),
      quantity,
      po_number: poNumber || undefined,
      notes: notes || undefined,
      received_date: new Date(receivedDate).toISOString()
    })
  }

  const filteredHistory = (partInHistory || []).filter((log: any) =>
    log.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex-1 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
            placeholder="Search by part number or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Receive Stock
        </button>
      </div>

      {/* Receive Form */}
      {showForm && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-4 flex items-center">
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Receive Parts into Stock
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Select Part *</label>
              {partsLoading ? (
                <div className="py-2 text-sm text-gray-400">Loading parts...</div>
              ) : (
                <select
                  required
                  value={selectedPartStr}
                  onChange={(e) => setSelectedPartStr(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
                >
                  <option value="">-- Select Part --</option>
                  {allParts?.map((p: any) => (
                    <option key={`${p.part_type}::${p.id}`} value={`${p.part_type}::${p.id}`}>
                      {p.part_number} - {p.description || 'N/A'} (Stock: {p.stock_quantity})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Supplier *</label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
              >
                <option value="">-- Select Supplier --</option>
                {suppliers?.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">PO Reference</label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-20260401..."
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Received Date</label>
              <input
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>

            <div className="flex items-end space-x-3">
              <button
                type="submit"
                disabled={receiveMutation.isPending || !selectedPartStr || !supplierId}
                className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-200 disabled:opacity-50 transition-all"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {receiveMutation.isPending ? 'Processing...' : 'Receive'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 bg-white border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="flex-1 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg border border-gray-200">
        <div className="h-full overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td></tr>
                ))
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                    <ArrowDownToLine className="mx-auto h-12 w-12 text-gray-200 mb-4" />
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No stock receipts recorded</h3>
                    <p className="text-xs text-gray-400 mt-1">Click "Receive Stock" to log incoming parts</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                      <Calendar className="h-3 w-3 inline mr-1.5 text-gray-400" />
                      {new Date(log.use_date_time).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">{log.part_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Factory className="h-4 w-4 text-gray-400 mr-2" />
                        {log.supplier_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-green-700 tabular-nums">
                      +{log.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                      {log.po_reference || '-'}
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

// ─── PART OUT TAB ───

const PartOutTab = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'flat' | 'grouped'>('grouped')
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const { data: flatHistory, isLoading: flatLoading } = useQuery({
    queryKey: ['part-out-history'],
    queryFn: () => partInOutApi.getPartOutHistory(),
    enabled: viewMode === 'flat'
  })

  const { data: groupedHistory, isLoading: groupedLoading } = useQuery({
    queryKey: ['part-out-by-project'],
    queryFn: () => partInOutApi.getPartOutByProject(),
    enabled: viewMode === 'grouped'
  })

  const isLoading = viewMode === 'flat' ? flatLoading : groupedLoading

  const toggleProject = (projectName: string) => {
    const next = new Set(expandedProjects)
    if (next.has(projectName)) next.delete(projectName)
    else next.add(projectName)
    setExpandedProjects(next)
  }

  const filteredGrouped = (groupedHistory || []).filter((g: any) =>
    g.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.logs.some((l: any) => l.part_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredFlat = (flatHistory || []).filter((log: any) =>
    log.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Search + View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
            placeholder="Search by part or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'grouped' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            By Project
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
              viewMode === 'flat' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            All Records
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : viewMode === 'grouped' ? (
          /* Grouped by Project */
          filteredGrouped.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
              <ArrowUpFromLine className="mx-auto h-12 w-12 text-gray-200 mb-4" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No part usage recorded</h3>
              <p className="text-xs text-gray-400 mt-1">Parts will appear here when added to projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrouped.map((group: any) => (
                <div key={group.projectName} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <button
                    onClick={() => toggleProject(group.projectName)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {expandedProjects.has(group.projectName) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <Briefcase className="h-5 w-5 text-orange-500" />
                      <div className="text-left">
                        <span className="text-sm font-bold text-gray-900">{group.projectName}</span>
                        <p className="text-[10px] text-gray-400 font-medium">{group.totalParts} items &middot; {group.totalQuantity} total qty</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full tabular-nums">
                      {group.totalQuantity} units out
                    </span>
                  </button>

                  {expandedProjects.has(group.projectName) && (
                    <div className="border-t border-gray-100">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Part Number</th>
                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Part Type</th>
                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Qty Used</th>
                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Site</th>
                            <th className="px-6 py-2 text-left text-[10px] font-bold text-gray-400 uppercase">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {group.logs.map((log: any) => (
                            <tr key={log.id} className="hover:bg-gray-50/50">
                              <td className="px-6 py-2.5">
                                <span className="text-sm font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{log.part_number}</span>
                              </td>
                              <td className="px-6 py-2.5 text-xs text-gray-500">{log.part_table_name?.replace(/_/g, ' ')}</td>
                              <td className="px-6 py-2.5 text-sm font-black text-orange-700 tabular-nums">-{log.quantity}</td>
                              <td className="px-6 py-2.5 text-xs text-gray-500 italic">
                                <MapPin className="h-3 w-3 inline mr-1 text-gray-400" />
                                {log.site_name || 'Main Site'}
                              </td>
                              <td className="px-6 py-2.5 text-xs text-gray-500 font-mono">{new Date(log.use_date_time).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          /* Flat View */
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlat.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No records found</td></tr>
                ) : (
                  filteredFlat.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-xs text-gray-600 font-mono">{new Date(log.use_date_time).toLocaleString()}</td>
                      <td className="px-6 py-3 text-sm font-bold text-gray-900">{log.project_name}</td>
                      <td className="px-6 py-3"><span className="text-sm font-mono font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{log.part_number}</span></td>
                      <td className="px-6 py-3 text-sm font-black text-orange-700 tabular-nums">-{log.quantity}</td>
                      <td className="px-6 py-3 text-xs text-gray-500 italic">{log.site_name || 'Main Site'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default PartInOut
