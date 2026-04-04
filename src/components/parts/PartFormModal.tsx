import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Save, FileUp, Factory, Upload, FileText, Image as ImageIcon, Box } from 'lucide-react'
import { partsApi, PartCategory } from '@/api/parts'
import { suppliersApi } from '@/api/parts-api/suppliers'
import FileUpload from '../ui/FileUpload'

interface PartFormModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: PartCategory
  partToEdit?: any | null
}

const PartFormModal = ({ isOpen, onClose, activeTab, partToEdit }: PartFormModalProps) => {
  const queryClient = useQueryClient()
  const isManufacture = activeTab.includes('manufacture')

  const [formData, setFormData] = useState<any>({
    part_number: '',
    description: '',
    stock_quantity: 0,
    min_stock_level: 0,
    base_price: 0,
    currency: 'INR',
    discount_percent: 0,
    manufacturer: '',
    manufacturer_part_number: '',
    supplier_id: null,
    beperp_part_no: '',
    material: '',
    finish: '',
    port_size: '',
    operating_pressure: '',
    specifications: '',
    notes: '',
    // File paths
    image_path: null,
    pdf_path: null,
    pdf2_path: null,
    pdf3_path: null,
    cad_file_url: null
  })

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getSuppliers(),
    enabled: isOpen
  })

  useEffect(() => {
    if (partToEdit) {
      setFormData({
        ...partToEdit,
        currency: partToEdit.currency || 'INR',
        discount_percent: partToEdit.discount_percent || 0
      })
    } else {
      setFormData({
        part_number: '',
        description: '',
        stock_quantity: 0,
        min_stock_level: 0,
        base_price: 0,
        currency: 'INR',
        discount_percent: 0,
        manufacturer: '',
        manufacturer_part_number: '',
        supplier_id: null,
        beperp_part_no: '',
        material: '',
        finish: '',
        port_size: '',
        operating_pressure: '',
        specifications: '',
        notes: '',
        image_path: null,
        pdf_path: null,
        pdf2_path: null,
        pdf3_path: null,
        cad_file_url: null
      })
    }
  }, [partToEdit, isOpen])

  const createMutation = useMutation({
    mutationFn: (newPart: any) => partsApi.createPart(activeTab, newPart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', activeTab] })
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (updatedPart: any) => partsApi.updatePart(activeTab, partToEdit.id, updatedPart),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts', activeTab] })
      onClose()
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (partToEdit) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : (value === '' ? null : value)
    }))
  }

  const handleFileUpload = (key: string, url: string) => {
    setFormData((prev: any) => ({ ...prev, [key]: url }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-20">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight italic">
              {partToEdit ? 'Edit Asset' : 'New Master Entry'}
            </h3>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
              Category: {activeTab.replace(/_/g, ' ')}
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all hover:rotate-90">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          
          {/* Section 1: Identification */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-gray-900 rounded-full" />
               <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Part Identification</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 focus-within:border-gray-900 transition-all">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Internal Part Number *</label>
                <input
                  type="text"
                  name="part_number"
                  required
                  value={formData.part_number || ''}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-bold outline-none tabular-nums"
                  placeholder="e.g. MECH-2024-001"
                />
              </div>

              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 focus-within:border-gray-900 transition-all">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Supplier Selection</label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id || ''}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-bold outline-none cursor-pointer appearance-none"
                >
                  <option value="">-- Master Registry --</option>
                  {suppliers?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {!isManufacture && (
                <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 focus-within:border-gray-900 transition-all">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Manufacturer Part No.</label>
                  <input
                    type="text"
                    name="manufacturer_part_number"
                    value={formData.manufacturer_part_number || ''}
                    onChange={handleChange}
                    className="block w-full bg-transparent text-sm font-bold outline-none"
                    placeholder="OEM Reference"
                  />
                </div>
              )}

              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 focus-within:border-gray-900 transition-all">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">ERP Integration ID</label>
                <input
                  type="text"
                  name="beperp_part_no"
                  value={formData.beperp_part_no || ''}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-bold outline-none"
                  placeholder="Cross-platform UID"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 focus-within:border-gray-900 transition-all">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Global Description *</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description || ''}
                  onChange={handleChange}
                  required
                  className="block w-full bg-transparent text-sm font-medium outline-none resize-none"
                  placeholder="Detailed part specification..."
                />
              </div>
            </div>
          </section>

          {/* Section 2: Commercials & Stock */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
               <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Inventory & Pricing</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Stock Level</label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity || 0}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-black tabular-nums outline-none"
                />
              </div>
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Safety Buffer</label>
                <input
                  type="number"
                  name="min_stock_level"
                  value={formData.min_stock_level || 0}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-black tabular-nums outline-none text-red-500"
                />
              </div>
              <div className="p-4 bg-gray-900 rounded-3xl shadow-xl shadow-gray-200">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Base Price (Snapshot)</label>
                <div className="flex items-center">
                   <span className="text-gray-500 font-black mr-2">₹</span>
                   <input
                    type="number"
                    name="base_price"
                    step="0.01"
                    value={formData.base_price || 0}
                    onChange={handleChange}
                    className="block w-full bg-transparent text-sm font-black tabular-nums text-white outline-none"
                  />
                </div>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Standard Disc. %</label>
                <input
                  type="number"
                  name="discount_percent"
                  step="0.1"
                  value={formData.discount_percent || 0}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-black tabular-nums outline-none text-emerald-600"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Technical Docs & Files */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
               <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Digital Assets & Engineering</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <ImageIcon className="w-4 h-4 text-blue-500" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Part Visual</span>
                  </div>
                  <FileUpload
                    existingUrl={formData.image_path}
                    onUpload={(url) => handleFileUpload('image_path', url)}
                    bucket="part-images"
                    label="Image"
                  />
               </div>

               <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <Box className="w-4 h-4 text-purple-500" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CAD Geometry</span>
                  </div>
                  <FileUpload
                    existingUrl={formData.cad_file_url}
                    onUpload={(url) => handleFileUpload('cad_file_url', url)}
                    bucket="cad-files"
                    label="Model"
                  />
               </div>

               <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                     <FileText className="w-4 h-4 text-emerald-500" />
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Primary Datasheet</span>
                  </div>
                  <FileUpload
                    existingUrl={formData.pdf_path}
                    onUpload={(url) => handleFileUpload('pdf_path', url)}
                    bucket="pdf-files"
                    label="Datasheet"
                  />
               </div>

               <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-gray-400">
                     <FileText className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Audit PDF 2</span>
                  </div>
                  <FileUpload
                    existingUrl={formData.pdf2_path}
                    onUpload={(url) => handleFileUpload('pdf2_path', url)}
                    bucket="pdf-files"
                    label="Certificates"
                  />
               </div>

               <div className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-gray-400">
                     <FileText className="w-4 h-4" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Drawing PDF 3</span>
                  </div>
                  <FileUpload
                    existingUrl={formData.pdf3_path}
                    onUpload={(url) => handleFileUpload('pdf3_path', url)}
                    bucket="pdf-files"
                    label="Drawings"
                  />
               </div>
            </div>
          </section>

          {/* Section 4: Specifications */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-1.5 h-6 bg-gray-300 rounded-full" />
               <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Engineering Specifications</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {(isManufacture || activeTab === 'pneumatic_bought_out') && (
                  <div className="md:col-span-2 grid grid-cols-2 gap-4">
                     <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Material / Grade</label>
                        <input name="material" value={formData.material || ''} onChange={handleChange} className="w-full bg-transparent text-sm font-bold outline-none" />
                     </div>
                     <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Coating / Finish</label>
                        <input name="finish" value={formData.finish || ''} onChange={handleChange} className="w-full bg-transparent text-sm font-bold outline-none" />
                     </div>
                  </div>
               )}
               <div className="md:col-span-2 p-4 bg-gray-50/50 rounded-3xl border border-gray-100">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Technical Summary</label>
                <textarea
                  name="specifications"
                  rows={2}
                  value={formData.specifications || ''}
                  onChange={handleChange}
                  className="block w-full bg-transparent text-sm font-medium outline-none resize-none"
                  placeholder="Dimensions, tolerances, or power ratings..."
                />
              </div>
            </div>
          </section>

          {/* Spacer for footer */}
          <div className="h-10" />
        </form>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-gray-50 flex justify-end gap-5 bg-white sticky bottom-0 z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em] hover:text-gray-900 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="inline-flex items-center px-12 py-4 bg-gray-900 text-white text-xs font-black rounded-3xl shadow-2xl shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em]"
          >
            {createMutation.isPending || updateMutation.isPending ? 'Propagating...' : (
              <>
                <Save className="h-4 w-4 mr-3" />
                Commit to Registry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PartFormModal
