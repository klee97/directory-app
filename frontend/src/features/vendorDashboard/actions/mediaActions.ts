"use server";

import { createClient } from "@/lib/supabase/server";


export async function updateMediaConsent({
  mediaId,
  credits,
  consentGiven,
}: {
  mediaId: string;
  credits: string | null;
  consentGiven: boolean;
}) {
  // Get current session to verify user is authenticated
  const supabase = await createClient();

  const { data: { user }, error: sessionError } = await supabase.auth.getUser();

  if (!user || sessionError) {
    return { success: false, error: "You must be logged in to perform this action" };
  }

  const { error } = await supabase
    .from("vendor_media")
    .update({ consent_given: consentGiven, credits })
    .eq("id", mediaId);

  if (error) {
    return { success: false, error: `Failed to update media consent: ${error.message}` };
  }

  return { success: true };
}
