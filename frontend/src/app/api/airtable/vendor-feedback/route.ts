import { NextRequest } from 'next/server';
import { getVendorFeedbackTable } from '@/lib/airtable/constants';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { vendorId, businessName, comment } = await req.json();

  if (!vendorId || !businessName || !comment) {
    return apiError('All fields are required.', 400);
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
    return apiSuccess({ success });
  } catch (error) {
    console.error("Vendor feedback submission error:", error);
    return apiError('Failed to submit feedback.', 502);
  }
}
