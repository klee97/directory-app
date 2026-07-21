import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { getDirectoryRedirect } from './directoryRedirect';
import { LATITUDE_PARAM, LONGITUDE_PARAM, SEARCH_PARAM, TRAVEL_PARAM, SKILL_PARAM, SERVICE_PARAM } from '../constants';

function makeRequest(url: string) {
  return new NextRequest(new Request(url));
}

describe('getDirectoryRedirect', () => {
  it('redirects homepage with a location param to /directory, preserving params', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com?lat=37.7793&lon=-122.4193');
    const res = getDirectoryRedirect(req);

    expect(res).not.toBeNull();
    expect(res!.status).toBe(301);
    expect(res!.headers.get('location')).toBe('https://www.asianweddingmakeup.com/vendors?lat=37.7793&lon=-122.4193');
  });

  it('preserves multiple params', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com?query=makeup&lat=34.0537&lon=-118.2428&service=Makeup&skill=South+Asian+Makeup&travelsWorldwide=true');
    const res = getDirectoryRedirect(req);

    const redirectUrl = new URL(res!.headers.get('location')!);
    expect(redirectUrl.pathname).toBe('/vendors');
    expect(redirectUrl.searchParams.get(LATITUDE_PARAM)).toBe('34.0537');
    expect(redirectUrl.searchParams.get(LONGITUDE_PARAM)).toBe('-118.2428');
    expect(redirectUrl.searchParams.get(SEARCH_PARAM)).toBe('makeup');
    expect(redirectUrl.searchParams.get(SERVICE_PARAM)).toBe('Makeup');
    expect(redirectUrl.searchParams.get(SKILL_PARAM)).toBe('South Asian Makeup');
    expect(redirectUrl.searchParams.get(TRAVEL_PARAM)).toBe('true');
  });

  it('does not redirect the homepage with no filter params', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com/');
    expect(getDirectoryRedirect(req)).toBeNull();
  });

  it('does not redirect the homepage with an unrelated param', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com/?utm_source=reddit');
    expect(getDirectoryRedirect(req)).toBeNull();
  });

  it('does not redirect non-homepage paths even with filter params', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com/some-other-page?lat=40.7127&lon=-74.006');
    expect(getDirectoryRedirect(req)).toBeNull();
  });

  it('does not redirect the directory page itself', () => {
    const req = makeRequest('https://www.asianweddingmakeup.com/vendors?lat=40.7127&lon=-74.006');
    expect(getDirectoryRedirect(req)).toBeNull();
  });
});