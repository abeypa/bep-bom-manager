import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { stockMovementsApi } from '@/api/stock-movements'
import {
  ArrowDownToLine, ArrowUpFromLine, Search, Plus, Filter,
  Calendar, Briefcase, Factory, User, FileText, RefreshCw,
  TrendingUp, RotateCcw, SlidersHorizontal, Package
} from 'lucide-react'
import StockMovementModal from '@/components/inventory/StockMovementModal'

const PartInOut = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'IN' | 'OUT' | 'ADJUST' | 'RESTORE'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: movements, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['stock-movements', activeTab],
    queryFn: () => stockMovementsApi.getAll({
      movement_type: activeTab === 'all' ? undefined : activeTab,
      limit: 100
    })
  })

  const getMovementStyles = (type: string) => {
    switch (type) {
      case 'IN': return { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: ArrowDownToLine };
      case 'OUT': return { color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', icon: ArrowUpFromLine };
      case 'ADJUST': return { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: SlidersHorizontal };
      case 'RESTORE': return { color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: RotateCcw };
      default: return { color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-100', icon: FileText };
    }
  };

  const filteredMovements = (movements || []).filter((m: any) =>
    m.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reference_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Stock Movements</h1>
          <p className="text-gray-500 font-medium text-sm mt-1 uppercase tracking-wider">Audit Trail • Real-time Inventory Logs</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => refetch()}
            className={`p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all ${isRefetching ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            New Adjustment
          </button>
        </div>
      </div>

      <StockMovementModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Tabs / Filters Container */}
      <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex p-1 bg-gray-50 rounded-2xl space-x-1">
          {['all', 'IN', 'OUT', 'ADJUST', 'RESTORE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-md scale-105'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'all' ? 'Everything' : tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 w-full max-w-md">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-4 top-3 text-gray-400 group-focus-within:text-gray-900 transition-colors" />
            <input
              type="text"
              placeholder="Filter by part, project, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-gray-900/5 focus:border-gray-200 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-gray-50 rounded-2xl hover:bg-gray-100 text-gray-400 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Metadata</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Movement</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Part Identification</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Impact</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Context / Reference</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Executor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                 Array(8).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-gray-50 rounded-full w-full"></div></td>
                  </tr>
                 ))
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <Package className="w-16 h-16 mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm">No transaction records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m: any) => {
                  const style = getMovementStyles(m.movement_type);
                  const Icon = style.icon;
                  return (
                    <tr key={m.id} className="group hover:bg-gray-50/40 transition-colors cursor-default">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-300" />
                          <div className="text-xs font-bold text-gray-500 tabular-nums">
                            {new Date(m.moved_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            <span className="block text-[10px] font-medium text-gray-300 uppercase mt-0.5">
                              {new Date(m.moved_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black rounded-xl border ${style.bg} ${style.color} ${style.border}`}>
                          <Icon className="w-3 h-3" />
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-mono text-sm font-bold text-gray-900 tracking-tight">{m.part_number}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter mt-0.5">{m.part_table_name?.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className={`text-base font-black tabular-nums ${m.quantity > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold tabular-nums mt-0.5 uppercase tracking-widest">
                          Stock: {m.stock_before} → {m.stock_after}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5">
                          {m.project_name && (
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <Briefcase className="w-3.5 h-3.5 text-gray-300" />
                              {m.project_name}
                            </div>
                          )}
                          {m.supplier_name && (
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                              <Factory className="w-3.5 h-3.5 text-gray-300" />
                              {m.supplier_name}
                            </div>
                          )}
                          {m.po_number && (
                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit">
                              PO: {m.po_number}
                            </div>
                          )}
                          {!m.project_name && !m.supplier_name && (
                            <div className="text-xs text-gray-400 italic font-medium">{m.reference_notes || 'No reference'}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">
                            {m.moved_by?.charAt(0) || 'S'}
                          </div>
                          <div className="text-xs font-bold text-gray-600">
                            {m.moved_by?.split('@')[0] || 'System'}
                            <span className="block text-[10px] font-medium text-gray-400 lowercase tracking-normal">{m.moved_by || 'automated'}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination / Status Footer */}
      <div className="flex justify-between items-center px-4">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Showing latest 100 movements • Auto-refresh active</p>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Previous</button>
          <button className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-900 transition-colors">Next Page</button>
        </div>
      </div>
    </div>
  )
}

export default PartInOut
