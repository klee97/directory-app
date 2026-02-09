import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';

export default function VendorRecoveryCodeErrorPage() {
  return (
    <AuthErrorPage
      errorType="passwordReset"
      routes={{
        login: '/partner/login',
        verifyOrForgot: '/partner/forgot-password',
        home: '/partner/login',
        support: '/partner/contact'
      }}
      labels={{
        homeButton: 'Return to home'
      }}
    />
  );
}
