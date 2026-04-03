import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getVendorForCurrentUser } from '@/features/profile/dashboard/api/getVendorForCurrentUser';
import { VendorSettings } from '@/features/settings/components/VendorSettings';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Settings | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function VendorSettingsPage() {
  // Check authentication
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect('/partner/login?redirect=/partner/settings');
  }

  const { userId } = currentUser;

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId);
  console.log("Fetched vendor data:", vendor);


  if (!vendor) {
    redirect('/partner/login?redirect=/partner/settings');
  }

  return <VendorSettings userEmail={currentUser.email} hasPassword={currentUser.has_password} vendorId={vendor.id} vendorSlug={vendor.slug ?? undefined} approvedInquiriesAt={vendor.approved_inquiries_at} />;
}