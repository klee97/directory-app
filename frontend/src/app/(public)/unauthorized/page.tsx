import { UnauthorizedPage } from '@/features/auth/components/shared/UnauthorizedPage';

export default function PublicUnauthorized() {
  return <UnauthorizedPage homeUrl="/" homeButtonText="Return to Home" />;
}