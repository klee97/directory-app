// utils/auth-server.ts
import { createClient } from '@/lib/supabase/server';


export async function getServerSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getServerUser() {
  const session = await getServerSession();
  return session?.user || null;
}

export async function isAuthenticated() {
  const session = await getServerSession();
  return !!session;
}