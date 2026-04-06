import React, { useState, useEffect } from 'react';
import { X, Truck, CheckCircle, Trash2, IndianRupee, Calendar, Upload, FileText, ExternalLink } from 'lucide-react';
import { purchaseOrdersApi } from '../../api/purchase-orders';
import { useToast } from '../../context/ToastContext';

interface PODetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  poId: number;
  onStatusUpdated?: () => void;
}

export default function PODetailModal({
  isOpen,
  onClose,
  poId,
  onStatusUpdated,
}: PODetailModalProps) {
  const { showToast } = useToast();
  const [po, setPo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bepPoPdfUrl, setBepPoPdfUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isOpen || !poId) return;
    loadPO();
  }, [isOpen, poId]);

  const loadPO = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersApi.getById(poId) as any;
      setPo(data);
      setBepPoPdfUrl(data.bep_po_pdf_url || '');
    } catch (err) {
      showToast('error', 'Failed to load PO details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePdf = async () => {
    try {
      setIsUpdating(true);
      await purchaseOrdersApi.updatePurchaseOrder(poId, { bep_po_pdf_url: bepPoPdfUrl });
      showToast('success', 'PO document URL updated');
      await loadPO();
    } catch (err: any) {
      showToast('error', 'Failed to update document URL');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReleasePO = async () => {
    if (!bepPoPdfUrl) {
      showToast('error', 'Please attach BEP PO PDF before releasing');
      return;
    }

    try {
      setIsUpdating(true);
      await purchaseOrdersApi.releasePO(poId);
      showToast('success', 'PO released successfully!');
      await loadPO();
      onStatusUpdated?.();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus: any) => {
    try {
      setIsUpdating(true);
      await purchaseOrdersApi.updateStatus(poId, newStatus);
      showToast('success', `Status updated to ${newStatus}`);
      await loadPO();
      onStatusUpdated?.();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const daysUntilDelivery = po?.expected_delivery_date
    ? Math.ceil((new Date(po.expected_delivery_date).getTime() - Date.now()) / (1000 * 3600 * 24))
    : null;

  if (!isOpen) return null;

  const statusColors: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-700 border-gray-200',
    Released: 'bg-blue-100 text-blue-700 border-blue-200',
    Sent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Partial: 'bg-amber-100 text-amber-700 border-amber-200',
    Received: 'bg-green-100 text-green-700 border-green-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-10 py-8 border-b flex items-center justify-between bg-gray-50/50">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-gray-900 leading-none">PO #{po?.po_number}</h1>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[po?.status] || 'bg-gray-100'}`}>
                {po?.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4" />
                {po?.suppliers?.name}
              </span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(po?.po_date).toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white hover:shadow-xl rounded-2xl transition-all active:scale-95 group">
            <X className="w-6 h-6 text-gray-400 group-hover:text-gray-900" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-10 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hydrating Details...</p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                {/* Expected Delivery Card */}
                {po?.expected_delivery_date && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-center gap-5">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1">Expected Delivery</p>
                      <p className="text-xl font-black text-blue-900">
                        {new Date(po.expected_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      {daysUntilDelivery !== null && (
                        <p className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${daysUntilDelivery > 0 ? 'text-blue-600' : 'text-red-600 animate-pulse'}`}>
                          {daysUntilDelivery > 0 
                            ? `${daysUntilDelivery} days remaining` 
                            : daysUntilDelivery === 0 ? 'Delivery Due Today' : 'Delivery Overdue'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Total Value Card */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-3xl p-6 flex items-center gap-5">
                  <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Total PO Value</p>
                    <p className="text-xl font-black text-emerald-900 tabular-nums">
                      {po?.grand_total?.toLocaleString('en-IN', { style: 'currency', currency: po?.currency || 'INR' })}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Net Total + Taxes</p>
                  </div>
                </div>
              </div>

              {/* Enhanced BEP PO PDF Control */}
              <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">PO Documentation</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Attach the authorized BEP PO document to enable release.</p>
                  </div>
                  {po?.bep_po_pdf_url && (
                    <a 
                      href={po.bep_po_pdf_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 underline underline-offset-4"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View current PDF
                    </a>
                  )}
                </div>

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={bepPoPdfUrl}
                      onChange={(e) => setBepPoPdfUrl(e.target.value)}
                      placeholder="Enter BEP PO PDF URL (e.g., Supabase Storage link)"
                      className="w-full bg-white border border-gray-200 rounded-2xl px-14 py-4 text-xs font-bold focus:ring-2 focus:ring-gray-900 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleUpdatePdf}
                    disabled={isUpdating || bepPoPdfUrl === po?.bep_po_pdf_url}
                    className="px-8 py-4 bg-white border border-gray-200 text-xs font-black rounded-2xl hover:bg-gray-50 disabled:opacity-50 transition-all uppercase tracking-widest"
                  >
                    Save URL
                  </button>
                </div>
              </div>

              {/* Status Workflow Action */}
              {po?.status === 'Draft' && (
                <div className="bg-gray-900 rounded-[2rem] p-10 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-all duration-500"></div>
                  <div className="relative z-10">
                    <h2 className="text-xl font-black text-white tracking-tight mb-2">Ready to Release PO?</h2>
                    <p className="text-sm text-gray-400 font-medium mb-10 max-w-md mx-auto">
                      Releasing the PO locks the configuration and marks it as an official procurement request. PDF attachment is mandatory.
                    </p>
                    <button
                      onClick={handleReleasePO}
                      disabled={isUpdating || !bepPoPdfUrl}
                      className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-700 text-white text-xs font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 uppercase tracking-[0.2em] disabled:shadow-none"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      {bepPoPdfUrl ? 'Initiate PO Release' : 'Attach PDF to Release'}
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Status Transitions (Released/Sent states) */}
              {['Released', 'Sent', 'Confirmed', 'Partial'].includes(po?.status) && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Procurement Workflow</h3>
                  <div className="flex flex-wrap gap-3">
                    {po.status === 'Released' && (
                      <button 
                        onClick={() => handleStatusUpdate('Sent')}
                        className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-widest"
                      >
                        Mark as Sent to Supplier
                      </button>
                    )}
                    {(po.status === 'Sent' || po.status === 'Released') && (
                      <button 
                        onClick={() => handleStatusUpdate('Confirmed')}
                        className="px-6 py-3 bg-emerald-600 text-white text-[10px] font-black rounded-xl hover:bg-emerald-700 transition-all uppercase tracking-widest"
                      >
                        Confirm Receipt by Supplier
                      </button>
                    )}
                    {po.status !== 'Received' && po.status !== 'Cancelled' && (
                      <button 
                        onClick={() => handleStatusUpdate('Cancelled')}
                        className="px-6 py-3 bg-white border border-red-200 text-red-600 text-[10px] font-black rounded-xl hover:bg-red-50 transition-all uppercase tracking-widest"
                      >
                        Cancel Purchase Order
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">PO Line Items</h3>
                <div className="border border-gray-100 rounded-3xl overflow-hidden bg-white shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Part Detail</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ordered</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Received</th>
                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(() => {
                        const grouped = new Map<string, any>();
                        (po?.purchase_order_items || []).forEach((item: any) => {
                          const pn = item.part_number || 'N/A';
                          if (!grouped.has(pn)) {
                            grouped.set(pn, {
                              ...item,
                              quantity: 0,
                              received_qty: 0,
                              total_amount: 0,
                              projectNumbers: new Set<string>()
                            });
                          }
                          const g = grouped.get(pn);
                          g.quantity += (item.quantity || 0);
                          g.received_qty += (item.received_qty || 0);
                          g.total_amount += (item.total_amount || 0);
                          const prjNo = item.project_part?.project_section?.project?.project_number;
                          if (prjNo) {
                            g.projectNumbers.add(prjNo);
                          }
                        });
                        return Array.from(grouped.values()).map((item: any) => (
                          <tr key={item.part_number} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-5">
                              <p className="text-sm font-black text-gray-900 tracking-tight">{item.part_number}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">{item.description}</p>
                              {item.projectNumbers.size > 0 && (
                                <p className="text-[9px] text-indigo-500 font-bold uppercase truncate">
                                  Prj: {Array.from(item.projectNumbers).join(', ')}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className="text-sm font-black text-gray-600 tabular-nums">{item.quantity}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={`text-sm font-black tabular-nums ${item.received_qty > 0 ? (item.received_qty >= item.quantity ? 'text-green-600' : 'text-amber-600') : 'text-gray-300'}`}>
                                {item.received_qty || 0}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <p className="text-sm font-black text-gray-900 tabular-nums">
                                 {item.total_amount?.toLocaleString('en-IN', { style: 'currency', currency: po?.currency || 'INR' })}
                               </p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tabular-nums">@{item.unit_price}</p>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-10 py-6 border-t flex justify-between items-center bg-gray-50/50">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Last Updated: {po?.updated_date ? new Date(po.updated_date).toLocaleString() : 'N/A'}
          </p>
          <button 
            onClick={onClose} 
            className="px-10 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95 uppercase tracking-[0.2em]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
