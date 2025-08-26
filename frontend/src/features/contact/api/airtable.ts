"use server";
import { FormData } from '../components/LeadCaptureForm';
interface VendorInfo {
  name: string;
  slug: string;
}

export const submitToAirtable = async (
  data: FormData,
  vendor: VendorInfo
): Promise<boolean> => {
  const baseId = process.env.AIRTABLE_APP_ID;
  const tableName = process.env.AIRTABLE_LEADS_TABLE_NAME;
  const apiToken = process.env.AIRTABLE_API_TOKEN;

  const recordData = {
    records: [
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
    ],
  };

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recordData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Airtable submission successful:', result.records[0].id);
      return true;
    } else {
      const errorData = await response.json();
      console.error('Airtable submission failed:', errorData);
      return false;
    }
  } catch (error) {
    console.error('Airtable submission error:', error);
    return false;
  }
};
