import { ResetPasswordPage } from '@/features/auth/components/shared/ResetPasswordPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PublicResetPasswordPage() {
  return <ResetPasswordPage loginUrl="/login" />;
} 