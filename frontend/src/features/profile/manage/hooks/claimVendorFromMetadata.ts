"use server";

import { createClient } from '@/lib/supabase/server';
import { claimVendor } from './claimVendor';

export async function claimVendorFromMetadata(accessToken: string) {
  const supabase = await createClient();
  
  // Claim the vendor
  await claimVendor(accessToken);

  // Clear the pending metadata
  await supabase.auth.updateUser({
    data: {
      pending_vendor_access_token: null
    }
  });
}