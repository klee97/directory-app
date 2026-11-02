import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

type ServerClientOpts = {
  onHeaders?: (headers: Record<string, string>) => void;
};

const { verifyOtp, state } = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  state: { opts: undefined as ServerClientOpts | undefined },
}));

vi.mock('@/lib/supabase/clients/serverClient', () => ({
  createServerClient: vi.fn(async (opts) => {
    state.opts = opts;
    return { auth: { verifyOtp } };
  }),
}));
vi.mock('@/lib/env/env', () => ({ getBaseUrl: () => 'http://localhost:3000' }));

import { GET } from './route';

const NO_STORE = { 'Cache-Control': 'private, no-store', Expires: '0', Pragma: 'no-cache' };
const call = (qs: string) =>
  GET(new NextRequest(`http://localhost:3000/auth/confirm?${qs}`));

beforeEach(() => {
  vi.clearAllMocks();
  verifyOtp.mockImplementation(async () => {
    state.opts?.onHeaders?.(NO_STORE); // simulate @supabase/ssr writing the session
    return { error: null };
  });
});

describe('success', () => {
  it('redirects with message and applies cache headers', async () => {
    const res = await call('token_hash=abc&type=email&redirectTo=http://localhost:3000/dashboard');
    const location = new URL(res.headers.get('location')!);

    expect(location.pathname).toBe('/dashboard');
    expect(location.searchParams.get('message')).toBe('Email verified successfully!');
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('pragma')).toBe('no-cache');
  });

  it('defaults a missing redirectTo to / without throwing', async () => {
    const res = await call('token_hash=abc&type=email');
    expect(new URL(res.headers.get('location')!).pathname).toBe('/');
  });
});

describe('open redirect protection', () => {
  it.each([
    'https://evil.com/steal',
    '//evil.com',
    'javascript:alert(1)',
    'http://localhost:3000.evil.com',
  ])('does not redirect to %s', async (redirectTo) => {
    const res = await call(`token_hash=abc&type=email&redirectTo=${encodeURIComponent(redirectTo)}`);
    expect(new URL(res.headers.get('location')!).origin).toBe('http://localhost:3000');
  });
});

describe('failure paths', () => {
  beforeEach(() => verifyOtp.mockResolvedValue({ error: { message: 'expired' } }));

  it.each([
    ['email', '', '/auth/auth-code-error'],
    ['email', 'redirectTo=/partner/home', '/partner/auth/auth-code-error'],
    ['recovery', '', '/auth/recovery-code-error'],
    ['recovery', 'redirectTo=/partner/home', '/partner/auth/recovery-code-error'],
  ])('type=%s %s -> %s', async (type, extra, expected) => {
    const res = await call(`token_hash=abc&type=${type}&${extra}`);
    expect(new URL(res.headers.get('location')!).pathname).toBe(expected);
  });

  it('goes to the error page without calling verifyOtp when token_hash is missing', async () => {
    const res = await call('type=email');
    expect(verifyOtp).not.toHaveBeenCalled();
    expect(new URL(res.headers.get('location')!).pathname).toBe('/auth/auth-code-error');
  });
});