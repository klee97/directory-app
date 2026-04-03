import { VerifyEmailPage } from "@/features/auth/components/shared/VerifyEmailPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Verify Email | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default function PublicVerifyEmailPage() {
  return <VerifyEmailPage loginUrl="/login" />;
} 