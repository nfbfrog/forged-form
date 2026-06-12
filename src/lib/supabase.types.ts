export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string | null
          updated_at?: string
        }
      }
      settings: {
        Row: {
          user_id: string
          protein_target: number
          calorie_target: number
          water_target: number
          step_target: number
          sleep_target: number
          life_stage: 'cycling' | 'perimenopause' | 'postmenopause' | 'other'
          metabolic_support: boolean
          hormone_support: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          protein_target?: number
          calorie_target?: number
          water_target?: number
          step_target?: number
          sleep_target?: number
          life_stage?: 'cycling' | 'perimenopause' | 'postmenopause' | 'other'
          metabolic_support?: boolean
          hormone_support?: boolean
          updated_at?: string
        }
        Update: {
          protein_target?: number
          calorie_target?: number
          water_target?: number
          step_target?: number
          sleep_target?: number
          life_stage?: 'cycling' | 'perimenopause' | 'postmenopause' | 'other'
          metabolic_support?: boolean
          hormone_support?: boolean
          updated_at?: string
        }
      }
      daily_logs: {
        Row: {
          user_id: string
          log_date: string
          protein: number
          calories: number
          habits: Json
          appetite: number
          energy: number
          nausea: number
          cycle_context: string
          symptoms: string[]
          note: string
          imported: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          log_date: string
          protein?: number
          calories?: number
          habits?: Json
          appetite?: number
          energy?: number
          nausea?: number
          cycle_context?: string
          symptoms?: string[]
          note?: string
          imported?: boolean
          updated_at?: string
        }
        Update: {
          protein?: number
          calories?: number
          habits?: Json
          appetite?: number
          energy?: number
          nausea?: number
          cycle_context?: string
          symptoms?: string[]
          note?: string
          imported?: boolean
          updated_at?: string
        }
      }
      weekly_metrics: {
        Row: {
          user_id: string
          week_start: string
          weight: number | null
          waist: number | null
          systolic: number | null
          diastolic: number | null
          resting_pulse: number | null
          photo: boolean
          best_lift: string
          sessions: Json
          updated_at: string
        }
        Insert: {
          user_id: string
          week_start: string
          weight?: number | null
          waist?: number | null
          systolic?: number | null
          diastolic?: number | null
          resting_pulse?: number | null
          photo?: boolean
          best_lift?: string
          sessions?: Json
          updated_at?: string
        }
        Update: {
          weight?: number | null
          waist?: number | null
          systolic?: number | null
          diastolic?: number | null
          resting_pulse?: number | null
          photo?: boolean
          best_lift?: string
          sessions?: Json
          updated_at?: string
        }
      }
      exercise_entries: {
        Row: {
          id: string
          user_id: string
          client_id: string
          entry_date: string
          session_id: string
          exercise_id: string
          weight: number
          reps: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id: string
          entry_date: string
          session_id: string
          exercise_id: string
          weight: number
          reps: number
          created_at?: string
        }
        Update: {
          entry_date?: string
          client_id?: string
          session_id?: string
          exercise_id?: string
          weight?: number
          reps?: number
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
