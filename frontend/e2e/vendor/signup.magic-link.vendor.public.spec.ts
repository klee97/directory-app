import { test, expect } from '../fixtures/fixtures';
import { mockRecaptcha } from '../fixtures/mockRecaptcha';

/**
 * Vendor Sign-Up / Magic Link Claiming e2e tests — public (no auth needed).
 *
 * Tests the /partner/claim page (VendorClaimContent + VendorClaimForm).
 * Serial execution because claiming a vendor consumes the access_token.
 *
 * Depends on seeded claim vendor in supabase/seed.sql:
 *   - TEST-E2E-CLAIM "Test Claim Vendor" slug: test-claim-vendor
 *     email: claim-vendor@example.com
 *     access_token: 11111111-1111-1111-1111-111111111111
 */

const CLAIM_VENDOR = {
  slug: 'test-claim-vendor',
  email: 'claim-vendor@example.com',
  token: '11111111-1111-1111-1111-111111111111',
};

function buildClaimUrl(params: Partial<typeof CLAIM_VENDOR> = CLAIM_VENDOR): string {
  const searchParams = new URLSearchParams();
  if (params.email) searchParams.set('email', params.email);
  if (params.slug) searchParams.set('slug', params.slug);
  if (params.token) searchParams.set('token', params.token);
  return `/partner/claim?${searchParams.toString()}`;
}

test.describe.serial('Vendor Sign-Up — Magic Link Claiming', () => {
  test.beforeEach(async ({ page }) => {
    await mockRecaptcha(page);
  });

  test('missing params shows error page', async ({ page }) => {
    await page.goto('/partner/claim');

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByText('Incomplete claim link')).toBeVisible();
  });

  test('missing email param shows error page', async ({ page }) => {
    await page.goto(`/partner/claim?slug=${CLAIM_VENDOR.slug}&token=${CLAIM_VENDOR.token}`);

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByText('Incomplete claim link')).toBeVisible();
  });

  test('missing token param shows error page', async ({ page }) => {
    await page.goto(`/partner/claim?slug=${CLAIM_VENDOR.slug}&email=${CLAIM_VENDOR.email}`);

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByText('Incomplete claim link')).toBeVisible();
  });

  test.fixme('invalid token shows error page', async ({ page }) => {
    await page.goto(buildClaimUrl({
      ...CLAIM_VENDOR,
      token: '00000000-0000-0000-0000-badtoken0000',
    }));

    await expect(page.getByText('Something went wrong')).toBeVisible();
    await expect(page.getByText('Invalid claim link')).toBeVisible();
  });

  test('valid magic link shows claim form', async ({ page }) => {
    await page.goto(buildClaimUrl());

    await expect(page.getByText('Your profile is ready to claim')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Test Claim Vendor')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Claim profile' })).toBeVisible();
  });

  test('password mismatch shows error', async ({ page }) => {
    await page.goto(buildClaimUrl());
    await expect(page.getByText('Your profile is ready to claim')).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Password', { exact: true }).fill('StrongPass123!');
    await page.getByLabel('Confirm password').fill('DifferentPass123!');
    await page.getByRole('button', { name: 'Claim profile' }).click();

    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('weak password shows validation error', async ({ page }) => {
    await page.goto(buildClaimUrl());
    await expect(page.getByText('Your profile is ready to claim')).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Password', { exact: true }).fill('weak');
    await page.getByLabel('Confirm password').fill('weak');
    await page.getByRole('button', { name: 'Claim profile' }).click();

    // validatePassword returns a message about password requirements
    await expect(page.locator('.MuiAlert-standardError')).toBeVisible();
  });

  test('terms checkbox required before claim', async ({ page }) => {
    await page.goto(buildClaimUrl());
    await expect(page.getByText('Your profile is ready to claim')).toBeVisible({ timeout: 10_000 });

    await page.getByLabel('Password', { exact: true }).fill('ValidPass123!');
    await page.getByLabel('Confirm password').fill('ValidPass123!');

    // Don't check the terms checkbox — click claim
    await page.getByRole('button', { name: 'Claim profile' }).click();

    await expect(page.getByText('You must agree to the terms and conditions before continuing')).toBeVisible();
  });

  test.fixme('successful claim redirects to dashboard', async ({ page }) => {
    await page.goto(buildClaimUrl());
    await expect(page.getByText('Your profile is ready to claim')).toBeVisible({ timeout: 10_000 });

    const claimPassword = 'ClaimTestPass123!';
    await page.getByLabel('Password', { exact: true }).fill(claimPassword);
    await page.getByLabel('Confirm password').fill(claimPassword);

    // Check terms checkbox
    await page.getByText(/I agree to the Vendor/).click();

    await page.getByRole('button', { name: 'Claim profile' }).click();

    await expect(page).toHaveURL('/partner/dashboard', { timeout: 15_000 });
  });
});
