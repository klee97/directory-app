import { requireAdmin, authErrorResponse } from "@/lib/auth/requireAdmin";
import { apiSuccess, apiFail } from "@/lib/api/respond";
import { INQUIRY_STATUS } from "@/lib/inquiries/status";

/**
 * Manual review queue: every inquiry still awaiting a decision, oldest first.
 * No automated pre-filtering — per the current scope, ALL new inquiries land
 * here until a human approves or rejects them.
 */
export async function GET() {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch (err) {
    return authErrorResponse(err);
  }

  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("inquiry_status", INQUIRY_STATUS.PendingReview)
    .order("submitted_at", { ascending: true });

  if (error) {
    console.error("[queue_fetch_failed] Failed to fetch pending_review inquiries", error);
    return apiFail("queue_fetch_failed");
  }

  return apiSuccess({ inquiries: data });
}