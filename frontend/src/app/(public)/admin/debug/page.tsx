'use client'

import EnvDebugPanel from '@/components/env/EnvDebugPanel';
import AdminLoadingSpinner from '@/features/profile/admin/components/LoadingSpinner';
import { useRequireAdmin } from '@/hooks/useRequireAdmin';


export default function EnvDebugPage() {
  const { isLoading } = useRequireAdmin();
  
  if (isLoading) {
    return (
      <AdminLoadingSpinner />
    );
  }

  return <EnvDebugPanel />
}