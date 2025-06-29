import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { auth } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
  updatePassword: (password: string) => Promise<{ data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialUser = async () => {
      try {
        console.log('🔐 AuthProvider: Getting initial user session...');
        
        const { data, error } = await auth.getUser();
        
        if (!mounted) return;

        if (error) {
          console.error('❌ AuthProvider: Error getting initial user:', error.message);
          
          // Handle specific error cases gracefully
          if (error.message === 'STALE_TOKEN_CLEARED') {
            console.log('🔄 AuthProvider: Stale tokens cleared, user set to null');
            setUser(null);
          } else {
            console.warn('⚠️ AuthProvider: Auth service error, continuing without user');
            setUser(null);
          }
        } else {
          console.log('✅ AuthProvider: Initial user session retrieved');
          setUser(data.user);
        }
      } catch (err: any) {
        if (!mounted) return;
        
        console.error('❌ AuthProvider: Exception getting initial user:', err);
        console.warn('⚠️ AuthProvider: Continuing without authentication');
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialUser();

    // Set up auth state listener
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔐 AuthProvider: Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
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