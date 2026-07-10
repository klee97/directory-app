import { fetchApi } from '@/lib/api/client';
import { LeadFormData, PartialLead } from '@/types/leads';
import { VendorInfo } from '@/types/leads';

export const submitToAirtable = async (
  data: LeadFormData,
  vendor: VendorInfo
): Promise<boolean> => {
  const result = await fetchApi<{ recordId: string }>('/api/airtable/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData: data, vendor }),
  });

  if (!result.ok) {
    console.error('Failed to save lead:', result.error);
    return false;
  }

  return true;
};

export const savePartialLeadToAirtable = async (
  partialLead: PartialLead
): Promise<boolean> => {
  const result = await fetchApi<{ recordId: string }>('/api/airtable/partial-leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partialLead),
  });

  if (!result.ok) {
    console.error('Failed to save partial lead:', result.error);
    return false;
  }

  return true;
};

export const submitVendorFeedback = async (
  vendorId: string,
  businessName: string,
  comment: string
): Promise<boolean> => {
  const result = await fetchApi<{ recordId: string }>('/api/airtable/vendor-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId, businessName, comment }),
  });

  if (!result.ok) {
    console.error('Vendor feedback submission error:', result.error);
    return false;
  }

  return true;
};

export const submitWebsiteInterest = async (
  vendorId: string,
  businessName: string,
  priority: string
): Promise<boolean> => {
  const result = await fetchApi<{ recordId: string }>('/api/airtable/website-interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId, businessName, priority }),
  });

  if (!result.ok) {
    console.error('Website interest submission error:', result.error);
    return false;
  }

  return true;
};

export async function submitPremiumWaitlist(
  vendorId: string,
  businessName: string,
): Promise<boolean> {
  const result = await fetchApi<{ recordId: string }>('/api/airtable/premium-interest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vendorId, businessName }),
  });

  if (!result.ok) {
    console.error('Premium waitlist submission error:', result.error);
    return false;
  }

  return result.ok;
}