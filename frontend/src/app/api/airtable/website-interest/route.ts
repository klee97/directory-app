import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteInterestTable } from '@/lib/airtable/constants';
import { createClient } from '@/lib/supabase/client';
import { supabase } from '@/lib/api-client';

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
        'Status': 'New',
      }
    }]);

    if (record.length > 0) {
      await supabase
        .from('vendors')
        .update({ website_interest_submitted: true })
        .eq('id', vendorId);
    }

    return NextResponse.json({ ok: record.length > 0 });
  } catch (error) {
    console.error('Airtable website interest error:', error);
    return NextResponse.json({ error: 'Failed to submit.' }, { status: 502 });
  }
}