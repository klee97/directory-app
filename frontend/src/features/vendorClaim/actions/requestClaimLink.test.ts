import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  verifyRecaptchaTokenMock,
  revalidateVendorMock,
  sendClaimLinkEmailMock,
  maybeSingleMock,
  updateEqMock,
  updateMock,
  fromMock,
} = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const selectEqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const selectMock = vi.fn(() => ({ eq: selectEqMock }));
  const updateEqMock = vi.fn();
  const updateMock = vi.fn((_values: { access_token: string }) => ({ eq: updateEqMock }));
  return {
    verifyRecaptchaTokenMock: vi.fn(),
    revalidateVendorMock: vi.fn(),
    sendClaimLinkEmailMock: vi.fn(),
    maybeSingleMock,
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
  verified_at: null,
};

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
    updateEqMock.mockResolvedValue({ error: null });
    sendClaimLinkEmailMock.mockResolvedValue(true);
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
    updateEqMock.mockResolvedValue({ error: { message: 'boom' } });

    expectSilentSuccess(await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' }));
  });

  it('still reports success when the email fails to send', async () => {
    sendClaimLinkEmailMock.mockResolvedValue(false);

    const result = await requestClaimLink({ slug: SLUG, recaptchaToken: 'test-bypass' });

    expect(result).toEqual({ success: true });
    expect(sendClaimLinkEmailMock).toHaveBeenCalled();
  });
});
