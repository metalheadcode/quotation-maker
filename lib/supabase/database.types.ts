export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bank_info: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          id: string
          is_default: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          is_favorite: boolean | null
          last_used_at: string | null
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_favorite?: boolean | null
          last_used_at?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      company_info: {
        Row: {
          address: string
          created_at: string | null
          email: string
          id: string
          is_default: boolean | null
          logo_url: string | null
          name: string
          phone: string
          registration_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name: string
          phone: string
          registration_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          id?: string
          is_default?: boolean | null
          logo_url?: string | null
          name?: string
          phone?: string
          registration_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          bank_account_name: string
          bank_account_number: string
          bank_info_id: string | null
          bank_name: string
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          company_info_id: string | null
          created_at: string | null
          discount_value: number | null
          due_date: string
          from_company_address: string | null
          from_company_email: string | null
          from_company_logo_url: string | null
          from_company_name: string | null
          from_company_phone: string | null
          from_company_registration: string | null
          id: string
          invoice_date: string
          invoice_number: string
          items: Json
          notes: string | null
          paid_amount: number | null
          paid_date: string | null
          payment_reference: string | null
          po_number: string | null
          project_title: string | null
          quotation_id: string | null
          shipping: number | null
          sst_amount: number | null
          sst_rate: number | null
          status: string | null
          subtotal: number
          terms: string | null
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          bank_account_name: string
          bank_account_number: string
          bank_info_id?: string | null
          bank_name: string
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_info_id?: string | null
          created_at?: string | null
          discount_value?: number | null
          due_date: string
          from_company_address?: string | null
          from_company_email?: string | null
          from_company_logo_url?: string | null
          from_company_name?: string | null
          from_company_phone?: string | null
          from_company_registration?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          po_number?: string | null
          project_title?: string | null
          quotation_id?: string | null
          shipping?: number | null
          sst_amount?: number | null
          sst_rate?: number | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          bank_account_name?: string
          bank_account_number?: string
          bank_info_id?: string | null
          bank_name?: string
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_info_id?: string | null
          created_at?: string | null
          discount_value?: number | null
          due_date?: string
          from_company_address?: string | null
          from_company_email?: string | null
          from_company_logo_url?: string | null
          from_company_name?: string | null
          from_company_phone?: string | null
          from_company_registration?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          paid_date?: string | null
          payment_reference?: string | null
          po_number?: string | null
          project_title?: string | null
          quotation_id?: string | null
          shipping?: number | null
          sst_amount?: number | null
          sst_rate?: number | null
          status?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_bank_info_id_fkey"
            columns: ["bank_info_id"]
            isOneToOne: false
            referencedRelation: "bank_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_info_id_fkey"
            columns: ["company_info_id"]
            isOneToOne: false
            referencedRelation: "company_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          bank_account_name: string | null
          bank_account_number: string | null
          bank_info_id: string | null
          bank_name: string | null
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_id: string | null
          client_name: string | null
          client_phone: string | null
          company_info_id: string | null
          created_at: string | null
          date: string
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          from_company_address: string | null
          from_company_email: string | null
          from_company_logo_url: string | null
          from_company_name: string | null
          from_company_phone: string | null
          from_company_registration: string | null
          id: string
          items: Json
          notes: string | null
          project_title: string | null
          quotation_number: string
          shipping: number | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          tax_rate: number | null
          terms: string | null
          total: number
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_info_id?: string | null
          bank_name?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_info_id?: string | null
          created_at?: string | null
          date?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          from_company_address?: string | null
          from_company_email?: string | null
          from_company_logo_url?: string | null
          from_company_name?: string | null
          from_company_phone?: string | null
          from_company_registration?: string | null
          id?: string
          items?: Json
          notes?: string | null
          project_title?: string | null
          quotation_number: string
          shipping?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_info_id?: string | null
          bank_name?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string | null
          client_phone?: string | null
          company_info_id?: string | null
          created_at?: string | null
          date?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          from_company_address?: string | null
          from_company_email?: string | null
          from_company_logo_url?: string | null
          from_company_name?: string | null
          from_company_phone?: string | null
          from_company_registration?: string | null
          id?: string
          items?: Json
          notes?: string | null
          project_title?: string | null
          quotation_number?: string
          shipping?: number | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          tax_rate?: number | null
          terms?: string | null
          total?: number
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_bank_info_id_fkey"
            columns: ["bank_info_id"]
            isOneToOne: false
            referencedRelation: "bank_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_company_info_id_fkey"
            columns: ["company_info_id"]
            isOneToOne: false
            referencedRelation: "company_info"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      generate_quotation_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

