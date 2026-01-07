"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert, VendorTag } from "@/types/vendor";
import { prepareVendorData, VendorDataInput } from "../../admin/util/vendorHelper";
import { updateHubSpotContact } from "@/lib/hubspot/hubspot";
import { isTestVendor, shouldIncludeTestVendors } from "@/lib/env/env";
import { revalidateVendor } from "@/lib/actions/revalidate";

interface VendorLookup {
  id?: string;
  slug?: string;
}

interface UpdateVendorResult {
  success: boolean;
  data?: { id: string; slug: string; email: string };
  error?: string;
}

export const updateVendor = async (
  lookup: VendorLookup,
  vendor: VendorDataInput,
  firstname: string | null,
  lastname: string | null,
  newTags: VendorTag[] | null,
): Promise<UpdateVendorResult> => {
  const operationId = `update-${Date.now()}`;
  console.log(`[${operationId}] Starting vendor update`, { lookup, updateFields: Object.keys(vendor) });

  // Validate that we have data to update
  if (Object.keys(vendor).length === 0) {
    console.error(`[${operationId}] No fields provided for update`);
    return { success: false, error: "No fields to update" };
  }

  // Get current session to verify user is authenticated
  const supabase = await createClient();
  console.debug(`[${operationId}] Checking authentication...`);

  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (!user || sessionError) {
    console.error(`[${operationId}] Authentication failed:`, sessionError?.message || "No active session");
    return { success: false, error: "You must be logged in to perform this action" };
  }

  console.debug(`[${operationId}] User authenticated:`, user.id);

  // Determine lookup field
  let lookupField: 'id' | 'slug';
  let lookupValue: string;

  if (lookup.id && lookup.id !== '' && lookup.id.startsWith('HMUA-')) {
    lookupField = 'id';
    lookupValue = lookup.id;
    console.debug(`[${operationId}] Using vendor ID for lookup:`, lookup.id);
  } else if (lookup.id && lookup.id !== '' && isTestVendor(lookup.id)) {
    // Allow TEST- IDs in development only
    if (!shouldIncludeTestVendors()) {
      console.error(`[${operationId}] Attempted to modify test vendor in production:`, lookup.id);
      return { success: false, error: "Test vendors can only be modified in development environment" };
    }
    lookupField = 'id';
    lookupValue = lookup.id;
    console.debug(`[${operationId}] ⚠️  Using test vendor ID for lookup:`, lookup.id);
  } else if (lookup.slug && lookup.slug !== '') {
    lookupField = 'slug';
    lookupValue = lookup.slug;
    console.debug(`[${operationId}] Using vendor slug for lookup:`, lookup.slug);
  } else {
    console.error(`[${operationId}] Invalid lookup parameters:`, lookup);
    return { success: false, error: "Either vendor ID (HMUA-XXX or TEST-XXX) or slug is required for update" };
  }

  // Fetch existing vendor data
  console.log(`[${operationId}] Fetching existing vendor data...`);
  const { data: existingVendorData, error: fetchError } = await supabase
    .from("vendors")
    .select(`
      id,
      slug,
      latitude,
      longitude,
      business_name,
      email,
      cover_image,
      tags (id, display_name, name, type, is_visible, style)
    `)
    .eq(lookupField, lookupValue)
    .single();

  if (fetchError || !existingVendorData) {
    console.error(`[${operationId}] Vendor not found with ${lookupField}="${lookupValue}":`, fetchError?.message);
    return { success: false, error: `Vendor not found with ${lookupField}: ${lookupValue}` };
  }

  const vendorId = existingVendorData.id;
  console.debug(`[${operationId}] Found vendor:`, { id: vendorId, slug: existingVendorData.slug });

  // Validate test vendor modification
  if (isTestVendor(vendorId)) {
    if (!shouldIncludeTestVendors()) {
      console.error(`[${operationId}] Cannot modify test vendor in production:`, vendorId);
      return { success: false, error: "Test vendors can only be modified in development environment" };
    }
    console.debug(`[${operationId}] ⚠️  Updating TEST vendor (development only)`);
  }

  // Prepare vendor data
  let vendorData: BackendVendorInsert;
  try {
    console.debug(`[${operationId}] Preparing vendor data...`);
    console.debug(`[${operationId}] Raw vendor data: ${vendor.description}`);
    vendorData = await prepareVendorData(vendor, {
      mode: 'update',
      existingData: existingVendorData
    });
    console.debug(`[${operationId}] Vendor data prepared successfully; ${vendorData}`);
  } catch (prepareError) {
    console.error(`[${operationId}] Failed to prepare vendor data:`, prepareError);
    return { success: false, error: "Failed to prepare vendor data for update" };
  }


  // Update vendor in database
  console.debug(`[${operationId}] Vendor data to update:`, vendorData);
  console.debug(`[${operationId}] Updating vendor in database with lookup field ${lookupField} value ${lookupValue}...`);
  const { data: updatedVendor, error: updateError } = await supabase
    .from("vendors")
    .update(vendorData)
    .eq(lookupField, lookupValue)
    .select("id, slug, email")
    .single();

  console.debug(`[${operationId}] Data returned from update:`, updatedVendor, updateError);

  if (updateError || !updatedVendor) {
    console.error(`[${operationId}] Failed to update vendor:`, updateError?.message);
    return { success: false, error: updateError?.message || "Failed to update vendor" };
  }

  console.debug(`[${operationId}] ✅ Vendor updated successfully:`, lookupValue);

  // Update vendor region if coordinates changed
  if (vendorData.latitude !== undefined && vendorData.longitude !== undefined) {
    console.debug(`[${operationId}] Updating vendor location...`);
    const { error: locationError } = await supabase.rpc("update_vendor_location", {
      vendor_id: updatedVendor.id
    });

    if (locationError) {
      console.error(`[${operationId}] Failed to update vendor location (non-critical):`, locationError.message);
      // Non-critical error - continue
    } else {
      console.debug(`[${operationId}] ✅ Vendor region updated`);
    }
  }

  // Update tags if changed
  console.debug(`[${operationId}] Checking for tag updates...`);
  console.debug(`[${operationId}] Existing tags:`, existingVendorData.tags);
  console.debug(`[${operationId}] New tags:`, newTags);

  const oldTags: VendorTag[] = existingVendorData.tags || [];
  if (oldTags.length > 0 || (newTags && newTags.length > 0)) {
    console.debug(`[${operationId}] Updating vendor tags...`);

    const newTagIds = newTags?.map((t: VendorTag) => t.id) ?? [];
    const oldTagIds = oldTags.map((t: VendorTag) => t.id);

    const toAdd = newTagIds.filter((id: string) => !oldTagIds.includes(id));
    const toRemove = oldTagIds.filter(id => !newTagIds.includes(id));

    console.debug(`[${operationId}] Tag changes:`, { toAdd: toAdd.length, toRemove: toRemove.length });

    // Add new tags
    if (toAdd.length > 0) {
      const rows = toAdd.map((id: string) => ({
        vendor_id: vendorId,
        tag_id: id
      }));

      const { error: upsertError } = await supabase
        .from('vendor_tags')
        .upsert(rows);

      if (upsertError) {
        console.error(`[${operationId}] Failed to add tags (non-critical):`, upsertError.message);
        // Non-critical error - continue
      } else {
        console.debug(`[${operationId}] ✅ Added ${toAdd.length} tags`);
      }
    }

    // Remove deleted tags
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabase
        .from('vendor_tags')
        .delete()
        .eq('vendor_id', vendorId)
        .in('tag_id', toRemove);

      if (deleteError) {
        console.error(`[${operationId}] Failed to remove tags (non-critical):`, deleteError.message);
        // Non-critical error - continue
      } else {
        console.debug(`[${operationId}] ✅ Removed ${toRemove.length} tags`);
      }
    }
  }

  // Update cover image to vendor_media if updated
  if (vendorData.cover_image && vendorData.cover_image !== '' && existingVendorData.cover_image !== vendorData.cover_image) {
    console.log(`[${operationId}] Adding cover image to vendor_media...`);
    const { error: mediaError } = await supabase
      .from('vendor_media')
      .insert({
        media_url: vendorData.cover_image,
        vendor_id: updatedVendor.id,
      });

    if (mediaError) {
      console.warn(`[${operationId}] Failed to add cover image to vendor_media (may be duplicate):`, mediaError.message);
      // Non-critical error - continue
    } else {
      console.debug(`[${operationId}] ✅ Cover image added to vendor_media`);
    }
  }

  // Update HubSpot contact (skip for test vendors)
  const isTest = isTestVendor(updatedVendor.id);
  if (isTest) {
    console.debug(`[${operationId}] ⚠️  Skipping HubSpot contact update for test vendor`);
  } else if (hasVendorContactInfo(firstname, lastname, vendor.business_name) &&
    updatedVendor.email && updatedVendor.email !== '') {
    console.debug(`[${operationId}] Updating HubSpot contact...`);

    try {
      const hubspotContactId = await updateHubSpotContact({
        email: updatedVendor.email,
        firstname: firstname,
        lastname: lastname,
        slug: updatedVendor.slug,
        company: vendor.business_name ?? '',
      });

      if (!hubspotContactId) {
        console.error(`[${operationId}] HubSpot contact update returned no ID`);
        // Non-critical error - continue
      } else {
        console.debug(`[${operationId}] ✅ HubSpot contact updated:`, hubspotContactId);
      }
    } catch (hubspotError) {
      console.error(`[${operationId}] HubSpot contact update failed (non-critical):`, hubspotError);
      // Non-critical error - continue
    }
  }

  console.debug(`[${operationId}] ✅ Vendor update complete`);

  revalidateVendor(updatedVendor.slug);
  return { success: true, data: updatedVendor };
};

function hasVendorContactInfo(
  firstname?: string | null,
  lastname?: string | null,
  business_name?: string | null
): boolean {
  return [firstname, lastname, business_name].some(
    (val) => !!val && val.trim() !== ''
  );
}