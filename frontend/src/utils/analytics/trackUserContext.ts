import type { UserRole } from '@/contexts/AuthContext';

export type RouteType = 'vendor' | 'customer' | null;
export type AnalyticsUserType = 'vendor' | 'user' | 'admin' | 'unauthenticated';

export function resolveUserType(
  routeType: RouteType,
  role: UserRole
): AnalyticsUserType {
  // Session role is source of truth when available
  if (role === 'vendor') return 'vendor';
  if (role === 'user') return 'user';
  if (role === 'admin') return 'admin';

  // Fall back to route intent for unauthenticated visitors
  if (routeType === 'vendor') return 'vendor';
  if (routeType === 'customer') return 'user';

  return 'unauthenticated';
}

export function trackUserContext(userType: AnalyticsUserType, userId?: string) {
  if (typeof window === 'undefined' || !window.dataLayer) return;

  window.dataLayer.push({
    event: 'user_context',
    user_type: userType,
    ...(userId && { user_id: userId }),
  });
}