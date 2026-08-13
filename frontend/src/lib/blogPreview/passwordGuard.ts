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

function safeRedirectTarget(request: NextRequest): string {
  const redirectTo = request.nextUrl.searchParams.get('redirectTo');
  const isSafeRelativePath = Boolean(redirectTo) && redirectTo!.startsWith('/') && !redirectTo!.startsWith('//');
  return isSafeRelativePath ? redirectTo! : '/blog';
}

export async function guardBlogPreview(request: NextRequest): Promise<NextResponse | null> {
  const authorized = isAuthorized(request);

  if (request.nextUrl.pathname === PREVIEW_LOGIN_PATH) {
    if (!authorized) return null;
    const url = request.nextUrl.clone();
    url.pathname = safeRedirectTarget(request);
    url.search = '';
    return NextResponse.redirect(url);
  }

  const match = request.nextUrl.pathname.match(BLOG_SLUG_PATTERN);
  if (!match) return null;

  const status = await getBlogPublishStatus(match[1]);
  if (status !== 'unpublished') return null;
  if (authorized) return null;

  const url = request.nextUrl.clone();
  const redirectTo = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = PREVIEW_LOGIN_PATH;
  url.searchParams.set('redirectTo', redirectTo);
  return NextResponse.redirect(url);
}