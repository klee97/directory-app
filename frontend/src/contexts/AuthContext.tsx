'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/clients/browserClient';
import type { User } from '@supabase/supabase-js';
import { UserRole, getUserRole } from '@/lib/auth/userRole';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  role: UserRole;
  vendorId: string | null;
  isRoleLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const supabaseBrowserClient = createBrowserClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  // Check role and vendor status whenever user changes
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setRole(UserRole.USER);
        setVendorId(null);
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);
      try {
        const { data: profile } = await supabaseBrowserClient
          .from('profiles')
          .select('role, vendor_id')
          .eq('id', user.id)
          .single();

        setRole(getUserRole({ vendor_id: profile?.vendor_id, role: profile?.role }));
        setVendorId(profile?.vendor_id || null);
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole(UserRole.USER);
        setVendorId(null);
      } finally {
        setIsRoleLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    const { data: { subscription } } = supabaseBrowserClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    isLoading,
    isLoggedIn: !!user,
    role,
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