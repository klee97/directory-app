import { LeadStatus } from "@/features/contact/components/LeadCaptureForm";

export interface BaseTrackingData {
  timestamp?: string;
}

export interface VendorInfo {
  slug: string;
  id?: string;
}

export interface FormStartedData extends BaseTrackingData {
  vendor_slug: string;
  form_type: 'vendor_contact';
}

export interface FormSubmissionData extends BaseTrackingData {
  form_type: 'vendor_contact';
  vendor_slug: string;
  services: string;
  location: string;
  people_count: string;
  budget: string;
  wedding_date: string;
  time_to_complete: number;
}

export interface FormValidationErrorData extends BaseTrackingData {
  step_number: number;
  error_fields: string[];
  vendor_slug: string;
  form_type: 'vendor_contact';
}

export interface PartialLeadSavedData extends BaseTrackingData {
  status: LeadStatus;
  fields_completed: number;
  vendor_slug: string;
}

export interface FormStepBackData extends BaseTrackingData {
  vendor_slug: string;
}

export interface FormSubmissionErrorData extends BaseTrackingData {
  vendor_slug: string;
  error_message: string;
}

export interface StepProgressData extends BaseTrackingData {
  step_number: number;
  vendor_slug: string;
}

export interface FormAbandonmentData extends BaseTrackingData {
  step_number: number;
  fields_completed: string[];
  time_to_complete: number;
  vendor_slug: string;
  vendor_id?: string;
  abandonment_reason: 'component_unmount' | 'user_closed';
}

const trackEvent = <T extends BaseTrackingData>(
  eventName: string,
  data: T
): void => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...data,
    timestamp: data.timestamp || new Date().toISOString()
  });
};

// Specific tracking functions with type safety
export const trackFormStarted = (data: FormStartedData) => {
  trackEvent('form_started', data);
};

export const trackVendorContactFormSubmission = (data: FormSubmissionData) => {
  trackEvent('vendor_contact_form_submission', data);
};

export const trackFormValidationErrors = (data: FormValidationErrorData) => {
  trackEvent('form_validation_errors', data);
};

export const trackPartialLeadSaved = (data: PartialLeadSavedData) => {
  trackEvent('partial_lead_saved', data);
};

export const trackFormStepBack = (data: FormStepBackData) => {
  trackEvent('form_step_back', data);
};

export const trackFormSubmissionError = (data: FormSubmissionErrorData) => {
  trackEvent('form_submission_error', data);
};

export const trackStepProgress = (data: StepProgressData) => {
  trackEvent('step_progress', data);
};

export const trackFormAbandonment = (data: FormAbandonmentData) => {
  trackEvent('form_abandonment', data);
};

// Generic tracking function for any other events (fallback)
export const trackGenericFormEvent = <T extends BaseTrackingData>(eventName: string, data: T) => {
  console.warn(`Using generic tracking for event: ${eventName}. Consider creating a specific typed function.`);
  trackEvent(eventName, data);
};