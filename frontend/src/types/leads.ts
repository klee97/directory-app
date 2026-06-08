
export interface LeadFormData {
  isTestRecord: boolean;

  // Step 1: Services & Event Details
  services: string[];
  peopleCount: string;
  flexibleCount: boolean;

  // Step 2: Event details
  firstName: string;
  lastName: string;
  email: string;
  location: string;
  weddingDate: string;
  flexibleDate: boolean;
  budget: string;
  additionalDetails: string;

  // Step 3: Style & Preferences
  makeupStyles: string[];
}

export interface LeadFormErrors {
  [key: string]: string | null;
}

export interface VendorInfo {
  businessName: string;
  slug: string;
  id: string;
}

export interface PartialLead {
  formData: Partial<LeadFormData>;
  vendor: VendorInfo;
  status: LeadStatus;
  stepNumber: number;
  fieldsCompleted: string[];
  timeSpent: number;
  timestamp: string;
}

export enum LeadStatus {
  FORM_STARTED = 'form_started',
  STEP_1_COMPLETED = 'step_1_completed',
  STEP_2_WITH_EMAIL = 'step_2_with_email',
  ABANDONED = 'abandoned'
}
