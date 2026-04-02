const Parts = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Parts Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all parts including mechanical, electrical, and pneumatic components.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Parts Module</h3>
        <p className="text-gray-600 mb-4">
          This page will display all parts with search, filter, and CRUD operations.
        </p>
        <div className="text-sm text-gray-500">
          <p>Features coming soon:</p>
          <ul className="mt-2 space-y-1">
            <li>• Tabbed interface for 5 part types</li>
            <li>• Search and filter functionality</li>
            <li>• Bulk import from Excel/JSON</li>
            <li>• File upload for drawings and datasheets</li>
            <li>• Low stock alerts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Parts