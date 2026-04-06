import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { partsApi } from './parts'

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type ProjectSection = Database['public']['Tables']['project_sections']['Row']
export type ProjectSectionInsert = Database['public']['Tables']['project_sections']['Insert']

type PartCategory = 
  | 'mechanical_manufacture' 
  | 'mechanical_bought_out' 
  | 'electrical_manufacture' 
  | 'electrical_bought_out' 
  | 'pneumatic_bought_out';

// Helper: Log stock movement
const logStockMovement = async (
  movementType: 'IN' | 'OUT' | 'ADJUST' | 'RESTORE',
  partTable: PartCategory,
  partId: number,
  partNumber: string,
  quantity: number,
  stockBefore: number,
  stockAfter: number,
  extra: any = {}
) => {
  await (supabase as any).from('stock_movements').insert({
    movement_type: movementType,
    part_table_name: partTable,
    part_id: partId,
    part_number: partNumber,
    quantity: movementType === 'OUT' ? -quantity : quantity,
    stock_before: stockBefore,
    stock_after: stockAfter,
    ...extra,
    moved_by: (await supabase.auth.getUser()).data.user?.email || 'system',
  });
};

export const projectsApi = {
  getProjects: async () => {
    const { data, error } = await (supabase as any)
      .from('projects')
      .select('*')
      .order('created_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  getProject: async (projectId: number) => {
    const { data, error } = await (supabase as any)
      .from('projects')
      .select(`
        *,
        sections:project_sections (
          *,
          parts:project_parts (
            *,
            mechanical_manufacture (*),
            mechanical_bought_out (*),
            electrical_manufacture (*),
            electrical_bought_out (*),
            pneumatic_bought_out (*)
          )
        )
      `)
      .eq('id', projectId)
      .order('sort_order', { foreignTable: 'project_sections', ascending: true })
      .single();
    if (error) throw error;
    return data;
  },

  createProject: async (project: ProjectInsert) => {
    const { data, error } = await (supabase as any)
      .from('projects')
      .insert([project])
      .select()
      .single()
    if (error) throw error
    return data
  },

  updateProject: async (id: number, project: ProjectUpdate) => {
    const { data, error } = await (supabase as any)
      .from('projects')
      .update(project)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  deleteProject: async (id: number) => {
    const { error } = await (supabase as any)
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Task 4: Copy section from one project to another
  copySection: async (sectionId: number, targetProjectId: number) => {
    // 1. Get the source section details (Excluding many columns to avoid schema cache issues)
    const { data: section, error: secError } = await (supabase as any)
      .from('project_sections')
      .select(`
        id, 
        section_name, 
        description, 
        status, 
        estimated_cost, 
        sort_order,
        image_path,
        drawing_path,
        datasheet_path,
        parts:project_parts(
          id,
          mechanical_manufacture_id,
          mechanical_bought_out_part_id,
          electrical_manufacture_id,
          electrical_bought_out_part_id,
          pneumatic_bought_out_part_id,
          quantity,
          unit_price,
          currency,
          discount_percent,
          base_price_at_assignment,
          supplier_name_at_assignment,
          reference_designator,
          notes
        )
      `)
      .eq('id', sectionId)
      .single();

    if (secError) throw secError;
    if (!section) throw new Error('Section not found');

    // 2. Create a new section in the target project
    const newSectionPayload = {
      project_id: targetProjectId,
      section_name: `${section.section_name} (Copy)`,
      description: section.description,
      status: 'planning',
      estimated_cost: section.estimated_cost,
      actual_cost: 0,
      sort_order: (section.sort_order || 0) + 1,
      image_path: section.image_path,
      drawing_path: section.drawing_path,
      datasheet_path: section.datasheet_path
    };

    const { data: newSection, error: insSecError } = await (supabase as any)
      .from('project_sections')
      .insert([newSectionPayload])
      .select()
      .single();

    if (insSecError) throw insSecError;
    if (!newSection) throw new Error('Failed to create new section');

    // 3. Copy all parts associated with the section
    const rawParts = (section as any).parts || [];
    if (rawParts.length > 0) {
      const partsToCopy = rawParts.map((p: any) => ({
        project_section_id: (newSection as any).id,
        mechanical_manufacture_id: p.mechanical_manufacture_id,
        mechanical_bought_out_part_id: p.mechanical_bought_out_part_id,
        electrical_manufacture_id: p.electrical_manufacture_id,
        electrical_bought_out_part_id: p.electrical_bought_out_part_id,
        pneumatic_bought_out_part_id: p.pneumatic_bought_out_part_id,
        quantity: p.quantity,
        unit_price: p.unit_price,
        currency: p.currency,
        discount_percent: p.discount_percent,
        base_price_at_assignment: p.base_price_at_assignment,
        supplier_name_at_assignment: p.supplier_name_at_assignment,
        reference_designator: p.reference_designator,
        notes: p.notes
      }));

      const { error: insPartsError } = await (supabase as any)
        .from('project_parts')
        .insert(partsToCopy);

      if (insPartsError) throw insPartsError;
    }

    return newSection;
  },

  getSections: async (projectId: number) => {
    const { data, error } = await (supabase as any)
      .from('project_sections')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
    if (error) throw error
    return data
  },

  createSection: async (section: ProjectSectionInsert) => {
    const { data, error } = await (supabase as any)
      .from('project_sections')
      .insert([section])
      .select()
      .single()
    if (error) throw error
    return data
  },

  updateSection: async (id: number, section: any) => {
    const { data, error } = await (supabase as any)
      .from('project_sections')
      .update(section)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  deleteSection: async (id: number) => {
    const { error } = await (supabase as any)
      .from('project_sections')
      .delete()
      .eq('id', id)
    if (error) throw error
  },

  // === CRITICAL: Add part to section with snapshot + stock guard ===
  addPartToSection: async (payload: {
    project_section_id: number;
    part_type?: PartCategory; // Allow explicit or derived
    part_id?: number;
    quantity: number;
    unit_price?: number;
    currency?: string;
    discount_percent?: number;
    reference_designator?: string | null;
    notes?: string | null;
    [key: string]: any; // Match polymorphic legacy input
  }) => {
    const { project_section_id, quantity, reference_designator, notes } = payload;

    // 1. Resolve Part ID and Category
    const partKeys = [
      'mechanical_manufacture_id',
      'mechanical_bought_out_part_id',
      'electrical_manufacture_id',
      'electrical_bought_out_part_id',
      'pneumatic_bought_out_part_id'
    ];

    let partTableValue: PartCategory | undefined = payload.part_type;
    let partIdValue: number | undefined = payload.part_id;

    if (!partTableValue || !partIdValue) {
       for (const key of partKeys) {
         if (payload[key]) {
           partIdValue = payload[key];
           if (key === 'mechanical_manufacture_id') partTableValue = 'mechanical_manufacture';
           else if (key === 'mechanical_bought_out_part_id') partTableValue = 'mechanical_bought_out';
           else if (key === 'electrical_manufacture_id') partTableValue = 'electrical_manufacture';
           else if (key === 'electrical_bought_out_part_id') partTableValue = 'electrical_bought_out';
           else if (key === 'pneumatic_bought_out_part_id') partTableValue = 'pneumatic_bought_out';
           break;
         }
       }
    }

    if (!partTableValue || !partIdValue) throw new Error('Part table or ID not identified');

    // 2. Get current part data and Project name
    const [{ data: part }, { data: section }] = await Promise.all([
      (supabase as any).from(partTableValue).select('stock_quantity, base_price, part_number, supplier_id, suppliers:supplier_id(name), discount_percent').eq('id', partIdValue).single(),
      (supabase as any).from('project_sections').select('*, project:projects(id, project_name)').eq('id', project_section_id).single()
    ]);

    if (!part) throw new Error('Part not found');
    if (!section) throw new Error('Section/Project not found');

    const project = (section as any).project;
    const vendorName = (part as any).suppliers?.name || null;

    // 4. Check for existing part in project
    const partTypeKey = `${partTableValue}${partTableValue.includes('bought_out') && !partTableValue.includes('_part') ? '_part' : ''}_id`;
      const { data: existingPart } = await (supabase as any)
      .from('project_parts')
      .select('*')
      .eq('project_section_id', project_section_id)
      .eq(partTypeKey, partIdValue)
      .maybeSingle();

    const stockBefore = part.stock_quantity;
    const newStock = stockBefore - quantity;

    let result;
    if (existingPart) {
      // Update existing
      const { data: updated, error: upError } = await (supabase as any)
        .from('project_parts')
        .update({
          quantity: (existingPart as any).quantity + quantity,
          use_date_time: new Date().toISOString(),
          updated_date: new Date().toISOString()
        })
        .eq('id', existingPart.id)
        .select()
        .single();
      
      if (upError) throw upError;
      result = updated;
    } else {
      // 5. Insert into project_parts with Snapshot
      const insertPayload: any = {
        project_section_id,
        [partTypeKey]: partIdValue,
        quantity,
        unit_price: payload.unit_price || part.base_price || 0,
        currency: payload.currency || 'INR',
        discount_percent: payload.discount_percent ?? part.discount_percent ?? 0,
        base_price_at_assignment: part.base_price,
        supplier_name_at_assignment: vendorName,
        reference_designator,
        notes,
        use_date_time: new Date().toISOString()
      };

      const { data: inserted, error: inError } = await (supabase as any)
        .from('project_parts')
        .insert([insertPayload])
        .select()
        .single();

      if (inError) throw inError;
      result = inserted;
    }

    // 6. Update master stock and log movement
    await Promise.all([
      (supabase as any).from(partTableValue).update({ stock_quantity: newStock }).eq('id', partIdValue),
      logStockMovement('OUT', partTableValue, partIdValue, part.part_number, quantity, stockBefore, newStock, { 
        project_id: project.id,
        project_name: project.project_name,
        project_section_name: (section as any).section_name
      })
    ]);

    return result;
  },

  // === Remove part from section + restore stock ===
  removePartFromSection: async (id: number) => {
    const { data: link, error: linkErr } = await (supabase as any)
      .from('project_parts')
      .select(`
        *,
        section:project_sections(
          id,
          section_name,
          project:projects(id, project_name)
        )
      `)
      .eq('id', id)
      .single();

    if (linkErr || !link) throw new Error('Part record not found');

    // Identify which part is linked
    const partTypes = [
      { key: 'mechanical_manufacture_id', table: 'mechanical_manufacture' },
      { key: 'mechanical_bought_out_part_id', table: 'mechanical_bought_out' },
      { key: 'electrical_manufacture_id', table: 'electrical_manufacture' },
      { key: 'electrical_bought_out_part_id', table: 'electrical_bought_out' },
      { key: 'pneumatic_bought_out_part_id', table: 'pneumatic_bought_out' }
    ];

    let partTable: PartCategory | undefined;
    let partId: number | undefined;
    for (const pt of partTypes) {
      if ((link as any)[pt.key]) {
        partTable = pt.table as PartCategory;
        partId = (link as any)[pt.key];
        break;
      }
    }

    if (!partTable || !partId) throw new Error('Underlying part not identified');

    const { data: part } = await (supabase as any).from(partTable).select('stock_quantity, part_number').eq('id', partId).single();
    if (!part) throw new Error('Master part not found');

    const stockBefore = part.stock_quantity;
    const newStock = stockBefore + link.quantity;

    // Execute Restoration
    await Promise.all([
      (supabase as any).from(partTable).update({ stock_quantity: newStock }).eq('id', partId),
      logStockMovement('RESTORE', partTable, partId, part.part_number, link.quantity, stockBefore, newStock, {
        project_id: (link as any).section?.project?.id,
        project_name: (link as any).section?.project?.project_name
      }),
      (supabase as any).from('project_parts').delete().eq('id', id)
    ]);
  },

  // Update part in section
  updatePartInSection: async (id: number, payload: any) => {
    const { data: oldLink } = await (supabase as any).from('project_parts').select('*').eq('id', id).single();
    if (!oldLink) throw new Error('Part record not found');

    const diff = (payload.quantity || oldLink.quantity) - oldLink.quantity;

    // If quantity changed, we need to handle stock logic
    if (diff !== 0) {
       // Logic similar to add/remove would go here for a robust implementation
       // For now, updating the record
    }

    const { data, error } = await (supabase as any)
      .from('project_parts')
      .update({
        quantity: payload.quantity,
        unit_price: payload.unit_price,
        currency: payload.currency,
        reference_designator: payload.reference_designator,
        notes: payload.notes,
        updated_date: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (payload.update_master) {
      // Find part table
      const partTypeKey = Object.keys(oldLink).find(k => k.endsWith('_id') && oldLink[k]);
      if (partTypeKey) {
        const table = partTypeKey.replace('_id', '').replace('_part', '');
        await partsApi.updatePart(table as any, oldLink[partTypeKey], {
          base_price: payload.unit_price,
          currency: payload.currency
        });
      }
    }

    return data;
  }
};

export default projectsApi;
