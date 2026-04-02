const Suppliers = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage supplier information and contact details.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Suppliers Module</h3>
        <p className="text-gray-600 mb-4">
          This page will display all suppliers with contact information and performance metrics.
        </p>
        <div className="text-sm text-gray-500">
          <p>Features coming soon:</p>
          <ul className="mt-2 space-y-1">
            <li>• Supplier list with contact details</li>
            <li>• Supplier performance tracking</li>
            <li>• Integration with purchase orders</li>
            <li>• Supplier categorization and tags</li>
            <li>• Document management for contracts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Suppliers