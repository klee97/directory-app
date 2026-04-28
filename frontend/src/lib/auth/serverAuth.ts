import { createServerClient } from '@/lib/supabase/clients/serverClient';
import { NextResponse } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';

export async function requireAuth() {
  const supabaseServerClient = await createServerClient();
  const { data } = await supabaseServerClient.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, error: null, supabase: supabaseServerClient };
}

export async function requireVendorAccess(vendorSlug: string, userId: string, supabase: SupabaseClient) {
  // Get vendor
  const vendorQuery = supabase
    .from('vendors')
    .select('id, slug');

  const { data: vendor, error: vendorError } = await vendorQuery
    .eq('slug', vendorSlug)
    .single();

  if (vendorError || !vendor) {
    console.error("Vendor not found for slug:", vendorSlug, vendorError);
    return { vendor: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, vendor_id')
    .eq('id', userId)
    .single();

  const isAdmin = profile?.is_admin;
  const isOwnVendor = profile?.vendor_id === vendor.id;

  if (!isAdmin && !isOwnVendor) {
    return { vendor: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { vendor, error: null, isAdmin };
}