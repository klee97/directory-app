"use server";

import { createServerClient } from "@/lib/supabase/clients/serverClient";


export async function updateWebsiteInterest({
  mediaId,
  credits,
  consentGiven,
}: {
  mediaId: string;
  credits: string | null;
  consentGiven: boolean;
}) {
  // Get current session to verify user is authenticated
  const supabaseServerClient = await createServerClient();

  const { data: { user }, error: sessionError } = await supabaseServerClient.auth.getUser();

  if (!user || sessionError) {
    return { success: false, error: "You must be logged in to perform this action" };
  }

  const { error } = await supabaseServerClient
    .from("vendor_media")
    .update({ consent_given: consentGiven, credits })
    .eq("id", mediaId);

  if (error) {
    return { success: false, error: `Failed to update media consent: ${error.message}` };
  }

  return { success: true };
}
