'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, User, Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  supabase: SupabaseClient;
  refreshSession: () => Promise<void>;
  role: UserRole;
  isVendor: boolean;
  isUser: boolean;
  isAdmin: boolean;
  vendorId: string | null;
  isRoleLoading: boolean;
};

type UserRole = 'user' | 'vendor' | 'admin' | null;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const supabase = createClient();

  // Check role and vendor status whenever user changes
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRole(null);
        setVendorId(null);
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, vendor_id')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || null);
        setVendorId(profile?.vendor_id || null);
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(null);
        setVendorId(null);
      } finally {
        setIsRoleLoading(false);
      }
    };

    checkUserRole();
  }, [user, supabase]);

  const refreshSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setUser(data.session?.user || null);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshSession, supabase.auth]);

  const value = {
    user,
    session,
    isLoading,
    isLoggedIn: !!session,
    supabase,
    refreshSession,
    role,
    isVendor: role === 'vendor',
    isUser: role === 'user',
    isAdmin: role === 'admin',
    vendorId,
    isRoleLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};