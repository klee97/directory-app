import { NextResponse } from 'next/server';
import { getTags } from '@/features/profile/common/api/getTags';

export async function GET() {
  const tags = await getTags();
  return NextResponse.json(tags);
}
