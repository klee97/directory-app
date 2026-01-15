import { UnauthorizedPage } from '@/features/auth/components/shared/UnauthorizedPage';

export default function VendorUnauthorized() {
  return <UnauthorizedPage homeUrl="/partner/dashboard" homeButtonText="Return to Dashboard" />;
}
