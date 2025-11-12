"use server";
import { BackendVendorDraft } from '@/types/vendorDraft';
import { createClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/api-client';
import { VendorFormData } from '@/types/vendorFormData';
import { formDataToDraft } from '@/lib/profile/formToDraftTranslator';
import { getCurrentUserAction } from '@/lib/auth/actions/getUser';

/**
 *  todo: add authentication to make sure user is linked with vendor
 * -- Enable RLS on vendor_drafts
ALTER TABLE vendor_drafts ENABLE ROW LEVEL SECURITY;

-- Users can only read their own drafts
CREATE POLICY "Users can view own drafts"
  ON vendor_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert drafts for vendors they own
CREATE POLICY "Users can create drafts for owned vendors"
  ON vendor_drafts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Users can only update their own drafts
CREATE POLICY "Users can update own drafts"
  ON vendor_drafts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own drafts
CREATE POLICY "Users can delete own drafts"
  ON vendor_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

**/


export async function loadUnpublishedDraft(
  vendorId: string,
  userId: string
): Promise<BackendVendorDraft | null> {
  const user = await getCurrentUserAction();
  if (!user) {
    throw new Error('User not authenticated');
  }
  // const hasAccess = await verifyVendorAccess(vendorId, user.id);
  // if (!hasAccess) throw new Error('Unauthorized');

  // Just check if unpublished draft exists
  const { data: draft } = await supabase
    .from('vendor_drafts')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('user_id', userId)
    .eq('is_published', false) // Only load unpublished
    .single();

  return draft; // null if no unpublished draft
}

export async function createOrUpdateDraft(
  formData: VendorFormData,
  vendorId: string,
  userId: string,
  existingDraftId: string | null
): Promise<BackendVendorDraft> {
  // Convert formData to draft
  const draftData = formDataToDraft(formData, vendorId, userId, existingDraftId);

  if (existingDraftId) {
    // Update existing draft
    const { data, error } = await supabase
      .from('vendor_drafts')
      .update(draftData)
      .eq('id', existingDraftId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } else {
    // Create new draft
    const { data, error } = await supabase
      .from('vendor_drafts')
      .insert(draftData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

/**
 * Save draft changes
 */
export async function saveDraft(
  draft: Partial<BackendVendorDraft> & { id: string }
): Promise<BackendVendorDraft | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('vendor_drafts')
      .update({
        ...draft,
        is_published: false, // Mark as unpublished when saving changes
      })
      .eq('id', draft.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving draft:', error);
    return null;
  }
}

/**
 * Publish draft to live vendor table
 */
export async function publishDraft(
  draftId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  try {
    // Load draft
    const { data: draft, error: loadError } = await supabase
      .from('vendor_drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (loadError || !draft) {
      return { success: false, error: 'Draft not found' };
    }

    console.log('Pretend to publish draft to vendor:', draft);

    // // Update vendor with draft data
    // const { error: updateError } = await supabase
    //   .from('vendors')
    //   .update({
    //     business_name: draft.business_name,
    //     website: draft.website,
    //     email: draft.email,
    //     ig_handle: draft.ig_handle,
    //     google_maps_place: draft.google_maps_place,
    //     description: draft.description,
    //     region: draft.region,
    //     city: draft.city,
    //     state: draft.state,
    //     country: draft.country,
    //     latitude: draft.latitude,
    //     longitude: draft.longitude,
    //     travels_world_wide: draft.travels_world_wide,
    //     lists_prices: draft.lists_prices,
    //     bridal_hair_price: draft.bridal_hair_price,
    //     bridal_makeup_price: draft.bridal_makeup_price,
    //     'bridal_hair_&_makeup_price': draft.bridal_hair_makeup_price,
    //     bridesmaid_hair_price: draft.bridesmaid_hair_price,
    //     bridesmaid_makeup_price: draft.bridesmaid_makeup_price,
    //     'bridesmaid_hair_&_makeup_price': draft.bridesmaid_hair_makeup_price,
    //     cover_image: draft.cover_image,
    //     profile_image: draft.profile_image,
    //     logo: draft.logo,
    //     // Note: gis_computed, state_id, metro_id are computed by DB
    //   })
    //   .eq('id', draft.vendor_id);

    // if (updateError) {
    //   return { success: false, error: updateError.message };
    // }

    // Mark draft as published
    await supabase
      .from('vendor_drafts')
      .update({ is_published: true })
      .eq('id', draftId);

    return { success: true };
  } catch (error) {
    console.error('Error publishing draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Discard draft changes (revert to published version)
 */
export async function discardDraft(draftId: string): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { data: draft } = await supabase
      .from('vendor_drafts')
      .select('vendor_id')
      .eq('id', draftId)
      .single();

    if (!draft) return false;

    // Reload from vendor table
    const { data: vendor } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', draft.vendor_id)
      .single();

    if (!vendor) return false;

    // Reset draft to match vendor
    await supabase
      .from('vendor_drafts')
      .update({
        business_name: vendor.business_name,
        website: vendor.website,
        // ... all other fields
        is_published: true,
      })
      .eq('id', draftId);

    return true;
  } catch (error) {
    console.error('Error discarding draft:', error);
    return false;
  }
}