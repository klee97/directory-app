import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { claimVendor } from '@/features/profile/manage/hooks/claimVendor';

export default async function ClaimCompletePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/partner/login');
  }

  // Check if there's a pending vendor claim
  const pendingToken = user.user_metadata?.pending_vendor_access_token;

  if (pendingToken) {
    try {
      await claimVendor(pendingToken, false); // Don't auto-confirm, they clicked OTP link
    } catch (error) {
      console.error('Failed to claim vendor:', error);
    }
  }

  redirect('/partner/manage');
}