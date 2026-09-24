import { LeadFormData } from '@/types/leads';
import { fetchApi } from '@/lib/api/client';

export interface SubmitInquiryResponse {
  id: string;
}

export async function submitInquiryToSupabase(
  formData: LeadFormData,
  vendorId: string,
  airtableRecordId: string | null
): Promise<boolean> {
  const response = await fetchApi<SubmitInquiryResponse>('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendor_id: vendorId,
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
      airtableRecordId: airtableRecordId,
    }),
  });

  if (!response.ok) {
    console.error('Supabase inquiry submission failed:', response.code, response.error);
    return false;
  }

  return true;
}