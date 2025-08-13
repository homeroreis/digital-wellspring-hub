export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          accept_terms: boolean
          age: number | null
          city: string | null
          created_at: string
          education_level: string | null
          full_name: string | null
          gender: string | null
          how_found_us: string | null
          id: string
          income_range: string | null
          marital_status: string | null
          phone: string | null
          profession: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accept_terms?: boolean
          age?: number | null
          city?: string | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          gender?: string | null
          how_found_us?: string | null
          id?: string
          income_range?: string | null
          marital_status?: string | null
          phone?: string | null
          profession?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accept_terms?: boolean
          age?: number | null
          city?: string | null
          created_at?: string
          education_level?: string | null
          full_name?: string | null
          gender?: string | null
          how_found_us?: string | null
          id?: string
          income_range?: string | null
          marital_status?: string | null
          phone?: string | null
          profession?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      questionnaire_results: {
        Row: {
          answers: Json
          comportamento_score: number
          created_at: string
          espiritual_score: number
          id: string
          relacoes_score: number
          total_score: number
          total_time_spent: number
          user_id: string
          vida_cotidiana_score: number
        }
        Insert: {
          answers: Json
          comportamento_score?: number
          created_at?: string
          espiritual_score?: number
          id?: string
          relacoes_score?: number
          total_score: number
          total_time_spent?: number
          user_id: string
          vida_cotidiana_score?: number
        }
        Update: {
          answers?: Json
          comportamento_score?: number
          created_at?: string
          espiritual_score?: number
          id?: string
          relacoes_score?: number
          total_score?: number
          total_time_spent?: number
          user_id?: string
          vida_cotidiana_score?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string
          achievement_name: string
          achievement_type: string
          created_at: string
          earned_at: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          achievement_description: string
          achievement_name: string
          achievement_type: string
          created_at?: string
          earned_at?: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          achievement_description?: string
          achievement_name?: string
          achievement_type?: string
          created_at?: string
          earned_at?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: []
      }
      user_activity_progress: {
        Row: {
          activity_index: number
          activity_title: string
          activity_type: string
          completed_at: string
          created_at: string
          day_number: number
          id: string
          points_earned: number
          track_slug: string
          user_id: string
        }
        Insert: {
          activity_index: number
          activity_title: string
          activity_type: string
          completed_at?: string
          created_at?: string
          day_number: number
          id?: string
          points_earned?: number
          track_slug: string
          user_id: string
        }
        Update: {
          activity_index?: number
          activity_title?: string
          activity_type?: string
          completed_at?: string
          created_at?: string
          day_number?: number
          id?: string
          points_earned?: number
          track_slug?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          experience_level: string | null
          focus_areas: string[] | null
          id: string
          notifications: boolean | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          reminder_time: string | null
          track_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          notifications?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          reminder_time?: string | null
          track_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          experience_level?: string | null
          focus_areas?: string[] | null
          id?: string
          notifications?: boolean | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          reminder_time?: string | null
          track_slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_track_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_day: number
          id: string
          is_active: boolean
          last_activity_at: string
          level_number: number
          started_at: string
          streak_days: number
          total_points: number
          track_slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          is_active?: boolean
          last_activity_at?: string
          level_number?: number
          started_at?: string
          streak_days?: number
          total_points?: number
          track_slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_day?: number
          id?: string
          is_active?: boolean
          last_activity_at?: string
          level_number?: number
          started_at?: string
          streak_days?: number
          total_points?: number
          track_slug?: string
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
      calculate_user_level: {
        Args: { total_points: number }
        Returns: number
      }
      check_and_award_achievements: {
        Args: { p_user_id: string; p_track_slug: string }
        Returns: undefined
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
