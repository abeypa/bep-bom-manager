export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      suppliers: {
        Row: {
          id: number
          name: string
          contact_person: string | null
          email: string | null
          phone: string | null
          address: string | null
          payment_terms: string | null
          notes: string | null
          created_date: string
          updated_date: string | null
        }
        Insert: {
          id?: number
          name: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          notes?: string | null
          created_date?: string
          updated_date?: string | null
        }
        Update: {
          id?: number
          name?: string
          contact_person?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          payment_terms?: string | null
          notes?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      projects: {
        Row: {
          id: number
          project_name: string
          project_number: string
          customer: string | null
          description: string | null
          status: 'planning' | 'design' | 'build' | 'testing' | 'completed' | 'on_hold' | 'cancelled'
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          mechanical_design_status: string | null
          ee_design_status: string | null
          pneumatic_design_status: string | null
          po_release_status: string | null
          part_arrival_status: string | null
          machine_build_status: string | null
          created_date: string
          updated_date: string | null
        }
        Insert: {
          id?: number
          project_name: string
          project_number: string
          customer?: string | null
          description?: string | null
          status?: 'planning' | 'design' | 'build' | 'testing' | 'completed' | 'on_hold' | 'cancelled'
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          mechanical_design_status?: string | null
          ee_design_status?: string | null
          pneumatic_design_status?: string | null
          po_release_status?: string | null
          part_arrival_status?: string | null
          machine_build_status?: string | null
          created_date?: string
          updated_date?: string | null
        }
        Update: {
          id?: number
          project_name?: string
          project_number?: string
          customer?: string | null
          description?: string | null
          status?: 'planning' | 'design' | 'build' | 'testing' | 'completed' | 'on_hold' | 'cancelled'
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          mechanical_design_status?: string | null
          ee_design_status?: string | null
          pneumatic_design_status?: string | null
          po_release_status?: string | null
          part_arrival_status?: string | null
          machine_build_status?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      project_sections: {
        Row: {
          id: number
          project_id: number
          section_name: string
          description: string | null
          status: string
          estimated_cost: number | null
          actual_cost: number | null
          start_date: string | null
          target_completion_date: string | null
          sort_order: number
          created_date: string
          updated_date: string | null
        }
        Insert: {
          id?: number
          project_id: number
          section_name: string
          description?: string | null
          status?: string
          estimated_cost?: number | null
          actual_cost?: number | null
          start_date?: string | null
          target_completion_date?: string | null
          sort_order?: number
          created_date?: string
          updated_date?: string | null
        }
        Update: {
          id?: number
          project_id?: number
          section_name?: string
          description?: string | null
          status?: string
          estimated_cost?: number | null
          actual_cost?: number | null
          start_date?: string | null
          target_completion_date?: string | null
          sort_order?: number
          created_date?: string
          updated_date?: string | null
        }
      }
      mechanical_manufacture: {
        Row: {
          id: number
          part_number: string
          beperp_part_no: string | null
          description: string | null
          supplier_id: number | null
          base_price: number
          currency: string
          discount_percent: number
          stock_quantity: number
          min_stock_level: number
          order_qty: number
          received_qty: number
          lead_time: string | null
          total_amount: number
          total_stock: number
          specifications: string | null
          manufacturer: string | null
          manufacturer_part_number: string | null
          material: string | null
          finish: string | null
          weight: number | null
          datasheet_url: string | null
          image_path: string | null
          cad_file_url: string | null
          pdm_file_path: string | null
          vendor_part_number: string | null
          po_number: string | null
          pdf_path: string | null
          pdf2_path: string | null
          pdf3_path: string | null
          created_date: string
          updated_date: string | null
        }
        Insert: {
          id?: number
          part_number: string
          beperp_part_no?: string | null
          description?: string | null
          supplier_id?: number | null
          base_price?: number
          currency?: string
          discount_percent?: number
          stock_quantity?: number
          min_stock_level?: number
          order_qty?: number
          received_qty?: number
          lead_time?: string | null
          total_amount?: number
          total_stock?: number
          specifications?: string | null
          manufacturer?: string | null
          manufacturer_part_number?: string | null
          material?: string | null
          finish?: string | null
          weight?: number | null
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
          pdm_file_path?: string | null
          vendor_part_number?: string | null
          po_number?: string | null
          pdf_path?: string | null
          pdf2_path?: string | null
          pdf3_path?: string | null
          created_date?: string
          updated_date?: string | null
        }
        Update: {
          id?: number
          part_number?: string
          beperp_part_no?: string | null
          description?: string | null
          supplier_id?: number | null
          base_price?: number
          currency?: string
          discount_percent?: number
          stock_quantity?: number
          min_stock_level?: number
          order_qty?: number
          received_qty?: number
          lead_time?: string | null
          total_amount?: number
          total_stock?: number
          specifications?: string | null
          manufacturer?: string | null
          manufacturer_part_number?: string | null
          material?: string | null
          finish?: string | null
          weight?: number | null
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
          pdm_file_path?: string | null
          vendor_part_number?: string | null
          po_number?: string | null
          pdf_path?: string | null
          pdf2_path?: string | null
          pdf3_path?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      // Similar types for other tables would be defined here
      // mechanical_bought_out, electrical_manufacture, electrical_bought_out, pneumatic_bought_out
      // project_parts, purchase_orders, purchase_order_items, part_usage_logs, json_excel_file_uploaded
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}