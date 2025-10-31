import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // const { vendorId, draftData } = await request.json();

    // Save to draft_data column only
    // const { error } = await supabase
    //   .from('vendors')
    //   .update({ draft_data: draftData })
    //   .eq('id', vendorId)
    //   .eq('user_id', user.id);

    // if (error) {
    //   return Response.json({ error: error.message }, { status: 500 });
    // }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}