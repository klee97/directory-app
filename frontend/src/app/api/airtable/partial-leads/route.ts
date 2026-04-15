import { NextRequest, NextResponse } from 'next/server';
import { getPartialLeadsTable } from '@/lib/airtable/constants';

export async function POST(req: NextRequest) {
  const partialLead = await req.json();

  try {
    const record = await getPartialLeadsTable().create([
      {
        fields: {
          'Step Number': partialLead.stepNumber,
          'Fields Completed': partialLead.fieldsCompleted?.join(', '),
          'Time Spent (seconds)': partialLead.timeSpent,
          'Timestamp': partialLead.timestamp,
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

    const success = record.length > 0;
    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error('Error saving partial lead to Airtable:', error);
    return NextResponse.json({ error: 'Failed to save partial lead.' }, { status: 502 });
  }
}
