import { AuthErrorPage } from '@/features/auth/components/shared/AuthErrorPage';
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Something went wrong | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

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
