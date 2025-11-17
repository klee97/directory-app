import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/manage/components/EditableVendorProfile';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getTags } from '@/features/profile/common/api/getTags';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';

export default async function VendorEditPage() {

  // Check authentication
  const user = await getCurrentUserAction();

  if (!user) {
    redirect('/vendors/login?redirect=/vendors/manage');
  }

  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser();

  if (!vendor) {
    // todo: If no vendor associated, redirect to appropriate page
    redirect('/');
  }
  const tags = await getTags();
  return <VendorEditProfile vendor={vendor} tags={tags} userId = {user.id} />;
}