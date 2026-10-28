import { Enums } from "@/types/supabase";

export type InquiryStatus = Enums<"inquiry_status">;

// satisfies makes a typo or a removed enum value a compile error
export const INQUIRY_STATUS = {
  PendingReview: "pending_review",
  Available: "available",
  Unlocked: "unlocked",
  Declined: "declined",
  Expired: "expired",
  BookedTrialOrWedding: "booked_trial_or_wedding",
} as const satisfies Record<string, InquiryStatus>;