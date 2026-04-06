import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Save, Layers, Trash2 } from 'lucide-react';
import { projectsApi, ProjectSectionInsert } from '@/api/projects';
import { FileUpload } from '@/components/ui/FileUpload';

interface ProjectSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  mainSections?: any[];
  sectionToEdit?: any | null;
  onDelete?: (sectionId: number) => void;
  defaultMainSectionId?: number;
}

const ProjectSectionModal = ({ isOpen, onClose, projectId, mainSections = [], sectionToEdit, onDelete, defaultMainSectionId }: ProjectSectionModalProps) => {
  const queryClient = useQueryClient();
  const [newMainSectionName, setNewMainSectionName] = useState('');
  const [isCreatingMainSection, setIsCreatingMainSection] = useState(false);
  const [formData, setFormData] = useState<Partial<ProjectSectionInsert>>({
    section_name: '',
    description: '',
    status: 'planning',
    estimated_cost: 0,
    actual_cost: 0,
    start_date: null,
    target_completion_date: null,
    project_id: projectId,
    main_section_id: defaultMainSectionId || null,
    image_path: null,
    drawing_path: null,
    datasheet_path: null
  });

  useEffect(() => {
    if (sectionToEdit) {
      setFormData(sectionToEdit);
    } else {
      setFormData({
        section_name: '',
        description: '',
        status: 'planning',
        estimated_cost: 0,
        actual_cost: 0,
        start_date: null,
        target_completion_date: null,
        project_id: projectId,
        main_section_id: defaultMainSectionId || null,
        image_path: null,
        drawing_path: null,
        datasheet_path: null
      });
    }
  }, [sectionToEdit, isOpen, projectId]);

  const mutation = useMutation({
    mutationFn: (data: ProjectSectionInsert) => 
      sectionToEdit 
        ? (projectsApi as any).updateSection(sectionToEdit.id, data) 
        : projectsApi.createSection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      onClose();
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'main_section_id' ? (value ? parseInt(value) : null) : value
    }));
  };

  const handleSaveWithMainSection = async (data: any) => {
    let finalMainSectionId = data.main_section_id;
    
    // Create new main section if requested
    if (isCreatingMainSection && newMainSectionName.trim()) {
      const newMain = await (projectsApi as any).createMainSection({
        project_id: projectId,
        name: newMainSectionName.trim()
      });
      finalMainSectionId = newMain.id;
    }

    const payload = { ...data, main_section_id: finalMainSectionId } as ProjectSectionInsert;
    mutation.mutate(payload);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section_name) return;
    
    // Prepare data with proper cleanup for Supabase
    const dataToSave = {
      ...formData,
      project_id: projectId,
      estimated_cost: parseFloat(formData.estimated_cost?.toString() || '0'),
      actual_cost: parseFloat(formData.actual_cost?.toString() || '0'),
      start_date: formData.start_date || null,
      target_completion_date: formData.target_completion_date || null
    };

    handleSaveWithMainSection(dataToSave);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {sectionToEdit ? 'Edit BOM Section' : 'Add BOM Section'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-4">
            <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100/50 space-y-3">
              <div className="flex items-center justify-between">
                 <label className="block text-xs font-black text-primary-900 uppercase tracking-widest px-0.5"><Layers className="inline w-3 h-3 mr-1 mb-0.5"/> Main Compartment Selection</label>
                 <button 
                   type="button" 
                   onClick={() => setIsCreatingMainSection(!isCreatingMainSection)}
                   className="text-[10px] font-bold text-primary-600 hover:text-primary-800 uppercase tracking-wider"
                 >
                   {isCreatingMainSection ? 'Cancel New' : '+ Create New'}
                 </button>
              </div>
              
              {isCreatingMainSection ? (
                <input
                  type="text"
                  required
                  placeholder="e.g. Mechanical Assembly"
                  value={newMainSectionName}
                  onChange={e => setNewMainSectionName(e.target.value)}
                  className="block w-full bg-white border-primary-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                />
              ) : (
                <select
                  name="main_section_id"
                  value={formData.main_section_id?.toString() || ''}
                  onChange={handleChange}
                  className="block w-full bg-white border-primary-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                >
                  <option value="">Unassigned (Legacy)</option>
                  {mainSections.map(ms => (
                     <option key={ms.id} value={ms.id}>{ms.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Sub-Compartment / Section Name *</label>
              <input
                type="text"
                name="section_name"
                required
                placeholder="e.g. Main Frame, Electrical Control Panel"
                value={formData.section_name || ''}
                onChange={handleChange}
                className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-300"
              />
            </div>
            
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Description (Optional)</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Briefly describe what this section covers..."
                value={formData.description || ''}
                onChange={handleChange}
                className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-gray-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Estimated Cost</label>
                <input
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost || 0}
                  onChange={handleChange}
                  className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Actual Cost</label>
                <input
                  type="number"
                  name="actual_cost"
                  value={formData.actual_cost || 0}
                  onChange={handleChange}
                  className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date || ''}
                  onChange={handleChange}
                  className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Completion Date</label>
                <input
                  type="date"
                  name="target_completion_date"
                  value={formData.target_completion_date || ''}
                  onChange={handleChange}
                  className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">Status</label>
              <select
                name="status"
                value={formData.status || 'planning'}
                onChange={handleChange}
                className="block w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
              >
                <option value="planning">Planning</option>
                <option value="design">Design</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="block text-sm font-bold text-gray-900 mb-2 italic">Section Assets</label>
              <div className="grid grid-cols-1 gap-4">
                <FileUpload
                  label="Section Image"
                  bucket="bom_assets"
                  existingUrl={formData.image_path}
                  onUpload={(url) => setFormData(prev => ({ ...prev, image_path: url }))}
                />
                
                <FileUpload
                  label="Technical Drawing"
                  bucket="bom_assets"
                  existingUrl={formData.drawing_path}
                  onUpload={(url) => setFormData(prev => ({ ...prev, drawing_path: url }))}
                />
                
                <FileUpload
                  label="Data Sheet"
                  bucket="bom_assets"
                  existingUrl={formData.datasheet_path}
                  onUpload={(url) => setFormData(prev => ({ ...prev, datasheet_path: url }))}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center sticky bottom-0 bg-white">
            <div>
              {sectionToEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(sectionToEdit.id);
                    onClose();
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Section
                </button>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="inline-flex justify-center items-center px-8 py-2.5 border border-transparent text-sm font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                {mutation.isPending ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectSectionModal;
