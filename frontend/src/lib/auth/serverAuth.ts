import { createServerClient } from '@/lib/supabase/clients/serverClient';

export async function requireVendorAccess(vendorSlug: string, userId: string) {
  const supabaseServerClient = await createServerClient();

  const vendorQuery = supabaseServerClient
    .from('vendors')
    .select('id, slug');

  const { data: vendor, error: vendorError } = await vendorQuery
    .eq('slug', vendorSlug)
    .single();

  if (vendorError || !vendor) {
    console.error("Vendor not found for slug:", vendorSlug, vendorError);
    return { vendor: null, error: 'Forbidden' };
  }

  const { data: profile } = await supabaseServerClient
    .from('profiles')
    .select('is_admin, vendor_id')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.is_admin;
  const isOwnVendor = profile?.vendor_id === vendor.id;

  if (!isAdmin && !isOwnVendor) {
    return { vendor: null, error: 'Forbidden' };
  }

  return { vendor, error: null, isAdmin };
}