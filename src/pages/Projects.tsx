import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, Project } from '@/api/projects'
import { Search, Plus, Edit, Trash2, Layout, Calendar, User, Briefcase } from 'lucide-react'
import ProjectFormModal from '@/components/projects/ProjectFormModal'
import { Link } from 'react-router-dom'

const Projects = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null)

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects()
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  const filteredProjects = (projects || []).filter(p => 
    p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProject = () => {
    setProjectToEdit(null)
    setIsModalOpen(true)
  }

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project)
    setIsModalOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this project? This will delete all associated BOM sections and parts.')) {
      deleteMutation.mutate(id)
    }
  }

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

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your engineering projects and Bill of Materials.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={handleAddProject}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            Add Project
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
            placeholder="Search projects by name, number, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="flex justify-between mt-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full flex flex-col justify-center items-center p-12 text-center bg-white rounded-lg shadow">
            <Layout className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new engineering project.
            </p>
            <div className="mt-6">
              <button
                onClick={handleAddProject}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Project
              </button>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{project.project_name}</h3>
                    <p className="text-sm font-mono text-primary-600">{project.project_number}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status || 'planning')}`}>
                    {project.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  {project.customer && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      {project.customer}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                       <Layout className="h-3 w-3 mr-1" /> Workflow Progress
                    </p>
                    <div className="flex space-x-1.5">
                      {[
                        { key: 'mechanical_design_status', label: 'Mech' },
                        { key: 'ee_design_status', label: 'Elec' },
                        { key: 'pneumatic_design_status', label: 'Pneu' },
                        { key: 'po_release_status', label: 'PO' },
                        { key: 'part_arrival_status', label: 'Arrival' },
                        { key: 'machine_build_status', label: 'Build' }
                      ].map((phase) => {
                        const status = (project as any)[phase.key] || 'not_started'
                        const color = 
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-primary-500' :
                          status === 'on_hold' ? 'bg-amber-500' :
                          'bg-gray-200'
                        return (
                          <div key={phase.key} className="flex-1 group relative">
                            <div className={`h-1.5 w-full rounded-full ${color} transition-all`} title={`${phase.label}: ${status}`} />
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                               <span className="text-[8px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                 {phase.label}
                               </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 pt-1">
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    Last Updated: {new Date(project.updated_date || project.created_date).toLocaleDateString()}
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 italic border-l-2 border-gray-100 pl-3 mt-4">
                    "{project.description}"
                  </p>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center rounded-b-lg">
                <Link
                  to={`/projects/${project.id}`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  View Details
                </Link>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ProjectFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        projectToEdit={projectToEdit}
      />
    </div>
  )
}

export default Projects