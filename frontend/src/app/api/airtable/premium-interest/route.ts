import { NextRequest } from 'next/server';
import { getPremiumInterestTable } from '@/lib/airtable/constants';
import { supabaseAdminClient } from '@/lib/supabase/clients/adminClient';
import { apiError, apiSuccess } from '@/lib/api/respond';

export async function POST(req: NextRequest) {
  const { vendorId, businessName } = await req.json();

  if (!vendorId) {
    return apiError('Required fields are missing.', 400);
  }
  // Write to Airtable
  let airtableSuccess = false;
  try {
    const record = await getPremiumInterestTable().create([{
      fields: {
        'Vendor ID': vendorId,
        'Business Name': businessName,
        'Status': 'New',
      }
    }]);
    airtableSuccess = record.length > 0;
  } catch (error) {
    console.error('Airtable premium interest error:', error);
    return apiError('Failed to submit.', 502);
  }

  // Write to Supabase — non-blocking, log but don't fail the request
  if (airtableSuccess) {
    const { error: supabaseError } = await supabaseAdminClient
      .from('vendors')
      .update({ premium_interest_submitted: true })
      .eq('id', vendorId);

    if (supabaseError) {
      console.error('Supabase premium interest update error:', supabaseError);
    }
  }

  return apiSuccess({ success: airtableSuccess });
}