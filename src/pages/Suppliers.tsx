import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersApi, Supplier } from '@/api/suppliers'
import { Search, Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react'
import SupplierFormModal from '@/components/suppliers/SupplierFormModal'
import { useRole } from '@/hooks/useRole'

const Suppliers = () => {
  const { isAdmin } = useRole()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null)

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getSuppliers()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => suppliersApi.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  const filteredSuppliers = (suppliers || []).filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddSupplier = () => {
    setSupplierToEdit(null)
    setIsModalOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this supplier? This will affect any parts linked to them.')) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your network of hardware and software suppliers.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={handleAddSupplier}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Supplier
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
            placeholder="Search suppliers by name, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 bg-white shadow rounded-lg overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suppliers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new supplier record.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddSupplier}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Supplier
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{supplier.name}</div>
                      {supplier.address && (
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{supplier.address}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{supplier.contact_person || '-'}</div>
                      <div className="space-y-1 mt-1">
                        {supplier.email && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Mail className="h-3 w-3 mr-1" /> {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Phone className="h-3 w-3 mr-1" /> {supplier.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {supplier.payment_terms || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditSupplier(supplier)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(supplier.id)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SupplierFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        supplierToEdit={supplierToEdit}
      />
    </div>
  )
}

export default Suppliers
