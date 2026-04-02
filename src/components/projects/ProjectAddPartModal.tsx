import { useState, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { partsApi, PartCategory } from '@/api/parts'
import { projectsApi } from '@/api/projects'

interface ProjectAddPartModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  sectionId: number
  sectionName: string
}

export const ProjectAddPartModal = ({ isOpen, onClose, projectId, sectionId, sectionName }: ProjectAddPartModalProps) => {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPartStr, setSelectedPartStr] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState<number>(0)
  const [currency, setCurrency] = useState('USD')
  const [referenceDesignator, setReferenceDesignator] = useState('')
  const [notes, setNotes] = useState('')
  const [siteName, setSiteName] = useState('Main Site')

  const categories: PartCategory[] = [
    'mechanical_manufacture',
    'mechanical_bought_out',
    'electrical_manufacture',
    'electrical_bought_out',
    'pneumatic_bought_out'
  ]

  const { data: allPartsData, isLoading } = useQuery({
    queryKey: ['allParts'],
    queryFn: async () => {
      const results = await Promise.all(
        categories.map(async (category) => {
          const parts = await partsApi.getParts(category)
          return { category, parts: parts || [] }
        })
      )
      return results
    },
    enabled: isOpen
  })

  // Handle selected part change to auto-fill price and currency
  useEffect(() => {
    if (selectedPartStr && allPartsData) {
      const [catStr, idStr] = selectedPartStr.split('::')
      const catParts = allPartsData.find(d => d.category === catStr)?.parts || []
      const part = catParts.find((p: any) => p.id === parseInt(idStr))
      
      if (part) {
        setUnitPrice(part.base_price || 0)
        if (part.currency) setCurrency(part.currency)
      }
    }
  }, [selectedPartStr, allPartsData])

  useEffect(() => {
    if (isOpen) {
      setSelectedPartStr('')
      setQuantity(1)
      setUnitPrice(0)
      setCurrency('USD')
      setReferenceDesignator('')
      setNotes('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPartStr) return

    setIsSubmitting(true)
    try {
      const [category, idStr] = selectedPartStr.split('::')
      const partId = parseInt(idStr)

      const payload: any = {
        project_section_id: sectionId,
        quantity,
        unit_price: unitPrice || 0,
        currency,
        reference_designator: referenceDesignator || null,
        notes: notes || null,
        site_name: siteName
      }

      if (category === 'mechanical_manufacture') payload.mechanical_manufacture_id = partId
      else if (category === 'mechanical_bought_out') payload.mechanical_bought_out_part_id = partId
      else if (category === 'electrical_manufacture') payload.electrical_manufacture_id = partId
      else if (category === 'electrical_bought_out') payload.electrical_bought_out_part_id = partId
      else if (category === 'pneumatic_bought_out') payload.pneumatic_bought_out_part_id = partId

      await projectsApi.addPartToSection(payload)
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      onClose()
    } catch (error) {
      console.error('Error adding part:', error)
      alert('Failed to add part to section.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCategoryLabel = (cat: string) => {
    return cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 leading-6">Add Part to {sectionName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="sr-only">Close</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Part</label>
              {isLoading ? (
                <div className="py-2 text-sm text-gray-500">Loading parts...</div>
              ) : (
                <select
                  required
                  value={selectedPartStr}
                  onChange={(e) => setSelectedPartStr(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">-- Select a Part --</option>
                  {allPartsData?.map((group) => (
                    <optgroup key={group.category} label={formatCategoryLabel(group.category)}>
                      {group.parts.map((p: any) => (
                        <option key={p.id} value={`${group.category}::${p.id}`}>
                          {p.part_number} - {p.description || 'No Description'} (Stock: {p.stock_quantity || 0})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Currency</label>
                <select
                  required
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Reference Designator</label>
              <input
                type="text"
                placeholder="e.g., R1, C2"
                value={referenceDesignator}
                onChange={(e) => setReferenceDesignator(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Target Site</label>
              <select
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="Main Site">Main Site</option>
                <option value="Client Site">Client Site</option>
                <option value="Packaging Site">Packaging Site</option>
                <option value="Assembly Site">Assembly Site</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedPartStr}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-primary-600 border border-transparent rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Part
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProjectAddPartModal
