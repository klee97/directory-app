import { logEnvironmentInfo, shouldIncludeTestVendors } from "@/lib/env/env";
import { createClient } from "@/lib/supabase/server";
import { transformBackendVendorToFrontend } from "@/types/vendor";

export async function getVendorForCurrentUser(userId: string) {
  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select(`
      vendor_id,
      vendors!inner (
        *,
        tags (id, display_name, name, type, is_visible, style),
        vendor_media (id, media_url)
      )
    `)
    .eq('id', userId);

  if (!shouldIncludeTestVendors()) {
    query = query.not('vendors.id', 'like', 'TEST-%');
  }

  logEnvironmentInfo();

  const { data, error } = await query.single();

  if (error || !data?.vendors) {
    console.error('Error fetching vendor:', error);
    return null;
  }

  const vendor = Array.isArray(data?.vendors) ? data.vendors[0] : data?.vendors;

  return transformBackendVendorToFrontend(vendor);
}