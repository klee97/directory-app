import { NextRequest, NextResponse } from 'next/server';
import { getVendorFeedbackTable } from '@/lib/airtable/constants';

export async function POST(req: NextRequest) {
  const { vendorId, businessName, comment } = await req.json();

  if (!vendorId || !businessName || !comment) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  try {
    const record = await getVendorFeedbackTable().create([
      {
        fields: {
          "Vendor Id": vendorId,
          "Business Name": businessName,
          "Comment": comment.trim()
        },
      },
    ]);

    const success = record.length > 0;
    return NextResponse.json({ ok: success });
  } catch (error) {
    console.error("Vendor feedback submission error:", error);
    return NextResponse.json({ error: 'Failed to submit feedback.' }, { status: 502 });
  }
}
