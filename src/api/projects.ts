import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectSection = Database['public']['Tables']['project_sections']['Row']
export type ProjectSectionInsert = Database['public']['Tables']['project_sections']['Insert']

export const projectsApi = {
  getProjects: async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false })
      
    if (error) throw error
    return data
  },
  
  getProject: async (id: number) => {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        sections:project_sections (
          *,
          parts:project_parts (
            *,
            mechanical_manufacture (part_number, description),
            mechanical_bought_out (part_number, description),
            electrical_manufacture (part_number, description),
            electrical_bought_out (part_number, description),
            pneumatic_bought_out (part_number, description)
          )
        )
      `)
      .eq('id', id)
      .order('sort_order', { foreignTable: 'project_sections', ascending: true })
      .single()
      
    if (error) throw error
    return data
  },
  
  createProject: async (project: ProjectInsert) => {
    const { data, error } = await (supabase.from('projects') as any)
      .insert([project])
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  updateProject: async (id: number, project: ProjectUpdate) => {
    const { data, error } = await (supabase.from('projects') as any)
      .update(project)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  deleteProject: async (id: number) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Sections
  getSections: async (projectId: number) => {
    const { data, error } = await supabase
      .from('project_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
      
    if (error) throw error
    return data
  },

  createSection: async (section: ProjectSectionInsert) => {
    const { data, error } = await (supabase.from('project_sections') as any)
      .insert([section])
      .select()
      .single()
      
    if (error) throw error
    return data
  },

  updateSection: async (id: number, section: any) => {
    const { data, error } = await (supabase.from('project_sections') as any)
      .update(section)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data
  },
  
  deleteSection: async (id: number) => {
    const { error } = await supabase
      .from('project_sections')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // Project Parts (Adding parts to sections)
  addPartToSection: async (payload: {
    project_section_id: number;
    quantity: number;
    unit_price: number;
    currency: string;
    reference_designator?: string | null;
    notes?: string | null;
    site_name?: string | null;
    [key: string]: any; // for the polymorphic part IDs
  }) => {
    const { project_section_id, quantity, unit_price, currency, reference_designator, notes, site_name } = payload;

    // 1. Get Section and Project info
    const { data: section, error: sectionError } = await supabase
      .from('project_sections')
      .select('*, project:projects(id, project_name)')
      .eq('id', project_section_id)
      .single();

    if (sectionError) throw sectionError;
    const project = (section as any).project;
    const projectId = project.id;
    const projectName = project.project_name;

    // 2. Identify the part type and ID
    const partTypes = [
      'mechanical_manufacture_id',
      'mechanical_bought_out_part_id',
      'electrical_manufacture_id',
      'electrical_bought_out_part_id',
      'pneumatic_bought_out_part_id'
    ];

    let partTypeKey = '';
    let partId = 0;
    let partTableName = '';

    for (const key of partTypes) {
      if (payload[key]) {
        partTypeKey = key;
        partId = payload[key];
        // Map to actual table names
        if (key === 'mechanical_manufacture_id') partTableName = 'mechanical_manufacture';
        else if (key === 'mechanical_bought_out_part_id') partTableName = 'mechanical_bought_out';
        else if (key === 'electrical_manufacture_id') partTableName = 'electrical_manufacture';
        else if (key === 'electrical_bought_out_part_id') partTableName = 'electrical_bought_out';
        else if (key === 'pneumatic_bought_out_part_id') partTableName = 'pneumatic_bought_out';
        break;
      }
    }

    if (!partTableName) throw new Error('Part type not identified');

    // 3. Get Part details (Stock and Part Number)
    const { data: part, error: partError } = await (supabase.from(partTableName) as any)
      .select('part_number, stock_quantity')
      .eq('id', partId)
      .single();

    if (partError) throw partError;
    const partNumber = (part as any).part_number;

    // 4. Check if part already exists IN THE PROJECT (Legacy logic)
    const { data: existingPart, error: existingError } = await supabase
      .from('project_parts')
      .select('*, section:project_sections!inner(project_id)')
      .eq('section.project_id', projectId)
      .eq(partTypeKey, partId)
      .maybeSingle();

    if (existingError) throw existingError;

    let result;
    if (existingPart) {
      // Update existing
      const { data: updated, error: updateError } = await (supabase.from('project_parts') as any)
        .update({
          quantity: (existingPart as any).quantity + quantity,
          unit_price,
          currency,
          reference_designator: reference_designator || (existingPart as any).reference_designator,
          notes: notes || (existingPart as any).notes,
          use_date_time: new Date().toISOString(),
          updated_date: new Date().toISOString()
        })
        .eq('id', (existingPart as any).id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      result = updated;
    } else {
      // Create new
      const insertPayload: any = {
        project_section_id,
        quantity,
        unit_price,
        currency,
        reference_designator,
        notes,
        [partTypeKey]: partId,
        created_date: new Date().toISOString(),
        use_date_time: new Date().toISOString()
      };

      const { data: inserted, error: insertError } = await (supabase.from('project_parts') as any)
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) throw insertError;
      result = inserted;
    }

    // 5. Update Master Part Stock
    const { error: stockError } = await (supabase.from(partTableName) as any)
      .update({ stock_quantity: ((part as any).stock_quantity || 0) - quantity })
      .eq('id', partId);
    
    if (stockError) throw stockError;

    // 6. Update/Create Part Usage Log
    // Try to find existing log for same project and part
    const { data: existingLog, error: logFetchError } = await supabase
      .from('part_usage_logs')
      .select('*')
      .eq('project_name', projectName)
      .eq('part_number', partNumber)
      .eq('part_table_name', partTableName)
      .maybeSingle();

    if (logFetchError) throw logFetchError;

    if (existingLog) {
      await (supabase.from('part_usage_logs') as any)
        .update({
          quantity: (existingLog as any).quantity + quantity,
          use_date_time: new Date().toISOString()
        })
        .eq('id', (existingLog as any).id);
    } else {
      await (supabase.from('part_usage_logs') as any)
        .insert([{
          project_name: projectName,
          part_number: partNumber,
          part_table_name: partTableName,
          quantity: quantity,
          use_date_time: new Date().toISOString(),
          created_date: new Date().toISOString(),
          site_name: site_name || 'Main Site'
        }]);
    }

    return result;
  },

  removePartFromSection: async (id: number) => {
    // 1. Get Project Part and its relation to master parts
    const { data: pp, error: ppError } = await supabase
      .from('project_parts')
      .select(`
        *,
        section:project_sections(
          project:projects(project_name)
        )
      `)
      .eq('id', id)
      .single();

    if (ppError) throw ppError;

    const partTypes = [
      { key: 'mechanical_manufacture_id', table: 'mechanical_manufacture' },
      { key: 'mechanical_bought_out_part_id', table: 'mechanical_bought_out' },
      { key: 'electrical_manufacture_id', table: 'electrical_manufacture' },
      { key: 'electrical_bought_out_part_id', table: 'electrical_bought_out' },
      { key: 'pneumatic_bought_out_part_id', table: 'pneumatic_bought_out' }
    ];

    let partTable = '';
    let partId = 0;
    for (const pt of partTypes) {
      if ((pp as any)[pt.key]) {
        partTable = pt.table;
        partId = (pp as any)[pt.key];
        break;
      }
    }

    if (partTable && partId) {
      // 2. Restore Stock
      const { data: part } = await (supabase.from(partTable) as any).select('stock_quantity, part_number').eq('id', partId).single();
      if (part) {
        await (supabase.from(partTable) as any).update({ stock_quantity: ((part as any).stock_quantity || 0) + (pp as any).quantity }).eq('id', partId);

        // 3. Update Log (decrement)
        const projectName = (pp as any).section?.project?.project_name;
        if (projectName) {
          const { data: log } = await (supabase.from('part_usage_logs') as any)
            .select('*')
            .eq('project_name', projectName)
            .eq('part_number', (part as any).part_number)
            .eq('part_table_name', partTable)
            .maybeSingle();
          
          if (log) {
            await (supabase.from('part_usage_logs') as any).update({ quantity: Math.max(0, (log as any).quantity - (pp as any).quantity) }).eq('id', (log as any).id);
          }
        }
      }
    }

    // 4. Delete Project Part
    const { error } = await supabase
      .from('project_parts')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
}
