import { revalidateBlog } from '@/lib/actions/revalidate';
import { NextRequest, NextResponse } from 'next/server';

const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!REVALIDATE_SECRET || authHeader !== `Bearer ${REVALIDATE_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  revalidateBlog();
  return NextResponse.json({ revalidated: true, scope: 'all-posts' });
}