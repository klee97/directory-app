// app/vendor/edit/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import VendorEditProfile from '@/features/profile/manage/components/EditableVendorProfile';
import { fetchVendorBySlug } from '@/features/profile/common/api/fetchVendor';

export default async function VendorEditPage() {
  // const supabase = createClient();
  
  // Check authentication
  // const { data: { user } } = await supabase.auth.getUser();
  
  // if (!user) {
  //   redirect('/login?redirect=/vendor/edit');
  // }
  
  // Fetch vendor data for current user
  const vendor = await fetchVendorBySlug("mable-pang");
  
  if (!vendor) {
    // User is not a vendor, redirect or show error
    redirect('/'); // or show "not a vendor" page
  }
  
  return <VendorEditProfile vendor={vendor} />;
}