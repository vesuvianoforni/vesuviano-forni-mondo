export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          contact_method: string
          created_at: string
          id: string
          notes: string | null
          phone_number: string
          status: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          contact_method: string
          created_at?: string
          id?: string
          notes?: string | null
          phone_number: string
          status?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          contact_method?: string
          created_at?: string
          id?: string
          notes?: string | null
          phone_number?: string
          status?: string
        }
        Relationships: []
      }
      configurator_options: {
        Row: {
          created_at: string
          description: string | null
          diameter: number | null
          id: string
          is_active: boolean
          name: string
          price: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          diameter?: number | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          diameter?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      configurator_ovens: {
        Row: {
          additional_images: string[] | null
          base_price_a: number
          base_price_b: number | null
          base_price_c: number | null
          coatings: Json | null
          created_at: string
          delivery_time_weeks: number
          description: string | null
          diameter: number
          electric_price_a: number | null
          electric_price_b: number | null
          electric_price_c: number | null
          fuel_type: string[]
          gas_price_a: number | null
          gas_price_b: number | null
          gas_price_c: number | null
          id: string
          image_url: string
          installation_price_a: number | null
          installation_price_b: number | null
          installation_price_c: number | null
          is_active: boolean
          model_name: string
          pizza_capacity: string
          sizes: Json | null
          updated_at: string
          video_url_360: string | null
        }
        Insert: {
          additional_images?: string[] | null
          base_price_a: number
          base_price_b?: number | null
          base_price_c?: number | null
          coatings?: Json | null
          created_at?: string
          delivery_time_weeks: number
          description?: string | null
          diameter: number
          electric_price_a?: number | null
          electric_price_b?: number | null
          electric_price_c?: number | null
          fuel_type: string[]
          gas_price_a?: number | null
          gas_price_b?: number | null
          gas_price_c?: number | null
          id?: string
          image_url: string
          installation_price_a?: number | null
          installation_price_b?: number | null
          installation_price_c?: number | null
          is_active?: boolean
          model_name: string
          pizza_capacity: string
          sizes?: Json | null
          updated_at?: string
          video_url_360?: string | null
        }
        Update: {
          additional_images?: string[] | null
          base_price_a?: number
          base_price_b?: number | null
          base_price_c?: number | null
          coatings?: Json | null
          created_at?: string
          delivery_time_weeks?: number
          description?: string | null
          diameter?: number
          electric_price_a?: number | null
          electric_price_b?: number | null
          electric_price_c?: number | null
          fuel_type?: string[]
          gas_price_a?: number | null
          gas_price_b?: number | null
          gas_price_c?: number | null
          id?: string
          image_url?: string
          installation_price_a?: number | null
          installation_price_b?: number | null
          installation_price_c?: number | null
          is_active?: boolean
          model_name?: string
          pizza_capacity?: string
          sizes?: Json | null
          updated_at?: string
          video_url_360?: string | null
        }
        Relationships: []
      }
      configurator_quotes: {
        Row: {
          billing_address: string | null
          company_name: string | null
          created_at: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_address: string | null
          delivery_time_weeks: number
          final_notes: string | null
          has_gas: boolean
          has_installation: boolean
          id: string
          notes: string | null
          oven_id: string | null
          payment_completed: boolean | null
          status: string
          stripe_session_id: string | null
          total_price: number
          vat_number: string | null
        }
        Insert: {
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_time_weeks: number
          final_notes?: string | null
          has_gas?: boolean
          has_installation?: boolean
          id?: string
          notes?: string | null
          oven_id?: string | null
          payment_completed?: boolean | null
          status?: string
          stripe_session_id?: string | null
          total_price: number
          vat_number?: string | null
        }
        Update: {
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_address?: string | null
          delivery_time_weeks?: number
          final_notes?: string | null
          has_gas?: boolean
          has_installation?: boolean
          id?: string
          notes?: string | null
          oven_id?: string | null
          payment_completed?: boolean | null
          status?: string
          stripe_session_id?: string | null
          total_price?: number
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configurator_quotes_oven_id_fkey"
            columns: ["oven_id"]
            isOneToOne: false
            referencedRelation: "configurator_ovens"
            referencedColumns: ["id"]
          },
        ]
      }
      configurator_sessions: {
        Row: {
          created_at: string
          created_by: string | null
          customer_actions: Json | null
          customer_email: string | null
          customer_info: Json | null
          customer_name: string | null
          customer_phone: string | null
          expires_at: string | null
          feedback_date: string | null
          feedback_reason: string | null
          feedback_status: string | null
          id: string
          is_used: boolean
          last_opened_at: string | null
          link_sent: boolean
          price_list: string
          quote_id: string | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_actions?: Json | null
          customer_email?: string | null
          customer_info?: Json | null
          customer_name?: string | null
          customer_phone?: string | null
          expires_at?: string | null
          feedback_date?: string | null
          feedback_reason?: string | null
          feedback_status?: string | null
          id?: string
          is_used?: boolean
          last_opened_at?: string | null
          link_sent?: boolean
          price_list?: string
          quote_id?: string | null
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_actions?: Json | null
          customer_email?: string | null
          customer_info?: Json | null
          customer_name?: string | null
          customer_phone?: string | null
          expires_at?: string | null
          feedback_date?: string | null
          feedback_reason?: string | null
          feedback_status?: string | null
          id?: string
          is_used?: boolean
          last_opened_at?: string | null
          link_sent?: boolean
          price_list?: string
          quote_id?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "configurator_sessions_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "configurator_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      ovens: {
        Row: {
          category: string
          coating_type: string | null
          created_at: string
          description: string | null
          fuel_type: string | null
          id: string
          image_url: string
          name: string
          specifications: Json | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          category: string
          coating_type?: string | null
          created_at?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          image_url: string
          name: string
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          coating_type?: string | null
          created_at?: string
          description?: string | null
          fuel_type?: string | null
          id?: string
          image_url?: string
          name?: string
          specifications?: Json | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
