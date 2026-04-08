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
      check_ins: {
        Row: {
          created_at: string
          id: string
          note: string | null
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_rituals: {
        Row: {
          created_at: string
          duration_estimate: number
          id: string
          name: string
          steps: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_estimate?: number
          id?: string
          name?: string
          steps?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          duration_estimate?: number
          id?: string
          name?: string
          steps?: Json
          user_id?: string
        }
        Relationships: []
      }
      future_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          template: string
          title: string
          user_id: string
          vibe_check: string | null
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          template?: string
          title?: string
          user_id: string
          vibe_check?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          template?: string
          title?: string
          user_id?: string
          vibe_check?: string | null
        }
        Relationships: []
      }
      gathered_sequences: {
        Row: {
          created_at: string
          id: string
          lines: Json
          playback_settings: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lines?: Json
          playback_settings?: Json
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lines?: Json
          playback_settings?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      imagine_if_entries: {
        Row: {
          category: string
          created_at: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          text?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      momentum_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration: number
          id: string
          phrase: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration?: number
          id?: string
          phrase?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration?: number
          id?: string
          phrase?: string
          user_id?: string
        }
        Relationships: []
      }
      overflow_entries: {
        Row: {
          created_at: string
          entry_text: string
          feeling_text: string
          id: string
          mode: string
          resistance_note: string
          resource_amount: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_text?: string
          feeling_text?: string
          id?: string
          mode?: string
          resistance_note?: string
          resource_amount?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_text?: string
          feeling_text?: string
          id?: string
          mode?: string
          resistance_note?: string
          resource_amount?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarding_challenge: string | null
          onboarding_completed: boolean
          onboarding_reason: string | null
          onboarding_style: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_challenge?: string | null
          onboarding_completed?: boolean
          onboarding_reason?: string | null
          onboarding_style?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_challenge?: string | null
          onboarding_completed?: boolean
          onboarding_reason?: string | null
          onboarding_style?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resistance_entries: {
        Row: {
          body_location: string
          charge_after: string
          charge_before: string
          clearing_mode: string
          created_at: string
          id: string
          softened_statement: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          body_location?: string
          charge_after?: string
          charge_before?: string
          clearing_mode?: string
          created_at?: string
          id?: string
          softened_statement?: string | null
          trigger_type?: string
          user_id: string
        }
        Update: {
          body_location?: string
          charge_after?: string
          charge_before?: string
          clearing_mode?: string
          created_at?: string
          id?: string
          softened_statement?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      thought_shifts: {
        Row: {
          believable_statement: string
          charge_type: string
          created_at: string
          id: string
          original_thought: string
          softer_statement: string
          support_statement: string
          user_id: string
        }
        Insert: {
          believable_statement?: string
          charge_type?: string
          created_at?: string
          id?: string
          original_thought?: string
          softer_statement?: string
          support_statement?: string
          user_id: string
        }
        Update: {
          believable_statement?: string
          charge_type?: string
          created_at?: string
          id?: string
          original_thought?: string
          softer_statement?: string
          support_statement?: string
          user_id?: string
        }
        Relationships: []
      }
      today_flow: {
        Row: {
          created_at: string
          flow_date: string
          id: string
          momentum_completed: boolean
          morning_ritual: boolean
          reflection_completed: boolean
          reset_used: boolean
          return_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flow_date?: string
          id?: string
          momentum_completed?: boolean
          morning_ritual?: boolean
          reflection_completed?: boolean
          reset_used?: boolean
          return_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flow_date?: string
          id?: string
          momentum_completed?: boolean
          morning_ritual?: boolean
          reflection_completed?: boolean
          reset_used?: boolean
          return_count?: number
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
      wheels: {
        Row: {
          center_text: string
          completion_status: string
          created_at: string
          id: string
          segments: Json
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          center_text?: string
          completion_status?: string
          created_at?: string
          id?: string
          segments?: Json
          title?: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          center_text?: string
          completion_status?: string
          created_at?: string
          id?: string
          segments?: Json
          title?: string
          type?: string
          updated_at?: string
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
