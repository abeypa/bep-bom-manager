import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Package, 
  Projector, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Factory,
  ArrowRight
} from 'lucide-react';
import { purchaseOrdersApi } from '@/api/purchase-orders';
import { useToast } from '@/context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function ProcurementDashboard() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);
  const [selectedParts, setSelectedParts] = useState<Set<number>>(new Set());

  const { data: pendingParts, isLoading } = useQuery({
    queryKey: ['pending-procurement'],
    queryFn: () => purchaseOrdersApi.getPendingParts()
  });

  const generatePOMutation = useMutation({
    mutationFn: async ({ supplierId, parts }: { supplierId: number, parts: any[] }) => {
      const firstPart = parts[0];
      // Robust project ID extraction with multiple fallbacks
      const projectId = firstPart.section?.project_id || firstPart.section?.project?.id;
      
      if (!projectId) {
        console.error('Missing project Context for part:', firstPart);
        throw new Error('Mandatory Project ID not found for the selected items. Cannot generate PO.');
      }
      
      const poData = {
        supplier_id: supplierId,
        project_id: projectId,
        po_number: `CPO-${Date.now().toString().slice(-8)}`,
        po_date: new Date().toISOString(),
        status: 'Draft',
        grand_total: parts.reduce((acc, p) => acc + (p.quantity * p.unit_price * (1 - (p.discount_percent / 100))), 0),
        total_items: parts.length,
        notes: `Consolidated PO${parts.some(p => p.section?.project_id !== projectId) ? ' (Multi-Project)' : ''} generated from Global Procurement Registry.`,
        created_date: new Date().toISOString()
      };

      const poItems = parts.map(p => ({
        part_type: p.mechanical_manufacture_id ? 'mechanical_manufacture' : 
                   p.mechanical_bought_out_part_id ? 'mechanical_bought_out' :
                   p.electrical_manufacture_id ? 'electrical_manufacture' :
                   p.electrical_bought_out_part_id ? 'electrical_bought_out' : 'pneumatic_bought_out',
        part_id: p.mechanical_manufacture_id || p.mechanical_bought_out_part_id || 
                 p.electrical_manufacture_id || p.electrical_bought_out_part_id || p.pneumatic_bought_out_part_id,
        part_number: p.mechanical_manufacture?.part_number || p.mechanical_bought_out?.part_number || 
                    p.electrical_manufacture?.part_number || p.electrical_bought_out?.part_number || 
                    p.pneumatic_bought_out?.part_number || 'N/A',
        description: p.mechanical_manufacture?.description || p.mechanical_bought_out?.description || 
                    p.electrical_manufacture?.description || p.electrical_bought_out?.description || 
                    p.pneumatic_bought_out?.description || '',
        quantity: p.quantity,
        unit_price: p.unit_price,
        discount_percent: p.discount_percent,
        total_amount: p.quantity * p.unit_price * (1 - (p.discount_percent / 100)),
        project_part_id: p.id
      }));

      return purchaseOrdersApi.createPurchaseOrderWithItems(poData as any, poItems);
    },
    onSuccess: () => {
      showToast('success', 'Consolidated Draft PO generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pending-procurement'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      setSelectedParts(new Set());
      navigate('/purchase-orders');
    },
    onError: (error: any) => {
      showToast('error', `Failed to generate PO: ${error.message}`);
    }
  });

  const togglePartSelection = (id: number) => {
    const next = new Set(selectedParts);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedParts(next);
  };

  const getSupplierName = (p: any) => {
    return p.mechanical_manufacture?.suppliers?.name || 
           p.mechanical_bought_out?.suppliers?.name || 
           p.electrical_manufacture?.suppliers?.name || 
           p.electrical_bought_out?.suppliers?.name || 
           p.pneumatic_bought_out?.suppliers?.name || 'Unassigned';
  };

  const getSupplierId = (p: any) => {
    return p.mechanical_manufacture?.supplier_id || 
           p.mechanical_bought_out?.supplier_id || 
           p.electrical_manufacture?.supplier_id || 
           p.electrical_bought_out?.supplier_id || 
           p.pneumatic_bought_out?.supplier_id || null;
  };

  const groupedBySupplier = pendingParts?.reduce((acc: any, p: any) => {
    const sId = getSupplierId(p);
    const sName = getSupplierName(p);
    if (!acc[sName]) acc[sName] = { id: sId, parts: [] };
    acc[sName].parts.push(p);
    return acc;
  }, {}) || {};

  const filteredSuppliers = Object.entries(groupedBySupplier)
    .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b[1] as any).parts.length - (a[1] as any).parts.length);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            Global Supply Chain Registry
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase leading-none">Procurement Manager</h1>
        </div>

        <div className="flex items-center gap-4">
           {selectedParts.size > 0 && (
             <button 
              onClick={() => {
                const partsToPO = pendingParts?.filter((p: any) => selectedParts.has(p.id)) || [];
                if (partsToPO.length === 0) return;
                
                const suppId = getSupplierId(partsToPO[0]);
                // Basic validation: all selected must be same supplier
                const sameSupplier = partsToPO.every((p: any) => getSupplierId(p) === suppId);
                if (!sameSupplier) {
                  showToast('error', 'Select items from a SINGLE supplier for one PO');
                  return;
                }
                generatePOMutation.mutate({ supplierId: suppId, parts: partsToPO });
              }}
              className="px-8 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-3 hover:bg-indigo-700 transition-all scale-110"
             >
                <ShoppingCart className="w-4 h-4" />
                Release Group PO ({selectedParts.size})
             </button>
           )}
        </div>
      </div>

      <div className="relative">
        <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text"
          placeholder="Filter by Supplier or Partner..."
          className="w-full bg-white border border-gray-100 rounded-[2rem] pl-16 pr-8 py-5 text-sm font-bold shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-gray-50 rounded-[3rem] animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {filteredSuppliers.map(([name, data]: [string, any]) => (
             <div key={name} className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-indigo-100 transition-all duration-500">
                <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center group-hover:bg-indigo-50/30 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                         <Factory className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                         <h3 className="text-xl font-black tracking-tight text-gray-900 leading-none mb-1">{name}</h3>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{data.parts.length} PENDING ITEMS</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Total Value</p>
                      <p className="text-xl font-black text-gray-900 tabular-nums italic">
                        ₹{data.parts.reduce((sum: number, p: any) => sum + (p.quantity * p.unit_price), 0).toLocaleString()}
                      </p>
                   </div>
                </div>

                <div className="flex-1 p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                   {data.parts.map((p: any) => {
                      const isSelected = selectedParts.has(p.id);
                      const partNumber = p.mechanical_manufacture?.part_number || p.mechanical_bought_out?.part_number || 
                                       p.electrical_manufacture?.part_number || p.electrical_bought_out?.part_number || 
                                       p.pneumatic_bought_out?.part_number || 'N/A';
                      return (
                         <div 
                           key={p.id} 
                           onClick={() => togglePartSelection(p.id)}
                           className={`p-5 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center group/item ${
                             isSelected ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50/30 border-gray-50 hover:bg-white hover:border-gray-200'
                           }`}
                         >
                            <div className="flex items-center gap-4 flex-1">
                               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                 isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-300'
                               }`}>
                                  {isSelected ? <CheckCircle2 className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                               </div>
                               <div className="min-w-0">
                                  <p className="text-sm font-black text-gray-900 truncate tracking-tight">{partNumber}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                     <Projector className="w-3 h-3 text-gray-300" />
                                     <p className="text-[9px] font-bold text-gray-400 uppercase truncate">
                                        {p.section?.project?.project_name} <span className="mx-1 opacity-30 text-gray-900">•</span> {p.section?.section_name}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            <div className="text-right ml-4">
                               <p className="text-[11px] font-black text-gray-900 tabular-nums">x{p.quantity}</p>
                               <p className="text-[9px] font-black text-indigo-500 tabular-nums italic">₹{p.unit_price.toLocaleString()}</p>
                            </div>
                         </div>
                      );
                   })}
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-50">
                    <button 
                      onClick={() => {
                        const allSuppIds = new Set(data.parts.map((p: any) => p.id));
                        const next = new Set(selectedParts);
                        const allSelected = data.parts.every((p: any) => selectedParts.has(p.id));
                        
                        if (allSelected) {
                          data.parts.forEach((p: any) => next.delete(p.id));
                        } else {
                          data.parts.forEach((p: any) => next.add(p.id));
                        }
                        setSelectedParts(next);
                      }}
                      className="w-full py-4 text-[10px] font-black text-gray-400 hover:text-indigo-600 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                    >
                       {data.parts.every((p: any) => selectedParts.has(p.id)) ? 'Deselect All' : 'Select All Supplier Items'}
                       <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
