import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/manage/components/VendorEditProfile';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getTags } from '@/features/profile/common/api/getTags';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';
import { Suspense } from 'react';
import VendorEditSkeleton from '@/features/profile/manage/components/VendorEditSkeleton';
import NoVendorLinked from '@/features/profile/manage/components/NoVendorLinked';

export default async function VendorEditPage() {
  // Check authentication
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect('/partner/login?redirect=/partner/manage/profile');
  }

  const { userId } = currentUser;

  console.debug('[VendorEditPage] userId from getCurrentUserAction:', userId);

  return (
    <Suspense fallback={<VendorEditSkeleton />}>
      <VendorEditContent userId={userId} />
    </Suspense>
  );
}

async function VendorEditContent({ userId }: { userId: string }) {
  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId);

  if (!vendor) {
    return NoVendorLinked();
  }

  const tags = await getTags();
  return <VendorEditProfile vendor={vendor} tags={tags} userId={userId} />;
}