// Auto-generated Types for Comprehensive Schema
// Update this by running: npx supabase gen types typescript --local > types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          student_id: string | null
          department: string | null
          semester: number | null
          role: Database["public"]["Enums"]["app_role"]
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          student_id?: string | null
          department?: string | null
          semester?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          student_id?: string | null
          department?: string | null
          semester?: number | null
          role?: Database["public"]["Enums"]["app_role"]
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          assigned_at: string | null
          assigned_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
          assigned_at?: string | null
          assigned_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          assigned_at?: string | null
          assigned_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      student_performance: {
        Row: {
          id: string
          student_id: string
          attendance: number | null
          avg_assignment: number | null
          avg_quiz: number | null
          class_interaction: number | null
          stress_index: number | null
          social_media_hours: number | null
          travel_time: number | null
          calculated_score: number | null
          risk_level: Database["public"]["Enums"]["risk_level"] | null
          prediction: string | null
          last_updated: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          attendance?: number | null
          avg_assignment?: number | null
          avg_quiz?: number | null
          class_interaction?: number | null
          stress_index?: number | null
          social_media_hours?: number | null
          travel_time?: number | null
          calculated_score?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          prediction?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          attendance?: number | null
          avg_assignment?: number | null
          avg_quiz?: number | null
          class_interaction?: number | null
          stress_index?: number | null
          social_media_hours?: number | null
          travel_time?: number | null
          calculated_score?: number | null
          risk_level?: Database["public"]["Enums"]["risk_level"] | null
          prediction?: string | null
          last_updated?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      attendance_records: {
        Row: {
          id: string
          student_id: string
          attendance_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          subject: string | null
          class_duration: number | null
          marked_by: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          attendance_date: string
          status: Database["public"]["Enums"]["attendance_status"]
          subject?: string | null
          class_duration?: number | null
          marked_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          attendance_date?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          subject?: string | null
          class_duration?: number | null
          marked_by?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      assignment_submissions: {
        Row: {
          id: string
          student_id: string
          assignment_id: string
          assignment_name: string
          subject: string
          assignment_date: string
          due_date: string
          submission_date: string | null
          score: number | null
          total_points: number | null
          percentage: number | null
          submitted: boolean
          late: boolean
          feedback: string | null
          graded_by: string | null
          graded_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          assignment_id: string
          assignment_name: string
          subject: string
          assignment_date: string
          due_date: string
          submission_date?: string | null
          score?: number | null
          total_points?: number | null
          percentage?: number | null
          submitted?: boolean
          late?: boolean
          feedback?: string | null
          graded_by?: string | null
          graded_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          assignment_id?: string
          assignment_name?: string
          subject?: string
          assignment_date?: string
          due_date?: string
          submission_date?: string | null
          score?: number | null
          total_points?: number | null
          percentage?: number | null
          submitted?: boolean
          late?: boolean
          feedback?: string | null
          graded_by?: string | null
          graded_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      quiz_results: {
        Row: {
          id: string
          student_id: string
          quiz_id: string
          quiz_name: string
          subject: string
          quiz_date: string
          score: number
          total_points: number
          percentage: number | null
          total_questions: number | null
          correct_answers: number | null
          incorrect_answers: number | null
          time_spent: number | null
          difficulty_level: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          quiz_id: string
          quiz_name: string
          subject: string
          quiz_date: string
          score: number
          total_points: number
          percentage?: number | null
          total_questions?: number | null
          correct_answers?: number | null
          incorrect_answers?: number | null
          time_spent?: number | null
          difficulty_level?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          quiz_id?: string
          quiz_name?: string
          subject?: string
          quiz_date?: string
          score?: number
          total_points?: number
          percentage?: number | null
          total_questions?: number | null
          correct_answers?: number | null
          incorrect_answers?: number | null
          time_spent?: number | null
          difficulty_level?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      stress_indicators: {
        Row: {
          id: string
          student_id: string
          stress_score: number
          sleep_hours: number | null
          exercise_frequency: number | null
          social_engagement: number | null
          academic_pressure: number | null
          personal_issues: number | null
          motivation_level: number | null
          focus_level: number | null
          assessment_date: string
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          stress_score: number
          sleep_hours?: number | null
          exercise_frequency?: number | null
          social_engagement?: number | null
          academic_pressure?: number | null
          personal_issues?: number | null
          motivation_level?: number | null
          focus_level?: number | null
          assessment_date: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          stress_score?: number
          sleep_hours?: number | null
          exercise_frequency?: number | null
          social_engagement?: number | null
          academic_pressure?: number | null
          personal_issues?: number | null
          motivation_level?: number | null
          focus_level?: number | null
          assessment_date?: string
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stress_indicators_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      social_media_engagement: {
        Row: {
          id: string
          student_id: string
          tracking_date: string
          hours_spent: number | null
          sessions_count: number | null
          platforms: string[] | null
          primary_platform: string | null
          impact_on_studies: number | null
          engagement_score: number | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          tracking_date: string
          hours_spent?: number | null
          sessions_count?: number | null
          platforms?: string[] | null
          primary_platform?: string | null
          impact_on_studies?: number | null
          engagement_score?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          tracking_date?: string
          hours_spent?: number | null
          sessions_count?: number | null
          platforms?: string[] | null
          primary_platform?: string | null
          impact_on_studies?: number | null
          engagement_score?: number | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_media_engagement_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      risk_assessments: {
        Row: {
          id: string
          student_id: string
          assessment_date: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score: number | null
          attendance_factor: number | null
          academic_performance_factor: number | null
          stress_factor: number | null
          behavioral_factor: number | null
          recommended_action: string | null
          severity: string | null
          intervention_plan: string | null
          follow_up_date: string | null
          assessed_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          assessment_date: string
          risk_level: Database["public"]["Enums"]["risk_level"]
          risk_score?: number | null
          attendance_factor?: number | null
          academic_performance_factor?: number | null
          stress_factor?: number | null
          behavioral_factor?: number | null
          recommended_action?: string | null
          severity?: string | null
          intervention_plan?: string | null
          follow_up_date?: string | null
          assessed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          assessment_date?: string
          risk_level?: Database["public"]["Enums"]["risk_level"]
          risk_score?: number | null
          attendance_factor?: number | null
          academic_performance_factor?: number | null
          stress_factor?: number | null
          behavioral_factor?: number | null
          recommended_action?: string | null
          severity?: string | null
          intervention_plan?: string | null
          follow_up_date?: string | null
          assessed_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      faculty_notes: {
        Row: {
          id: string
          student_id: string
          faculty_id: string
          note: string
          note_type: string | null
          subject: string | null
          is_confidential: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          faculty_id: string
          note: string
          note_type?: string | null
          subject?: string | null
          is_confidential?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          faculty_id?: string
          note?: string
          note_type?: string | null
          subject?: string | null
          is_confidential?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_notes_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      communications: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string | null
          message: string
          message_type: string | null
          is_read: boolean
          read_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject?: string | null
          message: string
          message_type?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string | null
          message?: string
          message_type?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: { user_id: string; required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      calculate_risk_level: {
        Args: {
          attendance_val: number
          avg_assignment_val: number
          stress_val: number
          social_media_val: number
        }
        Returns: Database["public"]["Enums"]["risk_level"]
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "admin"
      risk_level: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk"
      attendance_status: "Present" | "Absent" | "Late" | "Excused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
