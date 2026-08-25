import { test, expect } from '@playwright/test';
import { mockRecaptcha } from '../fixtures/mockRecaptcha';

/**
 * "Is this your business? Manage this profile." CTA on the vendor profile page
 * (ManageProfilePrompt) — public, no auth needed.
 *
 * The CTA branches three ways:
 *   - claimed listing            → straight to /partner/login, no dialog
 *   - unclaimed, no email onfile → /partner/contact?reason=claim
 *   - unclaimed, email on file   → claim-link dialog
 *
 * Depends on fixtures from supabase/seed.sql:
 *   - TEST-E2E-001        "Test Glamour Studio"    test-glamour-studio    (verified_at set)
 *   - TEST-E2E-002        "Test Bridal Beauty Co"  test-bridal-beauty-co  (unclaimed, no email)
 *   - TEST-E2E-CLAIM-LINK "Test Claim Link Vendor" test-claim-link-vendor (unclaimed, email on file)
 *
 * Gated on NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED — see .env.test.example.
 */

const CLAIMED_SLUG = 'test-glamour-studio';
const NO_EMAIL_SLUG = 'test-bridal-beauty-co';
const CLAIM_LINK_VENDOR = {
  slug: 'test-claim-link-vendor',
  businessName: 'Test Claim Link Vendor',
  // maskEmail('claim-link-vendor@example.com')
  emailHint: 'cl•••@•••.com',
};

const MANAGE_LINK = 'Is this your business? Manage this profile.';

test.describe('Vendor profile — Manage this profile CTA', () => {
  test.skip(
    process.env.NEXT_PUBLIC_FEATURE_CLAIM_PROFILE_ENABLED !== 'true',
    'Claim profile feature flag is off'
  );

  test.beforeEach(async ({ page }) => {
    await mockRecaptcha(page);
  });

  test('already-claimed listing sends the owner to vendor login', async ({ page }) => {
    await page.goto(`/vendors/${CLAIMED_SLUG}`);

    await page.getByRole('button', { name: MANAGE_LINK }).click();

    await expect(page).toHaveURL('/partner/login');
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('unclaimed listing with no email on file sends the owner to the contact form', async ({ page }) => {
    await page.goto(`/vendors/${NO_EMAIL_SLUG}`);

    await page.getByRole('button', { name: MANAGE_LINK }).click();

    await expect(page).toHaveURL('/partner/contact?reason=claim');
    // The contact form arrives pre-selected to the claim reason.
    const form = page.getByTestId('email-form');
    await expect(form.getByRole('combobox', { name: 'Reason for Contacting' }))
      .toHaveText('Claim a Listing');
  });

  test.describe('unclaimed listing with an email on file', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/vendors/${CLAIM_LINK_VENDOR.slug}`);
      await page.getByRole('button', { name: MANAGE_LINK }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
    });

    test('opens a dialog showing only a masked hint of the email on file', async ({ page }) => {
      const dialog = page.getByRole('dialog');

      await expect(dialog.getByText('Manage this profile')).toBeVisible();
      await expect(dialog.getByText(CLAIM_LINK_VENDOR.businessName)).toBeVisible();
      await expect(dialog.getByText(CLAIM_LINK_VENDOR.emailHint)).toBeVisible();
      // The full address is never sent to the client.
      await expect(dialog).not.toContainText('claim-link-vendor@example.com');
      await expect(dialog.getByRole('button', { name: 'Send me a link' })).toBeVisible();
    });

    test('cancelling closes the dialog without sending', async ({ page }) => {
      await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page).toHaveURL(`/vendors/${CLAIM_LINK_VENDOR.slug}`);
    });

    test('sending a link shows the check-your-inbox confirmation', async ({ page }) => {
      const dialog = page.getByRole('dialog');

      await dialog.getByRole('button', { name: 'Send me a link' }).click();

      // The action always reports success — the outbound Resend call is not
      // exercised locally, and failures are deliberately indistinguishable.
      await expect(dialog.getByText('Check your inbox')).toBeVisible({ timeout: 15_000 });
      await expect(dialog.getByText(CLAIM_LINK_VENDOR.emailHint)).toBeVisible();

      await dialog.getByRole('button', { name: 'Done' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();
    });

    test('reopening after a send returns to the initial state', async ({ page }) => {
      const dialog = page.getByRole('dialog');
      await dialog.getByRole('button', { name: 'Send me a link' }).click();
      await expect(dialog.getByText('Check your inbox')).toBeVisible({ timeout: 15_000 });
      await dialog.getByRole('button', { name: 'Done' }).click();
      await expect(page.getByRole('dialog')).toBeHidden();

      await page.getByRole('button', { name: MANAGE_LINK }).click();

      await expect(page.getByRole('dialog').getByRole('button', { name: 'Send me a link' })).toBeVisible();
    });
  });
});
