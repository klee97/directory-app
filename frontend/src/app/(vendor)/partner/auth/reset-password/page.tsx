import { ResetPasswordPage } from '@/features/auth/components/shared/ResetPasswordPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Something went wrong | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}
export default function VendorResetPasswordPage() {
  return <ResetPasswordPage loginUrl="/partner/login" />;
}
