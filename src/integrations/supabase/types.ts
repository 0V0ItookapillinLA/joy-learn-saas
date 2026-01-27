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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_characters: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          personality: string | null
          system_prompt: string | null
          updated_at: string | null
          voice_style: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          personality?: string | null
          system_prompt?: string | null
          updated_at?: string | null
          voice_style?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          personality?: string | null
          system_prompt?: string | null
          updated_at?: string | null
          voice_style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_characters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          max_storage_mb: number | null
          max_trainees: number | null
          name: string
          plan_type: string | null
          primary_color: string | null
          status: Database["public"]["Enums"]["org_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_storage_mb?: number | null
          max_trainees?: number | null
          name: string
          plan_type?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["org_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          max_storage_mb?: number | null
          max_trainees?: number | null
          name?: string
          plan_type?: string | null
          primary_color?: string | null
          status?: Database["public"]["Enums"]["org_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      practice_sessions: {
        Row: {
          ai_role: string | null
          chapter_id: string | null
          created_at: string | null
          description: string | null
          id: string
          max_attempts: number | null
          organization_id: string
          practice_mode: string | null
          scenario_description: string | null
          scoring_criteria: Json | null
          time_limit_minutes: number | null
          title: string
          trainee_role: string | null
          updated_at: string | null
        }
        Insert: {
          ai_role?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          organization_id: string
          practice_mode?: string | null
          scenario_description?: string | null
          scoring_criteria?: Json | null
          time_limit_minutes?: number | null
          title: string
          trainee_role?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_role?: string | null
          chapter_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          max_attempts?: number | null
          organization_id?: string
          practice_mode?: string | null
          scenario_description?: string | null
          scoring_criteria?: Json | null
          time_limit_minutes?: number | null
          title?: string
          trainee_role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "training_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department_id: string | null
          full_name: string | null
          id: string
          job_title: string | null
          organization_id: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department_id?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_models: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          job_title: string | null
          name: string
          organization_id: string
          skills: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          job_title?: string | null
          name: string
          organization_id: string
          skills?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          job_title?: string | null
          name?: string
          organization_id?: string
          skills?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trainee_skills: {
        Row: {
          created_at: string | null
          current_score: number | null
          id: string
          last_updated: string | null
          skill_model_id: string
          skill_name: string
          target_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_score?: number | null
          id?: string
          last_updated?: string | null
          skill_model_id: string
          skill_name: string
          target_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_score?: number | null
          id?: string
          last_updated?: string | null
          skill_model_id?: string
          skill_name?: string
          target_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainee_skills_skill_model_id_fkey"
            columns: ["skill_model_id"]
            isOneToOne: false
            referencedRelation: "skill_models"
            referencedColumns: ["id"]
          },
        ]
      }
      training_chapters: {
        Row: {
          chapter_type: string | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          sort_order: number | null
          title: string
          training_plan_id: string
          updated_at: string | null
        }
        Insert: {
          chapter_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number | null
          title: string
          training_plan_id: string
          updated_at?: string | null
        }
        Update: {
          chapter_type?: string | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          sort_order?: number | null
          title?: string
          training_plan_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_chapters_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_departments: {
        Row: {
          created_at: string | null
          department_id: string
          id: string
          training_plan_id: string
        }
        Insert: {
          created_at?: string | null
          department_id: string
          id?: string
          training_plan_id: string
        }
        Update: {
          created_at?: string | null
          department_id?: string
          id?: string
          training_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_departments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_plan_departments_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plans: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          objectives: string | null
          organization_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          objectives?: string | null
          organization_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          objectives?: string | null
          organization_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          chapter_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          progress_percentage: number | null
          score: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["trainee_progress_status"] | null
          training_plan_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trainee_progress_status"] | null
          training_plan_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          progress_percentage?: number | null
          score?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["trainee_progress_status"] | null
          training_plan_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "training_chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_progress_training_plan_id_fkey"
            columns: ["training_plan_id"]
            isOneToOne: false
            referencedRelation: "training_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_user_with_organization: {
        Args: { _full_name?: string; _org_name?: string; _user_id: string }
        Returns: string
      }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "org_admin" | "manager" | "trainee"
      org_status: "active" | "inactive" | "suspended"
      trainee_progress_status: "not_started" | "in_progress" | "completed"
      training_status:
        | "draft"
        | "pending"
        | "in_progress"
        | "completed"
        | "archived"
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
      app_role: ["super_admin", "org_admin", "manager", "trainee"],
      org_status: ["active", "inactive", "suspended"],
      trainee_progress_status: ["not_started", "in_progress", "completed"],
      training_status: [
        "draft",
        "pending",
        "in_progress",
        "completed",
        "archived",
      ],
    },
  },
} as const
