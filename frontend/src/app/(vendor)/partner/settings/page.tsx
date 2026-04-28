import { redirect } from 'next/navigation';
import { getVendorForCurrentUser } from '@/features/profile/dashboard/api/getVendorForCurrentUser';
import { VendorSettings } from '@/features/settings/components/VendorSettings';

import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/getUser';

export const metadata: Metadata = {
  title: 'Vendor Settings | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function VendorSettingsPage() {
  // Check authentication
  const claims = await getCurrentUser();
  if (!claims) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/settings')}`);
  }
  const userId = claims.sub;

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId);
  console.log("Fetched vendor data:", vendor);


  if (!vendor) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/settings')}`);
  }

  return <VendorSettings userEmail={claims.email} vendorId={vendor.id} vendorSlug={vendor.slug ?? undefined} approvedInquiriesAt={vendor.approved_inquiries_at} />;
}