import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { partsApi, PartCategory } from '@/api/parts'
import { Search, Plus, FileDown, MoreHorizontal, FileText, Image as ImageIcon, Trash2, Edit, Package } from 'lucide-react'
import PartFormModal from '@/components/parts/PartFormModal'

const TABS: { id: PartCategory; name: string }[] = [
  { id: 'mechanical_manufacture', name: 'Mech Manufacture' },
  { id: 'mechanical_bought_out', name: 'Mech Bought Out' },
  { id: 'electrical_manufacture', name: 'Electrical Manufacture' },
  { id: 'electrical_bought_out', name: 'Electrical Bought Out' },
  { id: 'pneumatic_bought_out', name: 'Pneumatic' },
]

const Parts = () => {
  const [activeTab, setActiveTab] = useState<PartCategory>('mechanical_manufacture')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [partToEdit, setPartToEdit] = useState<any | null>(null)

  const handleAddPart = () => {
    setPartToEdit(null)
    setIsModalOpen(true)
  }

  const handleEditPart = (part: any) => {
    setPartToEdit(part)
    setIsModalOpen(true)
  }

  const { data: parts, isLoading } = useQuery({
    queryKey: ['parts', activeTab],
    queryFn: () => partsApi.getParts(activeTab)
  })

  const filteredParts = (parts || []).filter((p: any) => 
    p.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.manufacturer_part_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isManufacture = activeTab.includes('manufacture')

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Parts Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your engineering components and upload drawings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <FileDown className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Export
          </button>
          <button 
            onClick={handleAddPart}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Part
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3 border outline-none"
            placeholder="Search by part number or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="flex-1 bg-white shadow rounded-lg overflow-hidden flex flex-col min-h-[500px]">
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredParts.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No parts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new {TABS.find(t => t.id === activeTab)?.name} part.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleAddPart}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Part
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Part Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock / Min
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  {isManufacture && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Files
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredParts.map((part: any) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                          {part.image_path ? (
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Package className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{part.part_number}</div>
                          {part.beperp_part_no && (
                            <div className="text-xs text-gray-500">ERP: {part.beperp_part_no}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 line-clamp-2 max-w-xs" title={part.description}>
                        {part.description || '-'}
                      </div>
                      {part.manufacturer && (
                        <div className="text-xs text-gray-500 mt-1">{part.manufacturer} {part.manufacturer_part_number}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          part.stock_quantity <= part.min_stock_level ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {part.stock_quantity || 0}
                        </span>
                        <span className="text-gray-500 text-sm ml-2">/ {part.min_stock_level || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.currency} {part.base_price?.toFixed(2)}
                    </td>
                    {isManufacture && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {part.pdf_path && (
                            <button title="View Drawing PDF" className="text-red-500 hover:text-red-700">
                              <FileText className="h-4 w-4" />
                            </button>
                          )}
                          {part.cad_file_url && (
                            <button title="View CAD" className="text-blue-500 hover:text-blue-700">
                              <FileDown className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {part.suppliers?.name || 'No Supplier'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleEditPart(part)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PartFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        activeTab={activeTab}
        partToEdit={partToEdit}
      />
    </div>
  )
}

export default Parts