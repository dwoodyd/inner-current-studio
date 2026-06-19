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
      affirmation_sessions: {
        Row: {
          affirmation_text: string | null
          count: number
          created_at: string
          id: string
          source: string
          user_id: string
        }
        Insert: {
          affirmation_text?: string | null
          count?: number
          created_at?: string
          id?: string
          source?: string
          user_id: string
        }
        Update: {
          affirmation_text?: string | null
          count?: number
          created_at?: string
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
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
      current_deposits: {
        Row: {
          amount: string
          created_at: string
          ease_when_arrives: string
          feeling: string
          id: string
          represents: string
          resistance_level: string
          user_id: string
        }
        Insert: {
          amount?: string
          created_at?: string
          ease_when_arrives?: string
          feeling?: string
          id?: string
          represents?: string
          resistance_level?: string
          user_id: string
        }
        Update: {
          amount?: string
          created_at?: string
          ease_when_arrives?: string
          feeling?: string
          id?: string
          represents?: string
          resistance_level?: string
          user_id?: string
        }
        Relationships: []
      }
      current_progress: {
        Row: {
          beliefs_landed_alive: string[]
          beliefs_landed_true: string[]
          created_at: string
          current_streak: number
          first_visited_at: string | null
          id: string
          last_practice_date: string | null
          last_visited_at: string | null
          longest_streak: number
          practices_completed: number
          sequences_completed: string[]
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          beliefs_landed_alive?: string[]
          beliefs_landed_true?: string[]
          created_at?: string
          current_streak?: number
          first_visited_at?: string | null
          id?: string
          last_practice_date?: string | null
          last_visited_at?: string | null
          longest_streak?: number
          practices_completed?: number
          sequences_completed?: string[]
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          beliefs_landed_alive?: string[]
          beliefs_landed_true?: string[]
          created_at?: string
          current_streak?: number
          first_visited_at?: string | null
          id?: string
          last_practice_date?: string | null
          last_visited_at?: string | null
          longest_streak?: number
          practices_completed?: number
          sequences_completed?: string[]
          slug?: string
          updated_at?: string
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
      daily_usage: {
        Row: {
          count: number
          created_at: string
          id: string
          tool: string
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          tool: string
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          tool?: string
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_evidence: {
        Row: {
          category: string
          created_at: string
          domain: string
          entry_text: string
          id: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          domain: string
          entry_text?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          domain?: string
          entry_text?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      domain_openings: {
        Row: {
          created_at: string
          current_resistance: string
          desire: string
          desired_feeling: string
          domain: string
          id: string
          next_aligned_step: string
          position: number
          updated_at: string
          user_id: string
          why_it_matters: string
        }
        Insert: {
          created_at?: string
          current_resistance?: string
          desire?: string
          desired_feeling?: string
          domain: string
          id?: string
          next_aligned_step?: string
          position?: number
          updated_at?: string
          user_id: string
          why_it_matters?: string
        }
        Update: {
          created_at?: string
          current_resistance?: string
          desire?: string
          desired_feeling?: string
          domain?: string
          id?: string
          next_aligned_step?: string
          position?: number
          updated_at?: string
          user_id?: string
          why_it_matters?: string
        }
        Relationships: []
      }
      domain_resistance: {
        Row: {
          body_sensation: string
          charge_after: string
          charge_before: string
          created_at: string
          domain: string
          id: string
          resistance_type: string
          softened_thought: string | null
          user_id: string
        }
        Insert: {
          body_sensation?: string
          charge_after?: string
          charge_before?: string
          created_at?: string
          domain: string
          id?: string
          resistance_type?: string
          softened_thought?: string | null
          user_id: string
        }
        Update: {
          body_sensation?: string
          charge_after?: string
          charge_before?: string
          created_at?: string
          domain?: string
          id?: string
          resistance_type?: string
          softened_thought?: string | null
          user_id?: string
        }
        Relationships: []
      }
      domain_states: {
        Row: {
          created_at: string
          domain: string
          id: string
          note: string | null
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          note?: string | null
          state: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          note?: string | null
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      evidence_of_support: {
        Row: {
          category: string
          created_at: string
          entry_text: string
          id: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          entry_text?: string
          id?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          entry_text?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      founder_lifetime_slots: {
        Row: {
          claimed_at: string
          environment: string
          id: string
          paddle_subscription_id: string | null
          user_id: string
        }
        Insert: {
          claimed_at?: string
          environment?: string
          id?: string
          paddle_subscription_id?: string | null
          user_id: string
        }
        Update: {
          claimed_at?: string
          environment?: string
          id?: string
          paddle_subscription_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      founding_member_applications: {
        Row: {
          created_at: string
          current_focus: string | null
          email: string
          id: string
          name: string
          notes: string | null
          practice_context: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
          why: string
        }
        Insert: {
          created_at?: string
          current_focus?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          practice_context?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          why: string
        }
        Update: {
          created_at?: string
          current_focus?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          practice_context?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          why?: string
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
          domain: string
          id: string
          lines: Json
          playback_settings: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain?: string
          id?: string
          lines?: Json
          playback_settings?: Json
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
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
      invite_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          expires_at: string | null
          id: string
          label: string | null
          max_uses: number | null
          updated_at: string
          uses: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          label?: string | null
          max_uses?: number | null
          updated_at?: string
          uses?: number
        }
        Relationships: []
      }
      invite_redemptions: {
        Row: {
          id: string
          invite_code_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invite_code_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invite_code_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_redemptions_invite_code_id_fkey"
            columns: ["invite_code_id"]
            isOneToOne: false
            referencedRelation: "invite_codes"
            referencedColumns: ["id"]
          },
        ]
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
      money_openings: {
        Row: {
          created_at: string
          current_resistance: string
          desire: string
          desired_feeling: string
          id: string
          next_aligned_step: string
          position: number
          updated_at: string
          user_id: string
          why_it_matters: string
        }
        Insert: {
          created_at?: string
          current_resistance?: string
          desire?: string
          desired_feeling?: string
          id?: string
          next_aligned_step?: string
          position?: number
          updated_at?: string
          user_id: string
          why_it_matters?: string
        }
        Update: {
          created_at?: string
          current_resistance?: string
          desire?: string
          desired_feeling?: string
          id?: string
          next_aligned_step?: string
          position?: number
          updated_at?: string
          user_id?: string
          why_it_matters?: string
        }
        Relationships: []
      }
      money_resistance: {
        Row: {
          body_sensation: string
          charge_after: string
          charge_before: string
          created_at: string
          id: string
          resistance_type: string
          softened_thought: string | null
          user_id: string
        }
        Insert: {
          body_sensation?: string
          charge_after?: string
          charge_before?: string
          created_at?: string
          id?: string
          resistance_type?: string
          softened_thought?: string | null
          user_id: string
        }
        Update: {
          body_sensation?: string
          charge_after?: string
          charge_before?: string
          created_at?: string
          id?: string
          resistance_type?: string
          softened_thought?: string | null
          user_id?: string
        }
        Relationships: []
      }
      money_states: {
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
      overflow_spending: {
        Row: {
          created_at: string
          daily_amount: string
          how_it_feels: string
          id: string
          resistance_note: string
          user_id: string
          what_chosen: string
          why_it_matters: string
        }
        Insert: {
          created_at?: string
          daily_amount?: string
          how_it_feels?: string
          id?: string
          resistance_note?: string
          user_id: string
          what_chosen?: string
          why_it_matters?: string
        }
        Update: {
          created_at?: string
          daily_amount?: string
          how_it_feels?: string
          id?: string
          resistance_note?: string
          user_id?: string
          what_chosen?: string
          why_it_matters?: string
        }
        Relationships: []
      }
      payment_shifts: {
        Row: {
          circulation_feeling: string
          created_at: string
          from_steadiness: string
          id: string
          payment_name: string
          user_id: string
          what_it_provided: string
          what_it_supports: string
        }
        Insert: {
          circulation_feeling?: string
          created_at?: string
          from_steadiness?: string
          id?: string
          payment_name?: string
          user_id: string
          what_it_provided?: string
          what_it_supports?: string
        }
        Update: {
          circulation_feeling?: string
          created_at?: string
          from_steadiness?: string
          id?: string
          payment_name?: string
          user_id?: string
          what_it_provided?: string
          what_it_supports?: string
        }
        Relationships: []
      }
      practices: {
        Row: {
          created_at: string
          current_slug: string
          id: string
          practice_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_slug: string
          id?: string
          practice_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_slug?: string
          id?: string
          practice_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          companion_feeling: string | null
          companion_name: string | null
          companion_sigil: string | null
          created_at: string
          display_name: string | null
          founder_window_ends_at: string | null
          free_current: string | null
          id: string
          is_founding_member: boolean
          onboarding_challenge: string | null
          onboarding_completed: boolean
          onboarding_reason: string | null
          onboarding_style: string | null
          onboarding_version: number
          subscription_tier: string
          trial_ends_at: string | null
          trial_started_at: string | null
          trial_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          companion_feeling?: string | null
          companion_name?: string | null
          companion_sigil?: string | null
          created_at?: string
          display_name?: string | null
          founder_window_ends_at?: string | null
          free_current?: string | null
          id?: string
          is_founding_member?: boolean
          onboarding_challenge?: string | null
          onboarding_completed?: boolean
          onboarding_reason?: string | null
          onboarding_style?: string | null
          onboarding_version?: number
          subscription_tier?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          companion_feeling?: string | null
          companion_name?: string | null
          companion_sigil?: string | null
          created_at?: string
          display_name?: string | null
          founder_window_ends_at?: string | null
          free_current?: string | null
          id?: string
          is_founding_member?: boolean
          onboarding_challenge?: string | null
          onboarding_completed?: boolean
          onboarding_reason?: string | null
          onboarding_style?: string | null
          onboarding_version?: number
          subscription_tier?: string
          trial_ends_at?: string | null
          trial_started_at?: string | null
          trial_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          active: boolean
          affirmation_interval_minutes: number
          auth_key: string
          created_at: string
          endpoint: string
          evening_reflection: boolean
          evening_time: string
          gentle_returns: boolean
          id: string
          morning_reminder: boolean
          morning_time: string
          p256dh: string
          return_interval_hours: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          affirmation_interval_minutes?: number
          auth_key: string
          created_at?: string
          endpoint: string
          evening_reflection?: boolean
          evening_time?: string
          gentle_returns?: boolean
          id?: string
          morning_reminder?: boolean
          morning_time?: string
          p256dh: string
          return_interval_hours?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          affirmation_interval_minutes?: number
          auth_key?: string
          created_at?: string
          endpoint?: string
          evening_reflection?: boolean
          evening_time?: string
          gentle_returns?: boolean
          id?: string
          morning_reminder?: boolean
          morning_time?: string
          p256dh?: string
          return_interval_hours?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reality_evidence: {
        Row: {
          created_at: string
          domain: string
          entry_text: string
          felt_like_match: boolean
          id: string
          match_strength: number
          script_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          entry_text?: string
          felt_like_match?: boolean
          id?: string
          match_strength?: number
          script_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          entry_text?: string
          felt_like_match?: boolean
          id?: string
          match_strength?: number
          script_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reality_evidence_script_id_fkey"
            columns: ["script_id"]
            isOneToOne: false
            referencedRelation: "reality_scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      reality_progress: {
        Row: {
          constellation_progress: number
          created_at: string
          current_streak: number
          domain: string
          evidence_count: number
          id: string
          last_scripted_at: string | null
          longest_streak: number
          script_count: number
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          constellation_progress?: number
          created_at?: string
          current_streak?: number
          domain: string
          evidence_count?: number
          id?: string
          last_scripted_at?: string | null
          longest_streak?: number
          script_count?: number
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          constellation_progress?: number
          created_at?: string
          current_streak?: number
          domain?: string
          evidence_count?: number
          id?: string
          last_scripted_at?: string | null
          longest_streak?: number
          script_count?: number
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reality_scripts: {
        Row: {
          content: string
          created_at: string
          domain: string
          feeling_word: string
          id: string
          mode: string
          prompt: string
          revisit_at: string | null
          sensory_details: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          domain: string
          feeling_word?: string
          id?: string
          mode?: string
          prompt?: string
          revisit_at?: string | null
          sensory_details?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          domain?: string
          feeling_word?: string
          id?: string
          mode?: string
          prompt?: string
          revisit_at?: string | null
          sensory_details?: Json
          status?: string
          title?: string
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
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id: string
          paddle_subscription_id: string
          price_id: string
          product_id: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          paddle_customer_id?: string
          paddle_subscription_id?: string
          price_id?: string
          product_id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      founder_slots_remaining: { Args: never; Returns: number }
      grant_beta_trial: { Args: { user_uuid: string }; Returns: undefined }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_active_trial: { Args: { user_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_daily_usage: { Args: { _tool: string }; Returns: number }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      redeem_invite_code: { Args: { _code: string }; Returns: boolean }
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
