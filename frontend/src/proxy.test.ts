import { it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { proxy } from './proxy';

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(async () => NextResponse.next()),
}));
beforeEach(() => vi.clearAllMocks());

it('skips updateSession when a directory redirect fires', async () => {
  const req = new NextRequest(new Request('https://www.asianweddingmakeup.com/?lat=37.7793&lon=-122.4193'));
  const res = await proxy(req);

  expect(res.status).toBe(301);
  expect(updateSession).not.toHaveBeenCalled();
});

it('calls updateSession when no redirect is needed', async () => {
  const req = new NextRequest(new Request('https://www.asianweddingmakeup.com/'));
  await proxy(req);

  expect(updateSession).toHaveBeenCalledOnce();
});