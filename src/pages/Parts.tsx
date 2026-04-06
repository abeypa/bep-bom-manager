import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { partsApi, PartCategory } from '@/api/parts'
import { useToast } from '@/context/ToastContext'
import { 
  Search, Plus, FileDown, MoreHorizontal, FileText, Image as ImageIcon, 
  Trash2, Edit, Package, Upload, History, Grid, List
} from 'lucide-react'
import PartFormModal from '@/components/parts/PartFormModal'
import PartImportModal from '@/components/parts/PartImportModal'
import PriceHistoryModal from '@/components/parts/PriceHistoryModal'
import PartDetailModal from '@/components/parts/PartDetailModal'

const TABS: { id: PartCategory; name: string }[] = [
  { id: 'electrical_bought_out', name: 'Elec Bought-Out' },
  { id: 'mechanical_manufacture', name: 'Mech Manufacture' },
  { id: 'mechanical_bought_out', name: 'Mech Bought-Out' },
  { id: 'electrical_manufacture', name: 'Elec Manufacture' },
  { id: 'pneumatic_bought_out', name: 'Pneumatic' },
]

const Parts = () => {
  const { error: showToastError } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<PartCategory>('mechanical_manufacture')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [partToEdit, setPartToEdit] = useState<any | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [detailModal, setDetailModal] = useState<any>(null)
  
  // History Modal State
  const [historyModal, setHistoryModal] = useState<{
    isOpen: boolean;
    partId: number;
    partNumber: string;
    category: PartCategory;
  } | null>(null);

  const { data: parts, isLoading, isError } = useQuery({
    queryKey: ['parts', activeTab],
    queryFn: () => partsApi.getParts(activeTab),
    meta: {
      onError: () => showToastError('Failed to synchronize with registry')
    }
  })

  // Use useEffect to show toast if query fails (alternative to meta if using older React Query/V3)
  // But our context supports direct showToast as well.

  const handleAddPart = () => {
    setPartToEdit(null)
    setIsModalOpen(true)
  }

  const handleEditPart = (part: any) => {
    setPartToEdit(part)
    setIsModalOpen(true)
  }

  const handleShowHistory = (part: any) => {
    setHistoryModal({
      isOpen: true,
      partId: part.id,
      partNumber: part.part_number,
      category: activeTab
    });
  }

  const uniqueSuppliers = Array.from(new Set((parts || []).map((p: any) => p.suppliers?.name).filter(Boolean))).sort()

  const filteredParts = (parts || []).filter((p: any) => {
    const matchesSearch = 
      p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.manufacturer_part_number?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSupplier = selectedSupplier === '' || p.suppliers?.name === selectedSupplier

    return matchesSearch && matchesSupplier
  })

  const getStockBadge = (stock: number, min: number) => {
    if (stock <= 0) return { color: 'bg-red-50 text-red-700 border-red-100', text: 'Out of Stock' }
    if (stock <= min) return { color: 'bg-amber-50 text-amber-700 border-amber-100', text: 'Low Stock' }
    return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', text: 'In Stock' }
  }

  const isManufacture = activeTab.includes('manufacture')

  return (
    <div className="h-full flex flex-col p-6 max-w-[1600px] mx-auto overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-200">
               <Package className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Parts Master</h1>
          </div>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Asset Repository & BOM Sources</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Toggle */}
          <div className="bg-white border border-gray-100 shadow-sm rounded-[1.5rem] p-1.5 flex mr-2">
            <button 
                onClick={() => setViewMode('grid')} 
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
                onClick={() => setViewMode('table')} 
                className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
                title="Table View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center px-6 py-3.5 border border-gray-100 shadow-sm text-[10px] font-black rounded-2xl text-gray-600 bg-white hover:bg-gray-50 transition-all uppercase tracking-widest"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import
          </button>
          
          <button 
            onClick={handleAddPart}
            className="inline-flex items-center px-8 py-4 border border-transparent shadow-2xl shadow-gray-200 text-[10px] font-black rounded-[1.5rem] text-white bg-gray-900 hover:bg-gray-800 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Asset
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="bg-white border border-gray-100 p-1.5 rounded-[2rem] shadow-sm inline-flex min-w-full md:min-w-0 space-x-1">
            {TABS.map((tab) => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                whitespace-nowrap py-4 px-8 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all
                ${activeTab === tab.id
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-[1.02]'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}
                `}
            >
                {tab.name}
            </button>
            ))}
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="mb-10 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
            <Search className="h-6 w-6 absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-gray-900 transition-colors" />
            <input
                type="text"
                className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 text-lg font-bold shadow-sm outline-none focus:ring-4 focus:ring-gray-100/50 transition-all placeholder:text-gray-300"
                placeholder="Search by part number or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="md:w-72 relative">
            <select
                className="w-full bg-white border border-gray-100 rounded-[2rem] py-5 px-8 text-sm font-black shadow-sm outline-none focus:ring-4 focus:ring-gray-100/50 transition-all appearance-none cursor-pointer uppercase tracking-widest text-gray-400 focus:text-gray-900"
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
            >
                <option value="">ALL PARTNERS</option>
                {uniqueSuppliers.map(s => (
                <option key={String(s)} value={String(s)}>{s as string}</option>
                ))}
            </select>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <MoreHorizontal className="w-5 h-5 rotate-90" />
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[600px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="flex flex-col justify-center items-center py-24 bg-white border border-gray-100 rounded-[3rem] shadow-sm text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                <Package className="h-12 w-12 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-widest italic">No matching assets</h3>
            <p className="text-gray-400 text-sm font-medium mt-3 max-w-sm">Refine your search or categories to find what you're looking for.</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-8">
                {filteredParts.map((part: any) => {
                  const badge = getStockBadge(part.stock_quantity, part.min_stock_level || 0);
                  return (
                    <div
                      key={part.id}
                      onClick={() => setDetailModal({ part, category: activeTab })}
                      className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all group cursor-pointer flex flex-col h-full relative border-b-4 hover:border-gray-900"
                    >
                      {/* Visual Area */}
                      <div className="aspect-square bg-gray-50/50 relative overflow-hidden flex items-center justify-center border-b border-gray-50">
                        {part.image_path ? (
                          <img
                            src={part.image_path}
                            alt={part.part_number}
                            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                        ) : (
                          <Package className="w-24 h-24 text-gray-100 group-hover:text-gray-200 transition-colors" />
                        )}
                        
                        {/* Stock Badge */}
                        <div className={`absolute top-6 right-6 px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-xl ${badge.color}`}>
                          {badge.text}
                        </div>
  
                        {/* Type Flag */}
                        <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/80 backdrop-blur-md border border-gray-100 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-widest">
                          {isManufacture ? 'Custom' : 'Sourced'}
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPart(part); }}
                          className="absolute top-2 right-2 p-2 bg-white border border-gray-100 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Edit Asset"
                        >
                          <Edit className="h-4 w-4 text-gray-600 hover:text-gray-900" />
                        </button>
                      </div>
        
                      {/* Details Area */}
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-3 mb-2">
                             <div className="text-xl font-black text-gray-900 tracking-tight font-mono line-clamp-1">{part.part_number}</div>
                             <div className="flex gap-2">
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleShowHistory(part); }}
                                      className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-emerald-500 rounded-xl hover:bg-emerald-50 shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                                      title="Price Audit"
                                  >
                                      <History className="w-5 h-5" />
                                  </button>
                             </div>
                          </div>
                          <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed mb-6 italic">"{part.description || 'Global specification missing...'}"</p>
                          
                          {part.suppliers?.name && (
                             <div className="flex items-center gap-3 mb-6 bg-gray-50/50 p-3 rounded-2xl border border-gray-100 group/sup">
                                <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">{part.suppliers.name.charAt(0)}</div>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate">{part.suppliers.name}</span>
                             </div>
                          )}
                        </div>
        
                        <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                          <div>
                            <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2 px-1">Unit Valuation</div>
                            <div className="text-3xl font-black text-gray-900 tabular-nums tracking-tighter italic">
                               <span className="text-sm font-black mr-1 not-italic text-gray-300">₹</span>
                               {part.base_price?.toLocaleString('en-IN', { minimumFractionDigits: 1 })}
                            </div>
                          </div>
                          
                          <div className="flex gap-1.5 mb-2">
                             {part.pdf_path && <div className="w-2.5 h-2.5 bg-red-400 rounded-full shadow-[0_0_10px_rgba(248,113,113,0.4)]" title="Datasheet Linked" />}
                             {part.cad_file_url && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.4)]" title="CAD/3D Linked" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-[3rem] shadow-sm overflow-hidden min-w-full">
                <table className="min-w-full divide-y divide-gray-50">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-10 py-7 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Asset Identity</th>
                            <th className="px-10 py-7 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Valuation</th>
                            <th className="px-10 py-7 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Registry Status</th>
                            <th className="px-10 py-7 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Technical</th>
                            <th className="px-14 py-7 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredParts.map((part: any) => (
                            <tr key={part.id} className="group hover:bg-gray-50/80 transition-colors cursor-pointer" onClick={() => setDetailModal({ part, category: activeTab })}>
                                <td className="px-10 py-7">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                            {part.image_path ? <img src={part.image_path} className="w-10 h-10 object-contain p-1" /> : <Package className="w-8 h-8 text-gray-100" />}
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-gray-900 tracking-tight font-mono">{part.part_number}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-1.5 truncate max-w-[300px]">"{part.description || 'No description provided'}"</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-7">
                                    <p className="text-xl font-black text-gray-900 tabular-nums tracking-tighter italic whitespace-nowrap">₹ {part.base_price?.toLocaleString('en-IN', { minimumFractionDigits: 1 })}</p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1.5">{part.currency}</p>
                                </td>
                                <td className="px-10 py-7">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-xl border text-[11px] font-black tabular-nums tracking-widest shadow-sm ${getStockBadge(part.stock_quantity, part.min_stock_level || 0).color}`}>
                                            {part.stock_quantity}
                                        </div>
                                        <span className="text-gray-300 text-[10px] font-black uppercase tracking-tighter">/ {part.min_stock_level}</span>
                                    </div>
                                </td>
                                <td className="px-10 py-7">
                                    <div className="flex gap-3">
                                        {part.pdf_path && <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />}
                                        {part.cad_file_url && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />}
                                        {part.manufacturer && <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{part.manufacturer}</span>}
                                    </div>
                                </td>
                                <td className="px-14 py-7 text-right">
                                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleShowHistory(part); }}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-emerald-500 rounded-xl shadow-lg shadow-gray-200/50 transition-all"
                                            title="View Price Audit"
                                        >
                                            <History className="h-5 w-5" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditPart(part); }}
                                            className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-900 rounded-xl shadow-lg shadow-gray-200/50 transition-all"
                                            title="Edit Asset"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <PartFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activeTab={activeTab}
        partToEdit={partToEdit}
      />
      
      <PartImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        activeTab={activeTab}
      />

      {detailModal && (
        <PartDetailModal
            isOpen={true}
            onClose={() => setDetailModal(null)}
            onEdit={handleEditPart}
            part={detailModal.part}
            category={detailModal.category}
        />
      )}
      
      {historyModal && (
        <PriceHistoryModal
          isOpen={historyModal.isOpen}
          onClose={() => setHistoryModal(null)}
          partTable={historyModal.category}
          partId={historyModal.partId}
          partNumber={historyModal.partNumber}
        />
      )}
    </div>
  )
}

export default Parts
