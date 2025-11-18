import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';
import { Settings } from '@/features/settings/components/Settings';

export default async function VendorSettingsPage() {

  /*
  // Check authentication
  const user = await getCurrentUserAction();
  console.log("User in settings page:", user);

  if (!user) {
    redirect('/vendors/login?redirect=/vendors/settings');
  }

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser();
  console.log("Vendor in settings page:", vendor);

  if (!vendor) {
    // todo: If no vendor associated, redirect to appropriate page
    redirect('/');
  }
     */

  return <Settings isVendorSettings={true} />;
}