export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string;
          user_id: string | null;
          name: string | null;
          data: any;
          is_template: boolean | null;
          template_id: string | null;
          version: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          data: any;
          is_template?: boolean | null;
          template_id?: string | null;
          version?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string | null;
          data?: any;
          is_template?: boolean | null;
          template_id?: string | null;
          version?: number | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      chat_history: {
        Row: {
          id: string;
          user_id: string | null;
          resume_id: string | null;
          messages: any;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          resume_id?: string | null;
          messages: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          resume_id?: string | null;
          messages?: any;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          level: string;
          data: any;
          tags: string[] | null;
          preview: string | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          level: string;
          data: any;
          tags?: string[] | null;
          preview?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          level?: string;
          data?: any;
          tags?: string[] | null;
          preview?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      analytics: {
        Row: {
          id: string;
          user_id: string | null;
          event: string;
          details: any | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event: string;
          details?: any | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event?: string;
          details?: any | null;
          created_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: string | null;
          preferences: any | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string | null;
          preferences?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: string | null;
          preferences?: any | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}