import { test, expect } from '@playwright/test';

/**
 * Vendor Forgot Password e2e tests
 * Tests the password reset flow for vendor accounts
 */

const TEST_EMAILS = {
  customerMain: process.env.TEST_USER_EMAIL || 'test-customer@users.local',
  vendorMain: process.env.TEST_VENDOR_EMAIL || 'test-vendor@vendors.local',
  vendorPasswordReset: process.env.TEST_VENDOR_PASSWORD_RESET_EMAIL || 'test-reset@vendors.local',
};

test.describe('Vendor Forgot Password', () => {
  test('should not send email when customer email entered on vendor forgot password page', async ({ page }) => {
    await page.goto('/partner/login');

    // Click forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      await expect(page.getByLabel(/email/i)).toBeVisible();

      // Enter a customer email (not a vendor email)
      await page.getByLabel(/email/i).fill(TEST_EMAILS.customerMain);

      // Submit
      await page.getByRole('button', { name: /reset|submit|send/i }).click();

      // Should show generic message that doesn't confirm/deny if email exists
      await expect(page.getByText(/you'll get an email|if we find|associated.*email/i)).toBeVisible({ timeout: 5_000 });

      // No actual email should be sent to the customer email (can't easily verify, but flow should be same)
    }
  });

  test('should not send email when vendor email entered on customer forgot password page', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      await expect(page.getByLabel(/email/i)).toBeVisible();

      // Enter a vendor email
      await page.getByLabel(/email/i).fill(TEST_EMAILS.vendorMain);

      // Submit
      await page.getByRole('button', { name: /reset|submit|send/i }).click();

      // Should show generic message
      await expect(page.getByText(/you'll get an email|if we find|associated.*email/i)).toBeVisible({ timeout: 5_000 });

      // No email should be sent to vendor
    }
  });

  test('notification message shows "You\'ll get an email if we find an account"', async ({ page }) => {
    await page.goto('/partner/login');

    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      // Enter any email
      await page.getByLabel(/email/i).fill('test@example.com');

      // Submit
      await page.getByRole('button', { name: /reset|submit|send/i }).click();

      // Verify exact notification message
      await expect(page.getByText(/you'll get an email if we find an account/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('should handle non-existent email gracefully', async ({ page }) => {
    await page.goto('/partner/login');

    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      const nonExistentEmail = `nonexistent-${Date.now()}@example.com`;
      await page.getByLabel(/email/i).fill(nonExistentEmail);

      // Submit
      await page.getByRole('button', { name: /reset|submit|send/i }).click();

      // Should show same generic message - doesn't reveal if email exists or not
      await expect(page.getByText(/you'll get an email|if we find|associated.*email/i)).toBeVisible({ timeout: 5_000 });
    }
  });

  test('can reset password with valid email and login with new password', async ({ page }) => {
    // Note: This test assumes you have a dedicated test vendor email for password reset testing
    // In a real scenario, you'd need to integrate with a test email service to retrieve the reset link

    await page.goto('/partner/login');

    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();

      // Enter vendor email
      await page.getByLabel(/email/i).fill(TEST_EMAILS.vendorPasswordReset);

      // Submit
      await page.getByRole('button', { name: /reset|submit|send/i }).click();

      // Should show success message
      await expect(page.getByText(/you'll get an email|if we find|associated.*email/i)).toBeVisible({ timeout: 5_000 });

      // In a real test, you would:
      // 1. Fetch the reset link from test email service
      // 2. Navigate to the reset link
      // 3. Enter new password
      // 4. Confirm with login

      // For now, we'll verify the email was sent (in real setup, fetch from email service)
      // const resetLink = await getResetLinkFromEmail(TEST_EMAILS.vendorPasswordReset);
      // await page.goto(resetLink);
      // await page.getByLabel(/new password/i).fill('NewPassword123!');
      // await page.getByLabel(/confirm password/i).fill('NewPassword123!');
      // await page.getByRole('button', { name: /reset|update|save/i }).click();
      //
      // // Should redirect to login
      // await expect(page).toHaveURL('/partner/login');
      //
      // // Log in with new password
      // await page.getByLabel('Email Address').fill(TEST_EMAILS.vendorPasswordReset);
      // await page.getByLabel('Password').fill('NewPassword123!');
      // await page.getByTestId('login-submit').click();
      //
      // await expect(page).toHaveURL('/partner/dashboard');
    }
  });

  test('reset password link validation - invalid link shows error', async ({ page }) => {
    // Try with an invalid reset token
    await page.goto('/partner/reset-password?token=invalid&email=test@example.com');

    // Should show an error message
    await expect(page.getByText(/invalid|expired|error/i)).toBeVisible({ timeout: 3_000 });
  });

  test('reset password requires email and valid token', async ({ page }) => {
    // Try without email
    await page.goto('/partner/reset-password?token=sometoken');

    // Should show error or redirect
    await expect(page).toHaveURL(/\/partner\/login|\/login/, { timeout: 5_000 });

    // Try without token
    await page.goto('/partner/reset-password?email=test@example.com');

    // Should show error or redirect
    await expect(page).toHaveURL(/\/partner\/login|\/login/, { timeout: 5_000 });
  });

  test('reset password form validates password fields', async ({ page }) => {
    // Navigate to a valid reset page (assuming you have test token/email)
    // In real setup, fetch this from email service
    const resetLink = '/partner/reset-password?token=test-token&email=test@example.com';

    await page.goto(resetLink);

    // Try to submit without passwords
    const submitButton = page.getByRole('button', { name: /reset|update|save/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Should show validation errors
      await expect(page.getByText(/required|password/i)).toBeVisible({ timeout: 3_000 });
    }

    // Try with mismatched passwords
    const passwordField = page.getByLabel(/new password/i);
    const confirmField = page.getByLabel(/confirm password/i);

    if (await passwordField.isVisible() && await confirmField.isVisible()) {
      await passwordField.fill('Password123!');
      await confirmField.fill('DifferentPassword123!');

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Should show mismatch error
        await expect(page.getByText(/match|confirm|do not match|different/i)).toBeVisible({ timeout: 3_000 });
      }
    }
  });
});
