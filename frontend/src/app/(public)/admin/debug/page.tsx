'use client'

import EnvDebugPanel from '@/components/env/EnvDebugPanel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { checkAdminStatus } from '@/features/profile/admin/api/checkAdminStatus';
import AdminLoadingSpinner from '@/features/profile/admin/components/LoadingSpinner';


export default function EnvDebugPage() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus(supabase, setLoading, setIsAdmin);
  }, [router, supabase]);

  if (loading) {
    return (
      <AdminLoadingSpinner />
    );
  }

  if (!isAdmin) {
    return null; // This shouldn't render as the router.push above should redirect
  }
  return <EnvDebugPanel />
}