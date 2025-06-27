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
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Track auth events
      if (event === 'SIGNED_IN') {
        await db.analytics.track('user_signed_in');
      } else if (event === 'SIGNED_OUT') {
        await db.analytics.track('user_signed_out');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await auth.signUp(email, password, fullName);
    if (!error) {
      await db.analytics.track('user_signed_up', { email });
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await auth.signIn(email, password);
    return { error };
  };

  const signOut = async () => {
    const { error } = await auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await auth.resetPassword(email);
    if (!error) {
      await db.analytics.track('password_reset_requested', { email });
    }
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await auth.updatePassword(password);
    if (!error) {
      await db.analytics.track('password_updated');
    }
    return { error };
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