import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';

export default function PublicAuthCodeErrorPage() {
  return (
    <AuthErrorPage
      errorType="verification"
      routes={{
        login: '/login',
        verifyOrForgot: '/auth/verify-email',
        home: '/',
        support: '/contact'
      }}
      labels={{
        homeButton: 'Return to homepage'
      }}
    />
  );
}