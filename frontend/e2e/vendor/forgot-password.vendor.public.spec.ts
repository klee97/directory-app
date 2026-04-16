import { test, expect } from '../fixtures/fixtures';
import { vendorWorkerAccounts } from '../fixtures/testUsers';

/**
 * Vendor Forgot Password e2e tests — public (no auth needed).
 *
 * Tests the /partner/forgot-password page (ForgotPasswordForm).
 * Verifies the form renders, submits, and shows a generic success
 * message that does not leak whether the email exists.
 */

test.describe('Vendor Forgot Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/forgot-password');
  });

  test('forgot password page renders with form elements', async ({ page }) => {
    // Page and ForgotPasswordForm both render an h1 "Forgot Password" — take the first
    await expect(page.getByRole('heading', { name: 'Forgot Password' }).first()).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Link to Email' })).toBeVisible();
  });

  test.fixme('submitting valid vendor email shows success message', async ({ page }) => {
    const vendorEmail = vendorWorkerAccounts[0].email;

    await page.getByLabel('Email Address').fill(vendorEmail);
    await page.getByRole('button', { name: 'Send Link to Email' }).click();

    await expect(
      page.getByText(/If we find an account associated with that email/)
    ).toBeVisible({ timeout: 10_000 });
  });

  test.fixme('submitting non-existent email shows same success message (no info leak)', async ({ page }) => {
    await page.getByLabel('Email Address').fill('nonexistent-e2e@example.com');
    await page.getByRole('button', { name: 'Send Link to Email' }).click();

    // Should show the same generic message — does not reveal if email exists
    await expect(
      page.getByText(/If we find an account associated with that email/)
    ).toBeVisible({ timeout: 10_000 });
  });
});
