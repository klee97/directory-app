import EnvDebugPanel from '@/components/env/EnvDebugPanel';
import { requireAdminForPage } from '@/lib/auth/requireAdminForPage';


export default async function EnvDebugPage() {
  await requireAdminForPage('/admin/debug');

  return <EnvDebugPanel />
}