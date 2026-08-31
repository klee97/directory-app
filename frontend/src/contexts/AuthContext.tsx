'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserRole, getUserRole } from '@/lib/auth/userRole';
import type { ServerAuthState } from '@/lib/auth/getServerAuthState';

type AuthContextType = {
  user: User | null;
  isLoggedIn: boolean;
  role: UserRole;
  vendorId: string | null;
  isRoleLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialState,
}: {
  children: React.ReactNode;
  initialState: ServerAuthState;
}) {
  // Seed from server state so the navbar renders correctly on first paint,
  // with no client round trip needed for the common case.
  const [user, setUser] = useState<User | null>(null); // full User object filled in once client loads
  const [isLoggedIn, setIsLoggedIn] = useState(initialState.isLoggedIn);
  const [role, setRole] = useState<UserRole>(initialState.role);
  const [vendorId, setVendorId] = useState<string | null>(initialState.vendorId);

  const [isRoleLoading, setIsRoleLoading] = useState(false);

  const clientRef = useRef<Awaited<ReturnType<typeof loadClient>> | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    let usesIdleCallback = false;
    const supportsIdleCallback = typeof window.requestIdleCallback === 'function';

    // Defer loading the full Supabase client off the critical path so it
    // never blocks FCP/LCP/TBT on pages that don't need it (e.g. blog pages).
    const schedule = (cb: () => void): number | ReturnType<typeof setTimeout> => {
      if (supportsIdleCallback) {
        usesIdleCallback = true;
        return window.requestIdleCallback(cb, { timeout: 2000 });
      }
      return setTimeout(cb, 200);
    };

    const idleHandle = schedule(async () => {
      if (cancelled) return;
      const supabase = await loadClient();
      if (cancelled) return;
      clientRef.current = supabase;

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        setIsLoggedIn(!!nextUser);

        if (!nextUser) {
          setRole(UserRole.USER);
          setVendorId(null);
          return;
        }

        // Trust server-provided role/vendorId on the initial sync fired by
        // subscribing — only refetch on real auth changes (login, token
        // refresh to a different user, etc).
        if (event === 'INITIAL_SESSION') return;
        setIsRoleLoading(true);
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, vendor_id')
            .eq('id', nextUser.id)
            .single();
          setRole(getUserRole({ vendor_id: profile?.vendor_id, role: profile?.role }));
          setVendorId(profile?.vendor_id ?? null);
        } catch (error) {
          console.error('Error checking user role:', error);
        } finally {
          setIsRoleLoading(false);
        }
      });

      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (usesIdleCallback && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleHandle as number);
      } else {
        clearTimeout(idleHandle as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoggedIn,
    role,
    vendorId,
    isRoleLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function loadClient() {
  const { createBrowserClient } = await import('@/lib/supabase/clients/browserClient');
  return createBrowserClient();
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};