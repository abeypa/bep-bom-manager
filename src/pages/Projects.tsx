import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi, Project } from '@/api/projects'
import { Search, Plus, Edit, Trash2, Layout, Calendar, User, Briefcase, Clock, ChevronRight } from 'lucide-react'
import ProjectFormModal from '@/components/projects/ProjectFormModal'
import { Link } from 'react-router-dom'
import { useRole } from '@/hooks/useRole'

const Projects = () => {
  const { isAdmin } = useRole()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
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

  const filteredProjects = (projects || []).filter(p => {
    const matchesSearch = 
      p.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.project_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatus === '' || p.status === selectedStatus

    return matchesSearch && matchesStatus
  })

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
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
            </span>
            <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Active Infrastructure</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">Engineering Hub</h1>
          <p className="text-sm text-gray-500 font-medium max-w-xl">
            Centralized orchestration of Bill of Materials, procurement cycles, and project lifecycle tracking.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleAddProject}
            className="group relative inline-flex items-center px-6 py-3 border border-transparent shadow-xl shadow-primary-200 text-sm font-black rounded-2xl text-white bg-primary-600 hover:bg-primary-700 transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="mr-2 h-5 w-5" />
            Initialize Project
          </button>
        </div>
      </div>

      <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative group w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
          </div>
          <input
            type="text"
            className="focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block w-full pl-11 text-sm border-gray-200 bg-white rounded-2xl py-3 px-4 border outline-none transition-all placeholder:text-gray-400 font-medium"
            placeholder="Search clusters by name, number, or entity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <select
            className="focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 block w-full text-sm border-gray-200 bg-white rounded-2xl py-3 px-4 border outline-none transition-all font-bold text-gray-700 appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Status: All Nodes</option>
            <option value="planning">Phase: Planning</option>
            <option value="design">Phase: Design</option>
            <option value="procurement">Phase: Procurement</option>
            <option value="build">Phase: Build</option>
            <option value="testing">Phase: Testing</option>
            <option value="completed">Phase: Completed</option>
            <option value="on_hold">Phase: On Hold</option>
            <option value="cancelled">Phase: Cancelled</option>
          </select>
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
            <div key={project.id} className="group relative bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary-100 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="p-7 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-gray-900 line-clamp-1 tracking-tight group-hover:text-primary-600 transition-colors uppercase leading-none">{project.project_name}</h3>
                    <p className="text-[10px] font-black text-primary-500 font-mono tracking-[0.2em] uppercase">Ref ID: {project.project_number}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current shadow-sm ${
                    project.status === 'design' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    project.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' :
                    project.status === 'on_hold' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {project.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  {project.customer && (
                    <div className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <div className="p-1.5 bg-gray-50 rounded-lg mr-3 group-hover:bg-primary-50 transition-colors">
                        <User className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
                      </div>
                      {project.customer}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2.5">
                       <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center">
                          Workflow Evolution
                       </p>
                       <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded uppercase">
                          {Math.round([
                            project.mechanical_design_status,
                            project.ee_design_status,
                            project.pneumatic_design_status,
                            project.po_release_status,
                            project.part_arrival_status,
                            project.machine_build_status
                          ].filter(s => s === 'completed').length / 6 * 100)}%
                       </span>
                    </div>
                    <div className="flex space-x-1.5">
                      {[
                        { key: 'mechanical_design_status', label: 'Mech' },
                        { key: 'ee_design_status', label: 'Elec' },
                        { key: 'pneumatic_design_status', label: 'Pneu' },
                        { key: 'po_release_status', label: 'PO' },
                        { key: 'part_arrival_status', label: 'Arr' },
                        { key: 'machine_build_status', label: 'Bld' }
                      ].map((phase) => {
                        const status = (project as any)[phase.key] || 'not_started'
                        const color = 
                          status === 'completed' ? 'bg-green-500' :
                          status === 'in_progress' ? 'bg-primary-500' :
                          status === 'on_hold' ? 'bg-amber-500' :
                          'bg-gray-100'
                        return (
                          <div key={phase.key} className="flex-1 group/phase relative">
                            <div className={`h-1.5 w-full rounded-full ${color} transition-all duration-300 relative overflow-hidden`}>
                              {status === 'in_progress' && (
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                              )}
                            </div>
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover/phase:opacity-100 transition-opacity bg-gray-900 text-white text-[8px] font-black px-1.5 py-0.5 rounded z-10 uppercase whitespace-nowrap pointer-events-none">
                              {phase.label}: {status.replace('_', ' ')}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-bold text-gray-400 pt-2 uppercase tracking-tight">
                    <Clock className="h-4 w-4 mr-2 text-gray-300" />
                    Sync: {new Date(project.updated_date || project.created_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  {project.description && (
                    <p className="text-[11px] text-gray-500 font-medium line-clamp-2 italic bg-gray-50/50 p-3 rounded-2xl border-l-4 border-primary-200 mt-2">
                       {project.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-7 py-5 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center group-hover:bg-white transition-colors">
                <Link
                  to={`/projects/${project.id}`}
                  className="group/link flex items-center text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-colors"
                >
                  Inspect Cluster
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                    title="Modify Schema"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Decommission Project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
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
