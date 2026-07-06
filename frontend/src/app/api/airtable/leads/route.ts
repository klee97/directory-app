import { NextRequest } from 'next/server';
import { getLeadsTable, getVendorsTable } from '@/lib/airtable/constants';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { formData, vendor } = await req.json();

  if (!formData.email || !formData.firstName || !formData.lastName) {
    return apiError('Required fields are missing.', 400);
  }

  try {
    // Try to find the Vendor record ID that matches the slug
    let vendorRecordId: string | undefined;

    try {
      const vendorRecords = await getVendorsTable()
        .select({ filterByFormula: `{Slug} = '${vendor.slug}'` })
        .firstPage();

      if (vendorRecords.length > 0) {
        vendorRecordId = vendorRecords[0].id;
      } else {
        console.warn(`Vendor not found for slug: ${vendor.slug}. Recording inquiry without vendor link.`);
      }
    } catch (vendorError) {
      console.error('Error fetching vendor:', vendorError);
    }

    const fields: Record<string, string | number | boolean | string[]> = {
      'Email': formData.email,
      'First Name': formData.firstName,
      'Last Name': formData.lastName,
      'Wedding Date': formData.weddingDate,
      'Is Flexible Date?': formData.flexibleDate,
      'Location': formData.location,
      'Makeup Styles': formData.makeupStyles.join(', '),
      'People Count': parseInt(formData.peopleCount),
      'Is Flexible Count?': formData.flexibleCount,
      'Services Requested': formData.services,
      'Budget': parseInt(formData.budget),
      'Additional Details': formData.additionalDetails,
      'Business Name': vendor.businessName,
      'Vendor Slug': vendor.slug,
      'Submission Date': new Date().toISOString().split('T')[0],
      'Test Record': formData.isTestRecord,
      'Status': 'New',
    };

    if (vendorRecordId) {
      fields['Vendor'] = [vendorRecordId];
    }

    const record = await getLeadsTable().create([{ fields }]);
    const success = record.length > 0;

    return apiSuccess({ success });
  } catch (error) {
    console.error('Airtable submission error:', error);
    return apiError('Failed to submit lead.', 502);
  }
}
