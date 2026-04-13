import { login } from '../fixtures/auth.helpers';
import { test, expect } from '../fixtures/fixtures';
import { vendorThrowawayAccount } from '../fixtures/testUsers';

/**
 * Vendor Settings e2e tests — runs as authenticated vendor.
 *
 * Block A (read-only): Uses worker-scoped vendor auth. Tests page rendering,
 * bridal inquiries toggle, dialog open/close, delete account link.
 *
 * Block B (destructive): Uses vendorThrowawayAccount with fresh login per test.
 * Tests that mutate password/email state run in serial to avoid session conflicts.
 *
 * Depends on TEST-E2E-001 (worker 0) having approved_inquiries_at set (inquiry toggle ON).
 */

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ vendorWorkerStorageState }, use) => use(vendorWorkerStorageState) });

test.describe('Vendor Settings — read-only', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/partner/settings');
  });

  test('settings page renders with all options', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();
    await expect(page.getByText('Bridal Inquiries')).toBeVisible();
    await expect(page.getByText('Change Email')).toBeVisible();
    // Vendor worker accounts have passwords, so it shows "Change Password" not "Create A Password"
    await expect(page.getByText('Change Password')).toBeVisible();
    await expect(page.getByText('Delete Account')).toBeVisible();
  });

  test('bridal inquiries switch toggles', async ({ page }) => {
    // MUI Switch: input has opacity:0 so use the visible root for clicking/visibility,
    // and the input element for isChecked() state reads.
    const switchRoot = page.locator('.MuiSwitch-root');
    const inquiryInput = page.locator('.MuiSwitch-input');
    await expect(switchRoot).toBeVisible();

    const wasChecked = await inquiryInput.isChecked();

    // Toggle
    await switchRoot.click();
    const expectedNotification = wasChecked ? 'Bridal inquiries disabled' : 'Bridal inquiries enabled';
    await expect(page.getByText(expectedNotification)).toBeVisible({ timeout: 5_000 });

    // Restore original state
    await switchRoot.click();
    const restoreNotification = wasChecked ? 'Bridal inquiries enabled' : 'Bridal inquiries disabled';
    await expect(page.getByText(restoreNotification)).toBeVisible({ timeout: 5_000 });
  });

  test('change password dialog opens and closes', async ({ page }) => {
    await page.getByText('Change Password').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Change Password')).toBeVisible();
    await expect(page.getByLabel('Current Password')).toBeVisible();
    await expect(page.getByLabel('New Password').first()).toBeVisible();
    await expect(page.getByLabel('Confirm New Password')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('change email dialog opens and closes', async ({ page }) => {
    await page.getByText('Change Email').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Update the email address/)).toBeVisible();
    await expect(page.getByLabel('Current Password')).toBeVisible();
    await expect(page.getByLabel('New Email Address')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).not.toBeVisible();
  });

  test('delete account navigates to contact page', async ({ page }) => {
    await page.getByText('Delete Account').click();
    await expect(page).toHaveURL('/partner/contact');
  });
});

test.describe.serial('Vendor Settings — change password (throwaway)', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  const { email, password } = vendorThrowawayAccount;

  test.beforeEach(async ({ page }) => {
    await login(page, email, password, '/partner/login', '/partner/dashboard');
  });

  test('changing password with wrong current password shows error', async ({ page }) => {
    await page.goto('/partner/settings');
    await page.getByText('Change Password').click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.getByLabel('Current Password').fill('WrongPassword999!');
    await page.getByLabel('New Password').first().fill('NewVendorPassword123!');
    await page.getByLabel('Confirm New Password').fill('NewVendorPassword123!');
    await page.getByRole('button', { name: 'Update Password' }).click();

    // Dialog stays open and error notification appears
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.MuiAlert-filledError')).toBeVisible({ timeout: 10_000 });
  });

  test.skip('change password, log out, log in with new, restore', async ({ page }) => {
    // TODO: Full round-trip password change test.
    // Pattern: change to temp password → clear cookies → log in with new → restore original.
    // See settings.auth.spec.ts for reference implementation.
    const tempPassword = 'TempVendorPass@2025!';

    await page.goto('/partner/settings');
    await page.getByText('Change Password').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Current Password').fill(password);
    await page.getByLabel('New Password').first().fill(tempPassword);
    await page.getByLabel('Confirm New Password').fill(tempPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    // Clear session and re-login with new password
    await page.context().clearCookies();
    await page.goto('/');
    await login(page, email, tempPassword, '/partner/login', '/partner/dashboard');

    // Restore original password
    await page.goto('/partner/settings');
    await page.getByText('Change Password').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await page.getByLabel('Current Password').fill(tempPassword);
    await page.getByLabel('New Password').first().fill(password);
    await page.getByLabel('Confirm New Password').fill(password);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
  });
});
