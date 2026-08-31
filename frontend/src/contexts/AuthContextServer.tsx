import { getServerAuthState } from '@/lib/auth/getServerAuthState';
import { AuthProvider } from '@/contexts/AuthContext';

export async function AuthContextServer({ children }: { children: React.ReactNode }) {
  const authState = await getServerAuthState();
  return <AuthProvider initialState={authState}>{children}</AuthProvider>;
}