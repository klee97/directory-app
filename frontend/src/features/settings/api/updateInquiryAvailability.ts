"use server";
import { createClient } from "@/lib/supabase/server";

export async function updateInquiryAvailability(vendorId: string, enabled: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("vendors")
    .update({
      approved_inquiries_at: enabled ? new Date().toISOString() : null,
    })
    .eq("id", vendorId);

  if (error) {
    throw new Error("Failed to update inquiry settings");
  }
}
