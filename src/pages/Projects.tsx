const Projects = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
        <p className="mt-2 text-sm text-gray-600">
          Track engineering projects, sections, and assigned parts.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Projects Module</h3>
        <p className="text-gray-600 mb-4">
          This page will display all projects with sections, milestones, and assigned parts.
        </p>
        <div className="text-sm text-gray-500">
          <p>Features coming soon:</p>
          <ul className="mt-2 space-y-1">
            <li>• Project list with status indicators</li>
            <li>• Project detail view with sections</li>
            <li>• Gantt chart for project timeline</li>
            <li>• Part assignment to project sections</li>
            <li>• Project cost tracking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Projects