import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verifyRecaptchaTokenMock,
  revalidateVendorMock,
  sendClaimLinkEmailMock,
  maybeSingleMock,
  updateSelectMock,
  updateOrMock,
  updateEqMock,
  updateMock,
  fromMock,
} = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const selectEqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const selectMock = vi.fn(() => ({ eq: selectEqMock }));

  // The update chain is `update().eq()` then optionally `.or()`, terminated by
  // `.select()`. `or` returns the same shape so the terminal call is identical
  // whether or not the cooldown clause was applied.
  const updateSelectMock = vi.fn();
  const updateOrMock = vi.fn((_filter: string) => ({ select: updateSelectMock }));
  const updateEqMock = vi.fn(() => ({ or: updateOrMock, select: updateSelectMock }));
  const updateMock = vi.fn(
    (_values: { access_token: string; access_token_valid_until: string }) => ({ eq: updateEqMock })
  );
  return {
    verifyRecaptchaTokenMock: vi.fn(),
    revalidateVendorMock: vi.fn(),
    sendClaimLinkEmailMock: vi.fn(),
    maybeSingleMock,
    updateSelectMock,
    updateOrMock,
    updateEqMock,
    updateMock,
    fromMock: vi.fn(() => ({ select: selectMock, update: updateMock })),
  };
});

vi.mock('@/lib/supabase/clients/adminClient', () => ({
  supabaseAdminClient: { from: fromMock },
}));

vi.mock('@/lib/security/recaptchaVerification', () => ({
  verifyRecaptchaToken: verifyRecaptchaTokenMock,
}));

vi.mock('@/lib/actions/revalidate', () => ({
  revalidateVendor: revalidateVendorMock,
}));

vi.mock('@/lib/resend/resend', () => ({
  sendClaimLinkEmail: sendClaimLinkEmailMock,
}));

vi.mock('@/lib/env/env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/env/env')>()),
  getBaseUrl: () => 'https://example.com',
}));

import { requestClaimLink } from './requestClaimLink';

const SLUG = 'test-claim-vendor';

const UNCLAIMED_VENDOR = {
  id: 'TEST-E2E-CLAIM',
  email: 'claim+vendor@example.com',
  business_name: 'Test Claim Vendor',
  access_token: 'old-token',
  // No link has been requested yet, so nothing to derive a cooldown from.
  access_token_valid_until: null as string | null,
  verified_at: null as string | null,
};

const DEFAULT_VALID_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_COOLDOWN_SECONDS = 5 * 60;

/** A row was updated — i.e. the listing was not inside its cooldown. */
const UPDATED = { data: [{ id: UNCLAIMED_VENDOR.id }], error: null };
/** No row matched the cooldown predicate. */
const NOT_UPDATED = { data: [], error: null };

/** Every "can't send" branch must be indistinguishable from a real send. */
function expectSilentSuccess(result: unknown) {
  expect(result).toEqual({ success: true });
  expect(sendClaimLinkEmailMock).not.toHaveBeenCalled();
}

