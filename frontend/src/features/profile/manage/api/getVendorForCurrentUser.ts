import { shouldIncludeTestVendors } from "@/lib/env/env";
import { createClient } from "@/lib/supabase/server";
import { transformBackendVendorToFrontend } from "@/types/vendor";

export async function getVendorForCurrentUser(userId: string) {
  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  let query = supabase
    .from('vendors')
    .select(`
      *,
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url)
    `);
  if (!shouldIncludeTestVendors()) {
    query = query.not('id', 'like', 'TEST-%');
  }

  // Fetch vendor by access token
  const { data: vendor, error: vendorError } = await query
    .eq('user_id', userId)
    .single();

  if (vendorError) {
    console.error('Error fetching vendor:', vendorError);
    return null;
  }

  return transformBackendVendorToFrontend(vendor);
}