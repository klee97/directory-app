import { UnauthorizedPage } from "@/features/auth/components/shared/UnauthorizedPage";

export const metadata = { robots: { index: false } }

export default function Page() {
  return <UnauthorizedPage homeUrl="/" homeButtonText="Back to home" />;
}