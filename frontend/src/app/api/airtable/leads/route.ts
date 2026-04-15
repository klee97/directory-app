import { NextRequest, NextResponse } from 'next/server';
import { getLeadsTable, getVendorsTable } from '@/lib/airtable/constants';

export async function POST(req: NextRequest) {
  const { formData, vendor } = await req.json();

  if (!formData.email || !formData.firstName || !formData.lastName) {
    return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
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
      'Business Name': vendor.name,
      'Vendor Slug': vendor.slug,
      'Submission Date': new Date().toISOString().split('T')[0],
      'Status': 'New',
    };

    if (vendorRecordId) {
      fields['Vendor'] = [vendorRecordId];
    }

    const record = await getLeadsTable().create([{ fields }]);
    const success = record.length > 0;

    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error('Airtable submission error:', error);
    return NextResponse.json({ error: 'Failed to submit lead.' }, { status: 502 });
  }
}
