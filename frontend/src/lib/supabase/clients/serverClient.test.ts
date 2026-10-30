import { describe, it, expect, vi, beforeEach } from 'vitest';

type CookieOpts = {
  getAll: () => { name: string; value: string }[];
  setAll: (
    cookies: { name: string; value: string; options: Record<string, unknown> }[],
    headers: Record<string, string>,
  ) => void;
};

const { cookieStore, createSupabase } = vi.hoisted(() => ({
  cookieStore: { getAll: vi.fn(() => [{ name: 'a', value: '1' }]), set: vi.fn() },
  createSupabase: vi.fn((_url: string, _key: string, _opts: { cookies: CookieOpts }) => ({})),
}));

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => cookieStore) }));
vi.mock('@supabase/ssr', () => ({ createServerClient: createSupabase }));

import { createServerClient } from '@/lib/supabase/clients/serverClient';

const NO_STORE = { 'Cache-Control': 'private, no-store', Expires: '0', Pragma: 'no-cache' };
const getCookieOpts = () => createSupabase.mock.calls[0]![2].cookies;

beforeEach(() => vi.clearAllMocks());

describe('createServerClient', () => {
  it('delegates getAll to the cookie store', async () => {
    await createServerClient();
    expect(getCookieOpts().getAll()).toEqual([{ name: 'a', value: '1' }]);
  });

  it('writes cookies and forwards headers to onHeaders', async () => {
    const onHeaders = vi.fn();
    await createServerClient({ onHeaders });
    getCookieOpts().setAll([{ name: 'sb', value: 'x', options: { path: '/' } }], NO_STORE);

    expect(cookieStore.set).toHaveBeenCalledWith('sb', 'x', { path: '/' });
    expect(onHeaders).toHaveBeenCalledWith(NO_STORE);
  });

  it('does not throw when onHeaders is omitted (existing callers)', async () => {
    await createServerClient();
    expect(() => getCookieOpts().setAll([], NO_STORE)).not.toThrow();
  });

  it('swallows cookie write errors (Server Component) but still forwards headers', async () => {
    cookieStore.set.mockImplementation(() => { throw new Error('read-only'); });
    const onHeaders = vi.fn();
    await createServerClient({ onHeaders });

    expect(() =>
      getCookieOpts().setAll([{ name: 'sb', value: 'x', options: {} }], NO_STORE),
    ).not.toThrow();
    expect(onHeaders).toHaveBeenCalledWith(NO_STORE);
  });
});