import { login } from '../fixtures/auth.helpers';
import { test, expect } from '../fixtures/fixtures';
import { throwawayAccount } from '../fixtures/testUsers';

/**
 * Settings e2e tests — runs as authenticated user.
 *
 * The delete-account tests run FIRST because they are read-only (open/close
 * dialogs, enter wrong password) and do not mutate state. Running them before
 * the change-password group ensures their session.json tokens have not been
 * revoked by a password change.
 *
 * The change-password tests are in their own serial group because they modify
 * then restore the test user's password. Supabase may revoke existing session
 * tokens when a password changes, so these run last to avoid invalidating
 * sessions used by other test groups.
 */

test.use({ storageState: { cookies: [], origins: [] } }); // explicitly start unauthenticated

const { email, password } = throwawayAccount;

test.describe.serial('Settings — delete account', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, email, password, '/login', '/');
  });

  test('delete account dialog opens and closes without deleting', async ({ page }) => {
    await page.goto('/settings');
    const deleteButton = page.getByRole('button').filter({ hasText: 'Delete Account' });
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();

    const deleteDialog = page.getByRole('dialog', { name: 'Confirm Account Deletion' });
    await expect(deleteDialog).toBeVisible();
    await expect(deleteDialog.getByText('This action cannot be undone')).toBeVisible();

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('delete account with wrong password shows error and keeps dialog open', async ({ page }) => {
    await page.goto('/settings');
    const deleteButton = page.getByRole('button').filter({ hasText: 'Delete Account' });
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();
    await expect(page.getByRole('dialog', { name: 'Confirm Account Deletion' })).toBeVisible();

    await page.getByLabel('Current Password').fill('WrongPassword999!');
    await page.getByRole('button', { name: 'Delete Account' }).click();

    // On error: dialog stays open, error notification appears
    await expect(page.getByRole('dialog', { name: 'Confirm Account Deletion' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.MuiAlert-filledError')).toBeVisible({ timeout: 10_000 });
  });
});

test.describe.serial('Settings — change password', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, email, password, '/login', '/');
  });
  test.skip('settings page is accessible when logged in', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Account Settings' })).toBeVisible();
    await expect(page.getByText('Change Password')).toBeVisible();
    await expect(page.getByText('Delete Account')).toBeVisible();
  });

  test('change password dialog opens and closes without submitting', async ({ page }) => {
    await page.goto('/settings');
    const changeButton = page.getByRole('button').filter({ hasText: 'Change Password' });
    await changeButton.scrollIntoViewIfNeeded();
    await changeButton.click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('changing password with wrong current password keeps dialog open', async ({ page }) => {
    await page.goto('/settings');
    const changeButton = page.getByRole('button').filter({ hasText: 'Change Password' });
    await changeButton.scrollIntoViewIfNeeded();
    await changeButton.click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();

    await page.getByLabel('Current Password').fill('WrongPassword999!');
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill('NewPassword123!');
    await page.getByLabel('Confirm New Password').fill('NewPassword123!');
    await page.getByRole('button', { name: 'Update Password' }).click();

    // On error the dialog stays open and an error notification appears
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.MuiAlert-filledError')).toBeVisible({ timeout: 10_000 });
  });

  test.skip('change password, log out, log back in with new password, then restore', async ({ page }) => {
    const originalPassword = password;
    const tempPassword = 'TempPass@2025!';

    // Step 1: change to temp password
    await page.goto('/settings');
    const changeButton = page.getByRole('button').filter({ hasText: 'Change Password' });
    await changeButton.scrollIntoViewIfNeeded();
    await changeButton.click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByLabel('Current Password').fill(originalPassword);
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(tempPassword);
    await page.getByLabel('Confirm New Password').fill(tempPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });

    // Step 2: clear session — updatePassword internally calls
    // signInWithPassword() which re-creates the Supabase session. In CI the
    // old session may be revoked server-side, leaving the browser effectively
    // logged out. Clearing cookies is the reliable cross-environment way to
    // ensure a clean slate before re-logging in with the new password.
    await page.context().clearCookies();
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible({ timeout: 10_000 });

    // Step 3: log in with new password
    await page.goto('/login');
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(tempPassword);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/', { timeout: 15_000 });
    await expect(page.getByTestId('profile-button')).toBeVisible();

    // Step 4: restore original password
    await page.goto('/settings');
    await changeButton.scrollIntoViewIfNeeded();
    await changeButton.click();
    await expect(page.getByRole('dialog', { name: 'Change Password' })).toBeVisible();
    await page.getByLabel('Current Password').fill(tempPassword);
    await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(originalPassword);
    await page.getByLabel('Confirm New Password').fill(originalPassword);
    await page.getByRole('button', { name: 'Update Password' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10_000 });
  });
});
