import { redirect } from "next/navigation";

import DashboardContent from "@/features/vendorDashboard/components/DashboardContent";
import { getVendorForCurrentUser } from "@/features/profile/dashboard/api/getVendorForCurrentUser";
import VendorLoadError from "@/features/auth/components/shared/VendorLoadError";
import { Metadata } from 'next';
import { CurrentUser, getCurrentUser } from "@/lib/auth/getUser";

export const metadata: Metadata = {
  title: 'Vendor Dashboard | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function VendorDashboardPage() {
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/dashboard')}`);
  }


  // Fetch vendor data server-side
  const vendor = await getVendorForCurrentUser(currentUser.userId);

  if (!vendor) {
    console.error("DashboardContent: vendor is null - this should not happen");

    return <VendorLoadError />;
  }

  return <DashboardContent vendor={vendor} />;
}