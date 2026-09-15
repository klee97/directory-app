import { beforeEach, describe, expect, it, vi } from 'vitest';

const { maybeSingleMock, fromMock } = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  return { maybeSingleMock, fromMock: vi.fn(() => ({ select: selectMock })) };
});

vi.mock('@/lib/supabase/clients/adminClient', () => ({
  supabaseAdminClient: { from: fromMock },
}));

import { verifyVendorMagicLink } from './magicLink';

const SLUG = 'test-claim-vendor';
const EMAIL = 'claim-vendor@example.com';
const TOKEN = '11111111-1111-1111-1111-111111111111';

const IN_A_WEEK = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

type VendorRow = {
  email: string | null;
  business_name: string | null;
  access_token: string | null;
  access_token_valid_until: string | null;
  verified_at: string | null;
};

const VENDOR: VendorRow = {
  email: EMAIL,
  business_name: 'Test Claim Vendor',
  access_token: TOKEN,
  access_token_valid_until: IN_A_WEEK,
  verified_at: null,
};

const vendorRow = (overrides: Partial<VendorRow> = {}) => ({
  data: { ...VENDOR, ...overrides },
  error: null,
});

describe('verifyVendorMagicLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'debug').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.stubEnv('NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED', 'true');
    maybeSingleMock.mockResolvedValue(vendorRow());
  });

  it('accepts a matching, unexpired link', async () => {
    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result.success).toBe(true);
    expect(result.vendorEmail).toBe(EMAIL);
    expect(result.vendorBusinessName).toBe('Test Claim Vendor');
  });

  it('matches email and token case-insensitively', async () => {
    const result = await verifyVendorMagicLink(SLUG, EMAIL.toUpperCase(), TOKEN.toUpperCase());

    expect(result.success).toBe(true);
  });

  it('rejects a link whose expiry has passed', async () => {
    maybeSingleMock.mockResolvedValue(vendorRow({ access_token_valid_until: YESTERDAY }));

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result.success).toBe(false);
  });

  it('treats a missing expiry as expired while the flag is on', async () => {
    maybeSingleMock.mockResolvedValue(vendorRow({ access_token_valid_until: null }));

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result.success).toBe(false);
  });

  it('does not enforce expiry at all while the flag is off', async () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED', 'false');
    maybeSingleMock.mockResolvedValue(vendorRow({ access_token_valid_until: YESTERDAY }));

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result.success).toBe(true);
  });

  it('rejects a mismatched token', async () => {
    const result = await verifyVendorMagicLink(SLUG, EMAIL, 'not-the-token');

    expect(result.success).toBe(false);
  });

  it('rejects a mismatched email', async () => {
    const result = await verifyVendorMagicLink(SLUG, 'someone-else@example.com', TOKEN);

    expect(result.success).toBe(false);
  });

  it('rejects a consumed token rather than matching null against null', async () => {
    maybeSingleMock.mockResolvedValue(
      vendorRow({ access_token: null, verified_at: '2026-01-01T00:00:00Z' })
    );

    // `token.toLowerCase()` would throw or spuriously match without the guard.
    const result = await verifyVendorMagicLink(SLUG, EMAIL, '');

    expect(result.success).toBe(false);
  });

  it('withholds vendor details when verification fails', async () => {
    const result = await verifyVendorMagicLink(SLUG, EMAIL, 'not-the-token');

    expect(result.vendorEmail).toBeNull();
    expect(result.vendorBusinessName).toBeNull();
  });

  it('still reports the context the error page needs to offer a new link', async () => {
    maybeSingleMock.mockResolvedValue(vendorRow({ access_token_valid_until: YESTERDAY }));

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result).toMatchObject({ success: false, hasEmailOnFile: true, isClaimed: false });
  });

  it('reports an already-claimed listing so the CTA can point at login', async () => {
    maybeSingleMock.mockResolvedValue(
      vendorRow({ access_token: null, verified_at: '2026-01-01T00:00:00Z' })
    );

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result).toMatchObject({ success: false, isClaimed: true });
  });

  it('reveals nothing when there is no vendor for the slug', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    const result = await verifyVendorMagicLink('nope', EMAIL, TOKEN);

    expect(result).toEqual({
      success: false,
      hasEmailOnFile: false,
      isClaimed: false,
      vendorEmail: null,
      vendorBusinessName: null,
    });
  });

  it('fails closed on a lookup error', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    const result = await verifyVendorMagicLink(SLUG, EMAIL, TOKEN);

    expect(result.success).toBe(false);
  });
});
