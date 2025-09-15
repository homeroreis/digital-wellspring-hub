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
      activity_progress: {
        Row: {
          activity_id: string
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          day_number: number
          feedback_rating: number | null
          id: string
          notes: string | null
          points_earned: number | null
          started_at: string | null
          status: string | null
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          activity_id: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          day_number: number
          feedback_rating?: number | null
          id?: string
          notes?: string | null
          points_earned?: number | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          day_number?: number
          feedback_rating?: number | null
          id?: string
          notes?: string | null
          points_earned?: number | null
          started_at?: string | null
          status?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      admin_activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          created_by: string | null
          display_name: string | null
          email: string
          id: string
          is_active: boolean | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      content_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      content_media: {
        Row: {
          alt_text: string | null
          caption: string | null
          content_id: string
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          mime_type: string | null
          sort_order: number | null
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          content_id: string
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          mime_type?: string | null
          sort_order?: number | null
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          content_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          mime_type?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_media_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
      }
      content_personalization_rules: {
        Row: {
          condition_data: Json
          created_at: string
          day_number: number
          id: string
          personalized_content: Json
          rule_type: string
          track_slug: string
          updated_at: string
        }
        Insert: {
          condition_data: Json
          created_at?: string
          day_number: number
          id?: string
          personalized_content: Json
          rule_type: string
          track_slug: string
          updated_at?: string
        }
        Update: {
          condition_data?: Json
          created_at?: string
          day_number?: number
          id?: string
          personalized_content?: Json
          rule_type?: string
          track_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_tag_relations: {
        Row: {
          content_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_tag_relations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "content_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      content_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      contents: {
        Row: {
          audio_url: string | null
          author_id: string
          body: string | null
          category_id: string | null
          completion_count: number | null
          content_type: string
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          excerpt: string | null
          external_url: string | null
          featured_image_url: string | null
          id: string
          is_featured: boolean | null
          is_interactive: boolean | null
          is_premium: boolean | null
          like_count: number | null
          published_at: string | null
          reading_time_minutes: number | null
          scheduled_at: string | null
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          track_types: string[] | null
          updated_at: string
          video_url: string | null
          view_count: number | null
          youtube_url: string | null
        }
        Insert: {
          audio_url?: string | null
          author_id: string
          body?: string | null
          category_id?: string | null
          completion_count?: number | null
          content_type: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          excerpt?: string | null
          external_url?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_interactive?: boolean | null
          is_premium?: boolean | null
          like_count?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          track_types?: string[] | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
          youtube_url?: string | null
        }
        Update: {
          audio_url?: string | null
          author_id?: string
          body?: string | null
          category_id?: string | null
          completion_count?: number | null
          content_type?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          excerpt?: string | null
          external_url?: string | null
          featured_image_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_interactive?: boolean | null
          is_premium?: boolean | null
          like_count?: number | null
          published_at?: string | null
          reading_time_minutes?: number | null
          scheduled_at?: string | null
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          track_types?: string[] | null
          updated_at?: string
          video_url?: string | null
          view_count?: number | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contents_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_track_days: {
        Row: {
          activities_completed: number | null
          completed_at: string | null
          content: Json
          created_at: string | null
          day_number: number
          id: string
          is_completed: boolean | null
          points_earned: number | null
          time_spent: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activities_completed?: number | null
          completed_at?: string | null
          content: Json
          created_at?: string | null
          day_number: number
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activities_completed?: number | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          day_number?: number
          id?: string
          is_completed?: boolean | null
          points_earned?: number | null
          time_spent?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accept_terms: boolean
          birth_date: string | null
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
          role: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accept_terms?: boolean
          birth_date?: string | null
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
          role?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accept_terms?: boolean
          birth_date?: string | null
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
          role?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_materials: {
        Row: {
          author: string
          category: string
          content: string | null
          created_at: string | null
          description: string
          duration: number | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          likes_count: number | null
          media_url: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author: string
          category: string
          content?: string | null
          created_at?: string | null
          description: string
          duration?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          likes_count?: number | null
          media_url?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: []
      }
      questionnaire_results: {
        Row: {
          age: number | null
          answers: Json
          birth_date: string | null
          city: string | null
          completed_at: string | null
          comportamento_score: number
          created_at: string
          email: string | null
          espiritual_score: number
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          profession: string | null
          relacoes_score: number
          saved_to_profile: boolean | null
          state: string | null
          total_score: number
          total_time_spent: number
          track_type: string
          user_id: string
          vida_cotidiana_score: number
        }
        Insert: {
          age?: number | null
          answers: Json
          birth_date?: string | null
          city?: string | null
          completed_at?: string | null
          comportamento_score?: number
          created_at?: string
          email?: string | null
          espiritual_score?: number
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          profession?: string | null
          relacoes_score?: number
          saved_to_profile?: boolean | null
          state?: string | null
          total_score: number
          total_time_spent?: number
          track_type?: string
          user_id: string
          vida_cotidiana_score?: number
        }
        Update: {
          age?: number | null
          answers?: Json
          birth_date?: string | null
          city?: string | null
          completed_at?: string | null
          comportamento_score?: number
          created_at?: string
          email?: string | null
          espiritual_score?: number
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          profession?: string | null
          relacoes_score?: number
          saved_to_profile?: boolean | null
          state?: string | null
          total_score?: number
          total_time_spent?: number
          track_type?: string
          user_id?: string
          vida_cotidiana_score?: number
        }
        Relationships: []
      }
      quick_test_results: {
        Row: {
          accept_contact: boolean
          age: number | null
          answers: Json
          birth_date: string | null
          city: string | null
          completed_at: string
          created_at: string
          full_name: string
          id: string
          missionary_id: string | null
          recommended_track: string
          state: string | null
          total_score: number
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          accept_contact?: boolean
          age?: number | null
          answers: Json
          birth_date?: string | null
          city?: string | null
          completed_at?: string
          created_at?: string
          full_name: string
          id?: string
          missionary_id?: string | null
          recommended_track: string
          state?: string | null
          total_score: number
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          accept_contact?: boolean
          age?: number | null
          answers?: Json
          birth_date?: string | null
          city?: string | null
          completed_at?: string
          created_at?: string
          full_name?: string
          id?: string
          missionary_id?: string | null
          recommended_track?: string
          state?: string | null
          total_score?: number
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      track_content: {
        Row: {
          activities: Json
          base_difficulty: number | null
          base_duration: number | null
          created_at: string | null
          day_number: number
          description: string | null
          id: string
          subtitle: string | null
          tags: string[] | null
          title: string
          track_type: string
          updated_at: string | null
        }
        Insert: {
          activities?: Json
          base_difficulty?: number | null
          base_duration?: number | null
          created_at?: string | null
          day_number: number
          description?: string | null
          id?: string
          subtitle?: string | null
          tags?: string[] | null
          title: string
          track_type: string
          updated_at?: string | null
        }
        Update: {
          activities?: Json
          base_difficulty?: number | null
          base_duration?: number | null
          created_at?: string | null
          day_number?: number
          description?: string | null
          id?: string
          subtitle?: string | null
          tags?: string[] | null
          title?: string
          track_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      track_contents: {
        Row: {
          area: string
          audio_url: string | null
          challenge_content: string | null
          challenge_title: string | null
          created_at: string | null
          day_number: number
          difficulty_level: number | null
          extra_content: string | null
          extra_title: string | null
          id: number
          is_published: boolean | null
          main_content: string | null
          main_title: string | null
          max_points: number | null
          pdf_url: string | null
          prayer: string | null
          published_at: string | null
          reflection: string | null
          resources: Json | null
          track_slug: string
          updated_at: string | null
          verse: string | null
          video_url: string | null
        }
        Insert: {
          area: string
          audio_url?: string | null
          challenge_content?: string | null
          challenge_title?: string | null
          created_at?: string | null
          day_number: number
          difficulty_level?: number | null
          extra_content?: string | null
          extra_title?: string | null
          id?: number
          is_published?: boolean | null
          main_content?: string | null
          main_title?: string | null
          max_points?: number | null
          pdf_url?: string | null
          prayer?: string | null
          published_at?: string | null
          reflection?: string | null
          resources?: Json | null
          track_slug: string
          updated_at?: string | null
          verse?: string | null
          video_url?: string | null
        }
        Update: {
          area?: string
          audio_url?: string | null
          challenge_content?: string | null
          challenge_title?: string | null
          created_at?: string | null
          day_number?: number
          difficulty_level?: number | null
          extra_content?: string | null
          extra_title?: string | null
          id?: number
          is_published?: boolean | null
          main_content?: string | null
          main_title?: string | null
          max_points?: number | null
          pdf_url?: string | null
          prayer?: string | null
          published_at?: string | null
          reflection?: string | null
          resources?: Json | null
          track_slug?: string
          updated_at?: string | null
          verse?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_contents_track_slug_fkey"
            columns: ["track_slug"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["slug"]
          },
        ]
      }
      track_daily_activities: {
        Row: {
          activity_description: string
          activity_title: string
          created_at: string
          daily_content_id: string
          id: string
          is_required: boolean
          points_value: number
          sort_order: number
        }
        Insert: {
          activity_description: string
          activity_title: string
          created_at?: string
          daily_content_id: string
          id?: string
          is_required?: boolean
          points_value?: number
          sort_order?: number
        }
        Update: {
          activity_description?: string
          activity_title?: string
          created_at?: string
          daily_content_id?: string
          id?: string
          is_required?: boolean
          points_value?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "track_daily_activities_daily_content_id_fkey"
            columns: ["daily_content_id"]
            isOneToOne: false
            referencedRelation: "track_daily_content"
            referencedColumns: ["id"]
          },
        ]
      }
      track_daily_content: {
        Row: {
          bonus_activity_content: string | null
          bonus_activity_title: string | null
          created_at: string
          day_number: number
          devotional_prayer: string
          devotional_reflection: string
          devotional_verse: string
          difficulty_level: number
          id: string
          main_activity_content: string
          main_activity_title: string
          main_challenge_content: string
          main_challenge_title: string
          max_points: number
          objective: string
          title: string
          track_slug: string
          updated_at: string
        }
        Insert: {
          bonus_activity_content?: string | null
          bonus_activity_title?: string | null
          created_at?: string
          day_number: number
          devotional_prayer: string
          devotional_reflection: string
          devotional_verse: string
          difficulty_level?: number
          id?: string
          main_activity_content: string
          main_activity_title: string
          main_challenge_content: string
          main_challenge_title: string
          max_points?: number
          objective: string
          title: string
          track_slug: string
          updated_at?: string
        }
        Update: {
          bonus_activity_content?: string | null
          bonus_activity_title?: string | null
          created_at?: string
          day_number?: number
          devotional_prayer?: string
          devotional_reflection?: string
          devotional_verse?: string
          difficulty_level?: number
          id?: string
          main_activity_content?: string
          main_activity_title?: string
          main_challenge_content?: string
          main_challenge_title?: string
          max_points?: number
          objective?: string
          title?: string
          track_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      tracks: {
        Row: {
          created_at: string | null
          days_count: number
          description: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_count: number
          description?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_count?: number
          description?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
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
      user_content_interactions: {
        Row: {
          content_id: string
          created_at: string
          id: string
          interaction_type: string
          interaction_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          interaction_type: string
          interaction_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          interaction_type?: string
          interaction_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_interactions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
        ]
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
      user_profiles: {
        Row: {
          created_at: string | null
          demographics: Json | null
          id: string
          preferences: Json | null
          progress_data: Json | null
          test_results: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          demographics?: Json | null
          id?: string
          preferences?: Json | null
          progress_data?: Json | null
          test_results?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          demographics?: Json | null
          id?: string
          preferences?: Json | null
          progress_data?: Json | null
          test_results?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_test_results: {
        Row: {
          comportamento_score: number | null
          created_at: string | null
          espiritual_score: number | null
          id: string
          recommended_track: string | null
          relacoes_score: number | null
          total_score: number
          user_id: string
          vida_cotidiana_score: number | null
        }
        Insert: {
          comportamento_score?: number | null
          created_at?: string | null
          espiritual_score?: number | null
          id?: string
          recommended_track?: string | null
          relacoes_score?: number | null
          total_score: number
          user_id: string
          vida_cotidiana_score?: number | null
        }
        Update: {
          comportamento_score?: number | null
          created_at?: string | null
          espiritual_score?: number | null
          id?: string
          recommended_track?: string | null
          relacoes_score?: number | null
          total_score?: number
          user_id?: string
          vida_cotidiana_score?: number | null
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
      user_progress_dashboard: {
        Row: {
          achievements_unlocked: number | null
          created_at: string | null
          current_day: string | null
          current_level: number | null
          current_streak: number | null
          days_completed: number | null
          total_points: number | null
          total_score: number | null
          track_type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_admin_user: {
        Args: {
          user_display_name?: string
          user_email: string
          user_role?: string
        }
        Returns: Json
      }
      admin_add_user: {
        Args: {
          user_display_name?: string
          user_email: string
          user_role?: string
        }
        Returns: string
      }
      admin_list_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean
          role: string
        }[]
      }
      admin_remove_user: {
        Args: { user_email: string }
        Returns: string
      }
      admin_system_overview: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: string
          info_type: string
        }[]
      }
      calculate_age_from_birth_date: {
        Args: { birth_date: string }
        Returns: number
      }
      calculate_recommended_track: {
        Args: { total_score: number }
        Returns: string
      }
      calculate_user_gamification_stats: {
        Args: { user_uuid: string }
        Returns: {
          activities_completed: number
          current_level: number
          days_streak: number
          points_to_next_level: number
          total_points: number
          tracks_completed: number
        }[]
      }
      calculate_user_level: {
        Args: { total_points: number }
        Returns: number
      }
      check_admin_system_status: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      check_and_award_achievements: {
        Args: { p_track_slug: string; p_user_id: string }
        Returns: undefined
      }
      complete_activity: {
        Args: {
          p_activity_index: number
          p_activity_title: string
          p_activity_type?: string
          p_day_number: number
          p_track_slug: string
        }
        Returns: Json
      }
      complete_day: {
        Args: { p_day_number: number; p_track_slug: string }
        Returns: Json
      }
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_slug: {
        Args: { title: string }
        Returns: string
      }
      get_published_track_content: {
        Args: { p_area: string; p_day_number: number; p_track_slug: string }
        Returns: Json
      }
      get_track_content: {
        Args: { p_area: string; p_day_number: number; p_track_slug: string }
        Returns: Json
      }
      get_track_day: {
        Args: { p_day_number: number; p_track_slug: string }
        Returns: Json
      }
      get_user_display_data: {
        Args: { user_uuid: string }
        Returns: {
          birth_date: string
          city: string
          email: string
          full_name: string
          gender: string
          has_profile: boolean
          phone: string
          profession: string
          state: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_week_days: {
        Args: { p_start_day?: number; p_track_slug: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_personalized_track: {
        Args: { p_track_type: string; p_user_id: string }
        Returns: undefined
      }
      list_admin_users: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      list_admin_users_temp: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      log_admin_activity: {
        Args: {
          _action: string
          _details?: Json
          _resource_id?: string
          _resource_type?: string
        }
        Returns: undefined
      }
      make_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      update_content_metrics: {
        Args: { p_content_id: string; p_metric_type: string }
        Returns: undefined
      }
      upsert_track_content: {
        Args: {
          p_area: string
          p_audio_url?: string
          p_challenge_content?: string
          p_challenge_title?: string
          p_day_number: number
          p_difficulty_level?: number
          p_extra_content?: string
          p_extra_title?: string
          p_is_published?: boolean
          p_main_content?: string
          p_main_title?: string
          p_max_points?: number
          p_pdf_url?: string
          p_prayer?: string
          p_reflection?: string
          p_resources?: Json
          p_track_slug: string
          p_verse?: string
          p_video_url?: string
        }
        Returns: number
      }
      upsert_track_contents: {
        Args: { json_records: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
