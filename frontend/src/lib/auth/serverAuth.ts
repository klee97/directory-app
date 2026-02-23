import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { shouldIncludeTestVendors } from '../env/env';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, error: null, supabase };
}

export async function requireVendorAccess(vendorSlug: string, user: any, supabase: any) {
  // Get vendor
  let vendorQuery = supabase
    .from('vendors')
    .select('id, slug');

  if (!shouldIncludeTestVendors()) {
    vendorQuery = vendorQuery.not('id', 'like', 'TEST-%');
  }

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
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.is_admin;
  const isOwnVendor = profile?.vendor_id === vendor.id;

  if (!isAdmin && !isOwnVendor) {
    return { vendor: null, error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { vendor, error: null, isAdmin };
}