import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Get environment variables with fallbacks and better detection
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

console.log('🔧 Supabase Environment Check:');
console.log('NODE_ENV:', import.meta.env.MODE);
console.log('URL exists:', !!supabaseUrl);
console.log('URL length:', supabaseUrl?.length || 0);
console.log('Key exists:', !!supabaseAnonKey);
console.log('Key length:', supabaseAnonKey?.length || 0);

// More detailed logging for debugging
if (supabaseUrl) {
  console.log('URL preview:', supabaseUrl.substring(0, 30) + '...');
} else {
  console.error('❌ VITE_SUPABASE_URL is missing or empty');
}

if (supabaseAnonKey) {
  console.log('Key preview:', supabaseAnonKey.substring(0, 20) + '...');
} else {
  console.error('❌ VITE_SUPABASE_ANON_KEY is missing or empty');
}

// Validate URL format
const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');
const isValidKey = supabaseAnonKey && supabaseAnonKey.length > 50; // Supabase keys are typically longer

console.log('URL format valid:', isValidUrl);
console.log('Key format valid:', isValidKey);

// Create Supabase client only if both URL and key are valid
export const supabase = (isValidUrl && isValidKey) 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Test the connection only if properly configured
if (supabase) {
  console.log('✅ Supabase client created successfully');
  
  // Test connection with timeout and better error handling
  const testConnection = async () => {
    try {
      console.log('🔍 Testing Supabase connection...');
      
      // Use a simple query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const { data, error } = await supabase
        .from('resumes')
        .select('count', { count: 'exact', head: true })
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Supabase connection test failed:', error.message);
        if (error.message.includes('JWT')) {
          console.error('🔑 Authentication issue - check your Supabase keys');
        }
      } else {
        console.log('✅ Supabase connection test successful');
        console.log('📊 Database accessible, resume count check passed');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('⏰ Supabase connection test timed out');
      } else {
        console.error('❌ Supabase connection test error:', err.message);
      }
    }
  };
  
  // Test connection after a short delay
  setTimeout(testConnection, 1000);
} else {
  console.warn('⚠️ Supabase not properly configured');
  console.warn('📋 Required environment variables:');
  console.warn('   - VITE_SUPABASE_URL (should start with https:// and contain .supabase.co)');
  console.warn('   - VITE_SUPABASE_ANON_KEY (should be a long string)');
  console.warn('🔧 Please check your Netlify environment variables');
}

// Helper function to clear stale auth tokens
const clearStaleAuthTokens = () => {
  try {
    // Clear Supabase auth tokens from localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth-token')) {
        localStorage.removeItem(key);
        console.log('🧹 Cleared stale auth token:', key);
      }
    });
  } catch (err) {
    console.warn('⚠️ Failed to clear localStorage tokens:', err);
  }
};

