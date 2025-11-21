import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/manage/components/VendorEditProfile';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';
import { getTags } from '@/features/profile/common/api/getTags';
import { getVendorForCurrentUser } from '@/features/profile/manage/api/getVendorForCurrentUser';
import { Suspense } from 'react';
import VendorEditSkeleton from '@/features/profile/manage/components/VendorEditSkeleton';

async function VendorEditContent({ userId }: { userId: string }) {
  // Fetch vendor data for current user
  const vendor = await getVendorForCurrentUser(userId);
  
  if (!vendor) {
    // No vendor linked - redirect to onboarding or show error
    redirect('/partner/onboarding');
  }
  
  const tags = await getTags();
  return <VendorEditProfile vendor={vendor} tags={tags} userId={userId} />;
}

export default async function VendorEditPage() {
  // Check authentication
  const currentUser = await getCurrentUserAction();

  if (!currentUser || !currentUser.userId) {
    redirect('/partner/login?redirect=/partner/manage');
  }

  const { userId } = currentUser;

  return (
    <Suspense fallback={<VendorEditSkeleton />}>
      <VendorEditContent userId={userId} />
    </Suspense>
  );
}