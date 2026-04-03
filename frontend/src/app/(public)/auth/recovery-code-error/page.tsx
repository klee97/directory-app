import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Something went wrong | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

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