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
      ai_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | undefined
          content: string
          created_at?: string | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          sort_order?: number | undefined
          title: string
          updated_at?: string | undefined
        }
        Update: {
          category?: string | undefined
          content?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          sort_order?: number | undefined
          title?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
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
          created_at?: string | undefined
          id?: string | undefined
          notes?: string | null | undefined
          phone_number: string
          status?: string | undefined
        }
        Update: {
          appointment_date?: string | undefined
          appointment_time?: string | undefined
          contact_method?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          notes?: string | null | undefined
          phone_number?: string | undefined
          status?: string | undefined
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
          author?: string | null | undefined
          category?: string | undefined
          content_de?: string | undefined
          content_en?: string | undefined
          content_es?: string | undefined
          content_fr?: string | undefined
          content_it?: string | undefined
          created_at?: string | undefined
          featured_image?: string | null | undefined
          id?: string | undefined
          is_published?: boolean | undefined
          meta_description_de?: string | null | undefined
          meta_description_en?: string | null | undefined
          meta_description_es?: string | null | undefined
          meta_description_fr?: string | null | undefined
          meta_description_it?: string | null | undefined
          published_at?: string | null | undefined
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
          updated_at?: string | undefined
        }
        Update: {
          author?: string | null | undefined
          category?: string | undefined
          content_de?: string | undefined
          content_en?: string | undefined
          content_es?: string | undefined
          content_fr?: string | undefined
          content_it?: string | undefined
          created_at?: string | undefined
          featured_image?: string | null | undefined
          id?: string | undefined
          is_published?: boolean | undefined
          meta_description_de?: string | null | undefined
          meta_description_en?: string | null | undefined
          meta_description_es?: string | null | undefined
          meta_description_fr?: string | null | undefined
          meta_description_it?: string | null | undefined
          published_at?: string | null | undefined
          slug_de?: string | undefined
          slug_en?: string | undefined
          slug_es?: string | undefined
          slug_fr?: string | undefined
          slug_it?: string | undefined
          title_de?: string | undefined
          title_en?: string | undefined
          title_es?: string | undefined
          title_fr?: string | undefined
          title_it?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      bruno_actions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          args: Json
          channel: string | null
          created_at: string
          error_code: string | null
          expires_at: string
          finished_at: string | null
          id: string
          lead_id: string | null
          message_id: string | null
          request_text: string
          requested_by: string
          requested_label: string | null
          result: Json
          scheduled_at: string | null
          source: string
          started_at: string | null
          status: string
          tool_name: string
          updated_at: string
          voice_call_id: string | null
        }
        Insert: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          args?: Json | undefined
          channel?: string | null | undefined
          created_at?: string | undefined
          error_code?: string | null | undefined
          expires_at?: string | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          lead_id?: string | null | undefined
          message_id?: string | null | undefined
          request_text?: string | undefined
          requested_by: string
          requested_label?: string | null | undefined
          result?: Json | undefined
          scheduled_at?: string | null | undefined
          source?: string | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          tool_name: string
          updated_at?: string | undefined
          voice_call_id?: string | null | undefined
        }
        Update: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          args?: Json | undefined
          channel?: string | null | undefined
          created_at?: string | undefined
          error_code?: string | null | undefined
          expires_at?: string | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          lead_id?: string | null | undefined
          message_id?: string | null | undefined
          request_text?: string | undefined
          requested_by?: string | undefined
          requested_label?: string | null | undefined
          result?: Json | undefined
          scheduled_at?: string | null | undefined
          source?: string | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          tool_name?: string | undefined
          updated_at?: string | undefined
          voice_call_id?: string | null | undefined
        }
        Relationships: [
          {
            foreignKeyName: "bruno_actions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bruno_actions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "crm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bruno_actions_voice_call_id_fkey"
            columns: ["voice_call_id"]
            isOneToOne: false
            referencedRelation: "bruno_voice_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      bruno_call_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          call_type: string
          created_at: string
          gap_minutes: number
          id: string
          instructions: string | null
          last_error: string | null
          lease_until: string | null
          objective: string
          requested_by: string | null
          status: string
          tick_token: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          call_type?: string | undefined
          created_at?: string | undefined
          gap_minutes?: number | undefined
          id?: string | undefined
          instructions?: string | null | undefined
          last_error?: string | null | undefined
          lease_until?: string | null | undefined
          objective: string
          requested_by?: string | null | undefined
          status?: string | undefined
          tick_token?: string | undefined
          title: string
          updated_at?: string | undefined
        }
        Update: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          call_type?: string | undefined
          created_at?: string | undefined
          gap_minutes?: number | undefined
          id?: string | undefined
          instructions?: string | null | undefined
          last_error?: string | null | undefined
          lease_until?: string | null | undefined
          objective?: string | undefined
          requested_by?: string | null | undefined
          status?: string | undefined
          tick_token?: string | undefined
          title?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      bruno_knowledge: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          sort_order: number
          stages: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | undefined
          content: string
          created_at?: string | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          sort_order?: number | undefined
          stages?: string[] | undefined
          title: string
          updated_at?: string | undefined
        }
        Update: {
          category?: string | undefined
          content?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          sort_order?: number | undefined
          stages?: string[] | undefined
          title?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      bruno_voice_calls: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          call_type: string
          conversation_id: string | null
          created_at: string
          customer_timezone: string
          destination: string
          direction: string
          duration_seconds: number | null
          ended_at: string | null
          error_code: string | null
          expires_at: string
          from_number: string
          id: string
          instructions: string | null
          language: string
          lead_id: string
          objective: string
          plan_id: string | null
          plan_position: number | null
          provider_call_id: string | null
          qualification: Json
          recording_path: string | null
          recording_status: string
          requested_by: string | null
          started_at: string | null
          status: string
          summary: string | null
          summary_status: string
          transcript: Json
          transcript_status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          call_type?: string | undefined
          conversation_id?: string | null | undefined
          created_at?: string | undefined
          customer_timezone: string
          destination: string
          direction?: string | undefined
          duration_seconds?: number | null | undefined
          ended_at?: string | null | undefined
          error_code?: string | null | undefined
          expires_at?: string | undefined
          from_number?: string | undefined
          id?: string | undefined
          instructions?: string | null | undefined
          language?: string | undefined
          lead_id: string
          objective: string
          plan_id?: string | null | undefined
          plan_position?: number | null | undefined
          provider_call_id?: string | null | undefined
          qualification?: Json | undefined
          recording_path?: string | null | undefined
          recording_status?: string | undefined
          requested_by?: string | null | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          summary?: string | null | undefined
          summary_status?: string | undefined
          transcript?: Json | undefined
          transcript_status?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          call_type?: string | undefined
          conversation_id?: string | null | undefined
          created_at?: string | undefined
          customer_timezone?: string | undefined
          destination?: string | undefined
          direction?: string | undefined
          duration_seconds?: number | null | undefined
          ended_at?: string | null | undefined
          error_code?: string | null | undefined
          expires_at?: string | undefined
          from_number?: string | undefined
          id?: string | undefined
          instructions?: string | null | undefined
          language?: string | undefined
          lead_id?: string | undefined
          objective?: string | undefined
          plan_id?: string | null | undefined
          plan_position?: number | null | undefined
          provider_call_id?: string | null | undefined
          qualification?: Json | undefined
          recording_path?: string | null | undefined
          recording_status?: string | undefined
          requested_by?: string | null | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          summary?: string | null | undefined
          summary_status?: string | undefined
          transcript?: Json | undefined
          transcript_status?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "bruno_voice_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bruno_voice_calls_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "bruno_call_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      bruno_voice_result_jobs: {
        Row: {
          attempts: number
          call_id: string
          created_at: string
          error_code: string | null
          lease_until: string | null
          next_attempt_at: string
          recording_url: string | null
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          attempts?: number | undefined
          call_id: string
          created_at?: string | undefined
          error_code?: string | null | undefined
          lease_until?: string | null | undefined
          next_attempt_at?: string | undefined
          recording_url?: string | null | undefined
          status?: string | undefined
          token?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          attempts?: number | undefined
          call_id?: string | undefined
          created_at?: string | undefined
          error_code?: string | null | undefined
          lease_until?: string | null | undefined
          next_attempt_at?: string | undefined
          recording_url?: string | null | undefined
          status?: string | undefined
          token?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "bruno_voice_result_jobs_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: true
            referencedRelation: "bruno_voice_calls"
            referencedColumns: ["id"]
          },
        ]
      }
      bruno_voice_settings: {
        Row: {
          application_id: string | null
          assistant_id: string | null
          configured_at: string | null
          created_at: string
          from_number: string
          inbound_assistant_id: string | null
          inbound_configured_at: string | null
          key: string
          language: string
          public_key: string | null
          transfer_number: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null | undefined
          assistant_id?: string | null | undefined
          configured_at?: string | null | undefined
          created_at?: string | undefined
          from_number?: string | undefined
          inbound_assistant_id?: string | null | undefined
          inbound_configured_at?: string | null | undefined
          key?: string | undefined
          language?: string | undefined
          public_key?: string | null | undefined
          transfer_number?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          application_id?: string | null | undefined
          assistant_id?: string | null | undefined
          configured_at?: string | null | undefined
          created_at?: string | undefined
          from_number?: string | undefined
          inbound_assistant_id?: string | null | undefined
          inbound_configured_at?: string | null | undefined
          key?: string | undefined
          language?: string | undefined
          public_key?: string | null | undefined
          transfer_number?: string | undefined
          updated_at?: string | undefined
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
          price_b: number | null
          price_c: number | null
          specifications: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          is_active?: boolean | undefined
          name: string
          price?: number | undefined
          price_b?: number | null | undefined
          price_c?: number | null | undefined
          specifications?: Json | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          is_active?: boolean | undefined
          name?: string | undefined
          price?: number | undefined
          price_b?: number | null | undefined
          price_c?: number | null | undefined
          specifications?: Json | null | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          lang: string
          last_message_at: string
          lead_id: string | null
          message_count: number
          messages: Json
          page_url: string | null
          started_at: string
          visitor_email: string | null
          visitor_id: string
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          created_at?: string | undefined
          id?: string | undefined
          lang?: string | undefined
          last_message_at?: string | undefined
          lead_id?: string | null | undefined
          message_count?: number | undefined
          messages?: Json | undefined
          page_url?: string | null | undefined
          started_at?: string | undefined
          visitor_email?: string | null | undefined
          visitor_id: string
          visitor_name?: string | null | undefined
          visitor_phone?: string | null | undefined
        }
        Update: {
          created_at?: string | undefined
          id?: string | undefined
          lang?: string | undefined
          last_message_at?: string | undefined
          lead_id?: string | null | undefined
          message_count?: number | undefined
          messages?: Json | undefined
          page_url?: string | null | undefined
          started_at?: string | undefined
          visitor_email?: string | null | undefined
          visitor_id?: string | undefined
          visitor_name?: string | null | undefined
          visitor_phone?: string | null | undefined
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "website_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_offer_settings: {
        Row: {
          created_at: string
          key: string
          settings: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string | undefined
          key?: string | undefined
          settings: Json
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Update: {
          created_at?: string | undefined
          key?: string | undefined
          settings?: Json | undefined
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Relationships: []
      }
      commercial_offers: {
        Row: {
          amount: number
          archived: boolean
          created_at: string
          created_by: string | null
          currency: string
          customer_name: string
          document: Json
          id: string
          lead_id: string | null
          number: string
          public_code: string
          public_enabled: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | undefined
          archived?: boolean | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          customer_name: string
          document: Json
          id?: string | undefined
          lead_id?: string | null | undefined
          number: string
          public_code?: string | undefined
          public_enabled?: boolean | undefined
          status?: string | undefined
          title: string
          updated_at?: string | undefined
        }
        Update: {
          amount?: number | undefined
          archived?: boolean | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          customer_name?: string | undefined
          document?: Json | undefined
          id?: string | undefined
          lead_id?: string | null | undefined
          number?: string | undefined
          public_code?: string | undefined
          public_enabled?: boolean | undefined
          status?: string | undefined
          title?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "commercial_offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      commercial_videos: {
        Row: {
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          language: string
          notes: string | null
          public_url: string
          purpose: string
          size_bytes: number | null
          title: string
        }
        Insert: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          file_path: string
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          public_url: string
          purpose?: string | undefined
          size_bytes?: number | null | undefined
          title: string
        }
        Update: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          file_path?: string | undefined
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          public_url?: string | undefined
          purpose?: string | undefined
          size_bytes?: number | null | undefined
          title?: string | undefined
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
          created_at?: string | undefined
          description?: string | null | undefined
          diameter?: number | null | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          name: string
          price: number
          type: string
          updated_at?: string | undefined
        }
        Update: {
          created_at?: string | undefined
          description?: string | null | undefined
          diameter?: number | null | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          name?: string | undefined
          price?: number | undefined
          type?: string | undefined
          updated_at?: string | undefined
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
          additional_images?: string[] | null | undefined
          base_price_a: number
          base_price_b?: number | null | undefined
          base_price_c?: number | null | undefined
          coatings?: Json | null | undefined
          created_at?: string | undefined
          delivery_time_weeks: number
          description?: string | null | undefined
          diameter: number
          electric_price_a?: number | null | undefined
          electric_price_b?: number | null | undefined
          electric_price_c?: number | null | undefined
          fuel_type: string[]
          gas_price_a?: number | null | undefined
          gas_price_b?: number | null | undefined
          gas_price_c?: number | null | undefined
          id?: string | undefined
          image_url: string
          installation_price_a?: number | null | undefined
          installation_price_b?: number | null | undefined
          installation_price_c?: number | null | undefined
          is_active?: boolean | undefined
          model_name: string
          pizza_capacity: string
          sizes?: Json | null | undefined
          updated_at?: string | undefined
          video_url_360?: string | null | undefined
        }
        Update: {
          additional_images?: string[] | null | undefined
          base_price_a?: number | undefined
          base_price_b?: number | null | undefined
          base_price_c?: number | null | undefined
          coatings?: Json | null | undefined
          created_at?: string | undefined
          delivery_time_weeks?: number | undefined
          description?: string | null | undefined
          diameter?: number | undefined
          electric_price_a?: number | null | undefined
          electric_price_b?: number | null | undefined
          electric_price_c?: number | null | undefined
          fuel_type?: string[] | undefined
          gas_price_a?: number | null | undefined
          gas_price_b?: number | null | undefined
          gas_price_c?: number | null | undefined
          id?: string | undefined
          image_url?: string | undefined
          installation_price_a?: number | null | undefined
          installation_price_b?: number | null | undefined
          installation_price_c?: number | null | undefined
          is_active?: boolean | undefined
          model_name?: string | undefined
          pizza_capacity?: string | undefined
          sizes?: Json | null | undefined
          updated_at?: string | undefined
          video_url_360?: string | null | undefined
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
          billing_address?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivery_address?: string | null | undefined
          delivery_time_weeks: number
          final_notes?: string | null | undefined
          has_gas?: boolean | undefined
          has_installation?: boolean | undefined
          id?: string | undefined
          notes?: string | null | undefined
          oven_id?: string | null | undefined
          payment_completed?: boolean | null | undefined
          status?: string | undefined
          stripe_session_id?: string | null | undefined
          total_price: number
          vat_number?: string | null | undefined
        }
        Update: {
          billing_address?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivery_address?: string | null | undefined
          delivery_time_weeks?: number | undefined
          final_notes?: string | null | undefined
          has_gas?: boolean | undefined
          has_installation?: boolean | undefined
          id?: string | undefined
          notes?: string | null | undefined
          oven_id?: string | null | undefined
          payment_completed?: boolean | null | undefined
          status?: string | undefined
          stripe_session_id?: string | null | undefined
          total_price?: number | undefined
          vat_number?: string | null | undefined
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
          pipeline_stage: string
          price_list: string
          quote_id: string | null
          sent_via_email: boolean | null
          sent_via_whatsapp: boolean | null
          status: string
          token: string
        }
        Insert: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          customer_actions?: Json | null | undefined
          customer_email?: string | null | undefined
          customer_info?: Json | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          erp_webhook_url?: string | null | undefined
          expires_at?: string | null | undefined
          feedback_date?: string | null | undefined
          feedback_reason?: string | null | undefined
          feedback_status?: string | null | undefined
          id?: string | undefined
          is_used?: boolean | undefined
          last_opened_at?: string | null | undefined
          link_sent?: boolean | undefined
          pipeline_stage?: string | undefined
          price_list?: string | undefined
          quote_id?: string | null | undefined
          sent_via_email?: boolean | null | undefined
          sent_via_whatsapp?: boolean | null | undefined
          status?: string | undefined
          token: string
        }
        Update: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          customer_actions?: Json | null | undefined
          customer_email?: string | null | undefined
          customer_info?: Json | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          erp_webhook_url?: string | null | undefined
          expires_at?: string | null | undefined
          feedback_date?: string | null | undefined
          feedback_reason?: string | null | undefined
          feedback_status?: string | null | undefined
          id?: string | undefined
          is_used?: boolean | undefined
          last_opened_at?: string | null | undefined
          link_sent?: boolean | undefined
          pipeline_stage?: string | undefined
          price_list?: string | undefined
          quote_id?: string | null | undefined
          sent_via_email?: boolean | null | undefined
          sent_via_whatsapp?: boolean | null | undefined
          status?: string | undefined
          token?: string | undefined
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
      contract_field_presets: {
        Row: {
          created_at: string
          created_by: string | null
          field_key: string
          id: string
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          field_key: string
          id?: string | undefined
          label: string
          sort_order?: number | undefined
          updated_at?: string | undefined
          value: string
        }
        Update: {
          created_at?: string | undefined
          created_by?: string | null | undefined
          field_key?: string | undefined
          id?: string | undefined
          label?: string | undefined
          sort_order?: number | undefined
          updated_at?: string | undefined
          value?: string | undefined
        }
        Relationships: []
      }
      contracts: {
        Row: {
          clauses: Json
          client_address: string | null
          client_email: string | null
          client_name: string
          client_signature: string | null
          client_signature_ip: string | null
          client_signed_at: string | null
          client_vat: string | null
          created_at: string
          created_by: string | null
          currency: string
          destination: string | null
          estimated_delivery_date: string | null
          id: string
          language: string
          notes: string | null
          offer_date: string | null
          offer_number: string | null
          payment_terms: string
          pdf_url: string | null
          place_signed: string | null
          production_days: number | null
          shipping_days: number | null
          signature_token: string | null
          signed_at: string | null
          status: string
          total_amount: number | null
          updated_at: string
          variable_fields: Json
          warranty_years: number
        }
        Insert: {
          clauses?: Json | undefined
          client_address?: string | null | undefined
          client_email?: string | null | undefined
          client_name: string
          client_signature?: string | null | undefined
          client_signature_ip?: string | null | undefined
          client_signed_at?: string | null | undefined
          client_vat?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          destination?: string | null | undefined
          estimated_delivery_date?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          offer_date?: string | null | undefined
          offer_number?: string | null | undefined
          payment_terms?: string | undefined
          pdf_url?: string | null | undefined
          place_signed?: string | null | undefined
          production_days?: number | null | undefined
          shipping_days?: number | null | undefined
          signature_token?: string | null | undefined
          signed_at?: string | null | undefined
          status?: string | undefined
          total_amount?: number | null | undefined
          updated_at?: string | undefined
          variable_fields?: Json | undefined
          warranty_years?: number | undefined
        }
        Update: {
          clauses?: Json | undefined
          client_address?: string | null | undefined
          client_email?: string | null | undefined
          client_name?: string | undefined
          client_signature?: string | null | undefined
          client_signature_ip?: string | null | undefined
          client_signed_at?: string | null | undefined
          client_vat?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          destination?: string | null | undefined
          estimated_delivery_date?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          offer_date?: string | null | undefined
          offer_number?: string | null | undefined
          payment_terms?: string | undefined
          pdf_url?: string | null | undefined
          place_signed?: string | null | undefined
          production_days?: number | null | undefined
          shipping_days?: number | null | undefined
          signature_token?: string | null | undefined
          signed_at?: string | null | undefined
          status?: string | undefined
          total_amount?: number | null | undefined
          updated_at?: string | undefined
          variable_fields?: Json | undefined
          warranty_years?: number | undefined
        }
        Relationships: []
      }
      crm_messages: {
        Row: {
          ai_generated: boolean
          body: string
          channel: string
          created_at: string
          created_by: string | null
          direction: string
          error: string | null
          external_id: string | null
          id: string
          lead_id: string
          metadata: Json | null
          sender: string
          status: string
          subject: string | null
        }
        Insert: {
          ai_generated?: boolean | undefined
          body: string
          channel: string
          created_at?: string | undefined
          created_by?: string | null | undefined
          direction?: string | undefined
          error?: string | null | undefined
          external_id?: string | null | undefined
          id?: string | undefined
          lead_id: string
          metadata?: Json | null | undefined
          sender?: string | undefined
          status?: string | undefined
          subject?: string | null | undefined
        }
        Update: {
          ai_generated?: boolean | undefined
          body?: string | undefined
          channel?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          direction?: string | undefined
          error?: string | null | undefined
          external_id?: string | null | undefined
          id?: string | undefined
          lead_id?: string | undefined
          metadata?: Json | null | undefined
          sender?: string | undefined
          status?: string | undefined
          subject?: string | null | undefined
        }
        Relationships: [
          {
            foreignKeyName: "crm_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_tiers: {
        Row: {
          code: string
          label: string
          percentage: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          label: string
          percentage?: number | undefined
          sort_order?: number | undefined
          updated_at?: string | undefined
        }
        Update: {
          code?: string | undefined
          label?: string | undefined
          percentage?: number | undefined
          sort_order?: number | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      email_folder_cursors: {
        Row: {
          created_at: string
          folder: string
          id: string
          last_uid: number
          latest_uid: number
          mailbox_id: string
          uid_validity: string
          updated_at: string
        }
        Insert: {
          created_at?: string | undefined
          folder: string
          id?: string | undefined
          last_uid?: number | undefined
          latest_uid?: number | undefined
          mailbox_id: string
          uid_validity: string
          updated_at?: string | undefined
        }
        Update: {
          created_at?: string | undefined
          folder?: string | undefined
          id?: string | undefined
          last_uid?: number | undefined
          latest_uid?: number | undefined
          mailbox_id?: string | undefined
          uid_validity?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "email_folder_cursors_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "email_mailboxes"
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
          id?: string | undefined
          metadata?: Json | null | undefined
          sent_at?: string | undefined
          sent_from?: string | undefined
          sent_to: string
          session_id: string
          subject: string
        }
        Update: {
          body?: string | undefined
          email_type?: string | undefined
          id?: string | undefined
          metadata?: Json | null | undefined
          sent_at?: string | undefined
          sent_from?: string | undefined
          sent_to?: string | undefined
          session_id?: string | undefined
          subject?: string | undefined
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
      email_items: {
        Row: {
          attachment_names: Json
          body: string
          created_at: string
          crm_message_id: string | null
          direction: string
          folder: string | null
          id: string
          imap_uid: number | null
          in_reply_to: string | null
          lead_id: string | null
          link_checked_at: string | null
          mailbox_id: string
          message_id: string | null
          message_key: string
          recipients: Json
          reference_ids: Json
          sender: string
          sent_at: string
          subject: string
          uid_validity: string | null
          updated_at: string
        }
        Insert: {
          attachment_names?: Json | undefined
          body?: string | undefined
          created_at?: string | undefined
          crm_message_id?: string | null | undefined
          direction: string
          folder?: string | null | undefined
          id?: string | undefined
          imap_uid?: number | null | undefined
          in_reply_to?: string | null | undefined
          lead_id?: string | null | undefined
          link_checked_at?: string | null | undefined
          mailbox_id: string
          message_id?: string | null | undefined
          message_key: string
          recipients?: Json | undefined
          reference_ids?: Json | undefined
          sender: string
          sent_at: string
          subject?: string | undefined
          uid_validity?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          attachment_names?: Json | undefined
          body?: string | undefined
          created_at?: string | undefined
          crm_message_id?: string | null | undefined
          direction?: string | undefined
          folder?: string | null | undefined
          id?: string | undefined
          imap_uid?: number | null | undefined
          in_reply_to?: string | null | undefined
          lead_id?: string | null | undefined
          link_checked_at?: string | null | undefined
          mailbox_id?: string | undefined
          message_id?: string | null | undefined
          message_key?: string | undefined
          recipients?: Json | undefined
          reference_ids?: Json | undefined
          sender?: string | undefined
          sent_at?: string | undefined
          subject?: string | undefined
          uid_validity?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "email_items_crm_message_id_fkey"
            columns: ["crm_message_id"]
            isOneToOne: false
            referencedRelation: "crm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_items_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_items_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "email_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_mailboxes: {
        Row: {
          address: string
          created_at: string
          enabled: boolean
          id: string
          last_error: string | null
          last_sync_at: string | null
          lease_token: string | null
          lease_until: string | null
          sent_folder: string | null
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string | undefined
          enabled?: boolean | undefined
          id?: string | undefined
          last_error?: string | null | undefined
          last_sync_at?: string | null | undefined
          lease_token?: string | null | undefined
          lease_until?: string | null | undefined
          sent_folder?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          address?: string | undefined
          created_at?: string | undefined
          enabled?: boolean | undefined
          id?: string | undefined
          last_error?: string | null | undefined
          last_sync_at?: string | null | undefined
          lease_token?: string | null | undefined
          lease_until?: string | null | undefined
          sent_folder?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          append_attempted_at: string | null
          body: string
          copy_next_attempt_at: string | null
          copy_status: string
          created_at: string
          created_by: string | null
          crm_message_id: string | null
          id: string
          idempotency_key: string
          last_error: string | null
          lead_id: string
          mailbox_id: string
          message_id: string
          mime: string
          recipient: string
          rendered_html: string | null
          rendered_text: string | null
          signature_id: string | null
          signature_snapshot: Json | null
          smtp_accepted_at: string | null
          smtp_status: string
          subject: string
          updated_at: string
        }
        Insert: {
          append_attempted_at?: string | null | undefined
          body: string
          copy_next_attempt_at?: string | null | undefined
          copy_status?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          crm_message_id?: string | null | undefined
          id?: string | undefined
          idempotency_key: string
          last_error?: string | null | undefined
          lead_id: string
          mailbox_id: string
          message_id: string
          mime: string
          recipient: string
          rendered_html?: string | null | undefined
          rendered_text?: string | null | undefined
          signature_id?: string | null | undefined
          signature_snapshot?: Json | null | undefined
          smtp_accepted_at?: string | null | undefined
          smtp_status?: string | undefined
          subject: string
          updated_at?: string | undefined
        }
        Update: {
          append_attempted_at?: string | null | undefined
          body?: string | undefined
          copy_next_attempt_at?: string | null | undefined
          copy_status?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          crm_message_id?: string | null | undefined
          id?: string | undefined
          idempotency_key?: string | undefined
          last_error?: string | null | undefined
          lead_id?: string | undefined
          mailbox_id?: string | undefined
          message_id?: string | undefined
          mime?: string | undefined
          recipient?: string | undefined
          rendered_html?: string | null | undefined
          rendered_text?: string | null | undefined
          signature_id?: string | null | undefined
          signature_snapshot?: Json | null | undefined
          smtp_accepted_at?: string | null | undefined
          smtp_status?: string | undefined
          subject?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "email_outbox_crm_message_id_fkey"
            columns: ["crm_message_id"]
            isOneToOne: false
            referencedRelation: "crm_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_outbox_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_outbox_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "email_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_signatures: {
        Row: {
          address: string
          company: string
          created_at: string
          email: string
          id: string
          is_default: boolean
          mailbox_id: string
          name: string
          phone: string
          role: string
          updated_at: string
          website: string
          whatsapp: string
        }
        Insert: {
          address?: string | undefined
          company?: string | undefined
          created_at?: string | undefined
          email?: string | undefined
          id?: string | undefined
          is_default?: boolean | undefined
          mailbox_id: string
          name: string
          phone?: string | undefined
          role?: string | undefined
          updated_at?: string | undefined
          website?: string | undefined
          whatsapp?: string | undefined
        }
        Update: {
          address?: string | undefined
          company?: string | undefined
          created_at?: string | undefined
          email?: string | undefined
          id?: string | undefined
          is_default?: boolean | undefined
          mailbox_id?: string | undefined
          name?: string | undefined
          phone?: string | undefined
          role?: string | undefined
          updated_at?: string | undefined
          website?: string | undefined
          whatsapp?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "email_signatures_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "email_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sync_runs: {
        Row: {
          created_at: string
          error_code: string | null
          finished_at: string | null
          id: string
          kind: string
          linked: number
          mailbox_id: string
          processed: number
          started_at: string | null
          status: string
          updated_at: string
          worker_token: string
        }
        Insert: {
          created_at?: string | undefined
          error_code?: string | null | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          kind?: string | undefined
          linked?: number | undefined
          mailbox_id: string
          processed?: number | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          worker_token?: string | undefined
        }
        Update: {
          created_at?: string | undefined
          error_code?: string | null | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          kind?: string | undefined
          linked?: number | undefined
          mailbox_id?: string | undefined
          processed?: number | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          worker_token?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_runs_mailbox_id_fkey"
            columns: ["mailbox_id"]
            isOneToOne: false
            referencedRelation: "email_mailboxes"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          archived: boolean
          assigned_to: string | null
          bruno_mode: string
          bruno_paused_until: string | null
          city: string | null
          company_name: string | null
          contact_name: string | null
          country: string | null
          created_at: string
          customer_type: string
          discount_override: number | null
          email: string | null
          id: string
          next_activity_assigned_to: string | null
          next_activity_date: string | null
          next_activity_notes: string | null
          next_activity_type: string | null
          notes: string | null
          phone: string | null
          pipeline: string
          priority: string | null
          qualification: Json
          source: string | null
          status: string
          updated_at: string
          value: number | null
          website_lead_id: string | null
        }
        Insert: {
          archived?: boolean | undefined
          assigned_to?: string | null | undefined
          bruno_mode?: string | undefined
          bruno_paused_until?: string | null | undefined
          city?: string | null | undefined
          company_name?: string | null | undefined
          contact_name?: string | null | undefined
          country?: string | null | undefined
          created_at?: string | undefined
          customer_type?: string | undefined
          discount_override?: number | null | undefined
          email?: string | null | undefined
          id?: string | undefined
          next_activity_assigned_to?: string | null | undefined
          next_activity_date?: string | null | undefined
          next_activity_notes?: string | null | undefined
          next_activity_type?: string | null | undefined
          notes?: string | null | undefined
          phone?: string | null | undefined
          pipeline?: string | undefined
          priority?: string | null | undefined
          qualification?: Json | undefined
          source?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          value?: number | null | undefined
          website_lead_id?: string | null | undefined
        }
        Update: {
          archived?: boolean | undefined
          assigned_to?: string | null | undefined
          bruno_mode?: string | undefined
          bruno_paused_until?: string | null | undefined
          city?: string | null | undefined
          company_name?: string | null | undefined
          contact_name?: string | null | undefined
          country?: string | null | undefined
          created_at?: string | undefined
          customer_type?: string | undefined
          discount_override?: number | null | undefined
          email?: string | null | undefined
          id?: string | undefined
          next_activity_assigned_to?: string | null | undefined
          next_activity_date?: string | null | undefined
          next_activity_notes?: string | null | undefined
          next_activity_type?: string | null | undefined
          notes?: string | null | undefined
          phone?: string | null | undefined
          pipeline?: string | undefined
          priority?: string | null | undefined
          qualification?: Json | undefined
          source?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          value?: number | null | undefined
          website_lead_id?: string | null | undefined
        }
        Relationships: []
      }
      marketing_agent_runs: {
        Row: {
          campaign_id: string | null
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          lease_until: string | null
          period_key: string
          started_at: string | null
          status: string
          worker_token: string
        }
        Insert: {
          campaign_id?: string | null | undefined
          created_at?: string | undefined
          error?: string | null | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          lease_until?: string | null | undefined
          period_key: string
          started_at?: string | null | undefined
          status?: string | undefined
          worker_token?: string | undefined
        }
        Update: {
          campaign_id?: string | null | undefined
          created_at?: string | undefined
          error?: string | null | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          lease_until?: string | null | undefined
          period_key?: string | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          worker_token?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "marketing_agent_runs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_occasions: {
        Row: {
          code: string
          created_at: string
          day: number
          enabled: boolean
          month: number
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string | undefined
          day: number
          enabled?: boolean | undefined
          month: number
          title: string
          updated_at?: string | undefined
        }
        Update: {
          code?: string | undefined
          created_at?: string | undefined
          day?: number | undefined
          enabled?: boolean | undefined
          month?: number | undefined
          title?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      newsletter_ai_state: {
        Row: {
          created_at: string
          key: string
          reason: string
          status: number
          updated_at: string
        }
        Insert: {
          created_at?: string | undefined
          key: string
          reason: string
          status: number
          updated_at?: string | undefined
        }
        Update: {
          created_at?: string | undefined
          key?: string | undefined
          reason?: string | undefined
          status?: number | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      newsletter_campaigns: {
        Row: {
          audience: Json
          author: string
          body: string
          created_at: string
          created_by: string | null
          cta_label: string | null
          cta_url: string | null
          extra_images: Json
          failed_count: number
          id: string
          image_url: string | null
          language: string
          last_error: string | null
          period_key: string | null
          preheader: string
          prompt: string | null
          recipients_count: number
          sent_at: string | null
          sent_count: number
          status: string
          subject: string
          title: string
          translation_source: string | null
          translations: Json
          updated_at: string
        }
        Insert: {
          audience?: Json | undefined
          author?: string | undefined
          body?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          cta_label?: string | null | undefined
          cta_url?: string | null | undefined
          extra_images?: Json | undefined
          failed_count?: number | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          language?: string | undefined
          last_error?: string | null | undefined
          period_key?: string | null | undefined
          preheader?: string | undefined
          prompt?: string | null | undefined
          recipients_count?: number | undefined
          sent_at?: string | null | undefined
          sent_count?: number | undefined
          status?: string | undefined
          subject?: string | undefined
          title?: string | undefined
          translation_source?: string | null | undefined
          translations?: Json | undefined
          updated_at?: string | undefined
        }
        Update: {
          audience?: Json | undefined
          author?: string | undefined
          body?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          cta_label?: string | null | undefined
          cta_url?: string | null | undefined
          extra_images?: Json | undefined
          failed_count?: number | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          language?: string | undefined
          last_error?: string | null | undefined
          period_key?: string | null | undefined
          preheader?: string | undefined
          prompt?: string | null | undefined
          recipients_count?: number | undefined
          sent_at?: string | null | undefined
          sent_count?: number | undefined
          status?: string | undefined
          subject?: string | undefined
          title?: string | undefined
          translation_source?: string | null | undefined
          translations?: Json | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      newsletter_recipients: {
        Row: {
          campaign_id: string
          created_at: string
          email: string
          error: string | null
          id: string
          language: string
          lead_id: string | null
          recipient_name: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | undefined
          email: string
          error?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          lead_id?: string | null | undefined
          recipient_name?: string | null | undefined
          resend_id?: string | null | undefined
          sent_at?: string | null | undefined
          status?: string | undefined
        }
        Update: {
          campaign_id?: string | undefined
          created_at?: string | undefined
          email?: string | undefined
          error?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          lead_id?: string | null | undefined
          recipient_name?: string | null | undefined
          resend_id?: string | null | undefined
          sent_at?: string | null | undefined
          status?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "newsletter_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "newsletter_recipients_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_unsubscribes: {
        Row: {
          created_at: string
          email: string
          reason: string | null
        }
        Insert: {
          created_at?: string | undefined
          email: string
          reason?: string | null | undefined
        }
        Update: {
          created_at?: string | undefined
          email?: string | undefined
          reason?: string | null | undefined
        }
        Relationships: []
      }
      operating_expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          expense_date: string
          id: string
          updated_at: string
        }
        Insert: {
          amount?: number | undefined
          category?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          description?: string | null | undefined
          expense_date?: string | undefined
          id?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          amount?: number | undefined
          category?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          description?: string | null | undefined
          expense_date?: string | undefined
          id?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      order_cost_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          id: string
          order_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | undefined
          category?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          order_id: string
          updated_at?: string | undefined
        }
        Update: {
          amount?: number | undefined
          category?: string | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          order_id?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "order_cost_entries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
          burner_id?: string | null | undefined
          coating?: string | null | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          diameter?: number | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          item_type?: string | undefined
          line_total?: number | undefined
          model_name?: string | null | undefined
          order_id: string
          oven_id?: string | null | undefined
          quantity?: number | undefined
          sort_order?: number | undefined
          unit_price?: number | undefined
        }
        Update: {
          burner_id?: string | null | undefined
          coating?: string | null | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          diameter?: number | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          item_type?: string | undefined
          line_total?: number | undefined
          model_name?: string | null | undefined
          order_id?: string | undefined
          oven_id?: string | null | undefined
          quantity?: number | undefined
          sort_order?: number | undefined
          unit_price?: number | undefined
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
          balance_due?: number | undefined
          billing_address?: string | null | undefined
          carrier?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivered_at?: string | null | undefined
          delivery_address?: string | null | undefined
          deposit_paid?: number | undefined
          estimated_delivery?: string | null | undefined
          id?: string | undefined
          invoice_date?: string | null | undefined
          invoice_number?: string | null | undefined
          notes?: string | null | undefined
          order_number?: string | undefined
          payment_status?: string | undefined
          proforma_id?: string | null | undefined
          shipped_at?: string | null | undefined
          status?: string | undefined
          total_amount?: number | undefined
          tracking_number?: string | null | undefined
          updated_at?: string | undefined
          vat_number?: string | null | undefined
        }
        Update: {
          balance_due?: number | undefined
          billing_address?: string | null | undefined
          carrier?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivered_at?: string | null | undefined
          delivery_address?: string | null | undefined
          deposit_paid?: number | undefined
          estimated_delivery?: string | null | undefined
          id?: string | undefined
          invoice_date?: string | null | undefined
          invoice_number?: string | null | undefined
          notes?: string | null | undefined
          order_number?: string | undefined
          payment_status?: string | undefined
          proforma_id?: string | null | undefined
          shipped_at?: string | null | undefined
          status?: string | undefined
          total_amount?: number | undefined
          tracking_number?: string | null | undefined
          updated_at?: string | undefined
          vat_number?: string | null | undefined
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
      outreach_agent_config: {
        Row: {
          ai_reason: string | null
          ai_status: number | null
          created_at: string
          instructions: string
          key: string
          updated_at: string
        }
        Insert: {
          ai_reason?: string | null | undefined
          ai_status?: number | null | undefined
          created_at?: string | undefined
          instructions?: string | undefined
          key?: string | undefined
          updated_at?: string | undefined
        }
        Update: {
          ai_reason?: string | null | undefined
          ai_status?: number | null | undefined
          created_at?: string | undefined
          instructions?: string | undefined
          key?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      outreach_autopilot: {
        Row: {
          auto_paused_reason: string | null
          countries: string[]
          daily_organization_goal: number
          enabled: boolean
          key: string
          last_planned_on: string | null
          last_result: Json
          last_tick_at: string | null
          lease_until: string | null
          owner_id: string | null
          territory_cursor: number
          updated_at: string
        }
        Insert: {
          auto_paused_reason?: string | null | undefined
          countries?: string[] | undefined
          daily_organization_goal?: number | undefined
          enabled?: boolean | undefined
          key?: string | undefined
          last_planned_on?: string | null | undefined
          last_result?: Json | undefined
          last_tick_at?: string | null | undefined
          lease_until?: string | null | undefined
          owner_id?: string | null | undefined
          territory_cursor?: number | undefined
          updated_at?: string | undefined
        }
        Update: {
          auto_paused_reason?: string | null | undefined
          countries?: string[] | undefined
          daily_organization_goal?: number | undefined
          enabled?: boolean | undefined
          key?: string | undefined
          last_planned_on?: string | null | undefined
          last_result?: Json | undefined
          last_tick_at?: string | null | undefined
          lease_until?: string | null | undefined
          owner_id?: string | null | undefined
          territory_cursor?: number | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      outreach_chat_threads: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          messages: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null | undefined
          created_at?: string | undefined
          id: string
          messages?: Json | undefined
          status?: string | undefined
          title?: string | undefined
          updated_at?: string | undefined
          user_id: string
        }
        Update: {
          archived_at?: string | null | undefined
          created_at?: string | undefined
          id?: string | undefined
          messages?: Json | undefined
          status?: string | undefined
          title?: string | undefined
          updated_at?: string | undefined
          user_id?: string | undefined
        }
        Relationships: []
      }
      outreach_inbox: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          message_id: string | null
          physical_key: string
          prospect_id: string | null
          received_at: string
          sender: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string | undefined
          id?: string | undefined
          message_id?: string | null | undefined
          physical_key: string
          prospect_id?: string | null | undefined
          received_at: string
          sender: string
          subject: string
          updated_at?: string | undefined
        }
        Update: {
          body?: string | undefined
          category?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          message_id?: string | null | undefined
          physical_key?: string | undefined
          prospect_id?: string | null | undefined
          received_at?: string | undefined
          sender?: string | undefined
          subject?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "outreach_inbox_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "outreach_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_knowledge: {
        Row: {
          active: boolean
          content: string
          created_at: string
          id: string
          source_url: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean | undefined
          content: string
          created_at?: string | undefined
          id?: string | undefined
          source_url?: string | null | undefined
          title: string
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Update: {
          active?: boolean | undefined
          content?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          source_url?: string | null | undefined
          title?: string | undefined
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Relationships: []
      }
      outreach_messages: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string | null
          created_at: string
          direction: string
          error: string | null
          html: string | null
          id: string
          message_id: string | null
          prospect_id: string
          scheduled_at: string | null
          sent_at: string | null
          sources: Json
          status: string
          step: number
          subject: string | null
          template_key: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          body?: string | null | undefined
          created_at?: string | undefined
          direction?: string | undefined
          error?: string | null | undefined
          html?: string | null | undefined
          id?: string | undefined
          message_id?: string | null | undefined
          prospect_id: string
          scheduled_at?: string | null | undefined
          sent_at?: string | null | undefined
          sources?: Json | undefined
          status?: string | undefined
          step: number
          subject?: string | null | undefined
          template_key?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          body?: string | null | undefined
          created_at?: string | undefined
          direction?: string | undefined
          error?: string | null | undefined
          html?: string | null | undefined
          id?: string | undefined
          message_id?: string | null | undefined
          prospect_id?: string | undefined
          scheduled_at?: string | null | undefined
          sent_at?: string | null | undefined
          sources?: Json | undefined
          status?: string | undefined
          step?: number | undefined
          subject?: string | null | undefined
          template_key?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "outreach_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_outbox: {
        Row: {
          accepted_at: string | null
          append_attempted_at: string | null
          attempted_at: string | null
          copy_status: string
          created_at: string
          id: string
          last_error: string | null
          message_id: string
          mime: string | null
          outreach_message_id: string
          prospect_id: string
          recipient: string
          rendered_html: string
          rendered_text: string
          sent_folder: string | null
          smtp_status: string
          subject: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null | undefined
          append_attempted_at?: string | null | undefined
          attempted_at?: string | null | undefined
          copy_status?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          last_error?: string | null | undefined
          message_id: string
          mime?: string | null | undefined
          outreach_message_id: string
          prospect_id: string
          recipient: string
          rendered_html: string
          rendered_text: string
          sent_folder?: string | null | undefined
          smtp_status?: string | undefined
          subject: string
          updated_at?: string | undefined
        }
        Update: {
          accepted_at?: string | null | undefined
          append_attempted_at?: string | null | undefined
          attempted_at?: string | null | undefined
          copy_status?: string | undefined
          created_at?: string | undefined
          id?: string | undefined
          last_error?: string | null | undefined
          message_id?: string | undefined
          mime?: string | null | undefined
          outreach_message_id?: string | undefined
          prospect_id?: string | undefined
          recipient?: string | undefined
          rendered_html?: string | undefined
          rendered_text?: string | undefined
          sent_folder?: string | null | undefined
          smtp_status?: string | undefined
          subject?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "outreach_outbox_outreach_message_id_fkey"
            columns: ["outreach_message_id"]
            isOneToOne: true
            referencedRelation: "outreach_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_outbox_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "outreach_prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_prospects: {
        Row: {
          city: string | null
          contact_name: string | null
          country: string
          created_at: string
          domain: string | null
          eligibility_checked_at: string | null
          eligibility_checked_by: string | null
          eligibility_note: string | null
          email: string | null
          error: string | null
          evidence: Json
          id: string
          kind: string
          last_sent_at: string | null
          lead_id: string | null
          name: string
          next_send_at: string | null
          personalization: string | null
          phone: string | null
          qualification_reason: string | null
          qualified: boolean
          recipient_eligibility: string
          replied_at: string | null
          source: string
          source_url: string | null
          status: string
          step: number
          summary: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null | undefined
          contact_name?: string | null | undefined
          country: string
          created_at?: string | undefined
          domain?: string | null | undefined
          eligibility_checked_at?: string | null | undefined
          eligibility_checked_by?: string | null | undefined
          eligibility_note?: string | null | undefined
          email?: string | null | undefined
          error?: string | null | undefined
          evidence?: Json | undefined
          id?: string | undefined
          kind?: string | undefined
          last_sent_at?: string | null | undefined
          lead_id?: string | null | undefined
          name: string
          next_send_at?: string | null | undefined
          personalization?: string | null | undefined
          phone?: string | null | undefined
          qualification_reason?: string | null | undefined
          qualified?: boolean | undefined
          recipient_eligibility?: string | undefined
          replied_at?: string | null | undefined
          source?: string | undefined
          source_url?: string | null | undefined
          status?: string | undefined
          step?: number | undefined
          summary?: string | null | undefined
          updated_at?: string | undefined
          website?: string | null | undefined
        }
        Update: {
          city?: string | null | undefined
          contact_name?: string | null | undefined
          country?: string | undefined
          created_at?: string | undefined
          domain?: string | null | undefined
          eligibility_checked_at?: string | null | undefined
          eligibility_checked_by?: string | null | undefined
          eligibility_note?: string | null | undefined
          email?: string | null | undefined
          error?: string | null | undefined
          evidence?: Json | undefined
          id?: string | undefined
          kind?: string | undefined
          last_sent_at?: string | null | undefined
          lead_id?: string | null | undefined
          name?: string | undefined
          next_send_at?: string | null | undefined
          personalization?: string | null | undefined
          phone?: string | null | undefined
          qualification_reason?: string | null | undefined
          qualified?: boolean | undefined
          recipient_eligibility?: string | undefined
          replied_at?: string | null | undefined
          source?: string | undefined
          source_url?: string | null | undefined
          status?: string | undefined
          step?: number | undefined
          summary?: string | null | undefined
          updated_at?: string | undefined
          website?: string | null | undefined
        }
        Relationships: [
          {
            foreignKeyName: "outreach_prospects_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_research_jobs: {
        Row: {
          callback_claimed: boolean
          created_at: string
          error: string | null
          id: string
          input: Json
          kind: string
          lease_until: string | null
          not_before: string
          ordinal: number
          plan_id: string
          result: Json | null
          status: string
          updated_at: string
          worker_token: string
        }
        Insert: {
          callback_claimed?: boolean | undefined
          created_at?: string | undefined
          error?: string | null | undefined
          id?: string | undefined
          input: Json
          kind: string
          lease_until?: string | null | undefined
          not_before?: string | undefined
          ordinal: number
          plan_id: string
          result?: Json | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          worker_token?: string | undefined
        }
        Update: {
          callback_claimed?: boolean | undefined
          created_at?: string | undefined
          error?: string | null | undefined
          id?: string | undefined
          input?: Json | undefined
          kind?: string | undefined
          lease_until?: string | null | undefined
          not_before?: string | undefined
          ordinal?: number | undefined
          plan_id?: string | undefined
          result?: Json | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          worker_token?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "outreach_research_jobs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "outreach_research_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_research_plans: {
        Row: {
          analysis: Json
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string
          discovered: number
          error: string | null
          examined: number
          finished_at: string | null
          id: string
          proposal: Json
          request: string
          skipped: number
          started_at: string | null
          status: string
          thread_id: string
          updated_at: string
          verification_attempts: number
          verified: number
        }
        Insert: {
          analysis?: Json | undefined
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          created_at?: string | undefined
          created_by: string
          discovered?: number | undefined
          error?: string | null | undefined
          examined?: number | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          proposal: Json
          request: string
          skipped?: number | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          thread_id: string
          updated_at?: string | undefined
          verification_attempts?: number | undefined
          verified?: number | undefined
        }
        Update: {
          analysis?: Json | undefined
          approved_at?: string | null | undefined
          approved_by?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | undefined
          discovered?: number | undefined
          error?: string | null | undefined
          examined?: number | undefined
          finished_at?: string | null | undefined
          id?: string | undefined
          proposal?: Json | undefined
          request?: string | undefined
          skipped?: number | undefined
          started_at?: string | null | undefined
          status?: string | undefined
          thread_id?: string | undefined
          updated_at?: string | undefined
          verification_attempts?: number | undefined
          verified?: number | undefined
        }
        Relationships: []
      }
      outreach_runs: {
        Row: {
          actor_run_id: string | null
          created_at: string
          created_by: string | null
          dataset_id: string | null
          error: string | null
          finished_at: string | null
          found: number
          id: string
          input: Json
          kind: string
          lease_until: string
          result: Json
          sent: number
          status: string
        }
        Insert: {
          actor_run_id?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          dataset_id?: string | null | undefined
          error?: string | null | undefined
          finished_at?: string | null | undefined
          found?: number | undefined
          id?: string | undefined
          input?: Json | undefined
          kind: string
          lease_until?: string | undefined
          result?: Json | undefined
          sent?: number | undefined
          status?: string | undefined
        }
        Update: {
          actor_run_id?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          dataset_id?: string | null | undefined
          error?: string | null | undefined
          finished_at?: string | null | undefined
          found?: number | undefined
          id?: string | undefined
          input?: Json | undefined
          kind?: string | undefined
          lease_until?: string | undefined
          result?: Json | undefined
          sent?: number | undefined
          status?: string | undefined
        }
        Relationships: []
      }
      outreach_settings: {
        Row: {
          cities: Json
          daily_limit: number
          inbox_cursor: number
          inbox_validity: string | null
          key: string
          lease_token: string | null
          lease_until: string | null
          markets: string[]
          min_interval_seconds: number
          next_delivery_at: string | null
          pause_reason: string | null
          paused: boolean
          preflight: Json
          provider_approval_reference: string | null
          provider_verified_at: string | null
          send_markets: string[]
          sender_email: string | null
          timezone: string
          updated_at: string
          weekdays: number[]
          window_end: number
          window_start: number
        }
        Insert: {
          cities?: Json | undefined
          daily_limit?: number | undefined
          inbox_cursor?: number | undefined
          inbox_validity?: string | null | undefined
          key?: string | undefined
          lease_token?: string | null | undefined
          lease_until?: string | null | undefined
          markets?: string[] | undefined
          min_interval_seconds?: number | undefined
          next_delivery_at?: string | null | undefined
          pause_reason?: string | null | undefined
          paused?: boolean | undefined
          preflight?: Json | undefined
          provider_approval_reference?: string | null | undefined
          provider_verified_at?: string | null | undefined
          send_markets?: string[] | undefined
          sender_email?: string | null | undefined
          timezone?: string | undefined
          updated_at?: string | undefined
          weekdays?: number[] | undefined
          window_end?: number | undefined
          window_start?: number | undefined
        }
        Update: {
          cities?: Json | undefined
          daily_limit?: number | undefined
          inbox_cursor?: number | undefined
          inbox_validity?: string | null | undefined
          key?: string | undefined
          lease_token?: string | null | undefined
          lease_until?: string | null | undefined
          markets?: string[] | undefined
          min_interval_seconds?: number | undefined
          next_delivery_at?: string | null | undefined
          pause_reason?: string | null | undefined
          paused?: boolean | undefined
          preflight?: Json | undefined
          provider_approval_reference?: string | null | undefined
          provider_verified_at?: string | null | undefined
          send_markets?: string[] | undefined
          sender_email?: string | null | undefined
          timezone?: string | undefined
          updated_at?: string | undefined
          weekdays?: number[] | undefined
          window_end?: number | undefined
          window_start?: number | undefined
        }
        Relationships: []
      }
      outreach_suppressions: {
        Row: {
          created_at: string
          reason: string
          value: string
        }
        Insert: {
          created_at?: string | undefined
          reason: string
          value: string
        }
        Update: {
          created_at?: string | undefined
          reason?: string | undefined
          value?: string | undefined
        }
        Relationships: []
      }
      outreach_templates: {
        Row: {
          active: boolean
          body: string
          created_at: string
          key: string
          kind: string
          language: string
          step: number
          subject: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean | undefined
          body: string
          created_at?: string | undefined
          key: string
          kind: string
          language: string
          step: number
          subject: string
          title: string
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Update: {
          active?: boolean | undefined
          body?: string | undefined
          created_at?: string | undefined
          key?: string | undefined
          kind?: string | undefined
          language?: string | undefined
          step?: number | undefined
          subject?: string | undefined
          title?: string | undefined
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Relationships: []
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
          coating_type?: string | null | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url: string
          name: string
          specifications?: Json | null | undefined
          subcategory?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          category?: string | undefined
          coating_type?: string | null | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url?: string | undefined
          name?: string | undefined
          specifications?: Json | null | undefined
          subcategory?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: []
      }
      price_lists: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string | undefined
          id?: string | undefined
          notes?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          year: number
        }
        Update: {
          created_at?: string | undefined
          id?: string | undefined
          notes?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          year?: number | undefined
        }
        Relationships: []
      }
      product_asset_links: {
        Row: {
          asset_id: string
          created_at: string
          product_id: string
          updated_at: string
        }
        Insert: {
          asset_id: string
          created_at?: string | undefined
          product_id: string
          updated_at?: string | undefined
        }
        Update: {
          asset_id?: string | undefined
          created_at?: string | undefined
          product_id?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "product_asset_links_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "product_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_asset_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_assets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          kind: string
          language: string | null
          product_id: string | null
          sort_order: number
          storage_path: string | null
          tags: string[]
          title: string
          url: string
        }
        Insert: {
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          kind?: string | undefined
          language?: string | null | undefined
          product_id?: string | null | undefined
          sort_order?: number | undefined
          storage_path?: string | null | undefined
          tags?: string[] | undefined
          title: string
          url: string
        }
        Update: {
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          is_active?: boolean | undefined
          kind?: string | undefined
          language?: string | null | undefined
          product_id?: string | null | undefined
          sort_order?: number | undefined
          storage_path?: string | null | undefined
          tags?: string[] | undefined
          title?: string | undefined
          url?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "product_assets_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_costs: {
        Row: {
          cost: number | null
          created_at: string
          currency: string
          product_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cost?: number | null | undefined
          created_at?: string | undefined
          currency?: string | undefined
          product_id: string
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Update: {
          cost?: number | null | undefined
          created_at?: string | undefined
          currency?: string | undefined
          product_id?: string | undefined
          updated_at?: string | undefined
          updated_by?: string | null | undefined
        }
        Relationships: [
          {
            foreignKeyName: "product_costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_prices: {
        Row: {
          amount: number | null
          created_at: string
          currency: string
          id: string
          market: string
          price_list_id: string
          product_id: string
          updated_at: string
        }
        Insert: {
          amount?: number | null | undefined
          created_at?: string | undefined
          currency?: string | undefined
          id?: string | undefined
          market: string
          price_list_id: string
          product_id: string
          updated_at?: string | undefined
        }
        Update: {
          amount?: number | null | undefined
          created_at?: string | undefined
          currency?: string | undefined
          id?: string | undefined
          market?: string | undefined
          price_list_id?: string | undefined
          product_id?: string | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "product_prices_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          burner_id: string | null
          category: string
          coating: string | null
          component: string | null
          cost: number | null
          cost_currency: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          oven_id: string | null
          size_label: string | null
          sort_order: number
          source_key: string | null
          updated_at: string
        }
        Insert: {
          burner_id?: string | null | undefined
          category?: string | undefined
          coating?: string | null | undefined
          component?: string | null | undefined
          cost?: number | null | undefined
          cost_currency?: string | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          is_active?: boolean | undefined
          name: string
          oven_id?: string | null | undefined
          size_label?: string | null | undefined
          sort_order?: number | undefined
          source_key?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          burner_id?: string | null | undefined
          category?: string | undefined
          coating?: string | null | undefined
          component?: string | null | undefined
          cost?: number | null | undefined
          cost_currency?: string | undefined
          created_at?: string | undefined
          description?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          is_active?: boolean | undefined
          name?: string | undefined
          oven_id?: string | null | undefined
          size_label?: string | null | undefined
          sort_order?: number | undefined
          source_key?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "products_burner_id_fkey"
            columns: ["burner_id"]
            isOneToOne: false
            referencedRelation: "burners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_oven_id_fkey"
            columns: ["oven_id"]
            isOneToOne: false
            referencedRelation: "configurator_ovens"
            referencedColumns: ["id"]
          },
        ]
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
          ai_render_url?: string | null | undefined
          burner_id?: string | null | undefined
          coating?: string | null | undefined
          created_at?: string | undefined
          custom_description?: string | null | undefined
          custom_name?: string | null | undefined
          diameter?: number | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          item_type?: string | undefined
          line_total?: number | undefined
          model_name?: string | null | undefined
          oven_id?: string | null | undefined
          proforma_id: string
          quantity?: number | undefined
          sort_order?: number | undefined
          specifications?: Json | null | undefined
          unit_price?: number | undefined
        }
        Update: {
          ai_render_url?: string | null | undefined
          burner_id?: string | null | undefined
          coating?: string | null | undefined
          created_at?: string | undefined
          custom_description?: string | null | undefined
          custom_name?: string | null | undefined
          diameter?: number | null | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          image_url?: string | null | undefined
          item_type?: string | undefined
          line_total?: number | undefined
          model_name?: string | null | undefined
          oven_id?: string | null | undefined
          proforma_id?: string | undefined
          quantity?: number | undefined
          sort_order?: number | undefined
          specifications?: Json | null | undefined
          unit_price?: number | undefined
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
          bank_account: string
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
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          language: string
          notes: string | null
          payment_completed_at: string | null
          payment_option: string
          payment_status: string
          price_list: string
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
          bank_account?: string | undefined
          billing_address?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivery_days?: number | null | undefined
          deposit_amount?: number | undefined
          deposit_percentage?: number | undefined
          discount_amount?: number | null | undefined
          discount_percentage?: number | null | undefined
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          payment_completed_at?: string | null | undefined
          payment_option?: string | undefined
          payment_status?: string | undefined
          price_list?: string | undefined
          proforma_number?: string | null | undefined
          status?: string | undefined
          stripe_session_id?: string | null | undefined
          token?: string | undefined
          total_price?: number | undefined
          updated_at?: string | undefined
          valid_until?: string | null | undefined
          vat_number?: string | null | undefined
        }
        Update: {
          bank_account?: string | undefined
          billing_address?: string | null | undefined
          company_name?: string | null | undefined
          created_at?: string | undefined
          created_by?: string | null | undefined
          currency?: string | undefined
          customer_email?: string | null | undefined
          customer_name?: string | null | undefined
          customer_phone?: string | null | undefined
          delivery_days?: number | null | undefined
          deposit_amount?: number | undefined
          deposit_percentage?: number | undefined
          discount_amount?: number | null | undefined
          discount_percentage?: number | null | undefined
          id?: string | undefined
          language?: string | undefined
          notes?: string | null | undefined
          payment_completed_at?: string | null | undefined
          payment_option?: string | undefined
          payment_status?: string | undefined
          price_list?: string | undefined
          proforma_number?: string | null | undefined
          status?: string | undefined
          stripe_session_id?: string | null | undefined
          token?: string | undefined
          total_price?: number | undefined
          updated_at?: string | undefined
          valid_until?: string | null | undefined
          vat_number?: string | null | undefined
        }
        Relationships: []
      }
      ready_to_ship_followups: {
        Row: {
          created_at: string
          customer_name: string
          due_at: string
          email: string
          error: string | null
          external_id: string | null
          id: string
          language: string
          model_name: string
          phone: string
          proforma_id: string | null
          sent_at: string | null
          status: string
          updated_at: string
          website_lead_id: string | null
        }
        Insert: {
          created_at?: string | undefined
          customer_name: string
          due_at: string
          email: string
          error?: string | null | undefined
          external_id?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          model_name: string
          phone: string
          proforma_id?: string | null | undefined
          sent_at?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          website_lead_id?: string | null | undefined
        }
        Update: {
          created_at?: string | undefined
          customer_name?: string | undefined
          due_at?: string | undefined
          email?: string | undefined
          error?: string | null | undefined
          external_id?: string | null | undefined
          id?: string | undefined
          language?: string | undefined
          model_name?: string | undefined
          phone?: string | undefined
          proforma_id?: string | null | undefined
          sent_at?: string | null | undefined
          status?: string | undefined
          updated_at?: string | undefined
          website_lead_id?: string | null | undefined
        }
        Relationships: []
      }
      ready_to_ship_ovens: {
        Row: {
          coating: string | null
          created_at: string
          custom_title: string | null
          delivery_description: string | null
          delivery_price: number | null
          description: string | null
          diameter: number
          fuel_type: string | null
          id: string
          images: string[] | null
          is_sold: boolean
          list_price: number
          model_name: string
          oven_id: string | null
          sale_price: number | null
          sold_at: string | null
          updated_at: string
        }
        Insert: {
          coating?: string | null | undefined
          created_at?: string | undefined
          custom_title?: string | null | undefined
          delivery_description?: string | null | undefined
          delivery_price?: number | null | undefined
          description?: string | null | undefined
          diameter: number
          fuel_type?: string | null | undefined
          id?: string | undefined
          images?: string[] | null | undefined
          is_sold?: boolean | undefined
          list_price?: number | undefined
          model_name: string
          oven_id?: string | null | undefined
          sale_price?: number | null | undefined
          sold_at?: string | null | undefined
          updated_at?: string | undefined
        }
        Update: {
          coating?: string | null | undefined
          created_at?: string | undefined
          custom_title?: string | null | undefined
          delivery_description?: string | null | undefined
          delivery_price?: number | null | undefined
          description?: string | null | undefined
          diameter?: number | undefined
          fuel_type?: string | null | undefined
          id?: string | undefined
          images?: string[] | null | undefined
          is_sold?: boolean | undefined
          list_price?: number | undefined
          model_name?: string | undefined
          oven_id?: string | null | undefined
          sale_price?: number | null | undefined
          sold_at?: string | null | undefined
          updated_at?: string | undefined
        }
        Relationships: [
          {
            foreignKeyName: "ready_to_ship_ovens_oven_id_fkey"
            columns: ["oven_id"]
            isOneToOne: false
            referencedRelation: "configurator_ovens"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bruno_messages: {
        Row: {
          chat_id: number
          content: string
          created_at: string
          id: number
          role: string
        }
        Insert: {
          chat_id: number
          content: string
          created_at?: string | undefined
          id?: number | undefined
          role: string
        }
        Update: {
          chat_id?: number | undefined
          content?: string | undefined
          created_at?: string | undefined
          id?: number | undefined
          role?: string | undefined
        }
        Relationships: []
      }
      telegram_links: {
        Row: {
          chat_id: number | null
          code_expires_at: string | null
          created_at: string
          link_code: string | null
          linked_at: string | null
          telegram_username: string | null
          user_id: string
        }
        Insert: {
          chat_id?: number | null | undefined
          code_expires_at?: string | null | undefined
          created_at?: string | undefined
          link_code?: string | null | undefined
          linked_at?: string | null | undefined
          telegram_username?: string | null | undefined
          user_id: string
        }
        Update: {
          chat_id?: number | null | undefined
          code_expires_at?: string | null | undefined
          created_at?: string | undefined
          link_code?: string | null | undefined
          linked_at?: string | null | undefined
          telegram_username?: string | null | undefined
          user_id?: string | undefined
        }
        Relationships: []
      }
      telegram_notifications: {
        Row: {
          body: string | null
          created_at: string
          handled_at: string | null
          handled_by: string | null
          id: number
          kind: string
          lead_id: string | null
          message_id: string | null
          reminded_at: string | null
          sent_at: string | null
          snoozed_until: string | null
          tg_messages: Json
          token: string
        }
        Insert: {
          body?: string | null | undefined
          created_at?: string | undefined
          handled_at?: string | null | undefined
          handled_by?: string | null | undefined
          id?: number | undefined
          kind: string
          lead_id?: string | null | undefined
          message_id?: string | null | undefined
          reminded_at?: string | null | undefined
          sent_at?: string | null | undefined
          snoozed_until?: string | null | undefined
          tg_messages?: Json | undefined
          token?: string | undefined
        }
        Update: {
          body?: string | null | undefined
          created_at?: string | undefined
          handled_at?: string | null | undefined
          handled_by?: string | null | undefined
          id?: number | undefined
          kind?: string | undefined
          lead_id?: string | null | undefined
          message_id?: string | null | undefined
          reminded_at?: string | null | undefined
          sent_at?: string | null | undefined
          snoozed_until?: string | null | undefined
          tg_messages?: Json | undefined
          token?: string | undefined
        }
        Relationships: []
      }
      telegram_pending: {
        Row: {
          actions: Json
          chat_id: number
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          status: string
          summary: string | null
        }
        Insert: {
          actions: Json
          chat_id: number
          created_at?: string | undefined
          decided_at?: string | null | undefined
          decided_by?: string | null | undefined
          id?: string | undefined
          status?: string | undefined
          summary?: string | null | undefined
        }
        Update: {
          actions?: Json | undefined
          chat_id?: number | undefined
          created_at?: string | undefined
          decided_at?: string | null | undefined
          decided_by?: string | null | undefined
          id?: string | undefined
          status?: string | undefined
          summary?: string | null | undefined
        }
        Relationships: []
      }
      telegram_updates: {
        Row: {
          created_at: string
          update_id: number
        }
        Insert: {
          created_at?: string | undefined
          update_id: number
        }
        Update: {
          created_at?: string | undefined
          update_id?: number | undefined
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
          created_at?: string | null | undefined
          id?: string | undefined
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null | undefined
          id?: string | undefined
          role?: Database["public"]["Enums"]["app_role"] | undefined
          user_id?: string | undefined
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
          city?: string | null | undefined
          company?: string | null | undefined
          created_at?: string | undefined
          email?: string | null | undefined
          first_name?: string | null | undefined
          form_type: string
          id?: string | undefined
          last_name?: string | null | undefined
          metadata?: Json | null | undefined
          notes?: string | null | undefined
          oven_type?: string | null | undefined
          phone?: string | null | undefined
          status?: string | undefined
          website?: string | null | undefined
        }
        Update: {
          city?: string | null | undefined
          company?: string | null | undefined
          created_at?: string | undefined
          email?: string | null | undefined
          first_name?: string | null | undefined
          form_type?: string | undefined
          id?: string | undefined
          last_name?: string | null | undefined
          metadata?: Json | null | undefined
          notes?: string | null | undefined
          oven_type?: string | null | undefined
          phone?: string | null | undefined
          status?: string | undefined
          website?: string | null | undefined
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      acquire_email_mailbox: {
        Args: { _id: string; _token: string }
        Returns: boolean
      }
      acquire_mario_autopilot: { Args: never; Returns: boolean }
      acquire_mario_delivery: { Args: { p_token: string }; Returns: boolean }
      activate_price_list: { Args: { _id: string }; Returns: undefined }
      apply_active_price_list: { Args: never; Returns: undefined }
      approve_mario_research_plan: {
        Args: { p_id: string; p_jobs: Json; p_user: string }
        Returns: boolean
      }
      bruno_message_page: {
        Args: {
          p_before_at?: string | undefined
          p_before_id?: string | undefined
          p_channel?: string | undefined
          p_lead_id: string
          p_limit?: number | undefined
        }
        Returns: {
          ai_generated: boolean
          body: string
          channel: string
          created_at: string
          created_by: string | null
          direction: string
          error: string | null
          external_id: string | null
          id: string
          lead_id: string
          metadata: Json | null
          sender: string
          status: string
          subject: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "crm_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      bruno_message_summaries: {
        Args: { p_lead_ids: string[] }
        Returns: {
          channel_counts: Json
          last_at: string
          last_channel: string
          last_contact_at: string
          lead_id: string
          message_count: number
          preview: string
        }[]
      }
      bruno_workspace_summary: { Args: { p_days?: number }; Returns: Json }
      cancel_bruno_action: {
        Args: { p_id: string; p_user: string }
        Returns: boolean
      }
      cancel_mario_research_plan: { Args: { p_id: string }; Returns: boolean }
      claim_bruno_action: {
        Args: { p_id: string; p_user: string }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          args: Json
          channel: string | null
          created_at: string
          error_code: string | null
          expires_at: string
          finished_at: string | null
          id: string
          lead_id: string | null
          message_id: string | null
          request_text: string
          requested_by: string
          requested_label: string | null
          result: Json
          scheduled_at: string | null
          source: string
          started_at: string | null
          status: string
          tool_name: string
          updated_at: string
          voice_call_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "bruno_actions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_bruno_call_plan: {
        Args: { p_id: string; p_token: string }
        Returns: {
          approved_at: string | null
          approved_by: string | null
          call_type: string
          created_at: string
          gap_minutes: number
          id: string
          instructions: string | null
          last_error: string | null
          lease_until: string | null
          objective: string
          requested_by: string | null
          status: string
          tick_token: string
          title: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bruno_call_plans"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_bruno_voice_result: {
        Args: { p_call: string; p_token: string }
        Returns: {
          attempts: number
          call_id: string
          created_at: string
          error_code: string | null
          lease_until: string | null
          next_attempt_at: string
          recording_url: string | null
          status: string
          token: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "bruno_voice_result_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_mario_research_callback: {
        Args: { p_id: string; p_token: string }
        Returns: {
          callback_claimed: boolean
          created_at: string
          error: string | null
          id: string
          input: Json
          kind: string
          lease_until: string | null
          not_before: string
          ordinal: number
          plan_id: string
          result: Json | null
          status: string
          updated_at: string
          worker_token: string
        }[]
        SetofOptions: {
          from: "*"
          to: "outreach_research_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_mario_research_job: {
        Args: { p_id: string; p_token: string }
        Returns: {
          callback_claimed: boolean
          created_at: string
          error: string | null
          id: string
          input: Json
          kind: string
          lease_until: string | null
          not_before: string
          ordinal: number
          plan_id: string
          result: Json | null
          status: string
          updated_at: string
          worker_token: string
        }[]
        SetofOptions: {
          from: "*"
          to: "outreach_research_jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      claim_mario_run: {
        Args: { p_input: Json; p_kind: string; p_user: string }
        Returns: string
      }
      claim_roberta_run: {
        Args: { _id: string; _token: string }
        Returns: {
          campaign_id: string | null
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          lease_until: string | null
          period_key: string
          started_at: string | null
          status: string
          worker_token: string
        }[]
        SetofOptions: {
          from: "*"
          to: "marketing_agent_runs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fail_mario_research_job: {
        Args: { p_error: string; p_id: string; p_token: string }
        Returns: undefined
      }
      finish_mario_research_job: {
        Args: { p_id: string; p_result: Json; p_token: string }
        Returns: boolean
      }
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
      kick_bruno_call_plans: { Args: never; Returns: undefined }
      kick_bruno_voice_results: { Args: never; Returns: undefined }
      mario_crm_organization_summary: { Args: never; Returns: Json }
      mario_due_outbox: {
        Args: never
        Returns: {
          accepted_at: string | null
          append_attempted_at: string | null
          attempted_at: string | null
          copy_status: string
          created_at: string
          id: string
          last_error: string | null
          message_id: string
          mime: string | null
          outreach_message_id: string
          prospect_id: string
          recipient: string
          rendered_html: string
          rendered_text: string
          sent_folder: string | null
          smtp_status: string
          subject: string
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "outreach_outbox"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      mario_effective_daily_limit: { Args: never; Returns: number }
      mario_existing_organization: {
        Args: { p_domain: string }
        Returns: boolean
      }
      mario_kpis: { Args: never; Returns: Json }
      mario_prospect_summary: {
        Args: never
        Returns: {
          country: string
          kind: string
          status: string
          total: number
        }[]
      }
      mario_reply_match: {
        Args: { p_sender: string }
        Returns: {
          email: string
          id: string
        }[]
      }
      project_mario_acceptance: { Args: { p_id: string }; Returns: undefined }
      queue_roberta_run: { Args: never; Returns: undefined }
      reserve_mario_submission: {
        Args: { p_id: string; p_token: string }
        Returns: boolean
      }
      save_bruno_voice_callback: {
        Args: { p_call: string; p_notes: string; p_when: string }
        Returns: undefined
      }
      save_bruno_voice_qualification: {
        Args: { p_call: string; p_facts: Json; p_summary: string }
        Returns: undefined
      }
      save_email_signature: {
        Args: { _fields: Json; _id: string; _mailbox: string }
        Returns: {
          address: string
          company: string
          created_at: string
          email: string
          id: string
          is_default: boolean
          mailbox_id: string
          name: string
          phone: string
          role: string
          updated_at: string
          website: string
          whatsapp: string
        }
        SetofOptions: {
          from: "*"
          to: "email_signatures"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      save_product_material: {
        Args: { _fields: Json; _id: string; _product_ids: string[] }
        Returns: string
      }
      telegram_cron_kick: { Args: never; Returns: undefined }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
