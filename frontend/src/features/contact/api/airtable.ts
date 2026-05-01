import { FormData, PartialLead } from '@/features/contact/components/LeadCaptureForm';

interface VendorInfo {
  name: string;
  slug: string;
}

export const submitToAirtable = async (
  data: FormData,
  vendor: VendorInfo
): Promise<boolean> => {
  try {
    const response = await fetch('/api/airtable/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData: data, vendor }),
    });

    if (!response.ok) {
      console.error('Failed to save lead error status:', response.status);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error saving lead:', error);
    return false;
  }
};

export const savePartialLeadToAirtable = async (
  partialLead: PartialLead
): Promise<boolean> => {
  try {
    const response = await fetch('/api/airtable/partial-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partialLead),
    });

    if (!response.ok) {
      console.error('Failed to save partial lead error status:', response.statusText);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Error saving partial lead:', error);
    throw error;
  }
};

export const submitVendorFeedback = async (
  vendorId: string,
  businessName: string,
  comment: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/airtable/vendor-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, businessName, comment }),
    });

    if (!response.ok) {
      console.error("Vendor feedback submission error status:", response.status);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error("Vendor feedback submission error:", error);
    return false;
  }
};

export const submitWebsiteInterest = async (
  vendorId: string,
  businessName: string,
  priority: string
): Promise<boolean> => {
  try {
    const response = await fetch('/api/airtable/website-interest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendorId, businessName, priority }),
    });

    if (!response.ok) {
      console.error('Website interest submission error:', response.status);
      return false;
    }

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Website interest submission error:', error);
    return false;
  }
};


export async function submitPremiumWaitlist(
  vendorId: string,
  businessName: string,
): Promise<boolean> {
  try {
    const res = await fetch("/api/airtable/premium-interest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendorId, businessName }),
    });
    return res.ok;
  } catch {
    return false;
  }
}