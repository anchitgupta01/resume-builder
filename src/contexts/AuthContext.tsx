import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { auth, db } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Initializing authentication');
    
    // Get initial session
    auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        console.error('❌ AuthProvider: Error getting initial user:', error);
        
        // Check if stale tokens were cleared
        if (error.message === 'STALE_TOKEN_CLEARED') {
          console.log('🔄 AuthProvider: Stale tokens detected, reloading page');
          window.location.reload();
          return;
        }
        
        // For other errors, just log them but don't crash the app
        console.log('⚠️ AuthProvider: Authentication service may not be configured properly');
      } else {
        console.log('👤 AuthProvider: Initial user:', user?.email || 'none');
      }
      setUser(user);
      setLoading(false);
    }).catch(err => {
      console.error('❌ AuthProvider: Exception getting initial user:', err);
      console.log('⚠️ AuthProvider: Continuing without authentication');
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 AuthProvider: Auth event:', event, session?.user?.email || 'no user');
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle sign out event specifically
      if (event === 'SIGNED_OUT') {
        console.log('🔐 AuthProvider: User signed out, clearing state');
        setUser(null);
        setSession(null);
      }

      // Track auth events (only for authenticated users)
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await db.analytics.track('user_signed_in');
        } else if (event === 'SIGNED_OUT') {
          await db.analytics.track('user_signed_out');
        }
      } catch (analyticsError) {
        console.warn('⚠️ AuthProvider: Analytics tracking failed:', analyticsError);
      }
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔐 AuthProvider: Signing up user:', email);
      const { data, error } = await auth.signUp(email, password, fullName);
      
      if (error) {
        console.error('❌ AuthProvider: Sign up error:', error);
        return { error };
      }

      // Track signup attempt (only if user was created)
      if (data.user) {
        try {
          await db.analytics.track('user_signed_up', { email });
        } catch (analyticsError) {
          console.warn('⚠️ AuthProvider: Analytics tracking failed:', analyticsError);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('❌ AuthProvider: Unexpected signup error:', err);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 AuthProvider: Signing in user:', email);
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('❌ AuthProvider: Sign in error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('❌ AuthProvider: Unexpected signin error:', err);
      return { error: { message: 'An unexpected error occurred during signin' } };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔐 AuthProvider: Signing out user');
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      
      // Call the auth service
      const { error } = await auth.signOut();
      
      if (error) {
        console.error('❌ AuthProvider: Sign out error:', error);
        // Even if there's an error, we've already cleared local state
        // This ensures the UI updates immediately
      } else {
        console.log('✅ AuthProvider: Sign out successful');
      }
      
      return { error };
    } catch (err) {
      console.error('❌ AuthProvider: Sign out exception:', err);
      // Even on exception, ensure local state is cleared
      setUser(null);
      setSession(null);
      return { error: { message: 'An unexpected error occurred during signout' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 AuthProvider: Resetting password for:', email);
      const { data, error } = await auth.resetPassword(email);
      
      if (error) {
        console.error('❌ AuthProvider: Password reset error:', error);
        return { error };
      }

      // Track password reset request
      try {
        await db.analytics.track('password_reset_requested', { email });
      } catch (analyticsError) {
        console.warn('⚠️ AuthProvider: Analytics tracking failed:', analyticsError);
      }
      
      return { error: null };
    } catch (err) {
      console.error('❌ AuthProvider: Unexpected password reset error:', err);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      console.log('🔐 AuthProvider: Updating password');
      const { data, error } = await auth.updatePassword(password);
      
      if (error) {
        console.error('❌ AuthProvider: Password update error:', error);
        return { error };
      }

      // Track password update (only for authenticated users)
      if (user) {
        try {
          await db.analytics.track('password_updated');
        } catch (analyticsError) {
          console.warn('⚠️ AuthProvider: Analytics tracking failed:', analyticsError);
        }
      }
      
      return { error: null };
    } catch (err) {
      console.error('❌ AuthProvider: Unexpected password update error:', err);
      return { error: { message: 'An unexpected error occurred during password update' } };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}