import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Save, FileUp } from 'lucide-react'
import { partsApi, PartCategory } from '@/api/parts'
import { supabase } from '@/lib/supabase'

interface PartFormModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: PartCategory
  partToEdit?: any | null
}

const PartFormModal = ({ isOpen, onClose, activeTab, partToEdit }: PartFormModalProps) => {
  const queryClient = useQueryClient()
  const isManufacture = activeTab.includes('manufacture')

  const [formData, setFormData] = useState<any>(partToEdit || {
    part_number: '',
    description: '',
    stock_quantity: 0,
    min_stock_level: 0,
    base_price: 0,
    currency: 'USD',
    manufacturer: '',
    manufacturer_part_number: '',
    supplier_id: null
  })

  // Mutations
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {partToEdit ? 'Edit Part' : 'Add New Part'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Part Number *</label>
              <input
                type="text"
                name="part_number"
                required
                value={formData.part_number}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
            
            {!isManufacture && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Manuf. Part Number</label>
                <input
                  type="text"
                  name="manufacturer_part_number"
                  value={formData.manufacturer_part_number || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            )}
            
            <div className={`md:col-span-2`}>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Base Price</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="base_price"
                  step="0.01"
                  value={formData.base_price}
                  onChange={handleChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
                />
              </div>
            </div>

            {isManufacture && (
              <div className="md:col-span-2 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileUp className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2 text-sm text-gray-600">
                  <span className="text-primary-600 font-medium cursor-pointer hover:underline">Upload CAD/PDF files</span>
                  {' '}or drag and drop
                </div>
                <p className="text-xs text-gray-500 mt-1">Files will be saved to Supabase Storage</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="inline-flex justify-center flex-row items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PartFormModal
