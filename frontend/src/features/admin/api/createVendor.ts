"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert } from "@/types/vendor";
import { prepareVendorInsertData } from "../components/vendorHelper";
import { createHubSpotContact } from "@/lib/hubspot/hubspot";
import { TagOption } from "../components/TagSelector";

export const createVendor = async (
  vendor: BackendVendorInsert,
  firstname: string,
  lastname: string,
  tags: TagOption[],
) => {
  console.log("Creating vendor:", vendor);

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
  const vendorData = await prepareVendorInsertData(vendor);

  console.log("Updated vendor insert data:", vendorData);

  // Proceed with vendor creation
  const { data, error } = await supabase.from("vendors").insert(vendorData).select("id, slug").single();

  if (data && data.id && data.slug) {
    console.log("Vendor created successfully!", data);

    await supabase.rpc("update_vendor_location", { vendor_id: data.id });
    console.log("Vendor region updated successfully!", data);

    // Add tags to the vendor
    tags.map(async (tag) => {
      const { error: skillError } = await supabase
        .from("vendor_tags")
        .insert({ vendor_id: data.id, tag_id: tag.id });

      if (skillError) {
        console.error(`Error adding tag ${tag.unique_tag} to new vendor id ${data.id}`, skillError);
      }
    })

    // Create a contact in HubSpot if email is provided
    if (vendor.email) {
      const hubspotContactId = await createHubSpotContact({
        email: vendor.email,
        firstname: firstname,
        lastname: lastname,
        slug: data.slug,
        company: vendor.business_name ?? '',
      });

      if (!hubspotContactId) {
        console.error("Failed to create HubSpot contact for vendor:", data.slug);
      }
      console.log("HubSpot contact created successfully!", hubspotContactId);
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