import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';
import { Settings } from '@/features/settings/components/Settings';

export default async function VendorSettingsPage() {
  // Check authentication
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect('/partner/login?redirect=/partner/settings');
  }

  if (!currentUser.accessToken) {
    redirect('/partner/login?redirect=/partner/settings');
  }

  const { userId, accessToken } = currentUser;

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId, accessToken);
  console.log("Fetched vendor data:", vendor);


  if (!vendor) {
    redirect('/partner/login?redirect=/partner/settings');
  }

  return <Settings isVendorSettings={true} userEmail={currentUser.email} hasPassword={currentUser.has_password} />;
}