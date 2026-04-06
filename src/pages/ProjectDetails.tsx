import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
  Calendar,
  Layers,
  MoreVertical,
  PlusCircle,
  FileDown,
  Trash2,
  ShoppingCart,
  Edit2,
  Copy
} from 'lucide-react'

import ProjectSectionModal from '@/components/projects/ProjectSectionModal'
import ProjectAddPartModal from '@/components/projects/ProjectAddPartModal'
import ProjectEditPartModal from '@/components/projects/ProjectEditPartModal'
import CreatePOFromBOMModal from '@/components/projects/CreatePOFromBOMModal'
import ProjectSectionCopyModal from '@/components/projects/ProjectSectionCopyModal'
import SectionExportButton from '@/components/projects/SectionExportButton'
import { purchaseOrdersApi } from '@/api/purchase-orders'
import { useRole } from '@/hooks/useRole'
import { useToast } from '@/context/ToastContext'
import { supabase } from '@/lib/supabase'

const resolvePartType = (p: any) => {
  if (p.mechanical_manufacture_id) return { type: 'MECH-MFG', id: p.mechanical_manufacture_id, ref: p.mechanical_manufacture };
  if (p.mechanical_bought_out_part_id) return { type: 'MECH-BOP', id: p.mechanical_bought_out_part_id, ref: p.mechanical_bought_out };
  if (p.electrical_manufacture_id) return { type: 'ELEC-MFG', id: p.electrical_manufacture_id, ref: p.electrical_manufacture };
  if (p.electrical_bought_out_part_id) return { type: 'ELEC-BOP', id: p.electrical_bought_out_part_id, ref: p.electrical_bought_out };
  if (p.pneumatic_bought_out_part_id) return { type: 'PNEU-BOP', id: p.pneumatic_bought_out_part_id, ref: p.pneumatic_bought_out };
  return { type: 'UNKNOWN', id: p.id, ref: null };
}

