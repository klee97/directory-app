import { redirect } from 'next/navigation';
import VendorEditProfile from '@/features/profile/dashboard/components/VendorEditProfile';
import { getTags } from '@/features/profile/common/api/getTags';
import { getVendorForCurrentUser } from '@/features/profile/dashboard/api/getVendorForCurrentUser';
import { Suspense } from 'react';
import VendorEditSkeleton from '@/features/profile/dashboard/components/VendorEditSkeleton';
import NoVendorLinked from '@/features/profile/dashboard/components/NoVendorLinked';
import { Metadata } from 'next';
import { CurrentUser, getCurrentUser } from '@/lib/auth/getUser';

export const metadata: Metadata = {
  title: 'Edit Your Profile | Asian Wedding Makeup',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function VendorEditPage() {
  // Check authentication
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    redirect(`/partner/login?redirectTo=${encodeURIComponent('/partner/dashboard/profile')}`);
  }

  console.debug('[VendorEditPage] userId from getCurrentUserAction:', currentUser.userId);

  return (
    <Suspense fallback={<VendorEditSkeleton />}>
      <VendorEditContent userId={currentUser.userId} />
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