import { z } from "zod";
import { requireAdmin, authErrorResponse } from "@/lib/auth/requireAdmin";
import { apiSuccess, apiFail } from "@/lib/api/respond";
import { INQUIRY_STATUS } from "@/lib/inquiries/status";
import { INQUIRY_UNLOCK_WINDOW_DAYS } from "@/lib/inquiries/config";

const DAY_MS = 24 * 60 * 60 * 1000;

// Single-value enum on purpose: adding "reject" later is a one-line change
// here plus a new branch below, and clients already send { action }.
const reviewActionSchema = z.object({
  action: z.enum(["approve"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idParsed = z.string().uuid().safeParse(id);
  if (!idParsed.success) return apiFail("not_found");

  let admin, supabase;
  try {
    ({ user: admin, supabase } = await requireAdmin());
  } catch (err) {
    return authErrorResponse(err);
  }

  const parsed = reviewActionSchema.safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) return apiFail("invalid_body");

  // One `now` so reviewed_at and expires_at can't disagree.
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + INQUIRY_UNLOCK_WINDOW_DAYS * DAY_MS
  );

  // Atomic guard: the pending_review check lives in the UPDATE's WHERE
  // clause, not in a separate read beforehand. A read-then-write would race:
  // two concurrent requests could both read "still pending_review" before
  // either write lands. Scoping the update itself means only the first write
  // can match a row; the second matches zero rows and no-ops.
  const { data: updated, error: updateError } = await supabase
    .from("inquiries")
    .update({
      inquiry_status: INQUIRY_STATUS.Available, // review-approved, awaiting vendor action
      reviewed_by: admin.id,
      reviewed_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .eq("id", idParsed.data)
    .eq("inquiry_status", INQUIRY_STATUS.PendingReview)
    .select("id, inquiry_status, expires_at")
    .maybeSingle();

  if (updateError) {
    console.error("[update_failed] Failed to approve inquiry", updateError);
    return apiFail("update_failed");
  }

  if (!updated) {
    // Zero rows matched: either the id doesn't exist, or another request
    // already moved it out of pending_review. Only do this (rare) follow-up
    // read to tell the two cases apart.
    const { data: current } = await supabase
      .from("inquiries")
      .select("inquiry_status")
      .eq("id", idParsed.data)
      .maybeSingle();

    if (!current) return apiFail("not_found");
    return apiFail(
      "already_reviewed",
      `Inquiry is already ${current.inquiry_status}, not ${INQUIRY_STATUS.PendingReview}`
    );
  }

  return apiSuccess({
    id: updated.id,
    inquiry_status: updated.inquiry_status,
    expires_at: updated.expires_at,
  });
}