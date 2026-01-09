import { UnauthorizedPage } from '@/features/auth/components/shared/UnauthorizedPage';

export default function VendorUnauthorized() {
  return <UnauthorizedPage homeUrl="/partner/manage" homeButtonText="Return to Dashboard" />;
}
