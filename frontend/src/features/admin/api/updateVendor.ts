"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert } from "@/types/vendor";
import { prepareVendorInsertData } from "../components/vendorHelper";
import { updateHubSpotContact } from "@/lib/hubspot/hubspot";
import { TagOption } from "../components/TagSelector";

export const updateVendor = async (
  vendor: BackendVendorInsert,
  firstname: string,
  lastname: string,
  tags: TagOption[],
) => {
  console.log("Updating vendor:", vendor);

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

  if (vendor.id === null || vendor.id === '' || vendor.id === undefined ||  !vendor.id.includes('HMAU-')) {
    console.error("Vendor ID in format HMAU-XXX is required for update");
    throw new Error("Vendor ID in format HMAU-XXX is required for update");
  }

  console.log("Vendor update data:", vendor);
  const vendorData = await prepareVendorInsertData(vendor);

  console.log("Updated vendor insert data:", vendorData);

  // Proceed with vendor update
  const { data, error } = await supabase.from("vendors").update(vendorData).eq('id', vendor.id).select("id, slug, email").single();

  if (data && data.id) {
    console.log("Vendor updated successfully!", data);

    await supabase.rpc("update_vendor_location", { vendor_id: data.id });
    console.log("Vendor region updated successfully!", data);

    // Add tags to the vendor
    tags.map(async (tag) => {
      const { error: skillError } = await supabase
        .from("vendor_tags")
        .upsert({ vendor_id: data.id, tag_id: tag.id });

      if (skillError) {
        console.error(`Error upserting tag ${tag.unique_tag} to vendor id ${data.id}`, skillError);
      }
    })

    if (data.email != null && data.email != '') {
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