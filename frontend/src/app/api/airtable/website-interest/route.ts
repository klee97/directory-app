import { NextRequest } from 'next/server';
import { getWebsiteInterestTable } from '@/lib/airtable/constants';
import { supabaseAdminClient } from '@/lib/supabase/clients/adminClient';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { vendorId, businessName, priority } = await req.json();

  if (!vendorId || !priority) {
    return apiError('Required fields are missing.', 400);
  }
  // Write to Airtable
  let airtableSuccess = false;
  try {
    const record = await getWebsiteInterestTable().create([{
      fields: {
        'Vendor ID': vendorId,
        'Business Name': businessName,
        'Priority': priority,
        'Status': 'New',
      }
    }]);
    airtableSuccess = record.length > 0;
    if (!airtableSuccess) {
      return apiError('Failed to submit website interest.', 502);
    }
  } catch (error) {
    console.error('Airtable website interest error:', error);
    return apiError('Failed to submit website interest.', 502);
  }

  // Write to Supabase — non-blocking, log but don't fail the request
  if (airtableSuccess) {
    const { error: supabaseError } = await supabaseAdminClient
      .from('vendors')
      .update({ website_interest_submitted: true })
      .eq('id', vendorId);

    if (supabaseError) {
      console.error('Supabase website interest update error:', supabaseError);
    }
  }

  return apiSuccess({});
}