"use server";

import { CurrentUser, getCurrentUser } from "@/lib/auth/getUser";
import { createServerClient } from "@/lib/supabase/clients/serverClient";


export async function updateMediaConsent({
  mediaId,
  credits,
  consentGiven,
}: {
  mediaId: string;
  credits: string | null;
  consentGiven: boolean;
}) {
  const currentUser: CurrentUser | null = await getCurrentUser();
  if (!currentUser || !currentUser.email) {
    console.error("Authentication error: No active session");
    return { success: false, error: "You must be logged in to perform this action" };
  }

  const supabaseServerClient = await createServerClient();

  const { error } = await supabaseServerClient
    .from("vendor_media")
    .update({ consent_given: consentGiven, credits })
    .eq("id", mediaId);

  if (error) {
    return { success: false, error: `Failed to update media consent: ${error.message}` };
  }

  return { success: true };
}
