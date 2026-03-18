'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resolveUserType, trackUserContext } from '@/utils/analytics/trackUserContext';

export function UserContextTracker() {
  const { user, role, isRoleLoading } = useAuth();

  useEffect(() => {
    if (isRoleLoading) return;
    trackUserContext(resolveUserType('vendor', role), user?.id);
  }, [role, isRoleLoading, user?.id]);

  return null;
}