import { useAuth } from "@/contexts/AuthContext";
import { isAdminRole } from "@/lib/auth/userRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useRequireAdmin() {
  const { role, isLoading, isRoleLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isRoleLoading) return;

    if (!isLoggedIn) {
      router.push(`/login?redirectTo=${encodeURIComponent('/admin')}`);
      return;
    }
    if (!isAdminRole(role)) {
      router.push('/unauthorized');
      return;
    }
  }, [isLoading, isRoleLoading, isLoggedIn, role, router]);

  return {
    isAdmin: isAdminRole(role),
    isLoading: isLoading || isRoleLoading,
  };
}