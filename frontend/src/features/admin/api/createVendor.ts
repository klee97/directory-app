"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert } from "@/types/vendor";
import { prepareVendorInsertData } from "../components/vendorHelper";

export const createVendor = async (vendor: BackendVendorInsert) => {
  console.log("Creating vendor:", vendor);

  // Get current session to verify user is authenticated
  const supabase = await createClient();

  console.log("Authenticating...");

  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (!session) {
    return { error: "You must be logged in to perform this action" };
  }

  if (sessionError || !session) {
    console.error("Authentication error:", sessionError || "No active session");
    throw new Error("You must be logged in to perform this action");
  }

  // Check if user is an admin using the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .single();

  if (profileError || !profileData || !profileData.is_admin) {
    console.error("Authorization error: User is not an admin");
    throw new Error("You do not have permission to create vendors");
  }

  console.log("Vendor insert data:", vendor);
  const vendorData = await prepareVendorInsertData(vendor);

  console.log("Updated vendor insert data:", vendorData);

  // Proceed with vendor creation
  const { data, error } = await supabase.from("vendors").insert(vendorData).select("id").single();

  if (data && data.id) {
    await supabase.rpc("update_vendor_location", { vendor_id: data.id });
  }

  if (error) {
    console.error("Error creating vendor:", error);
    throw error;
  }

  console.log("Vendor created successfully!", data);
  return data;
};
