import { Package, FolderKanban, Users, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

const Dashboard = () => {
  // Mock data - in real app this would come from Supabase
  const stats = [
    { name: 'Total Parts', value: '1,234', icon: Package, color: 'bg-blue-500' },
    { name: 'Active Projects', value: '8', icon: FolderKanban, color: 'bg-green-500' },
    { name: 'Suppliers', value: '24', icon: Users, color: 'bg-purple-500' },
    { name: 'Pending POs', value: '12', icon: FileText, color: 'bg-yellow-500' },
    { name: 'Low Stock Alerts', value: '5', icon: AlertTriangle, color: 'bg-red-500' },
    { name: 'Completed Projects', value: '3', icon: CheckCircle, color: 'bg-indigo-500' },
  ]

  const recentProjects = [
    { id: 1, name: 'Automated Dispensing System', number: 'PRJ-2024-001', status: 'Design', progress: 65 },
    { id: 2, name: 'PCB Assembly Line', number: 'PRJ-2024-002', status: 'Planning', progress: 20 },
    { id: 3, name: 'CNC Router Upgrade', number: 'PRJ-2024-003', status: 'Build', progress: 85 },
    { id: 4, name: 'Robotic Arm Prototype', number: 'PRJ-2024-004', status: 'Completed', progress: 100 },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your parts inventory, projects, and purchase orders.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Projects</h3>
            <p className="mt-1 text-sm text-gray-500">Projects with recent activity</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentProjects.map((project, projectIdx) => (
                  <li key={project.id}>
                    <div className="relative pb-8">
                      {projectIdx !== recentProjects.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <FolderKanban className="h-5 w-5 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900 font-medium">{project.name}</p>
                            <p className="text-sm text-gray-500">{project.number}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              project.status === 'Build' ? 'bg-yellow-100 text-yellow-800' :
                              project.status === 'Design' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            <div className="mt-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full"
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 mt-1">{project.progress}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <p className="mt-1 text-sm text-gray-500">Common tasks you can perform</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-2 gap-4">
              <a
                href="/parts"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                    <Package className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Add New Part
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Create a new mechanical, electrical, or pneumatic part
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </a>

              <a
                href="/projects"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                    <FolderKanban className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    New Project
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Start tracking a new engineering project
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </a>

              <a
                href="/purchase-orders"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-yellow-50 text-yellow-700 ring-4 ring-white">
                    <FileText className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Create PO
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Generate a new purchase order for parts
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </a>

              <a
                href="/suppliers"
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                    <Users className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    Add Supplier
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Register a new supplier for parts procurement
                  </p>
                </div>
                <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4h1a1 1 0 00-1-1v1zm-1 12a1 1 0 102 0h-2zM8 3a1 1 0 000 2V3zM3.293 19.293a1 1 0 101.414 1.414l-1.414-1.414zM19 4v12h2V4h-2zm1-1H8v2h12V3zm-.707.293l-16 16 1.414 1.414 16-16-1.414-1.414z" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard