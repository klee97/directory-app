import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';

export default function VendorAuthCodeErrorPage() {
  return (
    <AuthErrorPage
      errorType="verification"
      routes={{
        login: '/partner/login',
        verifyOrForgot: '/partner/forgot-password',
        home: '/partner/dashboard',
        support: '/partner/contact'
      }}
      labels={{
        homeButton: 'Return to home'
      }}
    />
  );
}
