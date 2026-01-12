import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';

export default function PublicRecoveryCodeErrorPage() {
  return (
    <AuthErrorPage
      errorType="passwordReset"
      routes={{
        login: '/login',
        verifyOrForgot: '/forgot-password',
        home: '/',
        support: '/contact'
      }}
      labels={{
        homeButton: 'Return to homepage'
      }}
    />
  );
}