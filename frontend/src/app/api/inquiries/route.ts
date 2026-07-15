import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { supabaseAdminClient } from "@/lib/supabase/clients/adminClient";
import { leadFormSchema } from "@/types/leadsValidation";
import type { ApiResponse } from "@/types/api";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { SubmitInquiryResponse } from "@/features/contact/api/submitInquiry";

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<SubmitInquiryResponse>>> {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return apiError("Request body must be valid JSON", 400, "INVALID_JSON");
  }

  let input;
  try {
    input = leadFormSchema.parse(body);
  } catch (err) {
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      return apiError(firstIssue?.message ?? "Validation failed", 422, "VALIDATION_ERROR");
    }
    throw err;
  }

  const { data, error } = await supabaseAdminClient
    .from("inquiries")
    .insert({
      vendor_id: input.vendor_id,

      bride_first_name: input.firstName,
      bride_last_name: input.lastName,
      bride_email: input.email,
      message: input.additionalDetails,

      location: input.location,

      wedding_date: input.weddingDate,
      is_wedding_date_flexible: input.flexibleDate,

      budget: input.budget,
      is_budget_flexible: false, // no flexibleBudget field in current form

      service_tag_ids: input.services,
      makeup_styles: input.makeupStyles.length > 0 ? input.makeupStyles : null,

      people_count: input.peopleCount,
      is_people_count_flexible: input.flexibleCount,

      // inquiry_status intentionally omitted -> table default 'pending_review'
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to insert inquiry", error);

    // The DB trigger (inquiries_validate_service_tag_ids) raises with this
    // message if a tag id doesn't exist or isn't a primary/service tag —
    // surface that distinctly rather than as a generic 500, since it
    // usually means stale client-side tag data, not a server problem.
    if (error.message?.includes("valid primary/service tag")) {
      return apiError(
        "One or more selected services are no longer valid",
        422,
        "INVALID_SERVICE_TAGS"
      );
    }

    return apiError("Could not save inquiry", 500, "INSERT_FAILED");
  }

  return apiSuccess({ id: data.id }, { status: 201 });
}