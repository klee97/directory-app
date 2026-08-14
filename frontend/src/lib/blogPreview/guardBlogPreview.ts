import { type NextRequest, NextResponse } from 'next/server';
import { getBlogPublishStatus } from '@/features/blog/api/getBlogPublishStatus';
import { PREVIEW_COOKIE } from './constants';

const BLOG_SLUG_PATTERN = /^\/blog\/([^/]+)\/?$/;
const PREVIEW_LOGIN_PATH = '/blog-preview-auth';

function isAuthorized(request: NextRequest): boolean {
  const previewPassword = process.env.BLOG_PREVIEW_PASSWORD;
  const cookie = request.cookies.get(PREVIEW_COOKIE)?.value;
  return Boolean(previewPassword) && cookie === previewPassword;
}

const SAFE_BASE_ORIGIN = 'http://localhost';

export function safeRedirectTarget(
  rawRedirectTo: string | null | undefined
): { pathname: string; search: string } {
  const fallback = { pathname: '/blog', search: '' };

  if (!rawRedirectTo) return fallback;

  // Backslashes are normalized to forward slashes by URL parsers for special
  // schemes (http/https). "/\evil.com" would otherwise slip past a naive
  // startsWith('/') check and resolve to protocol-relative "//evil.com".
  // Reject outright rather than relying on parser normalization alone.
  if (rawRedirectTo.includes('\\')) return fallback;

  let parsed: URL;
  try {
    parsed = new URL(rawRedirectTo, SAFE_BASE_ORIGIN);
  } catch {
    return fallback;
  }

  // Parsing against a fixed placeholder origin means anything that changes
  // origin — absolute URL, protocol-relative "//host", embedded scheme —
  // fails this check. Only true same-origin relative paths survive.
  if (parsed.origin !== SAFE_BASE_ORIGIN) return fallback;

  return { pathname: parsed.pathname, search: parsed.search };
}

export async function guardBlogPreview(request: NextRequest): Promise<NextResponse | null> {
  const isLoginPath = request.nextUrl.pathname === PREVIEW_LOGIN_PATH;
  const match = request.nextUrl.pathname.match(BLOG_SLUG_PATTERN);

  // Neither the gate page nor a blog post — nothing for this guard to do.
  if (!isLoginPath && !match) return null;

  const authorized = isAuthorized(request);

  if (isLoginPath) {
    if (!authorized) return null;
    const url = request.nextUrl.clone();
    const { pathname, search } = safeRedirectTarget(request.nextUrl.searchParams.get('redirectTo'));
    url.pathname = pathname;
    url.search = search;
    return NextResponse.redirect(url);
  }

  // match is guaranteed non-null here since isLoginPath was false and the early-return covered the other case.
  const status = await getBlogPublishStatus(match![1]);
  if (status !== 'unpublished') return null;
  if (authorized) return null;

  const url = request.nextUrl.clone();
  const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = PREVIEW_LOGIN_PATH;
  url.searchParams.set('redirectTo', redirectTo);
  return NextResponse.redirect(url);
}