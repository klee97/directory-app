import { z } from 'zod';

// leadFormSchema below describes what the api accepts over the wire
//
// Field names here are camelCase, matching LeadFormData, NOT the DB's
// snake_case inquiries columns — the API route does that translation.
//
// Deliberately NOT accepted here (server-controlled or set later):
//   id, inquiry_status, outcome_status, submitted_at, airtable_record_id,
//   contacted_at, expires_at, unlocked_at, declined_at, booked_trial_at,
//   booked_wedding_at, stripe_payment_id, unlock_method, unlock_price,
//   created_at, updated_at, is_budget_flexible (no UI control for this yet)
export const leadFormSchema = z.object({
  vendor_id: z.string().min(1, 'vendor_id is required'),
  isTestRecord: z.boolean().default(false),

  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Enter a valid email address').max(255),
  additionalDetails: z.string().trim().min(1, 'Message is required').max(5000),

  weddingDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'weddingDate must be YYYY-MM-DD')
    .optional(),
  flexibleDate: z.boolean().default(false),

  location: z.string().trim().min(1, 'Location is required').max(255),

  // Sent as a string from the form's number input; coerce + validate here.
  budget: z.coerce
    .number({
      error: () => "Enter a valid budget"
    })
    .nonnegative()
    .max(1_000_000),

  peopleCount: z.coerce
    .number({
      error: () => "Enter a valid number of people"
    })
    .int()
    .positive()
    .max(1000),
  flexibleCount: z.boolean().default(false),

  // Expected to be an array of tag ids, not tag names
  services: z
    .array(z.guid('Each service must be a valid tag id'))
    .min(1, 'At least one service is required'),

  makeupStyles: z.array(z.string().trim().max(100)).default([]),
});

export type LeadFormWireInput = z.infer<typeof leadFormSchema>;