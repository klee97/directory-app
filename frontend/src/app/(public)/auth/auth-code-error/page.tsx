import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Something went wrong | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

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
        homeButton: 'Return to home'
      }}
    />
  );
}