describe('requestClaimLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
    verifyRecaptchaTokenMock.mockResolvedValue({ success: true });
    maybeSingleMock.mockResolvedValue({ data: UNCLAIMED_VENDOR, error: null });
    updateSelectMock.mockResolvedValue(UPDATED);
    sendClaimLinkEmailMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('rejects a request with no slug before touching the database', async () => {
    const result = await requestClaimLink({ slug: '', recaptchaToken: 'test-bypass' });

    expect(result).toEqual({ success: false, error: 'Missing vendor.' });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('rejects a request that fails reCAPTCHA before touching the database', async () => {
    verifyRecaptchaTokenMock.mockResolvedValue({ success: false });

    const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-fail' });

    expect(result).toEqual({
      success: false,
      error: 'Could not verify the request. Please try again.',
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('emails a claim link with a freshly generated token for an unclaimed vendor', async () => {
    const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

    expect(result).toEqual({ success: true });

    // The token is regenerated on every request so older links stop working.
    const [{ access_token: newToken }] = updateMock.mock.calls[0];
    expect(newToken).not.toBe(UNCLAIMED_VENDOR.access_token);
    expect(updateEqMock).toHaveBeenCalledWith('id', UNCLAIMED_VENDOR.id);

    expect(sendClaimLinkEmailMock).toHaveBeenCalledWith({
      email: UNCLAIMED_VENDOR.email,
      businessName: UNCLAIMED_VENDOR.business_name,
      claimUrl:
        `https://example.com/partner/claim?slug=${SLUG}` +
        `&email=claim%2Bvendor%40example.com&token=${newToken}`,
    });
  });

  it('stamps a 7-day expiry on the new token by default', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));
    try {
      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      const [{ access_token_valid_until: validUntil }] = updateMock.mock.calls[0];
      expect(validUntil).toBe('2026-03-08T00:00:00.000Z');
    } finally {
      vi.useRealTimers();
    }
  });

  it('honours ACCESS_TOKEN_VALID_DURATION so the expiry can be shortened for testing', async () => {
    vi.stubEnv('ACCESS_TOKEN_VALID_DURATION', '60');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T00:00:00.000Z'));
    try {
      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      const [{ access_token_valid_until: validUntil }] = updateMock.mock.calls[0];
      expect(validUntil).toBe('2026-03-01T00:01:00.000Z');
    } finally {
      vi.useRealTimers();
      vi.unstubAllEnvs();
    }
  });

  it('busts the cached vendor so the new token is reflected on the profile page', async () => {
    await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

    expect(revalidateVendorMock).toHaveBeenCalledWith(SLUG);
  });

  it('does not reveal that no vendor exists for the slug', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: null });

    expectSilentSuccess(await requestClaimLink({ slug: 'nope', recaptchaToken: 'test-bypass' }));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('does not reveal that the listing is already claimed, and leaves its token alone', async () => {
    maybeSingleMock.mockResolvedValue({
      data: { ...UNCLAIMED_VENDOR, verified_at: '2026-01-01T00:00:00Z' },
      error: null,
    });

    expectSilentSuccess(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' }));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('does not reveal that there is no email on file', async () => {
    maybeSingleMock.mockResolvedValue({ data: { ...UNCLAIMED_VENDOR, email: null }, error: null });

    expectSilentSuccess(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' }));
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('does not reveal a vendor lookup failure', async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    expectSilentSuccess(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' }));
  });

  it('skips sending when the token could not be persisted', async () => {
    updateSelectMock.mockResolvedValue({ data: null, error: { message: 'boom' } });

    expectSilentSuccess(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' }));
  });

  describe('per-listing cooldown', () => {
    const NOW = new Date('2026-03-01T00:00:00.000Z');

    /** Parses the `.or()` filter the action built, or null if it never called it. */
    const orFilter = (): string | null => updateOrMock.mock.calls[0]?.[0] ?? null;

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    it('sends when no link has ever been requested for the listing', async () => {
      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({ success: true });
      expect(sendClaimLinkEmailMock).toHaveBeenCalled();
    });

    it('constrains the update so a listing inside its cooldown cannot match', async () => {
      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      // blocked <=> valid_until > now + validity - cooldown
      const cutoff = new Date(
        NOW.getTime() + (DEFAULT_VALID_SECONDS - DEFAULT_COOLDOWN_SECONDS) * 1000
      ).toISOString();
      const underivable = new Date(NOW.getTime() + DEFAULT_VALID_SECONDS * 1000).toISOString();

      expect(orFilter()).toBe(
        `access_token_valid_until.is.null,` +
        `access_token_valid_until.lte.${cutoff},` +
        `access_token_valid_until.gt.${underivable}`
      );
    });

    it('refuses and reports the remaining wait when the update matches no row', async () => {
      // Link requested one minute ago → four of the five minutes remain.
      const requestedAt = NOW.getTime() - 60_000;
      maybeSingleMock.mockResolvedValue({
        data: {
          ...UNCLAIMED_VENDOR,
          access_token_valid_until: new Date(
            requestedAt + DEFAULT_VALID_SECONDS * 1000
          ).toISOString(),
        },
        error: null,
      });
      updateSelectMock.mockResolvedValue(NOT_UPDATED);

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({
        success: false,
        error:
          'We already sent a link for this listing. Check your inbox — you can request another in 4 minutes.',
      });
    });

    it('neither emails nor busts the cache when refused', async () => {
      updateSelectMock.mockResolvedValue(NOT_UPDATED);

      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(sendClaimLinkEmailMock).not.toHaveBeenCalled();
      expect(revalidateVendorMock).not.toHaveBeenCalled();
    });

    it('falls back to the full cooldown when it lost a race rather than hitting the window', async () => {
      // valid_until is null, so there is no request time to derive from.
      updateSelectMock.mockResolvedValue(NOT_UPDATED);

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toMatchObject({ success: false });
      expect((result as { error: string }).error).toContain('5 minutes');
    });

    it('drops the cooldown clause entirely when CLAIM_LINK_REQUEST_COOLDOWN is 0', async () => {
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN', '0');

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({ success: true });
      expect(orFilter()).toBeNull();
    });

    it('honours a shortened cooldown from the env var', async () => {
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN', '60');

      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      const cutoff = new Date(
        NOW.getTime() + (DEFAULT_VALID_SECONDS - 60) * 1000
      ).toISOString();
      expect(orFilter()).toContain(`access_token_valid_until.lte.${cutoff}`);
    });

    it('clamps a cooldown longer than the token validity window', async () => {
      vi.stubEnv('ACCESS_TOKEN_VALID_DURATION', '600');
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN', '99999');

      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      // Clamped to the 600s validity, so the cutoff lands exactly on now —
      // not somewhere in the past, which would lock the listing out.
      expect(orFilter()).toContain(
        `access_token_valid_until.lte.${NOW.toISOString()}`
      );
    });

    it('fails open for a token minted under a longer validity duration', async () => {
      // Stored expiry is further out than the current duration could produce,
      // so the derived request time would be in the future and meaningless.
      vi.stubEnv('ACCESS_TOKEN_VALID_DURATION', '600');
      const farFuture = new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      maybeSingleMock.mockResolvedValue({
        data: { ...UNCLAIMED_VENDOR, access_token_valid_until: farFuture },
        error: null,
      });

      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      // The escape hatch that lets such a row through.
      const underivable = new Date(NOW.getTime() + 600 * 1000).toISOString();
      expect(orFilter()).toContain(`access_token_valid_until.gt.${underivable}`);
      expect(new Date(farFuture).getTime()).toBeGreaterThan(new Date(underivable).getTime());
    });
  });

  it('still reports success when the email fails to send', async () => {
    sendClaimLinkEmailMock.mockResolvedValue(false);

    const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

    expect(result).toEqual({ success: true });
    expect(sendClaimLinkEmailMock).toHaveBeenCalled();
  });
});
