'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserType, trackUserContext } from '@/utils/analytics/trackUserContext';
import { UserRole } from '@/lib/auth/userRole';

export function UserContextTracker() {
  const { user, role, isRoleLoading } = useAuth();

  useEffect(() => {
    if (isRoleLoading) return;
    trackUserContext(resolveUserType(UserRole.VENDOR, role), user?.id);
  }, [role, isRoleLoading, user?.id]);

  return null;
}