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
      blog_posts: {
        Row: {
          author: string | null
          category: string
          content_de: string
          content_en: string
          content_es: string
          content_fr: string
          content_it: string
          created_at: string
          featured_image: string | null
          id: string
          is_published: boolean
          meta_description_de: string | null
          meta_description_en: string | null
          meta_description_es: string | null
          meta_description_fr: string | null
          meta_description_it: string | null
          published_at: string | null
          slug_de: string
          slug_en: string
          slug_es: string
          slug_fr: string
          slug_it: string
          title_de: string
          title_en: string
          title_es: string
          title_fr: string
          title_it: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string
          content_de?: string
          content_en?: string
          content_es?: string
          content_fr?: string
          content_it?: string
          created_at?: string
          featured_image?: string | null
          id?: string
          is_published?: boolean
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_it?: string | null
          published_at?: string | null
          slug_de: string
          slug_en: string
          slug_es: string
          slug_fr: string
          slug_it: string
          title_de: string
          title_en: string
          title_es: string
          title_fr: string
          title_it: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string
          content_de?: string
          content_en?: string
          content_es?: string
          content_fr?: string
          content_it?: string
          created_at?: string
          featured_image?: string | null
          id?: string
          is_published?: boolean
          meta_description_de?: string | null
          meta_description_en?: string | null
          meta_description_es?: string | null
          meta_description_fr?: string | null
          meta_description_it?: string | null
          published_at?: string | null
          slug_de?: string
          slug_en?: string
          slug_es?: string
          slug_fr?: string
          slug_it?: string
          title_de?: string
          title_en?: string
          title_es?: string
          title_fr?: string
          title_it?: string
          updated_at?: string
        }
        Relationships: []
      }
      burners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          specifications?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          specifications?: Json | null
          updated_at?: string
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
          erp_webhook_url: string | null
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
          sent_via_email: boolean | null
          sent_via_whatsapp: boolean | null
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
          erp_webhook_url?: string | null
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
          sent_via_email?: boolean | null
          sent_via_whatsapp?: boolean | null
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
          erp_webhook_url?: string | null
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
          sent_via_email?: boolean | null
          sent_via_whatsapp?: boolean | null
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
      email_history: {
        Row: {
          body: string
          email_type: string
          id: string
          metadata: Json | null
          sent_at: string
          sent_from: string
          sent_to: string
          session_id: string
          subject: string
        }
        Insert: {
          body: string
          email_type: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          sent_from?: string
          sent_to: string
          session_id: string
          subject: string
        }
        Update: {
          body?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          sent_at?: string
          sent_from?: string
          sent_to?: string
          session_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_email_history_session"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "configurator_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          burner_id: string | null
          coating: string | null
          created_at: string
          description: string | null
          diameter: number | null
          fuel_type: string | null
          id: string
          image_url: string | null
          item_type: string
          line_total: number
          model_name: string | null
          order_id: string
          oven_id: string | null
          quantity: number
          sort_order: number
          unit_price: number
        }
        Insert: {
          burner_id?: string | null
          coating?: string | null
          created_at?: string
          description?: string | null
          diameter?: number | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          line_total?: number
          model_name?: string | null
          order_id: string
          oven_id?: string | null
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Update: {
          burner_id?: string | null
          coating?: string | null
          created_at?: string
          description?: string | null
          diameter?: number | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          line_total?: number
          model_name?: string | null
          order_id?: string
          oven_id?: string | null
          quantity?: number
          sort_order?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_burner_id_fkey"
            columns: ["burner_id"]
            isOneToOne: false
            referencedRelation: "burners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_oven_id_fkey"
            columns: ["oven_id"]
            isOneToOne: false
            referencedRelation: "configurator_ovens"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          balance_due: number
          billing_address: string | null
          carrier: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string | null
          deposit_paid: number
          estimated_delivery: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          order_number: string
          payment_status: string
          proforma_id: string | null
          shipped_at: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          balance_due?: number
          billing_address?: string | null
          carrier?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          deposit_paid?: number
          estimated_delivery?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: string
          proforma_id?: string | null
          shipped_at?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          balance_due?: number
          billing_address?: string | null
          carrier?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          deposit_paid?: number
          estimated_delivery?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          order_number?: string
          payment_status?: string
          proforma_id?: string | null
          shipped_at?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_proforma_id_fkey"
            columns: ["proforma_id"]
            isOneToOne: false
            referencedRelation: "proformas"
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
      proforma_items: {
        Row: {
          ai_render_url: string | null
          burner_id: string | null
          coating: string | null
          created_at: string
          custom_description: string | null
          custom_name: string | null
          diameter: number | null
          fuel_type: string | null
          id: string
          image_url: string | null
          item_type: string
          line_total: number
          model_name: string | null
          oven_id: string | null
          proforma_id: string
          quantity: number
          sort_order: number
          specifications: Json | null
          unit_price: number
        }
        Insert: {
          ai_render_url?: string | null
          burner_id?: string | null
          coating?: string | null
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          diameter?: number | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          line_total?: number
          model_name?: string | null
          oven_id?: string | null
          proforma_id: string
          quantity?: number
          sort_order?: number
          specifications?: Json | null
          unit_price?: number
        }
        Update: {
          ai_render_url?: string | null
          burner_id?: string | null
          coating?: string | null
          created_at?: string
          custom_description?: string | null
          custom_name?: string | null
          diameter?: number | null
          fuel_type?: string | null
          id?: string
          image_url?: string | null
          item_type?: string
          line_total?: number
          model_name?: string | null
          oven_id?: string | null
          proforma_id?: string
          quantity?: number
          sort_order?: number
          specifications?: Json | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "proforma_items_burner_id_fkey"
            columns: ["burner_id"]
            isOneToOne: false
            referencedRelation: "burners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proforma_items_oven_id_fkey"
            columns: ["oven_id"]
            isOneToOne: false
            referencedRelation: "configurator_ovens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proforma_items_proforma_id_fkey"
            columns: ["proforma_id"]
            isOneToOne: false
            referencedRelation: "proformas"
            referencedColumns: ["id"]
          },
        ]
      }
      proformas: {
        Row: {
          billing_address: string | null
          company_name: string | null
          created_at: string
          created_by: string | null
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_days: number | null
          deposit_amount: number
          deposit_percentage: number
          id: string
          language: string
          notes: string | null
          payment_completed_at: string | null
          payment_option: string
          payment_status: string
          proforma_number: string | null
          status: string
          stripe_session_id: string | null
          token: string
          total_price: number
          updated_at: string
          valid_until: string | null
          vat_number: string | null
        }
        Insert: {
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_days?: number | null
          deposit_amount?: number
          deposit_percentage?: number
          id?: string
          language?: string
          notes?: string | null
          payment_completed_at?: string | null
          payment_option?: string
          payment_status?: string
          proforma_number?: string | null
          status?: string
          stripe_session_id?: string | null
          token?: string
          total_price?: number
          updated_at?: string
          valid_until?: string | null
          vat_number?: string | null
        }
        Update: {
          billing_address?: string | null
          company_name?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_days?: number | null
          deposit_amount?: number
          deposit_percentage?: number
          id?: string
          language?: string
          notes?: string | null
          payment_completed_at?: string | null
          payment_option?: string
          payment_status?: string
          proforma_number?: string | null
          status?: string
          stripe_session_id?: string | null
          token?: string
          total_price?: number
          updated_at?: string
          valid_until?: string | null
          vat_number?: string | null
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
      website_leads: {
        Row: {
          city: string | null
          company: string | null
          created_at: string
          email: string | null
          first_name: string | null
          form_type: string
          id: string
          last_name: string | null
          metadata: Json | null
          notes: string | null
          oven_type: string | null
          phone: string | null
          status: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          form_type: string
          id?: string
          last_name?: string | null
          metadata?: Json | null
          notes?: string | null
          oven_type?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          form_type?: string
          id?: string
          last_name?: string | null
          metadata?: Json | null
          notes?: string | null
          oven_type?: string | null
          phone?: string | null
          status?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_emails: {
        Args: { user_ids: string[] }
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "commerciale" | "produzione"
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
      app_role: ["admin", "user", "commerciale", "produzione"],
    },
  },
} as const
