import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/manage/components/EditableVendorProfile';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getTags } from '@/features/profile/common/api/getTags';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';

export default async function VendorEditPage() {

  // Check authentication
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect('/partner/login?redirect=/partner/manage');
  }

  if (!currentUser.accessToken) {
    redirect('/partner/login?redirect=/partner/manage');
  }

  const { userId, accessToken } = currentUser;

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId, accessToken);
  console.log("Fetched vendor data:", vendor);


  if (!vendor) {
    redirect('/partner/login?redirect=/partner/manage');
  }
  const tags = await getTags();
  return <VendorEditProfile vendor={vendor} tags={tags} userId={userId} />;
}