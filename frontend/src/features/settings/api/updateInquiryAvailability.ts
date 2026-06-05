"use server";
import { createServerClient } from "@/lib/supabase/clients/serverClient";

export async function updateInquiryAvailability(vendorId: string, enabled: boolean) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("vendors")
    .update({
      inquiries_opted_out_at: enabled ? null : new Date().toISOString(),
    })
    .eq("id", vendorId);

  if (error) {
    return { error: 'Failed to update inquiry settings. Please try again later.' };
  }

  return { error: null };
}
