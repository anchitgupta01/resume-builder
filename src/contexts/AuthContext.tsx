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
    // Get initial session
    auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Track auth events (only for authenticated users)
      if (event === 'SIGNED_IN' && session?.user) {
        await db.analytics.track('user_signed_in');
      } else if (event === 'SIGNED_OUT') {
        await db.analytics.track('user_signed_out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await auth.signUp(email, password, fullName);
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }

      // Track signup attempt (only if user was created)
      if (data.user) {
        await db.analytics.track('user_signed_up', { email });
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { error: { message: 'An unexpected error occurred during signup' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await auth.signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected signin error:', err);
      return { error: { message: 'An unexpected error occurred during signin' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await auth.signOut();
      return { error };
    } catch (err) {
      console.error('Sign out error:', err);
      return { error: { message: 'An unexpected error occurred during signout' } };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await auth.resetPassword(email);
      
      if (error) {
        console.error('Password reset error:', error);
        return { error };
      }

      // Track password reset request
      await db.analytics.track('password_reset_requested', { email });
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected password reset error:', err);
      return { error: { message: 'An unexpected error occurred during password reset' } };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await auth.updatePassword(password);
      
      if (error) {
        console.error('Password update error:', error);
        return { error };
      }

      // Track password update (only for authenticated users)
      if (user) {
        await db.analytics.track('password_updated');
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected password update error:', err);
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