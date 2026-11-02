import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

type SupabaseOpts = {
  cookies: {
    setAll: (
      cookies: { name: string; value: string; options: Record<string, unknown> }[],
      headers: Record<string, string>,
    ) => void;
  };
};

const { getClaims, state } = vi.hoisted(() => ({
  getClaims: vi.fn(),
  state: { opts: undefined as SupabaseOpts | undefined },
}));


vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn((_url, _key, opts) => {
    state.opts = opts;
    return { auth: { getClaims } };
  }),
}));

import { updateSession } from './middleware';
const NO_STORE = { 'Cache-Control': 'private, no-store', Expires: '0', Pragma: 'no-cache' };
const req = (path: string) => new NextRequest(`http://localhost:3000${path}`);

const loggedOut = () => getClaims.mockResolvedValue({ data: null });
const loggedIn = () => getClaims.mockResolvedValue({ data: { claims: { sub: 'u1' } } });

/** Simulates @supabase/ssr refreshing the token during getClaims(). */
const loggedInWithRefresh = () =>
  getClaims.mockImplementation(async () => {
    state.opts?.cookies.setAll(
      [{ name: 'sb-test-auth-token', value: 'new', options: { path: '/' } }],
      NO_STORE,
    );
    return { data: { claims: { sub: 'u1' } } };
  });


/** Simulates getClaims() clearing an invalid session: one setAll call per removed cookie. */
const loggedOutWithMultipleSetAll = () =>
  getClaims.mockImplementation(async () => {
    state.opts?.cookies.setAll(
      [{ name: 'sb-a-code-verifier', value: '', options: { path: '/', maxAge: 0 } }],
      { 'Cache-Control': 'private, no-store' },
    );
    state.opts?.cookies.setAll(
      [{ name: 'sb-b-code-verifier', value: '', options: { path: '/', maxAge: 0 } }],
      { Pragma: 'no-cache', Expires: '0' },
    );
    return { data: null };
  });

const loc = (res: Response) => new URL(res.headers.get('location')!);

beforeEach(() => vi.clearAllMocks());

describe('pass-through', () => {
  it('lets anonymous users reach public pages', async () => {
    loggedOut();
    const res = await updateSession(req('/'));
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('lets anonymous users reach /partner/login', async () => {
    loggedOut();
    const res = await updateSession(req('/partner/login'));
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('session refresh', () => {
  it('writes refreshed cookies and cache headers to the pass-through response', async () => {
    loggedInWithRefresh();
    const res = await updateSession(req('/'));
    expect(res.cookies.get('sb-test-auth-token')?.value).toBe('new');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('pragma')).toBe('no-cache');
  });
});

describe('multiple setAll calls in one request', () => {
  it('keeps cookies and headers from every call on the pass-through response', async () => {
    loggedOutWithMultipleSetAll();
    const res = await updateSession(req('/'));
    expect(res.cookies.get('sb-a-code-verifier')).toBeDefined();
    expect(res.cookies.get('sb-b-code-verifier')).toBeDefined();
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('pragma')).toBe('no-cache');
    expect(res.headers.get('expires')).toBe('0');
  });

  it('keeps cookies and headers from every call on a redirect response', async () => {
    loggedOutWithMultipleSetAll();
    const res = await updateSession(req('/favorites'));
    expect(res.status).toBe(307);
    expect(loc(res).pathname).toBe('/login');
    expect(res.cookies.get('sb-a-code-verifier')).toBeDefined();
    expect(res.cookies.get('sb-b-code-verifier')).toBeDefined();
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('pragma')).toBe('no-cache');
  });

  it('lets a later call override a same-named cookie from an earlier call', async () => {
    getClaims.mockImplementation(async () => {
      state.opts?.cookies.setAll(
        [{ name: 'sb-test-auth-token', value: 'old', options: { path: '/' } }],
        {},
      );
      state.opts?.cookies.setAll(
        [{ name: 'sb-test-auth-token', value: 'new', options: { path: '/' } }],
        {},
      );
      return { data: null };
    });
    const res = await updateSession(req('/'));
    expect(res.cookies.get('sb-test-auth-token')?.value).toBe('new');
  });
});

describe('route protection', () => {
  it.each([
    ['/partner/dashboard', '/partner/login'],
    ['/partner/settings', '/partner/login'],
    ['/admin', '/login'],
    ['/admin/users', '/login'],
    ['/favorites', '/login'],
    ['/settings', '/login'],
  ])('redirects anonymous %s -> %s', async (path, expected) => {
    loggedOut();
    const res = await updateSession(req(path));
    expect(res.status).toBe(307);
    expect(loc(res).pathname).toBe(expected);
  });

  it('preserves path and query in redirectTo', async () => {
    loggedOut();
    const res = await updateSession(req('/favorites?tab=recent'));
    expect(loc(res).searchParams.get('redirectTo')).toBe('/favorites?tab=recent');
  });

  it('does not protect similarly named paths (after fixing prefix matching)', async () => {
    loggedOut();
    const res = await updateSession(req('/settings-public'));
    expect(res.headers.get('location')).toBeNull();
  });
});

describe('redirects away from login pages', () => {
  it.each([
    ['/login', '/'],
    ['/signup', '/'],
    ['/partner/login', '/partner/dashboard'],
  ])('sends logged-in users from %s to %s', async (path, expected) => {
    loggedIn();
    const res = await updateSession(req(path));
    expect(loc(res).pathname).toBe(expected);
  });

  it('strips redirectTo when bouncing a logged-in user', async () => {
    loggedIn();
    const res = await updateSession(req('/login?redirectTo=/favorites'));
    expect(loc(res).searchParams.has('redirectTo')).toBe(false);
  });
});

describe('redirects carry the refreshed session', () => {
  it('copies refreshed cookies onto the redirect', async () => {
    loggedInWithRefresh();
    const res = await updateSession(req('/login'));
    expect(res.status).toBe(307);
    expect(res.cookies.get('sb-test-auth-token')?.value).toBe('new');
  });

  it('copies cache headers onto the redirect', async () => {
    loggedInWithRefresh();
    const res = await updateSession(req('/login'));
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });

  it('does not leak the pass-through marker onto redirects', async () => {
    loggedInWithRefresh();
    const res = await updateSession(req('/login'));
    expect(res.headers.get('x-middleware-next')).toBeNull();
  });
});