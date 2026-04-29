"use server";
import { createServerClient } from "@/lib/supabase/clients/serverClient";

export async function updateInquiryAvailability(vendorId: string, enabled: boolean) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("vendors")
    .update({
      approved_inquiries_at: enabled ? new Date().toISOString() : null,
    })
    .eq("id", vendorId);

  if (error) {
    return { error: 'Failed to update inquiry settings. Please try again later.' };
  }
}
