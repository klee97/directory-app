import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from './proxy';
import { guardBlogPreview } from '@/lib/blogPreview/guardBlogPreview';
import { updateSession } from '@/lib/supabase/middleware';

vi.mock('@/lib/blogPreview/guardBlogPreview', () => ({
  guardBlogPreview: vi.fn(),
}));

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn(),
}));

const mockGuard = vi.mocked(guardBlogPreview);
const mockUpdateSession = vi.mocked(updateSession);

function makeRequest(path: string) {
  return new NextRequest(new URL(path, 'https://example.com'));
}

describe('proxy', () => {
  beforeEach(() => {
    mockGuard.mockReset();
    mockUpdateSession.mockReset();
  });

  it('falls through to updateSession when guard finds nothing to gate', async () => {
    mockGuard.mockResolvedValue(null);
    const sessionResponse = new Response('ok');
    mockUpdateSession.mockResolvedValue(sessionResponse as never);

    const result = await proxy(makeRequest('/blog/published-post'));

    expect(result).toBe(sessionResponse);
    expect(mockUpdateSession).toHaveBeenCalled();
  });

  it('returns the guard redirect without calling updateSession when gated', async () => {
    const redirect = new Response(null, { status: 307, headers: { location: '/blog-preview-auth' } });
    mockGuard.mockResolvedValue(redirect as never);

    const result = await proxy(makeRequest('/blog/future-post'));

    expect(result).toBe(redirect);
    expect(mockUpdateSession).not.toHaveBeenCalled();
  });

  it('fails closed with a 503 when guardBlogPreview rejects', async () => {
    mockGuard.mockRejectedValue(new Error('Contentful is down'));

    const result = await proxy(makeRequest('/blog/some-post'));

    expect(result.status).toBe(503);
    expect(mockUpdateSession).not.toHaveBeenCalled();
  });

  it('includes a Retry-After header on the fail-closed response', async () => {
    mockGuard.mockRejectedValue(new Error('network timeout'));

    const result = await proxy(makeRequest('/blog/some-post'));

    expect(result.headers.get('Retry-After')).toBe('30');
  });

  it('does not update the session or leak through when the guard throws a non-Error value', async () => {
    mockGuard.mockRejectedValue('unexpected string rejection');

    const result = await proxy(makeRequest('/blog/some-post'));

    expect(result.status).toBe(503);
    expect(mockUpdateSession).not.toHaveBeenCalled();
  });
});