const ProjectDetails = () => {
  const { id } = useParams()
  const projectId = parseInt(id!)
  const { isAdmin } = useRole()
  const queryClient = useQueryClient()
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false)
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false)
  const [sectionToEdit, setSectionToEdit] = useState<any>(null)
  const [activeSectionId, setActiveSectionId] = useState<number>(0)
  const [activeSectionName, setActiveSectionName] = useState<string>('')
  const [selectedPartIds, setSelectedPartIds] = useState<Set<number>>(new Set())
  const [isGeneratePOModalOpen, setIsGeneratePOModalOpen] = useState(false)
  const [isEditPartModalOpen, setIsEditPartModalOpen] = useState(false)
  const [partToEdit, setPartToEdit] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'bom' | 'pos'>('bom')
  const [isCopySectionModalOpen, setIsCopySectionModalOpen] = useState(false)
  const [sectionToCopy, setSectionToCopy] = useState<{id: number, name: string} | null>(null)
  const { showToast } = useToast()
  
  const togglePartSelection = (partId: number) => {
    const newSelection = new Set(selectedPartIds)
    if (newSelection.has(partId)) {
      newSelection.delete(partId)
    } else {
      newSelection.add(partId)
    }
    setSelectedPartIds(newSelection)
  }

  const handleGeneratePO = () => {
    setIsGeneratePOModalOpen(true)
  }
  
  const { data: project, isLoading } = useQuery<any>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId)
  })

  const { data: projectPOs } = useQuery({
    queryKey: ['project-pos', projectId],
    queryFn: () => purchaseOrdersApi.getProjectPurchaseOrders(projectId),
    enabled: !!projectId
  })

  const openAddSection = () => {
    setSectionToEdit(null)
    setIsAddSectionModalOpen(true)
  }

  const openEditSection = (section: any) => {
    setSectionToEdit(section)
    setIsAddSectionModalOpen(true)
  }

  const openAddPart = (sectionId: number, sectionName: string) => {
    setActiveSectionId(sectionId)
    setActiveSectionName(sectionName)
    setIsAddPartModalOpen(true)
  }

  const openEditPart = (part: any) => {
    setPartToEdit(part)
    setIsEditPartModalOpen(true)
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (confirm('Are you sure you want to delete this section? All parts in this section will be removed.')) {
      try {
        await projectsApi.deleteSection(sectionId)
        queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      } catch (error) {
        console.error('Error deleting section:', error)
        alert('Failed to delete section')
      }
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

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center h-64">
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
          <button 
            onClick={async () => {
              try {
                const combinedParts: any[] = [];
                project.sections?.forEach((s: any) => {
                  s.parts?.forEach((p: any) => {
                    const type = resolvePartType(p);
                    combinedParts.push({
                      PartNumber: type.ref?.part_number,
                      Description: type.ref?.description || '',
                      PartType: p.part_table_name,
                      quantity: p.quantity,
                      unit_price: p.unit_price,
                      DiscountPercent: p.discount_percent,
                      Currency: p.currency,
                      projectName: project.project_name,
                      sectionName: s.section_name
                    });
                  });
                });
                
                const blob = new Blob([JSON.stringify(combinedParts, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.project_name}_Full_BOM.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('success', 'Project BOM exported as JSON');
              } catch (err) {
                showToast('error', 'Failed to export project BOM');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-blue-200 bg-blue-50 text-sm font-black rounded-lg text-blue-700 hover:bg-blue-100 shadow-sm transition-colors"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Project BOM (JSON)
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

          {selectedPartIds.size > 0 && (
            <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 shadow-xl border-t-4 border-t-primary-600 animate-in slide-in-from-bottom-4 duration-300">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <PlusCircle className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedPartIds.size} Parts Selected</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ready for procurement</p>
                    </div>
                  </div>
               </div>
               <button 
                onClick={handleGeneratePO}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all hover:scale-[1.02] active:scale-95"
               >
                 <ShoppingCart className="h-4 w-4 mr-2" />
                 Generate Purchase Order
               </button>
               <button 
                onClick={() => setSelectedPartIds(new Set())}
                className="w-full mt-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
               >
                 Clear Selection
               </button>
            </div>
          )}
        </div>

        {/* Right Column: Workflow & BOM Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Workflow Status Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:px-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
               <h3 className="text-sm font-bold text-gray-900 flex items-center uppercase tracking-widest">
                 <Layers className="h-4 w-4 mr-2 text-primary-600" /> Project Workflow
               </h3>
               <button 
                 onClick={() => {
                   // This button can navigate to an edit mode or open the project modal
                   // For now, it's just a placeholder since edit is in the header later or we can add it here
                 }}
                 className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 px-2 py-1 rounded transition-colors"
               >
                 Track Progress
               </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'mechanical_design_status', label: 'Mechanical Design' },
                  { key: 'ee_design_status', label: 'Electrical Design' },
                  { key: 'pneumatic_design_status', label: 'Pneumatic Design' },
                  { key: 'po_release_status', label: 'PO Release' },
                  { key: 'part_arrival_status', label: 'Part Arrival' },
                  { key: 'machine_build_status', label: 'Machine Build' }
                ].map((phase) => {
                  const status = (project as any)[phase.key] || 'not_started';
                  const getPhaseStatusDetails = (s: string) => {
                    const map: Record<string, { label: string, color: string, progress: number }> = {
                      not_started: { label: 'Not Started', color: 'bg-gray-200', progress: 0 },
                      in_progress: { label: 'In Progress', color: 'bg-primary-500', progress: 50 },
                      completed: { label: 'Completed', color: 'bg-green-500', progress: 100 },
                      on_hold: { label: 'On Hold', color: 'bg-amber-500', progress: 25 }
                    };
                    return map[s] || map.not_started;
                  };
                  const details = getPhaseStatusDetails(status);
                  
                  return (
                    <div key={phase.key} className="p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{phase.label}</span>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                          status === 'completed' ? 'bg-green-100 text-green-700' :
                          status === 'in_progress' ? 'bg-primary-100 text-primary-700' :
                          status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {details.label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${details.color}`}
                          style={{ width: `${details.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('bom')}
              className={`flex items-center px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'bom' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Layers className="h-4 w-4 mr-2" />
              Bill of Materials
            </button>
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center px-6 py-4 text-sm font-black uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'pos' 
                  ? 'border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Orders
              {projectPOs && projectPOs.length > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-[10px]">
                  {projectPOs.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'bom' ? (
            <>
              <div className="flex items-center justify-between pt-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <Folder className="h-5 w-5 mr-2 text-primary-600" />
                  BOM Sections
                </h2>
                <button 
                  onClick={openAddSection}
                  className="inline-flex items-center text-sm font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  New Section
                </button>
              </div>

          {!project.sections || project.sections.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-bold text-gray-900">No BOM Sections</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Break down your project into manageable BOM sections like 'Main Frame', 'Electrical Panel', etc.
              </p>
              <button 
                onClick={openAddSection}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Section
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {project.sections.map((section: any) => (
                <div key={section.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden group hover:border-primary-200 transition-colors">
                  <div className="p-4 sm:px-6 flex items-center justify-between bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-xs group-hover:bg-primary-50 transition-colors">
                        <FileText className="h-5 w-5 text-gray-400 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-gray-900">{section.section_name}</h4>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                            section.status === 'completed' ? 'bg-green-100 text-green-700' :
                            section.status === 'in_progress' ? 'bg-indigo-100 text-indigo-700' :
                            section.status === 'design' ? 'bg-blue-100 text-blue-700' :
                            section.status === 'on_hold' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {section.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-0.5">
                           <p className="text-[10px] font-medium text-gray-400">{section.parts?.length || 0} parts</p>
                           {(section.estimated_cost > 0 || section.actual_cost > 0) && (
                             <p className="text-[10px] font-bold text-gray-500">
                               Est: <span className="text-gray-900">${section.estimated_cost?.toFixed(0)}</span> | 
                               Act: <span className={section.actual_cost > section.estimated_cost ? 'text-red-600' : 'text-green-600'}>${section.actual_cost?.toFixed(0)}</span>
                             </p>
                           )}
                           {section.target_completion_date && (
                             <p className="text-[10px] font-medium text-primary-600">
                               Due: {new Date(section.target_completion_date).toLocaleDateString()}
                             </p>
                           )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <SectionExportButton 
                        sectionName={section.section_name}
                        parts={section.parts || []}
                        projectName={project.project_name}
                      />
                      <button 
                        onClick={() => {
                          setSectionToCopy({ id: section.id, name: section.section_name });
                          setIsCopySectionModalOpen(true);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Copy to another project"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </button>
                      <button 
                        onClick={() => openAddPart(section.id, section.section_name)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                      >
                       <Plus className="h-3.5 w-3.5 mr-1" /> Add Part
                      </button>
                      <button 
                        onClick={() => openEditSection(section)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors overflow-hidden relative group/btn"
                      >
                        <Settings className="h-3.5 w-3.5 mr-1" /> Edit
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteSection(section.id)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {section.parts && section.parts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-4 py-3 text-left">
                              <input 
                                type="checkbox"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                checked={section.parts?.every((p: any) => selectedPartIds.has(p.id))}
                                onChange={(e) => {
                                  const newSelection = new Set(selectedPartIds);
                                  if (e.target.checked) {
                                    section.parts?.forEach((p: any) => newSelection.add(p.id));
                                  } else {
                                    section.parts?.forEach((p: any) => newSelection.delete(p.id));
                                  }
                                  setSelectedPartIds(newSelection);
                                }}
                              />
                            </th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Part Number</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                            <th className="px-6 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                          {section.parts.map((p: any) => {
                            const pData = resolvePartType(p);
                            const isSelected = selectedPartIds.has(p.id);
                            return (
                            <tr key={p.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-primary-50/30' : ''}`}>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <input 
                                  type="checkbox"
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  checked={isSelected}
                                  onChange={() => togglePartSelection(p.id)}
                                />
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className={`text-sm font-bold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>{pData.ref?.part_number || `ID: ${pData.id}`}</span>
                                {p.reference_designator && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">{p.reference_designator}</span>
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm text-gray-500 max-w-sm truncate">
                                {pData.ref?.description || '-'}
                                {p.notes && <div className="text-xs text-gray-400 italic mt-0.5">{p.notes}</div>}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-xs font-bold text-gray-900 tabular-nums">
                                {p.quantity} {p.unit || 'pcs'}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-xs font-medium text-gray-500 tabular-nums">
                                {p.currency || '$'}{p.unit_price}
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  pData.type.includes('MFG') ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                  {pData.type}
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => openEditPart(p)}
                                    className="text-primary-400 hover:text-primary-600 transition-colors"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      if (confirm('Are you sure you want to remove this part from the BOM?')) {
                                        try {
                                          await projectsApi.removePartFromSection(p.id);
                                          queryClient.invalidateQueries({ queryKey: ['project', projectId] });
                                        } catch (error) {
                                          console.error('Error removing part:', error);
                                          alert('Failed to remove part');
                                        }
                                      }
                                    }}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )})}
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
        </>
      ) : (
        /* Purchase Orders Tab Content */
        <div className="space-y-4">
          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2 text-primary-600" />
              Project Purchase Orders
            </h2>
          </div>
          
          {!projectPOs || projectPOs.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-bold text-gray-900">No POs Generated</h3>
              <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                Once you select parts from the BOM sections above, you can generate Purchase Orders for suppliers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projectPOs.map((po: any) => (
                <div key={po.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-primary-200 transition-all group">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                       <div className="bg-primary-50 p-3 rounded-xl group-hover:bg-primary-100 transition-colors">
                          <FileText className="h-6 w-6 text-primary-600" />
                       </div>
                       <div>
                         <div className="flex items-center space-x-2">
                           <span className="text-xs font-black text-primary-600 font-mono tracking-widest">{po.po_number}</span>
                           <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                             po.status === 'Received' ? 'bg-green-50 text-green-700 border-green-200' :
                             po.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                             'bg-gray-50 text-gray-600 border-gray-200'
                           }`}>
                             {po.status}
                           </span>
                         </div>
                         <h4 className="text-sm font-bold text-gray-900 mt-1">{(po as any).suppliers?.name || 'N/A'}</h4>
                         <p className="text-[10px] text-gray-400 font-medium mt-0.5">{new Date(po.po_date).toLocaleDateString()}</p>
                       </div>
                     </div>
                     <div className="text-right">
                        <p className="text-lg font-black text-gray-900 tabular-nums">{po.currency} {po.grand_total?.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{po.total_items} items recorded</p>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
        </div>
      </div>

      <ProjectSectionModal 
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        projectId={projectId}
        sectionToEdit={sectionToEdit}
      />

      <ProjectAddPartModal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        projectId={projectId}
        sectionId={activeSectionId}
        sectionName={activeSectionName}
      />

      <ProjectEditPartModal
        isOpen={isEditPartModalOpen}
        onClose={() => {
          setIsEditPartModalOpen(false)
          setPartToEdit(null)
        }}
        projectId={projectId}
        projectPart={partToEdit}
      />

      <CreatePOFromBOMModal
        isOpen={isGeneratePOModalOpen}
        onClose={() => {
          setIsGeneratePOModalOpen(false)
          setSelectedPartIds(new Set())
        }}
        project={project}
        selectedPartIds={Array.from(selectedPartIds)}
      />

      {sectionToCopy && (
        <ProjectSectionCopyModal
          isOpen={isCopySectionModalOpen}
          onClose={() => {
            setIsCopySectionModalOpen(false);
            setSectionToCopy(null);
          }}
          sectionId={sectionToCopy.id}
          sectionName={sectionToCopy.name}
          currentProjectId={projectId}
        />
      )}
    </div>
  )
}

export default ProjectDetails
