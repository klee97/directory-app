import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verifyRecaptchaTokenMock,
  revalidateVendorMock,
  sendClaimLinkEmailMock,
  maybeSingleMock,
  updateSelectMock,
  updateIsMock,
  updateEqMock,
  updateMock,
  fromMock,
} = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const selectEqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const selectMock = vi.fn(() => ({ eq: selectEqMock }));

  // The update chain is `update().eq('id', ...)` then the compare-and-swap
  // filter — `.eq('access_token_valid_until', prev)` or `.is(..., null)` —
  // terminated by `.select()`. Every link returns the same chainable shape.
  const updateSelectMock = vi.fn();
  const updateChain: Record<string, unknown> = {};
  const updateEqMock = vi.fn((_column: string, _value: unknown) => updateChain);
  const updateIsMock = vi.fn((_column: string, _value: null) => updateChain);
  Object.assign(updateChain, {
    eq: updateEqMock,
    is: updateIsMock,
    select: updateSelectMock,
  });
  const updateMock = vi.fn(
    (_values: { access_token: string; access_token_valid_until: string }) => ({ eq: updateEqMock })
  );
  return {
    verifyRecaptchaTokenMock: vi.fn(),
    revalidateVendorMock: vi.fn(),
    sendClaimLinkEmailMock: vi.fn(),
    maybeSingleMock,
    updateSelectMock,
    updateIsMock,
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

  it('honours ACCESS_TOKEN_VALID_DURATION_SECONDS so the expiry can be shortened for testing', async () => {
    vi.stubEnv('ACCESS_TOKEN_VALID_DURATION_SECONDS', '60');
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
    const V = DEFAULT_VALID_SECONDS * 1000;

    /** An expiry consistent with a link requested `agoMs` ago. */
    const requestedAgo = (agoMs: number) =>
      new Date(NOW.getTime() - agoMs + V).toISOString();

    const vendorWithExpiry = (validUntil: string | null) =>
      maybeSingleMock.mockResolvedValue({
        data: { ...UNCLAIMED_VENDOR, access_token_valid_until: validUntil },
        error: null,
      });

    /** The compare-and-swap filter the action applied, as [column, value]. */
    const casFilter = (): [string, unknown] | null => {
      const isCall = updateIsMock.mock.calls[0];
      if (isCall) return [isCall[0], isCall[1]];
      // calls[0] is always .eq('id', ...); the CAS filter is the second.
      const eqCall = updateEqMock.mock.calls[1];
      return eqCall ? [eqCall[0], eqCall[1]] : null;
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(NOW);
    });

    it('sends when no link has ever been requested for the listing', async () => {
      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({ success: true });
      expect(sendClaimLinkEmailMock).toHaveBeenCalled();
    });

    it('refuses and reports the remaining wait inside the cooldown', async () => {
      vendorWithExpiry(requestedAgo(60_000)); // 1 min ago → 4 of 5 min left

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({
        success: false,
        error:
          "Check your inbox and spam folder for the link. Still don't see it? Request a new link in 4 minutes.",
      });
    });

    it('refuses without touching the database or the mailer', async () => {
      vendorWithExpiry(requestedAgo(60_000));

      await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(updateMock).not.toHaveBeenCalled();
      expect(sendClaimLinkEmailMock).not.toHaveBeenCalled();
      expect(revalidateVendorMock).not.toHaveBeenCalled();
    });

    it('sends again once the cooldown has elapsed', async () => {
      vendorWithExpiry(requestedAgo(6 * 60_000)); // 6 min ago, cooldown is 5

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({ success: true });
      expect(sendClaimLinkEmailMock).toHaveBeenCalled();
    });

    it('sends regardless of recency when the cooldown is 0', async () => {
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN_SECONDS', '0');
      vendorWithExpiry(requestedAgo(1_000));

      const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

      expect(result).toEqual({ success: true });
    });

    it('honours a shortened cooldown from the env var', async () => {
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN_SECONDS', '60');
      vendorWithExpiry(requestedAgo(90_000)); // 90s ago clears a 60s cooldown

      expect(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' })).toEqual({
        success: true,
      });
    });

    it('clamps a cooldown longer than the token validity window', async () => {
      vi.stubEnv('ACCESS_TOKEN_VALID_DURATION_SECONDS', '600');
      vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN_SECONDS', '99999');
      // Requested 11 min ago, so its 10 min token has already lapsed. Clamped
      // to 600s the cooldown is over; unclamped it would still be blocking.
      vendorWithExpiry(new Date(NOW.getTime() - 11 * 60_000 + 600_000).toISOString());

      expect(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' })).toEqual({
        success: true,
      });
    });

    it('fails open for a token minted under a longer validity duration', async () => {
      // Expiry is further out than the current 600s duration could produce, so
      // the derived request time would be in the future and is not trustworthy.
      vi.stubEnv('ACCESS_TOKEN_VALID_DURATION_SECONDS', '600');
      vendorWithExpiry(new Date(NOW.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

      expect(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' })).toEqual({
        success: true,
      });
    });

    describe('compare-and-swap', () => {
      it('matches on null when the listing had no expiry', async () => {
        vendorWithExpiry(null);

        await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

        expect(casFilter()).toEqual(['access_token_valid_until', null]);
        expect(updateIsMock).toHaveBeenCalled();
      });

      it('matches on the exact expiry it read', async () => {
        const previous = requestedAgo(6 * 60_000);
        vendorWithExpiry(previous);

        await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

        expect(casFilter()).toEqual(['access_token_valid_until', previous]);
      });

      it('reports the cooldown when a concurrent request won the race', async () => {
        vendorWithExpiry(null);
        updateSelectMock.mockResolvedValue(NOT_UPDATED);

        const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

        expect(result).toMatchObject({ success: false });
        expect(sendClaimLinkEmailMock).not.toHaveBeenCalled();
      });

      it('treats a lost race as success when the cooldown is disabled', async () => {
        vi.stubEnv('CLAIM_LINK_REQUEST_COOLDOWN_SECONDS', '0');
        vendorWithExpiry(null);
        updateSelectMock.mockResolvedValue(NOT_UPDATED);

        expect(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' })).toEqual({
          success: true,
        });
      });
    });
  });

  it('still reports success when the email fails to send', async () => {
    sendClaimLinkEmailMock.mockResolvedValue(false);

    const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

    expect(result).toEqual({ success: true });
    expect(sendClaimLinkEmailMock).toHaveBeenCalled();
  });
});
