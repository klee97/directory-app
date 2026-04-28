"use server";
import { createServerClient } from "@/lib/supabase/clients/serverClient";
import { BackendVendorInsert, VendorTag } from "@/types/vendor";
import { VendorMediaForm } from "@/types/vendorMedia";
import { prepareVendorData, VendorDataInput } from "@/features/profile/admin/util/vendorHelper";
import { updateHubSpotContact } from "@/lib/hubspot/hubspot";
import { isTestVendor, shouldIncludeTestVendors } from "@/lib/env/env";
import { revalidateVendor } from "@/lib/actions/revalidate";
import { deriveMediaMutations } from "@/lib/images/vendorMediaHelper";
import { applyVendorMediaMutation } from "@/lib/images/applyVendorMediaMutation";
import { deleteImageServer } from "./deleteImageServer";
import { CurrentUser, getCurrentUser } from "@/lib/auth/getUser";

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
  newImages: VendorMediaForm[]
): Promise<UpdateVendorResult> => {
  const operationId = `update-${Date.now()}`;

  // Check if user is authenticated
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser) {
    console.error("Authentication error: No active session");
    return { success: false, error: "You must be logged in to perform this action" };
  }

  // Validate that we have data to update
  if (Object.keys(vendor).length === 0) {
    console.error(`[${operationId}] No fields provided for update`);
    return { success: false, error: "No fields to update" };
  }

  // Determine lookup field
  let lookupField: 'id' | 'slug';
  let lookupValue: string;

  if (lookup.id && lookup.id !== '' && lookup.id.startsWith('HMUA-')) {
    lookupField = 'id';
    lookupValue = lookup.id;
  } else if (lookup.id && lookup.id !== '' && isTestVendor(lookup.id)) {
    // Allow TEST- IDs in development only
    if (!shouldIncludeTestVendors()) {
      console.error(`[${operationId}] Attempted to modify test vendor in production:`, lookup.id);
      return { success: false, error: "Test vendors can only be modified in development environment" };
    }
    lookupField = 'id';
    lookupValue = lookup.id;
  } else if (lookup.slug && lookup.slug !== '') {
    lookupField = 'slug';
    lookupValue = lookup.slug;
  } else {
    console.error(`[${operationId}] Invalid lookup parameters:`, lookup);
    return { success: false, error: "Either vendor ID (HMUA-XXX or TEST-XXX) or slug is required for update" };
  }

  // Fetch existing vendor data
  const supabaseServerClient = await createServerClient();
  const { data: existingVendorData, error: fetchError } = await supabaseServerClient
    .from("vendors")
    .select(`
      id,
      slug,
      latitude,
      longitude,
      business_name,
      email,
      tags (id, display_name, name, type, is_visible, style),
      vendor_media (id, media_url, is_featured, consent_given, credits)
    `)
    .eq(lookupField, lookupValue)
    .single();

  if (fetchError || !existingVendorData) {
    console.error(`[${operationId}] Vendor not found with ${lookupField}="${lookupValue}":`, fetchError?.message);
    return { success: false, error: `Vendor not found with ${lookupField}: ${lookupValue}` };
  }

  const vendorId = existingVendorData.id;

  // Validate test vendor modification
  if (isTestVendor(vendorId)) {
    if (!shouldIncludeTestVendors()) {
      console.error(`[${operationId}] Cannot modify test vendor in production:`, vendorId);
      return { success: false, error: "Test vendors can only be modified in development environment" };
    }
  }

  // Prepare vendor data
  let vendorData: BackendVendorInsert;
  try {
    vendorData = await prepareVendorData(vendor, {
      mode: 'update',
      existingData: existingVendorData
    });
  } catch (prepareError) {
    console.error(`[${operationId}] Failed to prepare vendor data:`, prepareError);
    return { success: false, error: "Failed to prepare vendor data for update" };
  }

  // Update vendor in database
  const { data: updatedVendor, error: updateError } = await supabaseServerClient
    .from("vendors")
    .update(vendorData)
    .eq(lookupField, lookupValue)
    .select("id, slug, email")
    .single();

  if (updateError || !updatedVendor) {
    console.error(`[${operationId}] Failed to update vendor:`, updateError?.message);
    return { success: false, error: updateError?.message || "Failed to update vendor" };
  }

  // Update vendor region if coordinates changed
  if (vendorData.latitude !== undefined && vendorData.longitude !== undefined) {
    const { error: locationError } = await supabaseServerClient.rpc("update_vendor_location", {
      vendor_id: updatedVendor.id
    });

    if (locationError) {
      console.error(`[${operationId}] Failed to update vendor location (non-critical):`, locationError.message);
      // Non-critical error - continue
    }
  }

  // Update tags if changed
  const oldTags: VendorTag[] = existingVendorData.tags || [];
  if (oldTags.length > 0 || (newTags && newTags.length > 0)) {

    const newTagIds = newTags?.map((t: VendorTag) => t.id) ?? [];
    const oldTagIds = oldTags.map((t: VendorTag) => t.id);

    const toAdd = newTagIds.filter((id: string) => !oldTagIds.includes(id));
    const toRemove = oldTagIds.filter(id => !newTagIds.includes(id));

    // Add new tags
    if (toAdd.length > 0) {
      const rows = toAdd.map((id: string) => ({
        vendor_id: vendorId,
        tag_id: id
      }));

      const { error: upsertError } = await supabaseServerClient
        .from('vendor_tags')
        .upsert(rows);

      if (upsertError) {
        console.error(`[${operationId}] Failed to add tags (non-critical):`, upsertError.message);
        // Non-critical error - continue
      }
    }

    // Remove deleted tags
    if (toRemove.length > 0) {
      const { error: deleteError } = await supabaseServerClient
        .from('vendor_tags')
        .delete()
        .eq('vendor_id', vendorId)
        .in('tag_id', toRemove);

      if (deleteError) {
        console.error(`[${operationId}] Failed to remove tags (non-critical):`, deleteError.message);
        // Non-critical error - continue
      }
    }
  }

  // Handle vendor_media table updates if cover image changed
  if (newImages?.length > 0 || existingVendorData.vendor_media.length > 0) {
    const existingImages = existingVendorData.vendor_media ?? [];
    const mutations = deriveMediaMutations(newImages, existingImages);
    for (const mutation of mutations) {
      const { error } = await applyVendorMediaMutation(supabaseServerClient, mutation);
      if (error) {
        console.warn(`[${operationId}] vendor_media mutation failed (non-critical):`, error.message);
      } else if (mutation.operation === 'delete') {
        deleteImageServer(mutation.media_url, updatedVendor.id);
      }
    }
  }

  // Update HubSpot contact (skip for test vendors)
  const isTest = isTestVendor(updatedVendor.id);
  if (isTest) {
    console.debug(`[${operationId}] ⚠️  Skipping HubSpot contact update for test vendor`);
  } else if (hasVendorContactInfo(firstname, lastname, vendor.business_name) &&
    updatedVendor.email && updatedVendor.email !== '') {

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
      }
    } catch (hubspotError) {
      console.error(`[${operationId}] HubSpot contact update failed (non-critical):`, hubspotError);
      // Non-critical error - continue
    }
  }

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