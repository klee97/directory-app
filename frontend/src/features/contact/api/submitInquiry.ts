import { LeadFormData } from '@/types/leads';
import { VendorTag } from '@/types/vendor';
import { fetchApi } from '@/lib/api/client';

interface VendorInfo {
  id: string;
  serviceTags: VendorTag[];
}

export interface SubmitInquiryResponse {
  id: string;
}

export async function submitInquiryToSupabase(
  formData: LeadFormData,
  vendor: VendorInfo
): Promise<boolean> {
  const response = await fetchApi<SubmitInquiryResponse>('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendor_id: vendor.id,
      isTestRecord: formData.isTestRecord,
      services: formData.services,
      peopleCount: formData.peopleCount,
      flexibleCount: formData.flexibleCount,
      makeupStyles: formData.makeupStyles,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      location: formData.location,
      weddingDate: formData.weddingDate,
      flexibleDate: formData.flexibleDate,
      budget: formData.budget,
      additionalDetails: formData.additionalDetails,
    }),
  });

  if (!response.ok) {
    console.error('Supabase inquiry submission failed:', response.code, response.error);
    return false;
  }

  return true;
}