// Auth helpers with improved error handling
export const auth = {
  signUp: async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      console.error('❌ Auth: Supabase not configured for signup');
      return { 
        data: null, 
        error: { 
          message: 'Authentication service is not configured. Please contact support.' 
        } 
      };
    }
    
    try {
      console.log('🔐 Auth: Attempting signup for:', email);
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
        console.error('❌ Auth signup error:', error.message);
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid API key')) {
          return { data: null, error: { message: 'Authentication service configuration error. Please contact support.' } };
        }
        if (error.message.includes('User already registered')) {
          return { data: null, error: { message: 'An account with this email already exists. Please sign in instead.' } };
        }
      } else {
        console.log('✅ Auth signup successful');
      }
      
      return { data, error };
    } catch (err: any) {
      console.error('❌ Auth signup exception:', err);
      return { 
        data: null, 
        error: { message: 'Authentication service temporarily unavailable. Please try again later.' } 
      };
    }
  },

  signIn: async (email: string, password: string) => {
    if (!supabase) {
      console.error('❌ Auth: Supabase not configured for signin');
      return { 
        data: null, 
        error: { 
          message: 'Authentication service is not configured. Please contact support.' 
        } 
      };
    }
    
    try {
      console.log('🔐 Auth: Attempting signin for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ Auth signin error:', error.message);
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid API key')) {
          return { data: null, error: { message: 'Authentication service configuration error. Please contact support.' } };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { data: null, error: { message: 'Invalid email or password. Please check your credentials.' } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { data: null, error: { message: 'Please check your email and click the confirmation link before signing in.' } };
        }
      } else {
        console.log('✅ Auth signin successful for:', email);
      }
      
      return { data, error };
    } catch (err: any) {
      console.error('❌ Auth signin exception:', err);
      return { 
        data: null, 
        error: { message: 'Authentication service temporarily unavailable. Please try again later.' } 
      };
    }
  },

  signOut: async () => {
    if (!supabase) {
      console.warn('⚠️ Auth: Supabase not configured for signout');
      return { error: null }; // Allow signout even if not configured
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
    } catch (err: any) {
      console.error('❌ Auth signout exception:', err);
      return { error: null }; // Don't block signout
    }
  },

  resetPassword: async (email: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Password reset service is not configured. Please contact support.' } 
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
        console.log('✅ Auth password reset email sent');
      }
      
      return { data, error };
    } catch (err: any) {
      console.error('❌ Auth password reset exception:', err);
      return { 
        data: null, 
        error: { message: 'Password reset service temporarily unavailable. Please try again later.' } 
      };
    }
  },

  updatePassword: async (password: string) => {
    if (!supabase) {
      return { 
        data: null, 
        error: { message: 'Password update service is not configured.' } 
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
    } catch (err: any) {
      console.error('❌ Auth password update exception:', err);
      return { 
        data: null, 
        error: { message: 'Password update failed. Please try again.' } 
      };
    }
  },

  getUser: async () => {
    if (!supabase) {
      console.log('⚠️ Auth: Supabase not configured, returning null user');
      return { 
        data: { user: null }, 
        error: null // Return null error instead of an error object when not configured
      };
    }
    
    try {
      console.log('🔐 Auth: Getting current user');
      const result = await supabase.auth.getUser();
      
      // Check for refresh token errors
      if (result.error && result.error.message && 
          (result.error.message.includes('refresh_token_not_found') || 
           result.error.message.includes('Invalid Refresh Token'))) {
        console.warn('🔄 Auth: Refresh token invalid, clearing stale tokens');
        clearStaleAuthTokens();
        return { 
          data: { user: null }, 
          error: { message: 'STALE_TOKEN_CLEARED' } 
        };
      }
      
      return result;
    } catch (err: any) {
      console.error('❌ Auth: Get user exception:', err);
      
      // Check if the error is related to refresh tokens
      if (err.message && (err.message.includes('refresh_token_not_found') || 
                         err.message.includes('Invalid Refresh Token'))) {
        console.warn('🔄 Auth: Refresh token exception, clearing stale tokens');
        clearStaleAuthTokens();
        return { 
          data: { user: null }, 
          error: { message: 'STALE_TOKEN_CLEARED' } 
        };
      }
      
      return { 
        data: { user: null }, 
        error: null // Return null error for graceful handling when service is unavailable
      };
    }
  },
  
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      console.log('⚠️ Auth: Supabase not configured, skipping auth state listener');
      // Return a mock subscription that does nothing
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => {
              console.log('🔐 Auth: Mock subscription unsubscribed');
            } 
          } 
        } 
      };
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
        console.warn('📄 DB: Supabase not configured, cannot list resumes');
        return { 
          data: null, 
          error: { 
            message: 'Resume storage is not available. Please check your configuration or contact support.' 
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
          console.error('❌ DB: Resume list error:', error.message);
          
          // Provide more specific error messages
          if (error.message.includes('JWT')) {
            return { data: null, error: { message: 'Authentication expired. Please sign in again.' } };
          }
          if (error.message.includes('permission')) {
            return { data: null, error: { message: 'Permission denied. Please check your account access.' } };
          }
        } else {
          console.log('✅ DB: Resume list success, count:', data?.length || 0);
        }
        
        return { data, error };
      } catch (err: any) {
        console.error('❌ DB: Resume list exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to fetch resumes. Please try again.' } 
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
      } catch (err: any) {
        console.error('❌ DB: Resume get exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to fetch resume' } 
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
      } catch (err: any) {
        console.error('❌ DB: Resume create exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to save resume' } 
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
      } catch (err: any) {
        console.error('❌ DB: Resume update exception:', err);
        return { 
          data: null, 
          error: { message: 'Failed to update resume' } 
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
      } catch (err: any) {
        console.error('❌ DB: Resume delete exception:', err);
        return { error: { message: 'Failed to delete resume' } };
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
      } catch (err: any) {
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
      } catch (err: any) {
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
      } catch (err: any) {
        console.error('❌ DB: Chat history update exception:', err);
        return { data: null, error: { message: 'Failed to update chat history' } };
      }
    },
  },

  // Templates operations
  templates: {
    list: async () => {
      if (!supabase) {
        console.log('📋 DB: Supabase not configured, templates not available from database');
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
      } catch (err: any) {
        console.error('❌ DB: Templates list exception:', err);
        return { data: null, error: { message: 'Failed to fetch templates' } };
      }
    },
  },

  // Analytics operations
  analytics: {
    track: async (event: string, details?: any) => {
      if (!supabase) {
        console.log('📊 DB: Supabase not configured, skipping analytics');
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
      } catch (err: any) {
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
      } catch (err: any) {
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
      } catch (err: any) {
        console.error('❌ DB: User profile update exception:', err);
        return { data: null, error: { message: 'Failed to update user profile' } };
      }
    },
  },
};