import { revalidateBlog } from '@/lib/actions/revalidate';
import { apiError, apiSuccess } from '@/lib/api/respond';
import { NextRequest } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!REVALIDATE_SECRET || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return apiError('Unauthorized', 401);
  }

  revalidateBlog();
  return apiSuccess({ revalidated: true, scope: 'all-posts' });
}