import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { guardBlogPreview, safeRedirectTarget } from './guardBlogPreview';
import { getBlogPublishStatus } from '@/features/blog/api/getBlogPublishStatus';

vi.mock('@/features/blog/api/getBlogPublishStatus', () => ({
  getBlogPublishStatus: vi.fn(),
}));

const mockGetStatus = vi.mocked(getBlogPublishStatus);
const ORIGINAL_ENV = process.env;

function makeRequest(path: string, opts: { cookie?: string } = {}) {
  const headers = new Headers();
  if (opts.cookie) headers.set('cookie', `preview-auth=${opts.cookie}`);
  return new NextRequest(new URL(path, 'https://example.com'), { headers });
}

describe('guardBlogPreview', () => {
  beforeEach(() => {
    mockGetStatus.mockReset();
    process.env = { ...ORIGINAL_ENV, BLOG_PREVIEW_PASSWORD: 'correct-password' };
  });

  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it('passes through non-blog routes untouched', async () => {
    const result = await guardBlogPreview(makeRequest('/about'));
    expect(result).toBeNull();
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('passes through published posts', async () => {
    mockGetStatus.mockResolvedValue('published');
    const result = await guardBlogPreview(makeRequest('/blog/my-post'));
    expect(result).toBeNull();
  });

  it('passes through not-found slugs (lets the page 404 naturally)', async () => {
    mockGetStatus.mockResolvedValue('not-found');
    const result = await guardBlogPreview(makeRequest('/blog/nonexistent'));
    expect(result).toBeNull();
  });

  it('decodes a percent-encoded unpublished slug before lookup', async () => {
    mockGetStatus.mockImplementation(async (slug) =>
      slug === 'café-wedding' ? 'unpublished' : 'published'
    );
    const result = await guardBlogPreview(makeRequest('/blog/caf%C3%A9-wedding'));

    expect(result).not.toBeNull();
    expect(mockGetStatus).toHaveBeenCalledWith('café-wedding');
  });

  it('falls back to the raw slug when percent-encoding is malformed', async () => {
    mockGetStatus.mockResolvedValue('not-found');
    // "%E0%A4%A" is a truncated/invalid UTF-8 percent sequence — decodeURIComponent
    // would throw on this; guardBlogPreview should catch it and use the raw string.
    const result = await guardBlogPreview(makeRequest('/blog/bad-%E0%A4%A-slug'));

    expect(result).toBeNull(); // not-found -> passes through, doesn't crash
    expect(mockGetStatus).toHaveBeenCalledWith('bad-%E0%A4%A-slug');
  });

  it('redirects unauthorized visitors away from unpublished posts', async () => {
    mockGetStatus.mockResolvedValue('unpublished');
    const result = await guardBlogPreview(makeRequest('/blog/future-post'));

    expect(result).not.toBeNull();
    const location = new URL(result!.headers.get('location')!);
    expect(location.pathname).toBe('/blog-preview-auth');
    expect(location.searchParams.get('redirectTo')).toBe('/blog/future-post');
  });

  it('preserves query params in redirectTo', async () => {
    mockGetStatus.mockResolvedValue('unpublished');
    const result = await guardBlogPreview(makeRequest('/blog/future-post?foo=bar'));

    const location = new URL(result!.headers.get('location')!);
    expect(location.searchParams.get('redirectTo')).toBe('/blog/future-post?foo=bar');
  });

  it('lets authorized visitors through to unpublished posts', async () => {
    const result = await guardBlogPreview(makeRequest('/blog/future-post', { cookie: 'correct-password' }));
    expect(result).toBeNull();
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('skips the publish-status lookup entirely for authorized visitors', async () => {
    const result = await guardBlogPreview(makeRequest('/blog/future-post', { cookie: 'correct-password' }));
    expect(result).toBeNull();
    expect(mockGetStatus).not.toHaveBeenCalled();
  });

  it('does not redirect an authorized visitor away from an actual blog post', async () => {
    mockGetStatus.mockResolvedValue('published');
    const result = await guardBlogPreview(makeRequest('/blog/some-published-post', { cookie: 'correct-password' }));
    expect(result).toBeNull();
  });

  it('does not authorize with the wrong cookie value', async () => {
    mockGetStatus.mockResolvedValue('unpublished');
    const result = await guardBlogPreview(makeRequest('/blog/future-post', { cookie: 'wrong-password' }));
    expect(result).not.toBeNull();
  });

  it('does not authorize when BLOG_PREVIEW_PASSWORD is unset', async () => {
    delete process.env.BLOG_PREVIEW_PASSWORD;
    mockGetStatus.mockResolvedValue('unpublished');
    const result = await guardBlogPreview(makeRequest('/blog/future-post', { cookie: 'anything' }));
    expect(result).not.toBeNull();
  });

  describe('on /blog-preview-auth', () => {
    it('shows the form when not authorized', async () => {
      const result = await guardBlogPreview(makeRequest('/blog-preview-auth'));
      expect(result).toBeNull();
      expect(mockGetStatus).not.toHaveBeenCalled();
    });

    it('redirects to /blog by default when already authorized with no redirectTo', async () => {
      const result = await guardBlogPreview(makeRequest('/blog-preview-auth', { cookie: 'correct-password' }));

      const location = new URL(result!.headers.get('location')!);
      expect(location.pathname).toBe('/blog');
    });

    it('redirects to redirectTo when already authorized', async () => {
      const result = await guardBlogPreview(
        makeRequest('/blog-preview-auth?redirectTo=%2Fblog%2Ffuture-post', { cookie: 'correct-password' })
      );

      const location = new URL(result!.headers.get('location')!);
      expect(location.pathname).toBe('/blog/future-post');
    });

    it('falls back to /blog for an absolute-URL redirectTo (open redirect guard)', async () => {
      const result = await guardBlogPreview(
        makeRequest('/blog-preview-auth?redirectTo=https%3A%2F%2Fevil.com', { cookie: 'correct-password' })
      );

      const location = new URL(result!.headers.get('location')!);
      expect(location.pathname).toBe('/blog');
      expect(location.hostname).toBe('example.com');
    });

    it('falls back to /blog for a protocol-relative redirectTo (open redirect guard)', async () => {
      const result = await guardBlogPreview(
        makeRequest('/blog-preview-auth?redirectTo=%2F%2Fevil.com', { cookie: 'correct-password' })
      );

      const location = new URL(result!.headers.get('location')!);
      expect(location.pathname).toBe('/blog');
      expect(location.hostname).toBe('example.com');
    });
  });

  describe('safeRedirectTarget', () => {
    it('preserves the query string of a safe relative path', () => {
      const result = safeRedirectTarget('/blog/future-post?foo=bar&baz=qux');
      expect(result).toEqual({ pathname: '/blog/future-post', search: '?foo=bar&baz=qux' });
    });

    it('falls back to /blog for a backslash-prefixed target', () => {
      const result = safeRedirectTarget('/\\evil.com');
      expect(result).toEqual({ pathname: '/blog', search: '' });
    });

    it('falls back to /blog for a double-backslash target', () => {
      const result = safeRedirectTarget('\\\\evil.com');
      expect(result).toEqual({ pathname: '/blog', search: '' });
    });

    it('falls back to /blog for a backslash embedded mid-path', () => {
      const result = safeRedirectTarget('/blog\\@evil.com');
      expect(result).toEqual({ pathname: '/blog', search: '' });
    });

    it('falls back to /blog for a protocol-relative target', () => {
      const result = safeRedirectTarget('//evil.com');
      expect(result).toEqual({ pathname: '/blog', search: '' });
    });

    it('falls back to /blog for an absolute external URL', () => {
      const result = safeRedirectTarget('https://evil.com/phishing');
      expect(result).toEqual({ pathname: '/blog', search: '' });
    });

    it('falls back to /blog for null or empty input', () => {
      expect(safeRedirectTarget(null)).toEqual({ pathname: '/blog', search: '' });
      expect(safeRedirectTarget('')).toEqual({ pathname: '/blog', search: '' });
    });
  });
});