import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Eye, Download } from 'lucide-react';
import { purchaseOrdersApi } from '../api/purchase-orders';
import PODetailModal from '../components/purchase-orders/PODetailModal';
import exportUtils from '../utils/export';
import { useToast } from '../context/ToastContext';

export default function PurchaseOrders() {
  const { showToast } = useToast();
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPOId, setSelectedPOId] = useState<number | null>(null);

  const loadPOs = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrdersApi.getAll();
      setPos(data);
    } catch (err) {
      showToast('error', 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOs();
  }, []);

  const filteredPOs = pos.filter(po =>
    po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    po.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportPO = async (po: any) => {
    try {
      // 1. Fetch full PO with line items (not included in the main list query)
      const fullPO = await purchaseOrdersApi.getById(po.id) as any;
      
      if (!fullPO) {
        showToast('error', 'Could not find PO details in system');
        return;
      }

      // 2. Map snapshot data to common terms
      const items = (fullPO.purchase_order_items || []).map((item: any) => ({
        ...item,
        part_number: item.part_number || 'N/A',
        description: item.description || '-'
      }));

      const poToExport = { ...fullPO, purchase_order_items: items };
      
      exportUtils.exportPOToCSV(poToExport);
      showToast('success', `PO ${po.po_number} exported with ${items.length} items!`);
    } catch (err) {
      console.error('Export error:', err);
      showToast('error', 'Failed to export PO details');
    }
  };

  const handleRowClick = (poId: number) => {
    setSelectedPOId(poId);
  };

  const handleModalClose = () => {
    setSelectedPOId(null);
    loadPOs();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Purchase Orders</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 border rounded-2xl hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filter
          </button>
          <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800">
            <Plus className="w-5 h-5" />
            New PO
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search PO number or supplier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border rounded-3xl focus:outline-none focus:border-black"
        />
      </div>

      <div className="bg-white border rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-8 py-5">PO Number</th>
              <th className="text-left px-8 py-5">Supplier</th>
              <th className="text-left px-8 py-5">Project</th>
              <th className="text-right px-8 py-5">Total</th>
              <th className="text-center px-8 py-5">Status</th>
              <th className="text-center px-8 py-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPOs.map((po) => (
              <tr key={po.id} className="border-b hover:bg-gray-50">
                <td className="px-8 py-5 font-medium cursor-pointer" onClick={() => handleRowClick(po.id)}>
                  #{po.po_number}
                </td>
                <td className="px-8 py-5 cursor-pointer" onClick={() => handleRowClick(po.id)}>
                  {po.suppliers?.name}
                </td>
                <td className="px-8 py-5 text-gray-600 cursor-pointer" onClick={() => handleRowClick(po.id)}>
                  {po.project?.project_name || '-'}
                </td>
                <td className="px-8 py-5 text-right font-semibold cursor-pointer" onClick={() => handleRowClick(po.id)}>
                  ₹{po.grand_total || po.total_amount || 0}
                </td>
                <td className="px-8 py-5 text-center cursor-pointer" onClick={() => handleRowClick(po.id)}>
                  <span className={`inline-block px-4 py-1 text-xs font-medium rounded-3xl ${po.status === 'Received' ? 'bg-emerald-100 text-emerald-700' : po.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                    {po.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleExportPO(po); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 rounded-2xl"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPOId && (
        <PODetailModal
          isOpen={true}
          onClose={handleModalClose}
          poId={selectedPOId}
          onStatusUpdated={loadPOs}
        />
      )}
    </div>
  );
}
