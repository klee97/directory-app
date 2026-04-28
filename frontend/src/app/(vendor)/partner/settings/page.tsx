import { redirect } from 'next/navigation';
import { getVendorForCurrentUser } from '@/features/profile/dashboard/api/getVendorForCurrentUser';
import { VendorSettings } from '@/features/settings/components/VendorSettings';

import { Metadata } from 'next';
import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';

export const metadata: Metadata = {
  title: 'Vendor Settings | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function VendorSettingsPage() {
  // Check authentication
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/settings')}`);
  }

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(currentUser.userId);
  console.log("Fetched vendor data:", vendor);


  if (!vendor) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/settings')}`);
  }

  return <VendorSettings userEmail={currentUser.email} vendorId={vendor.id} vendorSlug={vendor.slug ?? undefined} approvedInquiriesAt={vendor.approved_inquiries_at} />;
}