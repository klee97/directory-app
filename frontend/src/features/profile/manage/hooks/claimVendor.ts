"use server";

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/admin-client';

export async function claimVendor(accessToken: string) {
  // Get current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Update vendor to link it to this user, using admin to bypass RLS
  const { data: vendor, error } = await supabaseAdmin
    .from('vendors')
    .update({ user_id: user.id })
    .eq('access_token', accessToken)
    .is('user_id', null) // Only claim unclaimed vendors
    .select()
    .single();

  if (error) {
    throw new Error('Failed to claim vendor: ' + error.message);
  }

  return vendor;
}