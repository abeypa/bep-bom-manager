import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects'
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  ChevronRight, 
  FileText, 
  Folder, 
  Package,
  Clock,
  User,
  Info,
  Calendar,
  Layers,
  MoreVertical,
  PlusCircle,
  FileDown,
  Trash2
} from 'lucide-react'

const ProjectDetails = () => {
  const { id } = useParams()
  const projectId = parseInt(id!)
  const queryClient = useQueryClient()
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false)
  
  const { data: project, isLoading } = useQuery<any>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId)
  })

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      build: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-200">
        <Layers className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
        <Link 
          to="/projects"
          className="mt-6 inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col space-y-6">
      {/* Header & Navigation */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link to="/projects" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li className="flex items-center">
                <Link to="/projects" className="text-sm font-medium text-gray-500 hover:text-gray-700">Projects</Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                <span className="text-sm font-bold text-gray-900 line-clamp-1">{project.project_name}</span>
              </li>
            </ol>
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
            <FileDown className="h-4 w-4 mr-2" />
            Export BOM
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all shadow-sm">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Project Overview */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs font-mono font-bold tracking-widest text-primary-600 uppercase tabular-nums">{project.project_number}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status || 'planning')}`}>
                  {project.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{project.project_name}</h1>
              {project.customer && (
                <div className="flex items-center text-sm font-medium text-gray-600">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  {project.customer}
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-5">
              <div className="flex flex-col space-y-1.5">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
                <p className="text-sm text-gray-500 leading-relaxed italic border-l-2 border-gray-100 pl-3">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> Start Date
                  </span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    <Clock className="h-3 w-3 mr-1" /> Target Date
                  </span>
                  <span className="text-sm font-bold text-gray-900 tabular-nums">
                    {project.target_completion_date ? new Date(project.target_completion_date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 transform group-hover:scale-110 transition-transform">
              <Layers className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-primary-200 uppercase tracking-widest mb-4">BOM Summary</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-3xl font-black tabular-nums">{(project as any).sections?.length || 0}</span>
                  <span className="text-xs font-bold text-primary-300 uppercase mt-1">Sections</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black tabular-nums">
                    {(project as any).sections?.reduce((acc: number, s: any) => acc + (s.parts?.length || 0), 0)}
                  </span>
                  <span className="text-xs font-bold text-primary-300 uppercase mt-1">Total Parts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: BOM Sections */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Folder className="h-5 w-5 mr-2 text-primary-600" />
              BOM Sections
            </h2>
            <button className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all">
              <PlusCircle className="h-4 w-4 mr-1.5" />
              New Section
            </button>
          </div>

          {! (project as any).sections || (project as any).sections.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-bold text-gray-900">No BOM Sections</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Break down your project into manageable BOM sections like 'Main Frame', 'Electrical Panel', etc.
              </p>
              <button 
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {(project as any).sections.map((section: any) => (
                <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:border-primary-200 transition-colors">
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-xs group-hover:bg-primary-50 transition-colors">
                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{section.name}</h4>
                        <p className="text-xs font-medium text-gray-500">{section.parts?.length || 0} parts listed</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Part
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {section.parts && section.parts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">Qty</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest uppercase">Notes</th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Delete</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                          {section.parts.map((p: any) => (
                            <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className="text-xs font-mono font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded uppercase">{p.part_type.replace('_', '-')}-{p.part_id}</span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-xs font-bold text-gray-900 tabular-nums">
                                {p.quantity} {p.unit || 'pcs'}
                              </td>
                              <td className="px-6 py-3 text-xs text-gray-500 line-clamp-1 italic max-w-xs">
                                {p.notes || '-'}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button className="text-red-400 hover:text-red-600 transition-colors">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-gray-50/20 border-t border-gray-50">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">No parts added to this section yet</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetails
