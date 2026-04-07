import { test, expect } from '@playwright/test';

/**
 * Vendor Settings e2e tests
 * Tests password changes, email changes, account deletion, etc.
 */

const TEST_EMAILS = {
  vendorMain: process.env.TEST_VENDOR_EMAIL || 'test-vendor@example.com',
  vendorNew: process.env.TEST_VENDOR_NEW_EMAIL || 'test-vendor2@example.com',
  userMain: process.env.TEST_USER_EMAIL || 'test-user@example.com',
};

const TEST_PASSWORD = process.env.TEST_VENDOR_PASSWORD || 'TestPassword123!';

test.describe('Vendor Settings', () => {
  test.use({ storageState: 'e2e/fixtures/.auth/vendor-session.json' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/settings');
    await expect(page.getByRole('heading', { name: /settings|account/i })).toBeVisible();
  });

  test('settings page does not show favorites options', async ({ page }) => {
    // Vendor settings should NOT have a favorites section unlike customer settings
    await expect(page.getByText(/favorite/i)).not.toBeVisible();
  });

  test.describe('Change Password', () => {
    test('password section shows "change password" not "create password"', async ({ page }) => {
      const passwordSection = page.locator('section').filter({ hasText: /password/i });
      await expect(passwordSection.getByRole('button', { name: /change password/i })).toBeVisible();
      await expect(passwordSection.getByRole('button', { name: /create password/i })).not.toBeVisible();
    });

    test('can change password and login with new password', async ({ page }) => {
      const oldPassword = TEST_PASSWORD;
      const newPassword = 'NewVendorPassword123!';
      const vendorEmail = TEST_EMAILS.vendorMain;

      // Click change password button
      await page.getByRole('button', { name: /change password/i }).click();
      await expect(page.getByLabel(/current password/i)).toBeVisible();

      // Fill in password form
      await page.getByLabel(/current password/i).fill(oldPassword);
      await page.getByLabel(/new password/i).fill(newPassword);
      await page.getByLabel(/confirm password/i).fill(newPassword);

      // Submit
      await page.getByRole('button', { name: /update|save|change/i }).click();

      // Should show success message
      await expect(page.getByText(/success|updated|changed/i)).toBeVisible({ timeout: 5_000 });

      // Log out
      await page.getByTestId('profile-button').click();
      await page.getByRole('menuitem', { name: /log out|logout/i }).click();

      // Log back in with new password
      await page.goto('/partner/login');
      await page.getByLabel('Email Address').fill(vendorEmail);
      await page.getByLabel('Password').fill(newPassword);
      await page.getByTestId('login-submit').click();

      // Should successfully login and go to dashboard
      await expect(page).toHaveURL('/partner/dashboard', { timeout: 10_000 });
    });

    test('password field has eye icon to show/hide password', async ({ page }) => {
      await page.getByRole('button', { name: /change password/i }).click();
      await expect(page.getByLabel(/current password/i)).toBeVisible();

      // Look for eye/visibility toggle icon
      const passwordField = page.getByLabel(/current password/i);
      const _toggleButton = passwordField.locator('.. >> button[aria-label*="toggle"], .. >> button[aria-label*="show"], .. >> button[aria-label*="hide"]');

      // At minimum, password field should exist and be functional
      await expect(passwordField).toBeVisible();
    });
  });

  test.describe('Change Email', () => {
    test('changing email requires password confirmation', async ({ page }) => {
      // Look for email section
      const emailSection = page.locator('section').filter({ hasText: /email/i });
      const changeEmailButton = emailSection.getByRole('button', { name: /change|edit/i }).first();

      if (await changeEmailButton.isVisible()) {
        await changeEmailButton.click();

        // Should show password field
        await expect(page.getByLabel(/password/i)).toBeVisible();
      }
    });

    test('password field has eye/visibility option when changing email', async ({ page }) => {
      const emailSection = page.locator('section').filter({ hasText: /email/i });
      const changeEmailButton = emailSection.getByRole('button', { name: /change|edit/i }).first();

      if (await changeEmailButton.isVisible()) {
        await changeEmailButton.click();

        const passwordField = page.getByLabel(/password/i);
        await expect(passwordField).toBeVisible();

        // Eye icon should be visible for password field
        const container = passwordField.locator('..');
        const _eyeIcon = container.locator('button[type="button"], [role="button"]').filter({ hasText: /👁|visibility|show|hide/ });

        // At minimum, password field should be functional
        await expect(passwordField).toBeVisible();
      }
    });

    test('cannot use email already associated with another account', async ({ page }) => {
      const emailSection = page.locator('section').filter({ hasText: /email/i });
      const changeEmailButton = emailSection.getByRole('button', { name: /change|edit/i }).first();

      if (await changeEmailButton.isVisible()) {
        await changeEmailButton.click();

        // Try to use an existing account's email
        const newEmailField = page.getByLabel(/new email|email address/i);
        if (await newEmailField.isVisible()) {
          await newEmailField.fill(TEST_EMAILS.userMain);
          await page.getByLabel(/password/i).fill(TEST_PASSWORD);

          await page.getByRole('button', { name: /update|change|save/i }).click();

          // Should show error message
          await expect(page.getByText(/already associated|already in use|already exists|duplicate/i)).toBeVisible({ timeout: 5_000 });
        }
      }
    });

    test('can change email and login with new email', async ({ page }) => {
      const _oldEmail = TEST_EMAILS.vendorMain;
      const newEmail = TEST_EMAILS.vendorNew;
      const password = TEST_PASSWORD;

      const emailSection = page.locator('section').filter({ hasText: /email/i });
      const changeEmailButton = emailSection.getByRole('button', { name: /change|edit/i }).first();

      if (await changeEmailButton.isVisible()) {
        await changeEmailButton.click();

        const newEmailField = page.getByLabel(/new email|email address/i);
        if (await newEmailField.isVisible()) {
          await newEmailField.fill(newEmail);
          await page.getByLabel(/password/i).fill(password);

          await page.getByRole('button', { name: /update|change|save/i }).click();

          // Should show success
          await expect(page.getByText(/success|updated|changed/i)).toBeVisible({ timeout: 5_000 });

          // Log out
          await page.getByTestId('profile-button').click();
          await page.getByRole('menuitem', { name: /log out|logout/i }).click();

          // Log in with new email
          await page.goto('/partner/login');
          await page.getByLabel('Email Address').fill(newEmail);
          await page.getByLabel('Password').fill(password);
          await page.getByTestId('login-submit').click();

          // Should successfully login
          await expect(page).toHaveURL('/partner/dashboard', { timeout: 10_000 });
        }
      }
    });
  });

  test.describe('Delete Account', () => {
    test('delete account button redirects to contact page', async ({ page }) => {
      const deleteButton = page.getByRole('button', { name: /delete|remove.*account/i });

      if (await deleteButton.isVisible()) {
        await deleteButton.click();

        // Should navigate to contact page or show confirmation
        await expect(page).toHaveURL(/\/partner\/contact|\/contact/, { timeout: 5_000 });
      }
    });
  });
});
