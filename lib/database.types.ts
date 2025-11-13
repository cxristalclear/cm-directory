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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      business_info: {
        Row: {
          awards_recognition: string | null
          company_id: string | null
          created_at: string | null
          engineering_support_hours: string | null
          id: string
          min_order_qty: string | null
          notable_customers: string | null
          payment_terms: string | null
          production_lead_time: string | null
          prototype_lead_time: string | null
          rush_order_capability: boolean | null
          sales_territory: string | null
          twenty_four_seven_production: boolean | null
          updated_at: string | null
        }
        Insert: {
          awards_recognition?: string | null
          company_id?: string | null
          created_at?: string | null
          engineering_support_hours?: string | null
          id?: string
          min_order_qty?: string | null
          notable_customers?: string | null
          payment_terms?: string | null
          production_lead_time?: string | null
          prototype_lead_time?: string | null
          rush_order_capability?: boolean | null
          sales_territory?: string | null
          twenty_four_seven_production?: boolean | null
          updated_at?: string | null
        }
        Update: {
          awards_recognition?: string | null
          company_id?: string | null
          created_at?: string | null
          engineering_support_hours?: string | null
          id?: string
          min_order_qty?: string | null
          notable_customers?: string | null
          payment_terms?: string | null
          production_lead_time?: string | null
          prototype_lead_time?: string | null
          rush_order_capability?: boolean | null
          sales_territory?: string | null
          twenty_four_seven_production?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_info_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      capabilities: {
        Row: {
          box_build_assembly: boolean | null
          cable_harness_assembly: boolean | null
          company_id: string | null
          consigned_services: boolean | null
          created_at: string | null
          design_services: boolean | null
          high_volume_production: boolean | null
          id: string
          last_verified_date: string | null
          lead_free_soldering: boolean | null
          low_volume_production: boolean | null
          medium_volume_production: boolean | null
          pcb_assembly_fine_pitch: boolean | null
          pcb_assembly_mixed: boolean | null
          pcb_assembly_smt: boolean | null
          pcb_assembly_through_hole: boolean | null
          prototyping: boolean | null
          supply_chain_management: boolean | null
          testing_environmental: boolean | null
          testing_functional: boolean | null
          testing_ict: boolean | null
          testing_rf_wireless: boolean | null
          turnkey_services: boolean | null
          updated_at: string | null
        }
        Insert: {
          box_build_assembly?: boolean | null
          cable_harness_assembly?: boolean | null
          company_id?: string | null
          consigned_services?: boolean | null
          created_at?: string | null
          design_services?: boolean | null
          high_volume_production?: boolean | null
          id?: string
          last_verified_date?: string | null
          lead_free_soldering?: boolean | null
          low_volume_production?: boolean | null
          medium_volume_production?: boolean | null
          pcb_assembly_fine_pitch?: boolean | null
          pcb_assembly_mixed?: boolean | null
          pcb_assembly_smt?: boolean | null
          pcb_assembly_through_hole?: boolean | null
          prototyping?: boolean | null
          supply_chain_management?: boolean | null
          testing_environmental?: boolean | null
          testing_functional?: boolean | null
          testing_ict?: boolean | null
          testing_rf_wireless?: boolean | null
          turnkey_services?: boolean | null
          updated_at?: string | null
        }
        Update: {
          box_build_assembly?: boolean | null
          cable_harness_assembly?: boolean | null
          company_id?: string | null
          consigned_services?: boolean | null
          created_at?: string | null
          design_services?: boolean | null
          high_volume_production?: boolean | null
          id?: string
          last_verified_date?: string | null
          lead_free_soldering?: boolean | null
          low_volume_production?: boolean | null
          medium_volume_production?: boolean | null
          pcb_assembly_fine_pitch?: boolean | null
          pcb_assembly_mixed?: boolean | null
          pcb_assembly_smt?: boolean | null
          pcb_assembly_through_hole?: boolean | null
          prototyping?: boolean | null
          supply_chain_management?: boolean | null
          testing_environmental?: boolean | null
          testing_functional?: boolean | null
          testing_ict?: boolean | null
          testing_rf_wireless?: boolean | null
          turnkey_services?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capabilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certificate_number: string | null
          certification_type: string
          company_id: string | null
          created_at: string | null
          expiration_date: string | null
          id: string
          issued_date: string | null
          issuing_body: string | null
          scope: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_number?: string | null
          certification_type: string
          company_id?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_body?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_number?: string | null
          certification_type?: string
          company_id?: string | null
          created_at?: string | null
          expiration_date?: string | null
          id?: string
          issued_date?: string | null
          issuing_body?: string | null
          scope?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue_range: string | null
          claim_approved_at: string | null
          claim_approved_by: string | null
          claim_rejection_reason: string | null
          claim_status: string | null
          claimed_at: string | null
          claimed_by_email: string | null
          claimed_by_name: string | null
          company_name: string
          created_at: string | null
          dba_name: string | null
          description: string | null
          employee_count_range: string | null
          has_pending_updates: boolean | null
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          key_differentiators: string | null
          last_reviewed_at: string | null
          last_reviewed_by: string | null
          last_verified_date: string | null
          logo_url: string | null
          slug: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
          verified_until: string | null
          website_url: string
          year_founded: number | null
        }
        Insert: {
          annual_revenue_range?: string | null
          claim_approved_at?: string | null
          claim_approved_by?: string | null
          claim_rejection_reason?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          company_name: string
          created_at?: string | null
          dba_name?: string | null
          description?: string | null
          employee_count_range?: string | null
          has_pending_updates?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          key_differentiators?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          last_verified_date?: string | null
          logo_url?: string | null
          slug?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_until?: string | null
          website_url: string
          year_founded?: number | null
        }
        Update: {
          annual_revenue_range?: string | null
          claim_approved_at?: string | null
          claim_approved_by?: string | null
          claim_rejection_reason?: string | null
          claim_status?: string | null
          claimed_at?: string | null
          claimed_by_email?: string | null
          claimed_by_name?: string | null
          company_name?: string
          created_at?: string | null
          dba_name?: string | null
          description?: string | null
          employee_count_range?: string | null
          has_pending_updates?: boolean | null
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          key_differentiators?: string | null
          last_reviewed_at?: string | null
          last_reviewed_by?: string | null
          last_verified_date?: string | null
          logo_url?: string | null
          slug?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
          verified_until?: string | null
          website_url?: string
          year_founded?: number | null
        }
        Relationships: []
      }
      company_change_log: {
        Row: {
          change_summary: Json | null
          change_type: string
          changed_at: string
          changed_by_email: string
          changed_by_name: string
          company_id: string
          created_at: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
        }
        Insert: {
          change_summary?: Json | null
          change_type: string
          changed_at?: string
          changed_by_email: string
          changed_by_name: string
          company_id: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Update: {
          change_summary?: Json | null
          change_type?: string
          changed_at?: string
          changed_by_email?: string
          changed_by_name?: string
          company_id?: string
          created_at?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_change_log_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_research_history: {
        Row: {
          company_id: string
          company_name: string
          created_at: string
          created_by_email: string
          created_by_name: string
          data_confidence: string | null
          enrichment_snapshot: Json | null
          id: string
          research_notes: string | null
          research_snapshot: Json
          research_summary: string | null
          source: string | null
          website_url: string | null
        }
        Insert: {
          company_id: string
          company_name: string
          created_at?: string
          created_by_email: string
          created_by_name: string
          data_confidence?: string | null
          enrichment_snapshot?: Json | null
          id?: string
          research_notes?: string | null
          research_snapshot: Json
          research_summary?: string | null
          source?: string | null
          website_url?: string | null
        }
        Update: {
          company_id?: string
          company_name?: string
          created_at?: string
          created_by_email?: string
          created_by_name?: string
          data_confidence?: string | null
          enrichment_snapshot?: Json | null
          id?: string
          research_notes?: string | null
          research_snapshot?: Json
          research_summary?: string | null
          source?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_research_history_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          accepts_cold_outreach: boolean | null
          company_id: string | null
          contact_type: string
          created_at: string | null
          email: string | null
          extension: string | null
          first_name: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_contacted: string | null
          last_name: string | null
          phone: string | null
          preferred_contact_method: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          accepts_cold_outreach?: boolean | null
          company_id?: string | null
          contact_type: string
          created_at?: string | null
          email?: string | null
          extension?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_contacted?: string | null
          last_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          accepts_cold_outreach?: boolean | null
          company_id?: string | null
          contact_type?: string
          created_at?: string | null
          email?: string | null
          extension?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_contacted?: string | null
          last_name?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          id: string
          iso2: string
          iso3: string | null
          name: string
          name_normalized: string | null
        }
        Insert: {
          id?: string
          iso2: string
          iso3?: string | null
          name: string
          name_normalized?: string | null
        }
        Update: {
          id?: string
          iso2?: string
          iso3?: string | null
          name?: string
          name_normalized?: string | null
        }
        Relationships: []
      }
      country_aliases: {
        Row: {
          alias: string
          alias_normalized: string | null
          iso2: string
        }
        Insert: {
          alias: string
          alias_normalized?: string | null
          iso2: string
        }
        Update: {
          alias?: string
          alias_normalized?: string | null
          iso2?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_aliases_iso2_fkey"
            columns: ["iso2"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["iso2"]
          },
        ]
      }
      facilities: {
        Row: {
          city: string | null
          company_id: string | null
          country: string | null
          country_code: string | null
          created_at: string | null
          employees_at_location: number | null
          facility_name: string | null
          facility_size_sqft: number | null
          facility_type: string
          id: string
          is_primary: boolean | null
          key_capabilities: string | null
          latitude: number | null
          location: unknown
          longitude: number | null
          postal_code: string | null
          state: string | null
          state_code: string | null
          state_province: string | null
          street_address: string | null
          updated_at: string | null
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          company_id?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          employees_at_location?: number | null
          facility_name?: string | null
          facility_size_sqft?: number | null
          facility_type: string
          id?: string
          is_primary?: boolean | null
          key_capabilities?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          state_code?: string | null
          state_province?: string | null
          street_address?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          company_id?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          employees_at_location?: number | null
          facility_name?: string | null
          facility_size_sqft?: number | null
          facility_type?: string
          id?: string
          is_primary?: boolean | null
          key_capabilities?: string | null
          latitude?: number | null
          location?: unknown
          longitude?: number | null
          postal_code?: string | null
          state?: string | null
          state_code?: string | null
          state_province?: string | null
          street_address?: string | null
          updated_at?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      industries: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          industry_name: string
          is_specialization: boolean | null
          notable_projects: string | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry_name: string
          is_specialization?: boolean | null
          notable_projects?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          industry_name?: string
          is_specialization?: boolean | null
          notable_projects?: string | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "industries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_company_updates: {
        Row: {
          company_id: string
          created_at: string
          id: string
          proposed_changes: Json
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          submitted_by_email: string
          submitted_by_name: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          proposed_changes: Json
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by_email: string
          submitted_by_name: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          proposed_changes?: Json
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          submitted_by_email?: string
          submitted_by_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_company_updates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      search_analytics: {
        Row: {
          device_type: string | null
          filters_applied: Json | null
          id: string
          results_clicked: string[] | null
          results_count: number | null
          search_query: string | null
          search_timestamp: string | null
          session_id: string | null
          user_location: string | null
        }
        Insert: {
          device_type?: string | null
          filters_applied?: Json | null
          id?: string
          results_clicked?: string[] | null
          results_count?: number | null
          search_query?: string | null
          search_timestamp?: string | null
          session_id?: string | null
          user_location?: string | null
        }
        Update: {
          device_type?: string | null
          filters_applied?: Json | null
          id?: string
          results_clicked?: string[] | null
          results_count?: number | null
          search_query?: string | null
          search_timestamp?: string | null
          session_id?: string | null
          user_location?: string | null
        }
        Relationships: []
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string
          country_iso2: string
          id: string
          name: string
          name_normalized: string | null
        }
        Insert: {
          code: string
          country_iso2: string
          id?: string
          name: string
          name_normalized?: string | null
        }
        Update: {
          code?: string
          country_iso2?: string
          id?: string
          name?: string
          name_normalized?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "states_country_fk"
            columns: ["country_iso2"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["iso2"]
          },
        ]
      }
      stg_company_import: {
        Row: {
          additional_notes: string | null
          aoi_inspection: string | null
          burn_in_testing: string | null
          certification_status: string | null
          certification_type: string | null
          clean_room_class: string | null
          company_name: string | null
          conformal_coating: string | null
          employees_at_location: string | null
          facility_city: string | null
          facility_size_sqft: string | null
          facility_state: string | null
          facility_street_address: string | null
          facility_zip_code: string | null
          flying_probe_testing: string | null
          issuing_body: string | null
          lead_free_soldering: string | null
          max_pcb_layers: string | null
          pcb_assembly_fine_pitch: string | null
          pcb_assembly_smt: string | null
          potting_encapsulation: string | null
          smallest_component_size: string | null
          x_ray_inspection: string | null
        }
        Insert: {
          additional_notes?: string | null
          aoi_inspection?: string | null
          burn_in_testing?: string | null
          certification_status?: string | null
          certification_type?: string | null
          clean_room_class?: string | null
          company_name?: string | null
          conformal_coating?: string | null
          employees_at_location?: string | null
          facility_city?: string | null
          facility_size_sqft?: string | null
          facility_state?: string | null
          facility_street_address?: string | null
          facility_zip_code?: string | null
          flying_probe_testing?: string | null
          issuing_body?: string | null
          lead_free_soldering?: string | null
          max_pcb_layers?: string | null
          pcb_assembly_fine_pitch?: string | null
          pcb_assembly_smt?: string | null
          potting_encapsulation?: string | null
          smallest_component_size?: string | null
          x_ray_inspection?: string | null
        }
        Update: {
          additional_notes?: string | null
          aoi_inspection?: string | null
          burn_in_testing?: string | null
          certification_status?: string | null
          certification_type?: string | null
          clean_room_class?: string | null
          company_name?: string | null
          conformal_coating?: string | null
          employees_at_location?: string | null
          facility_city?: string | null
          facility_size_sqft?: string | null
          facility_state?: string | null
          facility_street_address?: string | null
          facility_zip_code?: string | null
          flying_probe_testing?: string | null
          issuing_body?: string | null
          lead_free_soldering?: string | null
          max_pcb_layers?: string | null
          pcb_assembly_fine_pitch?: string | null
          pcb_assembly_smt?: string | null
          potting_encapsulation?: string | null
          smallest_component_size?: string | null
          x_ray_inspection?: string | null
        }
        Relationships: []
      }
      technical_specs: {
        Row: {
          additional_specs: string | null
          aoi_inspection: boolean | null
          burn_in_testing: boolean | null
          clean_room_class: string | null
          company_id: string | null
          conformal_coating: boolean | null
          created_at: string | null
          finest_pitch_capability: string | null
          flying_probe_testing: boolean | null
          id: string
          lead_free_soldering: boolean | null
          max_pcb_layers: number | null
          max_pcb_size_inches: string | null
          potting_encapsulation: boolean | null
          smallest_component_size: string | null
          updated_at: string | null
          x_ray_inspection: boolean | null
        }
        Insert: {
          additional_specs?: string | null
          aoi_inspection?: boolean | null
          burn_in_testing?: boolean | null
          clean_room_class?: string | null
          company_id?: string | null
          conformal_coating?: boolean | null
          created_at?: string | null
          finest_pitch_capability?: string | null
          flying_probe_testing?: boolean | null
          id?: string
          lead_free_soldering?: boolean | null
          max_pcb_layers?: number | null
          max_pcb_size_inches?: string | null
          potting_encapsulation?: boolean | null
          smallest_component_size?: string | null
          updated_at?: string | null
          x_ray_inspection?: boolean | null
        }
        Update: {
          additional_specs?: string | null
          aoi_inspection?: boolean | null
          burn_in_testing?: boolean | null
          clean_room_class?: string | null
          company_id?: string | null
          conformal_coating?: boolean | null
          created_at?: string | null
          finest_pitch_capability?: string | null
          flying_probe_testing?: boolean | null
          id?: string
          lead_free_soldering?: boolean | null
          max_pcb_layers?: number | null
          max_pcb_size_inches?: string | null
          potting_encapsulation?: boolean | null
          smallest_component_size?: string | null
          updated_at?: string | null
          x_ray_inspection?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "technical_specs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_data: {
        Row: {
          company_id: string | null
          created_at: string | null
          data_confidence: string | null
          has_logo: boolean | null
          id: string
          internal_notes: string | null
          is_featured_partner: boolean | null
          profile_completeness: number | null
          public_description: string | null
          recommended_by: string | null
          updated_at: string | null
          venkel_relationship: string | null
          verification_date: string | null
          verification_method: string | null
          verified_by: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          data_confidence?: string | null
          has_logo?: boolean | null
          id?: string
          internal_notes?: string | null
          is_featured_partner?: boolean | null
          profile_completeness?: number | null
          public_description?: string | null
          recommended_by?: string | null
          updated_at?: string | null
          venkel_relationship?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          data_confidence?: string | null
          has_logo?: boolean | null
          id?: string
          internal_notes?: string | null
          is_featured_partner?: boolean | null
          profile_completeness?: number | null
          public_description?: string | null
          recommended_by?: string | null
          updated_at?: string | null
          venkel_relationship?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_data_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      dropgeometrytable:
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      find_companies_nearby: {
        Args: { lat: number; lng: number; radius_miles?: number }
        Returns: {
          city: string
          company_id: string
          company_name: string
          distance_miles: number
          state: string
        }[]
      }
      generate_slug: { Args: { input_text: string }; Returns: string }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_jwt_email: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      is_venkel_admin: { Args: never; Returns: boolean }
      longtransactionsenabled: { Args: never; Returns: boolean }
      merge_companies: {
        Args: { keep_id: string; remove_id: string }
        Returns: {
          rows_updated: number
          table_name: string
        }[]
      }
      normalize_company_name: { Args: { name: string }; Returns: string }
      normalize_location_text: { Args: { input: string }; Returns: string }
      populate_geometry_columns:
        | { Args: { use_typmod?: boolean }; Returns: string }
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_askml:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geom: unknown }; Returns: number }
        | { Args: { geog: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      text_to_bool: { Args: { t: string }; Returns: boolean }
      unlockrows: { Args: { "": string }; Returns: number }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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
    Enums: {},
  },
} as const
