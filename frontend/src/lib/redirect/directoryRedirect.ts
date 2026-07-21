import { NextRequest, NextResponse } from 'next/server';
import { DIRECTORY_FILTER_PARAMS } from '../constants';

/**
 * If the homepage is hit with directory-filter params,
 * redirect to the directory page, preserving all query params.
 * Returns null if no redirect is needed.
 */
export function getDirectoryRedirect(request: NextRequest): NextResponse | null {
  const { pathname, searchParams } = request.nextUrl;

  console.log('getDirectoryRedirect: pathname', pathname);
  if (pathname !== '/') {
    return null;
  }

  console.log('getDirectoryRedirect: searchParams', searchParams);

  const hasDirectoryFilter = DIRECTORY_FILTER_PARAMS.some((param) =>
    searchParams.has(param)
  );

  console.log('getDirectoryRedirect: hasDirectoryFilter', hasDirectoryFilter);

  if (!hasDirectoryFilter) {
    return null;
  }

  const url = request.nextUrl.clone();
  url.pathname = '/vendors';
  return NextResponse.redirect(url, 301);
}