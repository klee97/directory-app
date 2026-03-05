import { logEnvironmentInfo, shouldIncludeTestVendors } from "@/lib/env/env";
import { createClient } from "@/lib/supabase/server";
import { transformBackendVendorToFrontend } from "@/types/vendor";

export async function getVendorForCurrentUser(userId: string) {
  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  const query = supabase
    .from('profiles')
    .select(`
      vendor_id,
      is_test,
      vendors!inner (
        *,
        tags (id, display_name, name, type, is_visible, style),
        vendor_media (id, media_url, is_featured, consent_given, credits)
      )
    `)
    .eq('id', userId);

  logEnvironmentInfo();

  const { data, error } = await query.maybeSingle();

  if (error || !data?.vendors || data.vendors.length === 0) {
    console.error('Error fetching vendor:', error);
    return null;
  }

  const vendor = Array.isArray(data.vendors) ? data.vendors[0] : data.vendors;

  if (!vendor) {
    console.error('No vendor found for user:', userId);
    return null;
  }

  if (!shouldIncludeTestVendors() && !data.is_test) {
    if (vendor.id.startsWith('TEST-')) {
      console.warn('Skipping test vendor for non-test user');
      return null;
    }
  }

  return transformBackendVendorToFrontend(vendor);
}