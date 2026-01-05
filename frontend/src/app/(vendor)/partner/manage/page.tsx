import { redirect } from "next/navigation";

import { getCurrentUserAction } from "@/lib/auth/actions/getUser";
import DashboardContent from "@/features/vendorDashboard/DashboardContent";
import { getVendorForCurrentUser } from "@/features/profile/manage/api/getVendorForCurrentUser";


export default async function VendorDashboardPage() {
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect("/partner/login?redirect=/partner/manage");
  }

  // Fetch vendor data server-side
  const vendor = await getVendorForCurrentUser(currentUser.userId);

  return <DashboardContent vendor={vendor}/>;
}