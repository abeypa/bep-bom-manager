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
      part_price_history: {
        Row: {
          id: number;
          part_table_name: string;
          part_id: number;
          part_number: string;
          old_price: number | null;
          new_price: number;
          old_currency: string | null;
          new_currency: string;
          old_discount_percent: number | null;
          new_discount_percent: number | null;
          change_reason: string | null;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: number;
          part_table_name: string;
          part_id: number;
          part_number: string;
          old_price?: number | null;
          new_price: number;
          old_currency?: string | null;
          new_currency?: string;
          old_discount_percent?: number | null;
          new_discount_percent?: number | null;
          change_reason?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: number;
          part_table_name?: string;
          part_id?: number;
          part_number?: string;
          old_price?: number | null;
          new_price?: number;
          old_currency?: string | null;
          new_currency?: string;
          old_discount_percent?: number | null;
          new_discount_percent?: number | null;
          change_reason?: string | null;
          changed_by?: string | null;
          changed_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: number;
          movement_type: 'IN' | 'OUT' | 'ADJUST' | 'RESTORE';
          part_table_name: string;
          part_id: number;
          part_number: string;
          quantity: number;
          stock_before?: number | null;
          stock_after?: number | null;
          supplier_id?: number | null;
          supplier_name?: string | null;
          po_number?: string | null;
          project_name?: string | null;
          project_id?: number | null;
          project_section_name?: string | null;
          site_name?: string | null;
          reference_notes?: string | null;
          unit_price_at_movement?: number | null;
          currency: string;
          moved_by?: string | null;
          moved_at: string;
          created_date: string;
        };
        Insert: {
          id?: number;
          movement_type: 'IN' | 'OUT' | 'ADJUST' | 'RESTORE';
          part_table_name: string;
          part_id: number;
          part_number: string;
          quantity: number;
          stock_before?: number | null;
          stock_after?: number | null;
          supplier_id?: number | null;
          supplier_name?: string | null;
          po_number?: string | null;
          project_name?: string | null;
          project_id?: number | null;
          project_section_name?: string | null;
          site_name?: string | null;
          reference_notes?: string | null;
          unit_price_at_movement?: number | null;
          currency?: string;
          moved_by?: string | null;
          moved_at?: string;
          created_date?: string;
        };
        Update: {
          id?: number;
          movement_type?: 'IN' | 'OUT' | 'ADJUST' | 'RESTORE';
          part_table_name?: string;
          part_id?: number;
          part_number?: string;
          quantity?: number;
          stock_before?: number | null;
          stock_after?: number | null;
          supplier_id?: number | null;
          supplier_name?: string | null;
          po_number?: string | null;
          project_name?: string | null;
          project_id?: number | null;
          project_section_name?: string | null;
          site_name?: string | null;
          reference_notes?: string | null;
          unit_price_at_movement?: number | null;
          currency?: string;
          moved_by?: string | null;
          moved_at?: string;
          created_date?: string;
        };
      };
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
          sort_order: number | null
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
          sort_order?: number | null
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
          sort_order?: number | null
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
      mechanical_bought_out: {
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
      electrical_manufacture: {
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
          datasheet_url: string | null
          image_path: string | null
          cad_file_url: string | null
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
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
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
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
          po_number?: string | null
          pdf_path?: string | null
          pdf2_path?: string | null
          pdf3_path?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      electrical_bought_out: {
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
          datasheet_url: string | null
          image_path: string | null
          cad_file_url: string | null
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
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
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
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
          po_number?: string | null
          pdf_path?: string | null
          pdf2_path?: string | null
          pdf3_path?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      pneumatic_bought_out: {
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
          port_size: string | null
          operating_pressure: string | null
          datasheet_url: string | null
          image_path: string | null
          cad_file_url: string | null
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
          port_size?: string | null
          operating_pressure?: string | null
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
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
          port_size?: string | null
          operating_pressure?: string | null
          datasheet_url?: string | null
          image_path?: string | null
          cad_file_url?: string | null
          po_number?: string | null
          pdf_path?: string | null
          pdf2_path?: string | null
          pdf3_path?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      project_parts: {
        Row: {
          id: number;
          project_section_id: number;
          mechanical_manufacture_id?: number | null;
          mechanical_bought_out_part_id?: number | null;
          electrical_manufacture_id?: number | null;
          electrical_bought_out_part_id?: number | null;
          pneumatic_bought_out_part_id?: number | null;
          quantity: number;
          unit_price: number;
          currency: string;
          discount_percent: number;
          base_price_at_assignment?: number | null;
          supplier_name_at_assignment?: string | null;
          reference_designator?: string | null;
          notes?: string | null;
          use_date_time?: string | null;
          assigned_at?: string | null;
          created_date: string;
          updated_date?: string | null;
        };
        Insert: {
          id?: number;
          project_section_id: number;
          mechanical_manufacture_id?: number | null;
          mechanical_bought_out_part_id?: number | null;
          electrical_manufacture_id?: number | null;
          electrical_bought_out_part_id?: number | null;
          pneumatic_bought_out_part_id?: number | null;
          quantity?: number;
          unit_price?: number;
          currency?: string;
          discount_percent?: number;
          base_price_at_assignment?: number | null;
          supplier_name_at_assignment?: string | null;
          reference_designator?: string | null;
          notes?: string | null;
          use_date_time?: string | null;
          assigned_at?: string | null;
          created_date?: string;
          updated_date?: string | null;
        };
        Update: Partial<{
          id: number;
          project_section_id: number;
          mechanical_manufacture_id?: number | null;
          mechanical_bought_out_part_id?: number | null;
          electrical_manufacture_id?: number | null;
          electrical_bought_out_part_id?: number | null;
          pneumatic_bought_out_part_id?: number | null;
          quantity: number;
          unit_price: number;
          currency: string;
          discount_percent: number;
          base_price_at_assignment?: number | null;
          supplier_name_at_assignment?: string | null;
          reference_designator?: string | null;
          notes?: string | null;
          use_date_time?: string | null;
          assigned_at?: string | null;
          created_date: string;
          updated_date?: string | null;
        }>;
      };
      purchase_orders: {
        Row: {
          id: number
          po_number: string
          project_id: number
          supplier_id: number
          po_date: string
          status: 'Pending' | 'Sent' | 'Confirmed' | 'Partial' | 'Received' | 'Cancelled'
          currency: string
          grand_total: number
          total_items: number
          total_quantity: number
          notes: string | null
          terms: string | null
          created_date: string
          updated_date: string | null
        }
        Insert: {
          id?: number
          po_number: string
          project_id: number
          supplier_id: number
          po_date?: string
          status?: 'Pending' | 'Sent' | 'Confirmed' | 'Partial' | 'Received' | 'Cancelled'
          currency?: string
          grand_total?: number
          total_items?: number
          total_quantity?: number
          notes?: string | null
          terms?: string | null
          created_date?: string
          updated_date?: string | null
        }
        Update: {
          id?: number
          po_number?: string
          project_id?: number
          supplier_id?: number
          po_date?: string
          status?: 'Pending' | 'Sent' | 'Confirmed' | 'Partial' | 'Received' | 'Cancelled'
          currency?: string
          grand_total?: number
          total_items?: number
          total_quantity?: number
          notes?: string | null
          terms?: string | null
          created_date?: string
          updated_date?: string | null
        }
      }
      purchase_order_items: {
        Row: {
          id: number
          purchase_order_id: number
          part_type: string
          part_number: string
          description: string | null
          quantity: number
          unit_price: number
          discount_percent: number
          total_amount: number
          project_part_id: number | null
        }
        Insert: {
          id?: number
          purchase_order_id: number
          part_type: string
          part_number: string
          description?: string | null
          quantity?: number
          unit_price?: number
          discount_percent?: number
          total_amount?: number
          project_part_id?: number | null
        }
        Update: {
          id?: number
          purchase_order_id?: number
          part_type?: string
          part_number?: string
          description?: string | null
          quantity?: number
          unit_price?: number
          discount_percent?: number
          total_amount?: number
          project_part_id?: number | null
        }
      }
      part_usage_logs: {
        Row: {
          id: number
          project_name: string
          site_name: string | null
          use_date_time: string
          part_number: string
          part_table_name: string
          quantity: number
          created_date: string
        }
        Insert: {
          id?: number
          project_name: string
          site_name?: string | null
          use_date_time?: string
          part_number: string
          part_table_name: string
          quantity?: number
          created_date?: string
        }
        Update: {
          id?: number
          project_name?: string
          site_name?: string | null
          use_date_time?: string
          part_number?: string
          part_table_name?: string
          quantity?: number
          created_date?: string
        }
      }
      json_excel_file_uploaded: {
        Row: {
          id: number
          user_name: string | null
          date_time: string
          json_content_type: string | null
          json_data: string | null
          excel_path: string | null
          parts_processed: number
          parts_added: number
          parts_updated: number
          errors: number
          error_message: string | null
        }
        Insert: {
          id?: number
          user_name?: string | null
          date_time?: string
          json_content_type?: string | null
          json_data?: string | null
          excel_path?: string | null
          parts_processed?: number
          parts_added?: number
          parts_updated?: number
          errors?: number
          error_message?: string | null
        }
        Update: {
          id?: number
          user_name?: string | null
          date_time?: string
          json_content_type?: string | null
          json_data?: string | null
          excel_path?: string | null
          parts_processed?: number
          parts_added?: number
          parts_updated?: number
          errors?: number
          error_message?: string | null
        }
      }
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