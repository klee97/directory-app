import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteInterestTable } from '@/lib/airtable/constants';

export async function POST(req: NextRequest) {
  const { vendorId, businessName, priority } = await req.json();

  if (!vendorId || !priority) {
    return NextResponse.json({ error: 'Required fields are missing.' }, { status: 400 });
  }

  try {
    const record = await getWebsiteInterestTable().create([{
      fields: {
        'Vendor ID': vendorId,
        'Business Name': businessName,
        'Priority': priority,
        'Submission Date': new Date().toISOString().split('T')[0],
        'Status': 'New',
      }
    }]);

    return NextResponse.json({ ok: record.length > 0 });
  } catch (error) {
    console.error('Airtable website interest error:', error);
    return NextResponse.json({ error: 'Failed to submit.' }, { status: 502 });
  }
}