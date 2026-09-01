import { test, expect } from '@playwright/test';
import { mockRecaptcha } from '../fixtures/mockRecaptcha';

/**
 * Expired claim magic link — public, no auth needed.
 *
 * `vendors.access_token_valid_until` is stamped whenever requestClaimLink
 * rotates the token. Once it's in the past the link is refused, and the error
 * page offers a one-click route back to the listing's "Manage this profile"
 * CTA so the vendor can mint a fresh one.
 *
 * Depends on fixtures from supabase/seed.sql:
 *   - TEST-E2E-CLAIM-EXPIRED "Test Claim Expired Vendor" test-claim-expired-vendor
 *     (unclaimed, email on file, access_token_valid_until one day in the past)
 *   - TEST-E2E-CLAIM         "Test Claim Vendor"         test-claim-vendor
 *     (unclaimed, expiry seven days out — the happy path, for contrast)
 *
 * Gated on NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED — see .env.test.example.
 */

const EXPIRED_VENDOR = {
  slug: 'test-claim-expired-vendor',
  email: 'claim-expired-vendor@example.com',
  token: '33333333-3333-3333-3333-333333333333',
  // maskEmail('claim-expired-vendor@example.com')
  emailHint: 'cl•••@•••.com',
};

const VALID_VENDOR = {
  slug: 'test-claim-vendor',
  email: 'claim-vendor@example.com',
  token: '11111111-1111-1111-1111-111111111111',
};

const claimUrl = ({ slug, email, token }: { slug: string; email: string; token: string }) =>
  `/partner/claim?slug=${slug}&email=${encodeURIComponent(email)}&token=${token}`;

test.describe('Vendor claim — expired magic link', () => {
  test.skip(
    process.env.NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED !== 'true',
    'Claim profile feature flag is off'
  );

  test.beforeEach(async ({ page }) => {
    await mockRecaptcha(page);
  });

  test('an unexpired link still reaches the claim form', async ({ page }) => {
    await page.goto(claimUrl(VALID_VENDOR));

    await expect(page.getByText('Almost there!')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('Invalid or expired claim link')).toBeHidden();
  });

  test('an expired link is refused with expiry-aware copy', async ({ page }) => {
    await page.goto(claimUrl(EXPIRED_VENDOR));

    await expect(page.getByText('Invalid or expired claim link')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Request a new link' })).toBeVisible();
    // Vendor details are withheld once verification fails.
    await expect(page.locator('body')).not.toContainText(EXPIRED_VENDOR.email);
  });

  test('"Request a new link" lands on the listing with the claim dialog open', async ({ page }) => {
    await page.goto(claimUrl(EXPIRED_VENDOR));
    await expect(page.getByRole('button', { name: 'Request a new link' })).toBeVisible({
      timeout: 15_000,
    });

    await page.getByRole('button', { name: 'Request a new link' }).click();

    await expect(page).toHaveURL(`/vendors/${EXPIRED_VENDOR.slug}?claim=1`);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Manage this profile')).toBeVisible();
    await expect(dialog.getByText(EXPIRED_VENDOR.emailHint)).toBeVisible();
  });

  test('the vendor page does not publish the claim token', async ({ page }) => {
    await page.goto(`/vendors/${EXPIRED_VENDOR.slug}`);

    await expect(page.getByRole('button', { name: /Is this your business/ })).toBeVisible();
    expect(await page.content()).not.toContain(EXPIRED_VENDOR.token);
  });
});
