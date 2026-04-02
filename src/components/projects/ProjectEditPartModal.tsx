import { useState, useEffect } from 'react'
import { X, Save } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'

interface ProjectEditPartModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: number
  projectPart: any
}

export const ProjectEditPartModal = ({ isOpen, onClose, projectId, projectPart }: ProjectEditPartModalProps) => {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    quantity: 1,
    unit_price: 0,
    currency: 'USD',
    reference_designator: '',
    notes: '',
    update_master: false
  })

  useEffect(() => {
    if (projectPart && isOpen) {
      setFormData({
        quantity: projectPart.quantity || 1,
        unit_price: projectPart.unit_price || 0,
        currency: projectPart.currency || 'USD',
        reference_designator: projectPart.reference_designator || '',
        notes: projectPart.notes || '',
        update_master: false
      })
    }
  }, [projectPart, isOpen])

  if (!isOpen || !projectPart) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await projectsApi.updatePartInSection(projectPart.id, formData)
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      onClose()
    } catch (error) {
      console.error('Error updating part:', error)
      alert('Failed to update part.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-xl shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 leading-6">Edit BOM Part</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.unit_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="INR">INR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reference Designator</label>
                <input
                  type="text"
                  value={formData.reference_designator}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference_designator: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-bold"
                  placeholder="e.g. R1, C2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-medium"
              />
            </div>

            <div className="flex items-center space-x-2 py-2">
              <input
                id="update_master"
                type="checkbox"
                checked={formData.update_master}
                onChange={(e) => setFormData(prev => ({ ...prev, update_master: e.target.checked }))}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="update_master" className="text-xs font-bold text-gray-600 uppercase tracking-tight">
                Update master part pricing/description
              </label>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-primary-600 border border-transparent rounded-lg shadow-lg shadow-primary-100 hover:bg-primary-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
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

export default ProjectEditPartModal
