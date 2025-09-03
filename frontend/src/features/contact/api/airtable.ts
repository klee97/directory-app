"use server";
import { getLeadsTable, getPartialLeadsTable } from '@/lib/airtable/constants';
import { FormData, PartialLead } from '../components/LeadCaptureForm';

interface VendorInfo {
  name: string;
  slug: string;
}

export const submitToAirtable = async (
  data: FormData,
  vendor: VendorInfo
): Promise<boolean> => {
  try {
    const record = await getLeadsTable().create([
      {
        fields: {
          'Email': data.email,
          'First Name': data.firstName,
          'Last Name': data.lastName,
          'Wedding Date': data.weddingDate,
          'Flexible Date': data.flexibleDate ? 'Yes' : 'No',
          'Location': data.location,
          'Makeup Styles': data.makeupStyles.join(', '),
          'People Count': parseInt(data.peopleCount),
          'Flexible Count': data.flexibleCount ? 'Yes' : 'No',
          'Services Requested': data.services,
          'Budget': parseInt(data.budget),
          'Additional Details': data.additionalDetails,
          'Vendor Name': vendor.name,
          'Vendor Slug': vendor.slug,
          'Submission Date': new Date().toISOString().split('T')[0],
          'Status': 'New',
        },
      },
    ]);
    return record.length > 0;
  } catch (error) {
    console.error('Airtable submission error:', error);
    return false;
  }
};

export const savePartialLeadToAirtable = async (partialLead: PartialLead) => {
  try {
    // Save to Partial Leads table
    const record = await getPartialLeadsTable().create([
      {
        fields: {
          'Step Number': partialLead.stepNumber,
          'Fields Completed': partialLead.fieldsCompleted?.join(', '),
          'Time Spent (seconds)': partialLead.timeSpent,
          'Timestamp': partialLead.timestamp,

          // Form data fields (flatten the JSON)
          'Email': partialLead.formData.email,
          'First Name': partialLead.formData.firstName,
          'Last Name': partialLead.formData.lastName,
          'Wedding Date': partialLead.formData.weddingDate ? partialLead.formData.weddingDate : undefined,
          'Flexible Date': partialLead.formData.flexibleDate ? 'Yes' : 'No',
          'Location': partialLead.formData.location,
          'Makeup Styles': partialLead.formData.makeupStyles?.join(', '),
          'People Count': partialLead.formData.peopleCount ? parseInt(partialLead.formData.peopleCount) : -1,
          'Flexible Count': partialLead.formData.flexibleCount ? 'Yes' : 'No',
          'Services Requested': partialLead.formData.services,
          'Budget': partialLead.formData.budget ? parseInt(partialLead.formData.budget) : -1,
          'Additional Details': partialLead.formData.additionalDetails,
          'Vendor Name': partialLead.vendor.name,
          'Vendor Slug': partialLead.vendor.slug,
          'Submission Date': new Date().toISOString().split('T')[0],
          'Completion Status': partialLead.status,
        }
      }
    ]);

    return record.length > 0;
  } catch (error) {
    console.error('Error saving partial lead to Airtable:', error);
    throw error;
  }
};