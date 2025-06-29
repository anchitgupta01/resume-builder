import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Configuration Check:');
console.log('URL configured:', !!supabaseUrl);
console.log('Key configured:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined');

// Create Supabase client with proper error handling
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Test the connection only if properly configured
if (supabase) {
  console.log('✅ Supabase client created successfully');
  
  // Test connection with timeout
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('resumes')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
      } else {
        console.log('✅ Supabase connection test successful');
      }
    } catch (err) {
      console.error('❌ Supabase connection test error:', err);
    }
  };
  
  // Test connection after a short delay
  setTimeout(testConnection, 1000);
} else {
  console.warn('⚠️ Supabase not configured - some features will be limited');
}

// Auth helpers with improved error handling
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { 
          message: 'Database not configured. Please contact support or try again later.' 
        } 
      };
    }
    
    try {
      console.log('🔐 Auth: Signing up user');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error('❌ Auth signup error:', error);
      } else {
        console.log('✅ Auth signup successful');
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Auth signup exception:', err);
      return { 
        data: null, 
        error: { message: 'Authentication service temporarily unavailable' } 
      };
    }
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { 
          message: 'Database not configured. Please contact support or try again later.' 
        } 
      };
    }
    
    try {
      console.log('🔐 Auth: Signing in user');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Auth signin error:', error);
      } else {
        console.log('✅ Auth signin successful');
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Auth signin exception:', err);
      return { 
        data: null, 
        error: { message: 'Authentication service temporarily unavailable' } 
      };
    }
  },

  signOut: async () => {
    if (!supabase) {
      return { error: { message: 'Database not configured' } };
    }
    
    try {
      console.log('🔐 Auth: Signing out user');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Auth signout error:', error);
      } else {
        console.log('✅ Auth signout successful');
      }
      
      return { error };
    } catch (err) {
      console.error('❌ Auth signout exception:', err);
      return { error: { message: 'Sign out failed' } };
    }
  },

  resetPassword: async (email: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Database not configured' } 
      };
    }
    
    try {
      console.log('🔐 Auth: Resetting password for:', email);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('❌ Auth password reset error:', error);
      } else {
        console.log('✅ Auth password reset successful');
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Auth password reset exception:', err);
      return { 
        data: null, 
        error: { message: 'Password reset service temporarily unavailable' } 
      };
    }
  },

  updatePassword: async (password: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Database not configured' } 
      };
    }
    
    try {
      console.log('🔐 Auth: Updating password');
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) {
        console.error('❌ Auth password update error:', error);
      } else {
        console.log('✅ Auth password update successful');
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Auth password update exception:', err);
      return { 
        data: null, 
        error: { message: 'Password update failed' } 
      };
    }
  },

  getUser: () => {
    if (!supabase) {
      return Promise.resolve({ 
        data: { user: null }, 
        error: { message: 'Database not configured' } 
      });
    }
    
    console.log('🔐 Auth: Getting current user');
    return supabase.auth.getUser();
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      console.log('⚠️ Auth: Supabase not configured, skipping auth state listener');
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    
    console.log('🔐 Auth: Setting up auth state listener');
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers with improved error handling
export const db = {
  // Resume operations
  resumes: {
    list: async (userId: string) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { 
            message: 'Resume storage not available. Working in local mode only.' 
          } 
        };
      }
      
      try {
        console.log('📄 DB: Listing resumes for user:', userId);
        
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('❌ DB: Resume list error:', error);
        } else {
          console.log('✅ DB: Resume list success, count:', data?.length || 0);
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Resume list exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to fetch resumes from database' } 
        };
      }
    },

    get: async (id: string) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Resume storage not available' } 
        };
      }
      
      try {
        console.log('📄 DB: Getting resume:', id);
        
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          console.error('❌ DB: Resume get error:', error);
        } else {
          console.log('✅ DB: Resume get success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Resume get exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to fetch resume from database' } 
        };
      }
    },

    create: async (resume: any) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Resume storage not available' } 
        };
      }
      
      try {
        console.log('📄 DB: Creating resume for user:', resume.user_id);
        
        const { data, error } = await supabase
          .from('resumes')
          .insert(resume)
          .select()
          .single();
          
        if (error) {
          console.error('❌ DB: Resume create error:', error);
        } else {
          console.log('✅ DB: Resume create success, ID:', data.id);
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Resume create exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to save resume to database' } 
        };
      }
    },

    update: async (id: string, updates: any) => {
      if (!supabase) {
        return { 
          data: null, 
          error: { message: 'Resume storage not available' } 
        };
      }
      
      try {
        console.log('📄 DB: Updating resume:', id);
        
        const { data, error } = await supabase
          .from('resumes')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          console.error('❌ DB: Resume update error:', error);
        } else {
          console.log('✅ DB: Resume update success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Resume update exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to update resume in database' } 
        };
      }
    },

    delete: async (id: string) => {
      if (!supabase) {
        return { error: { message: 'Resume storage not available' } };
      }
      
      try {
        console.log('📄 DB: Deleting resume:', id);
        
        const { error } = await supabase
          .from('resumes')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error('❌ DB: Resume delete error:', error);
        } else {
          console.log('✅ DB: Resume delete success');
        }
        
        return { error };
      } catch (err) {
        console.error('❌ DB: Resume delete exception:', err);
        return { error: { message: 'Failed to delete resume from database' } };
      }
    },
  },

  // Chat history operations
  chatHistory: {
    list: async (userId: string, resumeId?: string) => {
      if (!supabase) {
        return { data: null, error: { message: 'Chat history not available' } };
      }
      
      try {
        console.log('💬 DB: Listing chat history for user:', userId);
        
        let query = supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (resumeId) {
          query = query.eq('resume_id', resumeId);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('❌ DB: Chat history list error:', error);
        } else {
          console.log('✅ DB: Chat history list success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Chat history list exception:', err);
        return { data: null, error: { message: 'Failed to fetch chat history' } };
      }
    },

    create: async (chatHistory: any) => {
      if (!supabase) {
        return { data: null, error: { message: 'Chat history not available' } };
      }
      
      try {
        console.log('💬 DB: Creating chat history');
        
        const { data, error } = await supabase
          .from('chat_history')
          .insert(chatHistory)
          .select()
          .single();
          
        if (error) {
          console.error('❌ DB: Chat history create error:', error);
        } else {
          console.log('✅ DB: Chat history create success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Chat history create exception:', err);
        return { data: null, error: { message: 'Failed to save chat history' } };
      }
    },

    update: async (id: string, messages: any) => {
      if (!supabase) {
        return { data: null, error: { message: 'Chat history not available' } };
      }
      
      try {
        console.log('💬 DB: Updating chat history:', id);
        
        const { data, error } = await supabase
          .from('chat_history')
          .update({ messages, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
          
        if (error) {
          console.error('❌ DB: Chat history update error:', error);
        } else {
          console.log('✅ DB: Chat history update success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Chat history update exception:', err);
        return { data: null, error: { message: 'Failed to update chat history' } };
      }
    },
  },

  // Templates operations
  templates: {
    list: async () => {
      if (!supabase) {
        return { data: null, error: { message: 'Templates not available from database' } };
      }
      
      try {
        console.log('📋 DB: Listing templates');
        
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('❌ DB: Templates list error:', error);
        } else {
          console.log('✅ DB: Templates list success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: Templates list exception:', err);
        return { data: null, error: { message: 'Failed to fetch templates' } };
      }
    },
  },

  // Analytics operations
  analytics: {
    track: async (event: string, details?: any) => {
      if (!supabase) {
        return { error: null }; // Silently fail for analytics when not configured
      }
      
      try {
        console.log('📊 DB: Tracking analytics event:', event);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        // Only track analytics for authenticated users
        if (!user?.id) {
          console.log('📊 DB: Skipping analytics for unauthenticated user');
          return { error: null };
        }
        
        const { error } = await supabase
          .from('analytics')
          .insert({
            user_id: user.id,
            event,
            details,
          });
          
        if (error) {
          console.error('❌ DB: Analytics tracking error:', error);
        } else {
          console.log('✅ DB: Analytics tracking success');
        }
        
        return { error };
      } catch (err) {
        console.error('❌ DB: Analytics tracking exception:', err);
        return { error: null }; // Don't fail the main operation for analytics
      }
    },
  },

  // User profile operations
  profiles: {
    get: async (userId: string) => {
      if (!supabase) {
        return { data: null, error: { message: 'User profiles not available' } };
      }
      
      try {
        console.log('👤 DB: Getting user profile:', userId);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('❌ DB: User profile get error:', error);
        } else {
          console.log('✅ DB: User profile get success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: User profile get exception:', err);
        return { data: null, error: { message: 'Failed to fetch user profile' } };
      }
    },

    update: async (userId: string, updates: any) => {
      if (!supabase) {
        return { data: null, error: { message: 'User profiles not available' } };
      }
      
      try {
        console.log('👤 DB: Updating user profile:', userId);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
          
        if (error) {
          console.error('❌ DB: User profile update error:', error);
        } else {
          console.log('✅ DB: User profile update success');
        }
        
        return { data, error };
      } catch (err) {
        console.error('❌ DB: User profile update exception:', err);
        return { data: null, error: { message: 'Failed to update user profile' } };
      }
    },
  },
};