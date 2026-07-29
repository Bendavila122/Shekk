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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ensure_account: {
        Args: never
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
      hold_create: {
        Args: {
          _amount_agorot: number
          _category?: string
          _external_ref?: string
          _icon?: string
          _idempotency_key?: string
          _merchant: string
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
        Args: { _hold_id: string }
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
        Args: { _final_amount_agorot?: number; _hold_id: string }
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
  public: {
    Enums: {},
  },
} as const
