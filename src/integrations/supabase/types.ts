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
      accounts: {
        Row: {
          balance_agorot: number
          created_at: string
          currency: string
          held_agorot: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_agorot?: number
          created_at?: string
          currency?: string
          held_agorot?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_agorot?: number
          created_at?: string
          currency?: string
          held_agorot?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      funding_events: {
        Row: {
          created_at: string
          entry_id: string | null
          fee_minor: number
          id: string
          idempotency_key: string
          interbank_rate: number
          method: string
          pay_amount_minor: number
          pay_currency: string
          provider: string
          provider_ref: string | null
          quoted_rate: number
          settled_at: string | null
          shekels_agorot: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id?: string | null
          fee_minor?: number
          id?: string
          idempotency_key: string
          interbank_rate: number
          method?: string
          pay_amount_minor: number
          pay_currency: string
          provider?: string
          provider_ref?: string | null
          quoted_rate: number
          settled_at?: string | null
          shekels_agorot: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string | null
          fee_minor?: number
          id?: string
          idempotency_key?: string
          interbank_rate?: number
          method?: string
          pay_amount_minor?: number
          pay_currency?: string
          provider?: string
          provider_ref?: string | null
          quoted_rate?: number
          settled_at?: string | null
          shekels_agorot?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funding_events_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      holds: {
        Row: {
          amount_agorot: number
          category: string
          created_at: string
          external_ref: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          resolved_at: string | null
          settled_amount_agorot: number | null
          settled_entry_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount_agorot: number
          category?: string
          created_at?: string
          external_ref?: string | null
          icon?: string
          id?: string
          idempotency_key: string
          merchant: string
          resolved_at?: string | null
          settled_amount_agorot?: number | null
          settled_entry_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount_agorot?: number
          category?: string
          created_at?: string
          external_ref?: string | null
          icon?: string
          id?: string
          idempotency_key?: string
          merchant?: string
          resolved_at?: string | null
          settled_amount_agorot?: number | null
          settled_entry_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holds_settled_entry_id_fkey"
            columns: ["settled_entry_id"]
            isOneToOne: false
            referencedRelation: "ledger_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_documents: {
        Row: {
          byte_size: number | null
          created_at: string
          id: string
          kind: string
          mime_type: string | null
          status: string
          storage_path: string
          user_id: string
        }
        Insert: {
          byte_size?: number | null
          created_at?: string
          id?: string
          kind: string
          mime_type?: string | null
          status?: string
          storage_path: string
          user_id: string
        }
        Update: {
          byte_size?: number | null
          created_at?: string
          id?: string
          kind?: string
          mime_type?: string | null
          status?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      ledger_entries: {
        Row: {
          amount_agorot: number
          balance_after_agorot: number
          category: string
          counterparty: string | null
          created_at: string
          direction: string
          external_ref: string | null
          hold_id: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          user_id: string
        }
        Insert: {
          amount_agorot: number
          balance_after_agorot: number
          category?: string
          counterparty?: string | null
          created_at?: string
          direction: string
          external_ref?: string | null
          hold_id?: string | null
          icon?: string
          id?: string
          idempotency_key: string
          merchant: string
          user_id: string
        }
        Update: {
          amount_agorot?: number
          balance_after_agorot?: number
          category?: string
          counterparty?: string | null
          created_at?: string
          direction?: string
          external_ref?: string | null
          hold_id?: string | null
          icon?: string
          id?: string
          idempotency_key?: string
          merchant?: string
          user_id?: string
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line1: string | null
          address_line2: string | null
          address_postcode: string | null
          address_state: string | null
          airwallex_account_id: string | null
          airwallex_account_status: string
          airwallex_cardholder_id: string | null
          airwallex_rejection_reason: string | null
          arrival_date: string | null
          city: string | null
          cohort: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          esign_accepted_at: string | null
          expected_monthly_ils: number | null
          id_document_number: string | null
          id_document_type: string | null
          id_expiry: string | null
          id_issuing_country: string | null
          il_address_city: string | null
          il_address_line1: string | null
          il_address_postcode: string | null
          ils_account_approved_at: string | null
          is_pep: boolean
          is_us_person: boolean
          kyc_rejection_reason: string | null
          kyc_reviewed_at: string | null
          kyc_status: string
          kyc_submitted_at: string | null
          legal_first_name: string | null
          legal_last_name: string | null
          legal_middle_name: string | null
          nationality: string | null
          occupation: string | null
          phone_country_code: string | null
          phone_number: string | null
          preferred_currency: string
          privacy_accepted_at: string | null
          program: string | null
          reverify_due_at: string | null
          source_of_funds: string | null
          tax_country: string | null
          tax_id: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postcode?: string | null
          address_state?: string | null
          airwallex_account_id?: string | null
          airwallex_account_status?: string
          airwallex_cardholder_id?: string | null
          airwallex_rejection_reason?: string | null
          arrival_date?: string | null
          city?: string | null
          cohort?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          esign_accepted_at?: string | null
          expected_monthly_ils?: number | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_expiry?: string | null
          id_issuing_country?: string | null
          il_address_city?: string | null
          il_address_line1?: string | null
          il_address_postcode?: string | null
          ils_account_approved_at?: string | null
          is_pep?: boolean
          is_us_person?: boolean
          kyc_rejection_reason?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          nationality?: string | null
          occupation?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          preferred_currency?: string
          privacy_accepted_at?: string | null
          program?: string | null
          reverify_due_at?: string | null
          source_of_funds?: string | null
          tax_country?: string | null
          tax_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postcode?: string | null
          address_state?: string | null
          airwallex_account_id?: string | null
          airwallex_account_status?: string
          airwallex_cardholder_id?: string | null
          airwallex_rejection_reason?: string | null
          arrival_date?: string | null
          city?: string | null
          cohort?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          esign_accepted_at?: string | null
          expected_monthly_ils?: number | null
          id_document_number?: string | null
          id_document_type?: string | null
          id_expiry?: string | null
          id_issuing_country?: string | null
          il_address_city?: string | null
          il_address_line1?: string | null
          il_address_postcode?: string | null
          ils_account_approved_at?: string | null
          is_pep?: boolean
          is_us_person?: boolean
          kyc_rejection_reason?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          legal_first_name?: string | null
          legal_last_name?: string | null
          legal_middle_name?: string | null
          nationality?: string | null
          occupation?: string | null
          phone_country_code?: string | null
          phone_number?: string | null
          preferred_currency?: string
          privacy_accepted_at?: string | null
          program?: string | null
          reverify_due_at?: string | null
          source_of_funds?: string | null
          tax_country?: string | null
          tax_id?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      claim_first_admin: { Args: { _user_id: string }; Returns: boolean }
      ensure_account: {
        Args: { _user_id: string }
        Returns: {
          balance_agorot: number
          created_at: string
          currency: string
          held_agorot: number
          status: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "accounts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      funding_settle: {
        Args: {
          _fee_minor: number
          _idempotency_key?: string
          _interbank_rate: number
          _method?: string
          _pay_amount_minor: number
          _pay_currency: string
          _provider?: string
          _provider_ref?: string
          _quoted_rate: number
          _shekels_agorot: number
          _user_id: string
        }
        Returns: {
          created_at: string
          entry_id: string | null
          fee_minor: number
          id: string
          idempotency_key: string
          interbank_rate: number
          method: string
          pay_amount_minor: number
          pay_currency: string
          provider: string
          provider_ref: string | null
          quoted_rate: number
          settled_at: string | null
          shekels_agorot: number
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "funding_events"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hold_create: {
        Args: {
          _amount_agorot: number
          _category?: string
          _external_ref?: string
          _icon?: string
          _idempotency_key?: string
          _merchant: string
          _user_id: string
        }
        Returns: {
          amount_agorot: number
          category: string
          created_at: string
          external_ref: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          resolved_at: string | null
          settled_amount_agorot: number | null
          settled_entry_id: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "holds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hold_release: {
        Args: { _hold_id: string; _user_id: string }
        Returns: {
          amount_agorot: number
          category: string
          created_at: string
          external_ref: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          resolved_at: string | null
          settled_amount_agorot: number | null
          settled_entry_id: string | null
          status: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "holds"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      hold_settle: {
        Args: {
          _final_amount_agorot?: number
          _hold_id: string
          _user_id: string
        }
        Returns: {
          amount_agorot: number
          balance_after_agorot: number
          category: string
          counterparty: string | null
          created_at: string
          direction: string
          external_ref: string | null
          hold_id: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ledger_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ledger_post: {
        Args: {
          _amount_agorot: number
          _category?: string
          _counterparty?: string
          _direction: string
          _external_ref?: string
          _hold_id?: string
          _icon?: string
          _idempotency_key?: string
          _merchant: string
          _user_id: string
        }
        Returns: {
          amount_agorot: number
          balance_after_agorot: number
          category: string
          counterparty: string | null
          created_at: string
          direction: string
          external_ref: string | null
          hold_id: string | null
          icon: string
          id: string
          idempotency_key: string
          merchant: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "ledger_entries"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "member"
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
      app_role: ["admin", "reviewer", "member"],
    },
  },
} as const
