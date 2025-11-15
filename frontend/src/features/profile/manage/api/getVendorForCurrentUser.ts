import { createClient } from "@/lib/supabase/server";

export async function getVendorForCurrentUser() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  // ✅ Get vendor from user metadata
  const vendorAccessToken = user.user_metadata?.vendor_access_token;
  
  if (!vendorAccessToken) {
    return null;
  }

  // Fetch vendor by access token
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors')
    .select(`
      *,
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url)
    `)
    .eq('access_token', vendorAccessToken)
    .single();

  if (vendorError) {
    console.error('Error fetching vendor:', vendorError);
    return null;
  }

  return vendor;
}