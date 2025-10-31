"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert, VendorTag } from "@/types/vendor";
import { prepareVendorInsertData } from "../../admin/util/vendorHelper";
import { updateHubSpotContact } from "@/lib/hubspot/hubspot";

interface VendorLookup {
  id?: string;
  slug?: string;
}

export const updateVendor = async (
  lookup: VendorLookup,
  vendor: BackendVendorInsert,
  firstname: string | null,
  lastname: string | null,
  tags: VendorTag[],
) => {
  console.log("Updating vendor with update data:", vendor);

  // Get current session to verify user is authenticated
  const supabase = await createClient();

  console.log("Authenticating...");

  // Check if user is authenticated
  const { data: { user }, error: sessionError } = await supabase.auth.getUser()

  if (!user || sessionError) {
    console.error("Authentication error:", sessionError || "No active session");
    return { error: "You must be logged in to perform this action" };
  }

  // Check if user is an admin using the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profileData || !profileData.is_admin) {
    console.error("Authorization error: User is not an admin: %s", profileError);
    throw new Error("You do not have permission to create vendors");
  }

  // Determine if we're using ID or slug to find the vendor
  let vendorId: string;
  let lookupField: 'id' | 'slug';
  let lookupValue: string;

  if (lookup.id && lookup.id !== '' && lookup.id.startsWith('HMUA-')) {
    // Use ID if provided and valid
    vendorId = lookup.id;
    lookupField = 'id';
    lookupValue = lookup.id;
    console.log("Using vendor ID for lookup:", lookup.id);
  } else if (lookup.slug && lookup.slug !== '') {
    // Fall back to slug if ID is not provided
    lookupField = 'slug';
    lookupValue = lookup.slug;
    console.log("Using vendor slug for lookup:", lookup.slug);

    // First, get the vendor ID from the slug
    const { data: existingVendor, error: lookupError } = await supabase
      .from("vendors")
      .select("id")
      .eq('slug', lookup.slug)
      .single();

    if (lookupError || !existingVendor) {
      console.error("Vendor not found with slug:", lookup.slug, lookupError);
      throw new Error(`Vendor not found with slug: ${lookup.slug}`);
    }

    vendorId = existingVendor.id;
    console.log("Found vendor ID from slug:", vendorId);
  } else {
    console.error("Either vendor ID (HMUA-XXX) or slug is required for update");
    throw new Error("Either vendor ID (HMUA-XXX) or slug is required for update");
  }

  const vendorData = await prepareVendorInsertData(vendor);
  console.log("Updated vendor insert data:", vendorData);

  // Proceed with vendor update using the determined lookup field
  const { data, error } = await supabase
    .from("vendors")
    .update(vendorData)
    .eq(lookupField, lookupValue)
    .select("id, slug, email")
    .single();

  if (data && data.id) {
    console.log("Vendor updated successfully!", data);

    if (vendor.location_coordinates && vendor.location_coordinates !== '') {
      await supabase.rpc("update_vendor_location", { vendor_id: data.id });
      console.log("Vendor region updated successfully!", data);
    }

    // Add tags to the vendor
    if (tags.length > 0) {
      tags.map(async (tag) => {
        const { error: skillError } = await supabase
          .from("vendor_tags")
          .upsert({ vendor_id: data.id, tag_id: tag.id });

        if (skillError) {
          console.error(`Error upserting tag ${tag.display_name} to vendor id ${data.id}`, skillError);
        }
      })
    }

    // If cover_image was updated, add it to vendor_media table
    if (vendorData.cover_image && vendorData.cover_image !== '') {
      const { error: mediaError } = await supabase
        .from('vendor_media')
        .insert({
          media_url: vendorData.cover_image,
          vendor_id: data.id,
        });

      if (mediaError) {
        // Log the error but don't fail the entire operation
        // The unique constraint might prevent duplicate inserts, which is fine
        console.warn('Failed to add to vendor_media (might be duplicate):', mediaError);
      } else {
        console.log('Added cover image to vendor_media table');
      }
    }

    if (hasVendorContactInfo(firstname, lastname, vendor.business_name) && data.email != null && data.email != '') {
      // Update contact in HubSpot
      const hubspotContactId = await updateHubSpotContact({
        email: data.email,
        firstname: firstname,
        lastname: lastname,
        slug: data.slug,
        company: vendor.business_name ?? '',
      });

      if (!hubspotContactId) {
        console.error("Failed to update HubSpot contact for vendor:", data.slug);
        throw new Error("Failed to update HubSpot contact for vendor");
      }
      console.log("HubSpot contact updated successfully!", hubspotContactId);
    }
  }

  if (error) {
    console.error("Error updating vendor:", error);
    throw error;
  }

  console.log("Vendor updating successfully!", data);

  return data;
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