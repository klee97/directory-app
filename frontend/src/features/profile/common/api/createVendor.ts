"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert, VendorTag } from "@/types/vendor";
import { prepareVendorData } from "../../admin/util/vendorHelper";
import { createHubSpotContact } from "@/lib/hubspot/hubspot";
import { isTestVendor, shouldIncludeTestVendors } from "@/lib/env/env";

export const createVendor = async (
  vendor: BackendVendorInsert,
  firstname: string,
  lastname: string,
  tags: VendorTag[] | null,
) => {
  console.log("Creating vendor:", vendor);

  // ✅ Validate test vendor creation
  if (vendor.id && isTestVendor(vendor.id)) {
    if (!shouldIncludeTestVendors()) {
      console.error("Cannot create test vendors in production");
      throw new Error("Test vendors can only be created in development environment");
    }
    console.log("⚠️  Creating TEST vendor (development only)");
  }

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

  console.log("Vendor insert data:", vendor);
  const vendorData = await prepareVendorData(vendor, { mode: 'create' });

  console.log("Updated vendor insert data:", vendorData);

  // Proceed with vendor creation
  const { data, error } = await supabase.from("vendors").insert(vendorData).select("id, slug").single();

  if (data && data.id && data.slug) {
    console.log("Vendor created successfully!", data);

    await supabase.rpc("update_vendor_location", { vendor_id: data.id });
    console.log("Vendor region updated successfully!", data);

    // Add tags to the vendor
    const tagsToAdd = tags ?? [];
    await Promise.all(tagsToAdd.map(async (tag) => {
      const { error: skillError } = await supabase
        .from("vendor_tags")
        .insert({ vendor_id: data.id, tag_id: tag.id });

      if (skillError) {
        console.error(`Error adding tag ${tag.display_name} to new vendor id ${data.id}`, skillError);
      }
    }));

    // ✅ Skip HubSpot for test vendors
    if (isTestVendor(data.id)) {
      console.log("⚠️  Skipping HubSpot contact creation for test vendor:", data.id);
    } else if (vendor.email) {
      // Create a contact in HubSpot if email is provided
      const hubspotContactId = await createHubSpotContact({
        email: vendor.email,
        firstname: firstname,
        lastname: lastname,
        slug: data.slug,
        company: vendor.business_name ?? '',
      });

      if (!hubspotContactId) {
        console.error("Failed to create HubSpot contact for vendor:", data.slug);
      } else {
        console.log("HubSpot contact created successfully!", hubspotContactId);
      }
    } else {
      console.log("No email provided, skipping HubSpot contact creation for vendor:", data?.slug);
    }
  }
  
  if (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }

  console.log("Vendor created successfully!", data);

  return data;
};