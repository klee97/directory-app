import { test, expect } from '@playwright/test';

/**
 * Settings e2e tests — runs as authenticated user.
 *
 * The change-password tests are in a serial group because they modify then
 * restore the test user's password. They must run in order and share a
 * browser context so that the login/logout state is preserved between steps.
 *
 * The delete-account tests are in a SEPARATE describe block so they get a
 * fresh browser context (loaded from session.json). This is necessary because
 * the change-password serial group logs the user out and back in, leaving the
 * shared context's session in a different state.
 */

test.describe.serial('Settings — change password', () => {
  test('settings page is accessible when logged in', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();
    await expect(page.getByText('Change Password')).toBeVisible();
    await expect(page.getByText('Delete Account')).toBeVisible();
  });

  test('change password dialog opens and closes without submitting', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Change Password' }).click();

    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('changing password with wrong current password keeps dialog open', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Change Password' }).click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();

    await page.getByLabel('Current Password').fill('WrongPassword999!');
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill('NewPassword123!');
    await page.getByLabel('Confirm New Password').fill('NewPassword123!');
    await page.getByRole('button', { name: 'Update Password' }).click();

    // On error the dialog stays open and an error notification appears
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.MuiAlert-filledError')).toBeVisible({ timeout: 10_000 });
  });

  test('change password, log out, log back in with new password, then restore', async ({ page }) => {
    const originalPassword = process.env.TEST_USER_PASSWORD!;
    const tempPassword = 'TempPass@2025!';

    // Step 1: change to temp password
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Change Password' }).click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByLabel('Current Password').fill(originalPassword);
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(tempPassword);
    await page.getByLabel('Confirm New Password').fill(tempPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    // Step 2: log out
    await page.getByTestId('profile-button').click();
    await page.getByRole('menuitem', { name: 'Log Out' }).click();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({ timeout: 10_000 });

    // Step 3: log in with new password
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel('Password').fill(tempPassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 15_000 });
    await expect(page.getByTestId('profile-button')).toBeVisible();

    // Step 4: restore original password
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Change Password' }).click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByLabel('Current Password').fill(tempPassword);
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(originalPassword);
    await page.getByLabel('Confirm New Password').fill(originalPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
  });
});

test.describe.serial('Settings — delete account', () => {
  test('delete account dialog opens and closes without deleting', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Delete Account' }).click();

    const deleteDialog = page.getByRole('dialog', { name: 'Confirm Account Deletion' });
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog.getByText('This action cannot be undone')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('delete account with wrong password shows error and keeps dialog open', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button').filter({ hasText: 'Delete Account' }).click();
    await expect(page.getByRole('dialog', { name: 'Confirm Account Deletion' })).toBeVisible();

    await page.getByLabel('Current Password').fill('WrongPassword999!');
    await page.getByRole('button', { name: 'Delete Account' }).click();

    // On error: dialog stays open, error notification appears
    await expect(page.getByRole('dialog', { name: 'Confirm Account Deletion' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.MuiAlert-filledError')).toBeVisible({ timeout: 10_000 });
  });
});
