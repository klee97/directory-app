"use server";
import { createClient } from "@/lib/supabase/server";
import { BackendVendorInsert } from "@/types/vendor";

export const createRecommendation = async (vendor: BackendVendorInsert) => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("vendor_recommendations").insert(vendor).select("id").single();

  if (error) {
    console.error("Error creating recommendation:", error);
    throw error;
  }

  console.log("Recommendation created successfully!", data);
  return data;
};
