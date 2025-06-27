import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        // Ensure email confirmation is enabled
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    return { data, error };
  },

  updatePassword: async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return { data, error };
  },

  getUser: () => supabase.auth.getUser(),
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // Resume operations
  resumes: {
    list: async (userId: string) => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      return { data, error };
    },

    get: async (id: string) => {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();
      return { data, error };
    },

    create: async (resume: any) => {
      const { data, error } = await supabase
        .from('resumes')
        .insert(resume)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from('resumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', id);
      return { error };
    },
  },

  // Chat history operations
  chatHistory: {
    list: async (userId: string, resumeId?: string) => {
      let query = supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (resumeId) {
        query = query.eq('resume_id', resumeId);
      }

      const { data, error } = await query;
      return { data, error };
    },

    create: async (chatHistory: any) => {
      const { data, error } = await supabase
        .from('chat_history')
        .insert(chatHistory)
        .select()
        .single();
      return { data, error };
    },

    update: async (id: string, messages: any) => {
      const { data, error } = await supabase
        .from('chat_history')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      return { data, error };
    },
  },

  // Templates operations
  templates: {
    list: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });
      return { data, error };
    },
  },

  // Analytics operations
  analytics: {
    track: async (event: string, details?: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only track analytics for authenticated users to comply with RLS policy
      if (!user?.id) {
        return { error: null }; // Return success for unauthenticated users without tracking
      }
      
      const { error } = await supabase
        .from('analytics')
        .insert({
          user_id: user.id,
          event,
          details,
        });
      return { error };
    },
  },

  // User profile operations
  profiles: {
    get: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return { data, error };
    },

    update: async (userId: string, updates: any) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    },
  },
};