import { revalidateVendor, revalidateVendors } from '@/lib/actions/revalidate';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!REVALIDATE_SECRET || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { slug } = body;

  if (slug) {
    // Revalidate a specific vendor
    revalidateVendor(slug);
    return NextResponse.json({ revalidated: true, slug });
  } else {
    // Revalidate all vendors
    revalidateVendors();
    return NextResponse.json({ revalidated: true, scope: 'all-vendors' });
  }
}