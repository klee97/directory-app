"use server";
import { VendorDraft } from '@/types/vendorDraft';
import { createClient } from '@/lib/supabase/server';
import { VendorFormData } from '@/types/vendorFormData';
import { formDataToDraft } from '@/lib/profile/formToDraftTranslator';
import { updateVendor } from '../../common/api/updateVendor';
import { draftToVendorInput } from '@/lib/profile/draftToVendorInputTranslator';


export async function loadUnpublishedDraft(
  vendorId: string,
  userId: string
): Promise<VendorDraft | null> {
  const supabase = await createClient();
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
): Promise<VendorDraft> {
  const supabase = await createClient();

  // Convert formData to draft
  const draftData = formDataToDraft(formData, vendorId, userId, existingDraftId);
  console.debug("vendorId:", vendorId, "userId:", userId, "existingDraftId:", existingDraftId);
  const { data, error } = await supabase
    .from('vendor_drafts')
    .upsert(draftData, {
      onConflict: 'vendor_id,user_id'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
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

    // Convert draft to VendorDataInput format
    const vendorInput = draftToVendorInput(draft);

    // Extract vendor lookup info
    const vendorLookup = {
      id: draft.vendor_id,
    };
    // Get vendor tags if they exist in draft
    const tags = draft.tags ?? [];
    const images = draft.images ?? [];

    // Reuse the existing updateVendor function
    const result = await updateVendor(
      vendorLookup,
      vendorInput,
      null, // first name of vendor
      null, // last name of vendor
      tags,
      images
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to update vendor'
      };
    }


    // Mark draft as published
    const { error: markError } = await supabase
      .from('vendor_drafts')
      .update({ is_published: true })
      .eq('id', draftId);

    if (markError) {
      console.error('Failed to mark draft as published:', markError);
      // Don't fail the whole operation if this fails
    }

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