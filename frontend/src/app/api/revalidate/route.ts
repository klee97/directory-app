import { revalidateVendor, revalidateVendors } from '@/lib/actions/revalidate';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { NextRequest } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!REVALIDATE_SECRET || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return apiError('Unauthorized', 401);
  }

  const body = await request.json();
  const { slug } = body;

  if (slug) {
    // Revalidate a specific vendor
    revalidateVendor(slug);
    return apiSuccess({ revalidated: true, slug });
  } else {
    // Revalidate all vendors
    revalidateVendors();
    return apiSuccess({ revalidated: true, scope: 'all-vendors' });
  }
}