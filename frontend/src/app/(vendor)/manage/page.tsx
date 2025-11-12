import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/manage/components/EditableVendorProfile';
import { fetchVendorBySlug } from '@/features/profile/common/api/fetchVendor';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getTags } from '@/features/profile/common/api/getTags';

export default async function VendorEditPage() {

  // Check authentication
  const user = await getCurrentUserAction();

  if (!user) {
    redirect('/login?redirect=/vendor/edit');
  }

  // Fetch vendor data for current user
  const vendor = await fetchVendorBySlug("mable-pang"); // todo: replace with user linked vendor slug

  if (!vendor) {
    // User is not a vendor, redirect
    redirect('/'); // todo: redirect to appropriate page
  }
  const tags = await getTags();
  return <VendorEditProfile vendor={vendor} tags={tags} />;
}