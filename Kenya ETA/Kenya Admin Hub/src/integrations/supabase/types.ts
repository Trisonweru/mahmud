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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          ip: string | null
          target_email: string | null
          target_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip?: string | null
          target_email?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          ip?: string | null
          target_email?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      application_documents: {
        Row: {
          application_id: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          application_id: string
          doc_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          application_id?: string
          doc_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string | null
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          accommodation_address: string | null
          accommodation_name: string | null
          address_in_country: string
          arrival_date: string
          assigned_to: string | null
          biometric_consent: boolean
          carrying_over_10k: boolean | null
          claimed_at: string | null
          claimed_by: string | null
          convicted_5_years: boolean | null
          conviction_details: string | null
          country_of_birth: string | null
          currency: string
          denied_entry: boolean | null
          denied_entry_details: string | null
          departure_date: string
          dob: string
          email: string
          emergency_contact_email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          etas_reference: string | null
          etas_submitted: boolean
          etas_submitted_at: string | null
          etas_submitted_by: string | null
          fee: number
          full_name: string
          id: string
          marital_status: string | null
          nationality: string
          nationality_at_birth: string | null
          occupation: string | null
          paid: boolean
          paid_at: string | null
          passport_expiry: string
          passport_issue_date: string | null
          passport_number: string
          phone: string | null
          processing_speed: string
          purpose: string
          reference: string
          refund_amount: number | null
          refund_processed_at: string | null
          refund_reason: string | null
          refund_requested_at: string | null
          refund_requested_by: string | null
          refund_status: string | null
          status: Database["public"]["Enums"]["application_status"]
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          submitted_at: string
          third_party_details: string | null
          third_party_financed: boolean | null
          type: Database["public"]["Enums"]["application_type"]
          updated_at: string | null
          visited_more_than_three: boolean | null
        }
        Insert: {
          accommodation_address?: string | null
          accommodation_name?: string | null
          address_in_country: string
          arrival_date: string
          assigned_to?: string | null
          biometric_consent?: boolean
          carrying_over_10k?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          convicted_5_years?: boolean | null
          conviction_details?: string | null
          country_of_birth?: string | null
          currency?: string
          denied_entry?: boolean | null
          denied_entry_details?: string | null
          departure_date: string
          dob: string
          email: string
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          etas_reference?: string | null
          etas_submitted?: boolean
          etas_submitted_at?: string | null
          etas_submitted_by?: string | null
          fee?: number
          full_name: string
          id?: string
          marital_status?: string | null
          nationality: string
          nationality_at_birth?: string | null
          occupation?: string | null
          paid?: boolean
          paid_at?: string | null
          passport_expiry: string
          passport_issue_date?: string | null
          passport_number: string
          phone?: string | null
          processing_speed?: string
          purpose: string
          reference?: string
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_requested_by?: string | null
          refund_status?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string
          third_party_details?: string | null
          third_party_financed?: boolean | null
          type?: Database["public"]["Enums"]["application_type"]
          updated_at?: string | null
          visited_more_than_three?: boolean | null
        }
        Update: {
          accommodation_address?: string | null
          accommodation_name?: string | null
          address_in_country?: string
          arrival_date?: string
          assigned_to?: string | null
          biometric_consent?: boolean
          carrying_over_10k?: boolean | null
          claimed_at?: string | null
          claimed_by?: string | null
          convicted_5_years?: boolean | null
          conviction_details?: string | null
          country_of_birth?: string | null
          currency?: string
          denied_entry?: boolean | null
          denied_entry_details?: string | null
          departure_date?: string
          dob?: string
          email?: string
          emergency_contact_email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          etas_reference?: string | null
          etas_submitted?: boolean
          etas_submitted_at?: string | null
          etas_submitted_by?: string | null
          fee?: number
          full_name?: string
          id?: string
          marital_status?: string | null
          nationality?: string
          nationality_at_birth?: string | null
          occupation?: string | null
          paid?: boolean
          paid_at?: string | null
          passport_expiry?: string
          passport_issue_date?: string | null
          passport_number?: string
          phone?: string | null
          processing_speed?: string
          purpose?: string
          reference?: string
          refund_amount?: number | null
          refund_processed_at?: string | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_requested_by?: string | null
          refund_status?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          submitted_at?: string
          third_party_details?: string | null
          third_party_financed?: boolean | null
          type?: Database["public"]["Enums"]["application_type"]
          updated_at?: string | null
          visited_more_than_three?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_refund_requested_by_fkey"
            columns: ["refund_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          application_id: string | null
          body: string | null
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          deleted_at: string | null
          deleted_by: string | null
          status: string
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          deleted_at?: string | null
          deleted_by?: string | null
          status?: string
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          position?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          deleted_at?: string | null
          deleted_by?: string | null
          status?: string
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
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
      generate_reference: { Args: never; Returns: string }
      notify_all_staff: {
        Args: {
          p_app_id?: string
          p_body?: string
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "officer"
      application_status:
        | "pending_payment"
        | "awaiting_etas"
        | "submitted"
        | "in_review"
        | "additional_info"
        | "approved"
        | "rejected"
        | "refunded"
      application_type: "standard" | "express"
      document_type:
        | "passport"
        | "photo"
        | "accommodation_booking"
        | "airline_booking"
        | "invitation_letter"
        | "host_identity_card"
        | "other"
      notification_type:
        | "application_submitted"
        | "payment_received"
        | "etas_overdue"
        | "application_approved"
        | "application_rejected"
        | "note_added"
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
      app_role: ["super_admin", "admin", "officer"],
      application_status: [
        "pending_payment",
        "awaiting_etas",
        "submitted",
        "in_review",
        "additional_info",
        "approved",
        "rejected",
        "refunded",
      ],
      application_type: ["standard", "express"],
      document_type: [
        "passport",
        "photo",
        "accommodation_booking",
        "airline_booking",
        "invitation_letter",
        "host_identity_card",
        "other",
      ],
      notification_type: [
        "application_submitted",
        "payment_received",
        "etas_overdue",
        "application_approved",
        "application_rejected",
        "note_added",
      ],
    },
  },
} as const
