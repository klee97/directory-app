import { UserRole } from '@/lib/auth/userRole';

export type AnalyticsUserType = 'vendor' | 'user' | 'admin' | 'guest';

export function resolveUserType(
  role: UserRole
): AnalyticsUserType {
  // Session role is source of truth when available
  if (role === UserRole.VENDOR) return 'vendor';
  if (role === UserRole.CUSTOMER) return 'user';
  if (role === UserRole.ADMIN) return 'admin';

  return 'guest';
}

export function trackUserContext(userType: AnalyticsUserType, userId?: string) {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'user_context',
    user_type: userType,
    ...(userId && { user_id: userId }),
  });
}