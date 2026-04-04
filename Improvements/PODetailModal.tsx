import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  X, Save, Trash2, ChevronRight, Package, FileText,
  CheckCircle, AlertCircle, Clock, Send, Ban, TruckIcon,
  Edit2, PackageCheck
} from 'lucide-react'
import { purchaseOrdersApi, POStatus } from '@/api/purchase-orders'

interface PODetailModalProps {
  isOpen: boolean
  onClose: () => void
  poId: number | null
}

const STATUS_ICONS: Record<string, any> = {
  Pending: Clock,
  Sent: Send,
  Confirmed: CheckCircle,
  Partial: Package,
  Received: PackageCheck,
  Cancelled: Ban
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Sent: 'bg-blue-100 text-blue-800 border-blue-200',
  Confirmed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Partial: 'bg-orange-100 text-orange-800 border-orange-200',
  Received: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200'
}

const PODetailModal = ({ isOpen, onClose, poId }: PODetailModalProps) => {
  const queryClient = useQueryClient()
  const [activeView, setActiveView] = useState<'details' | 'receive'>('details')
  const [isEditing, setIsEditing] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editTerms, setEditTerms] = useState('')
  const [receiveQuantities, setReceiveQuantities] = useState<Record<number, number>>({})

  const { data: po, isLoading } = useQuery({
    queryKey: ['purchase-order', poId],
    queryFn: () => purchaseOrdersApi.getPurchaseOrder(poId!),
    enabled: !!poId && isOpen
  })

  useEffect(() => {
    if (po) {
      setEditNotes(po.notes || '')
      setEditTerms(po.terms || '')
    }
  }, [po])

  // Initialize receive quantities when items load
  useEffect(() => {
    if (po?.items) {
      const defaults: Record<number, number> = {}
      ;(po.items as any[]).forEach((item: any) => {
        defaults[item.id] = item.quantity
      })
      setReceiveQuantities(defaults)
    }
  }, [po?.items])

  const validTransitions = useMemo(() => {
    if (!po) return []
    return purchaseOrdersApi.getValidTransitions(po.status as POStatus)
  }, [po?.status])

  // Status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: POStatus }) =>
      purchaseOrdersApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['project-pos'] })
    },
    onError: (err: any) => alert(err.message)
  })

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      purchaseOrdersApi.updatePurchaseOrder(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setIsEditing(false)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['project-pos'] })
      onClose()
    }
  })

  // Receive items mutation
  const receiveMutation = useMutation({
    mutationFn: () => {
      const items = Object.entries(receiveQuantities).map(([itemId, qty]) => ({
        itemId: parseInt(itemId),
        receivedQty: qty
      }))
      return purchaseOrdersApi.receiveItems(poId!, items)
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      alert(`Items received successfully! PO status: ${result.status}`)
      setActiveView('details')
    },
    onError: (err: any) => alert(`Receive failed: ${err.message}`)
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => purchaseOrdersApi.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-order', poId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    }
  })

  if (!isOpen || !poId) return null

  const handleSaveEdit = () => {
    editMutation.mutate({
      id: poId,
      data: { notes: editNotes, terms: editTerms }
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this Purchase Order? This cannot be undone.')) {
      deleteMutation.mutate(poId)
    }
  }

  const handleDeleteItem = (itemId: number) => {
    if (confirm('Remove this line item from the PO?')) {
      deleteItemMutation.mutate(itemId)
    }
  }

  const canReceive = po?.status === 'Confirmed' || po?.status === 'Partial'
  const canEdit = po?.status === 'Pending' || po?.status === 'Sent'
  const canDelete = po?.status === 'Pending' || po?.status === 'Cancelled'

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : !po ? (
            <div className="p-12 text-center text-gray-500">Purchase Order not found</div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gray-900 px-6 py-5 flex items-center justify-between text-white">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-black tracking-tight">{po.po_number}</h2>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${STATUS_COLORS[po.status]}`}>
                      {po.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1 font-medium">
                    {(po as any).suppliers?.name} &middot; {new Date(po.po_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-300 hover:text-red-100 hover:bg-red-900/50 rounded-lg transition-colors"
                      title="Delete PO"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                  <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Status Actions Bar */}
              {validTransitions.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center space-x-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Change Status:</span>
                  {validTransitions.map((status) => {
                    const Icon = STATUS_ICONS[status] || ChevronRight
                    return (
                      <button
                        key={status}
                        onClick={() => statusMutation.mutate({ id: poId, status })}
                        disabled={statusMutation.isPending}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border transition-all hover:scale-105 active:scale-95 ${
                          status === 'Cancelled'
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-primary-200 text-primary-700 hover:bg-primary-50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 mr-1.5" />
                        {status}
                      </button>
                    )
                  })}
                  {canReceive && (
                    <button
                      onClick={() => setActiveView('receive')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-all ml-auto"
                    >
                      <TruckIcon className="h-3.5 w-3.5 mr-1.5" />
                      Receive Items
                    </button>
                  )}
                </div>
              )}

              {/* Tab toggle */}
              <div className="px-6 pt-4 flex space-x-1 border-b border-gray-100">
                <button
                  onClick={() => setActiveView('details')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${
                    activeView === 'details'
                      ? 'bg-white border border-b-0 border-gray-200 text-gray-900'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Details & Items
                </button>
                {canReceive && (
                  <button
                    onClick={() => setActiveView('receive')}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-t-lg transition-colors ${
                      activeView === 'receive'
                        ? 'bg-white border border-b-0 border-gray-200 text-gray-900'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    Receive Stock
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeView === 'details' ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Project</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{(po as any).projects?.project_name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{(po as any).projects?.project_number}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</p>
                        <p className="text-lg font-black text-gray-900 mt-1 tabular-nums">{po.currency} {po.grand_total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</p>
                        <p className="text-lg font-black text-gray-900 mt-1 tabular-nums">{po.total_items}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Qty</p>
                        <p className="text-lg font-black text-gray-900 mt-1 tabular-nums">{po.total_quantity}</p>
                      </div>
                    </div>

                    {/* Notes / Terms (editable) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Notes & Terms</h4>
                        {canEdit && (
                          <button
                            onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                            disabled={editMutation.isPending}
                            className="inline-flex items-center text-xs font-bold text-primary-600 hover:text-primary-700"
                          >
                            {isEditing ? (
                              <><Save className="h-3.5 w-3.5 mr-1" /> Save</>
                            ) : (
                              <><Edit2 className="h-3.5 w-3.5 mr-1" /> Edit</>
                            )}
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Notes</label>
                            <textarea
                              rows={3}
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Terms</label>
                            <textarea
                              rows={3}
                              value={editTerms}
                              onChange={(e) => setEditTerms(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 italic">
                            {po.notes || 'No notes'}
                          </div>
                          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 italic">
                            {po.terms || 'No terms specified'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Line Items Table */}
                    <div>
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Line Items</h4>
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Part</th>
                              <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                              <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                              <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                              <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Disc %</th>
                              <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                              {canEdit && <th className="px-4 py-2.5 w-10"></th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {((po as any).items || []).map((item: any) => (
                              <tr key={item.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 font-mono">{item.part_number}</td>
                                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{item.description || '-'}</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{item.quantity}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums">{item.unit_price?.toFixed(2)}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 text-right tabular-nums">{item.discount_percent || 0}%</td>
                                <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{item.total_amount?.toFixed(2)}</td>
                                {canEdit && (
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-400 hover:text-red-600 transition-colors"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={canEdit ? 5 : 5} className="px-4 py-3 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Grand Total</td>
                              <td className="px-4 py-3 text-right text-sm font-black text-gray-900 tabular-nums">{po.currency} {po.grand_total?.toFixed(2)}</td>
                              {canEdit && <td></td>}
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Receive Items View */
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
                      <TruckIcon className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-green-800">Receive Items into Stock</h4>
                        <p className="text-xs text-green-700 mt-1">
                          Enter the quantity received for each item. Stock will be updated automatically.
                          If all items are fully received, PO status will change to "Received".
                          Otherwise it will be marked as "Partial".
                        </p>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase">Part Number</th>
                            <th className="px-4 py-2.5 text-left text-[10px] font-black text-gray-400 uppercase">Description</th>
                            <th className="px-4 py-2.5 text-right text-[10px] font-black text-gray-400 uppercase">Ordered</th>
                            <th className="px-4 py-2.5 text-center text-[10px] font-black text-gray-400 uppercase">Receive Qty</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {((po as any).items || []).map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50/50">
                              <td className="px-4 py-3 text-sm font-bold text-gray-900 font-mono">{item.part_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.description || '-'}</td>
                              <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right tabular-nums">{item.quantity}</td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={item.quantity}
                                  value={receiveQuantities[item.id] ?? item.quantity}
                                  onChange={(e) => setReceiveQuantities(prev => ({
                                    ...prev,
                                    [item.id]: parseInt(e.target.value) || 0
                                  }))}
                                  className="w-24 text-center border border-gray-300 rounded-lg py-1.5 text-sm font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setActiveView('details')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => receiveMutation.mutate()}
                        disabled={receiveMutation.isPending}
                        className="inline-flex items-center px-6 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-lg shadow-green-200 transition-all disabled:opacity-50"
                      >
                        <PackageCheck className="h-4 w-4 mr-2" />
                        {receiveMutation.isPending ? 'Processing...' : 'Confirm Receipt'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PODetailModal
