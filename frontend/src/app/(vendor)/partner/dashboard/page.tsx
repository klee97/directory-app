import { redirect } from "next/navigation";

import { getCurrentUserAction } from "@/lib/auth/actions/getUser";
import DashboardContent from "@/features/vendorDashboard/components/DashboardContent";
import { getVendorForCurrentUser } from "@/features/profile/dashboard/api/getVendorForCurrentUser";
import VendorLoadError from "@/features/auth/components/shared/VendorLoadError";


export default async function VendorDashboardPage() {
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect("/partner/login?redirectTo=/partner/dashboard");
  }

  // Fetch vendor data server-side
  const vendor = await getVendorForCurrentUser(currentUser.userId);

  if (!vendor) {
    console.error("DashboardContent: vendor is null - this should not happen");

    return <VendorLoadError />;
  }

  return <DashboardContent vendor={vendor} />;
}