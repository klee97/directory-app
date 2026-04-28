import { test, expect } from '../fixtures/fixtures';

// eslint-disable-next-line react-hooks/rules-of-hooks
test.use({ storageState: ({ userWorkerStorageState }, use) => use(userWorkerStorageState) });

test('authenticated user visiting /signup is redirected to directory', async ({ page }) => {
  await page.goto('/signup');
  await expect(page).toHaveURL('/');
});

test('authenticated user can visit /auth/reset-password ', async ({ page }) => {
  await page.goto('/auth/reset-password');
  await expect(page.getByLabel('New Password', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Confirm New Password')).toBeVisible();
  await expect(page.locator('#newPassword')).toBeVisible();
  await expect(page.locator('#confirmPassword')).toBeVisible();
});
