export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      activity_logs: {
        Row: {
          id: string
          task_id: string
          user_id: string
          action_type: string
          description: string
          metadata: any | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          action_type: string
          description: string
          metadata?: any | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          action_type?: string
          description?: string
          metadata?: any | null
          created_at?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          file_name: string
          file_path: string
          size_bytes: number
          content_type: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          file_name: string
          file_path: string
          size_bytes: number
          content_type: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          file_name?: string
          file_path?: string
          size_bytes?: number
          content_type?: string
          created_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      labels: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      login_history: {
        Row: {
          id: string
          user_id: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          name: string | null
          bio: string | null
          timezone: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          bio?: string | null
          timezone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          bio?: string | null
          timezone?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      recovery_codes: {
        Row: {
          id: string
          user_id: string
          code_hash: string
          used: boolean
          created_at: string
          used_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          code_hash: string
          used?: boolean
          created_at?: string
          used_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          code_hash?: string
          used?: boolean
          created_at?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recovery_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      task_labels: {
        Row: {
          task_id: string
          label_id: string
        }
        Insert: {
          task_id: string
          label_id: string
        }
        Update: {
          task_id?: string
          label_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'completed' | 'archived'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          category_id: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'completed' | 'archived'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          category_id?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      task_status: 'todo' | 'in_progress' | 'completed' | 'archived'
      task_priority: 'low' | 'medium' | 'high' | 'urgent'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
